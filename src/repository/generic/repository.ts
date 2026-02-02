import { Knex } from 'knex';
import { BaseEntities } from '@/data/entities/base-entities';
import { IRepository } from '../interfaces/repository.interface';
import {
  ListQueryOptions,
  PaginatedResult,
  SelectColumns,
  WhereCondition,
} from '@/database/types';

/**
 * Generic Repository Implementation
 * 
 * A single repository class that works with ANY entity type.
 * No need to create individual repository classes for each entity.
 * 
 * This is similar to .NET's Repository<T> pattern where one generic class
 * handles all CRUD operations for any entity.
 * 
 * @template T - Entity type extending BaseEntities
 * 
 * @example
 * ```typescript
 * // Creating repositories for different entities
 * const userRepo = new Repository<User>(knex, 'Users');
 * const taskRepo = new Repository<Task>(knex, 'Task');
 * 
 * // All CRUD operations are available
 * const users = await userRepo.findAll(orgId);
 * const user = await userRepo.findById(id, orgId);
 * await userRepo.create(newUser);
 * ```
 */
export class Repository<T extends BaseEntities> implements IRepository<T> {
  protected readonly knex: Knex;
  protected readonly tableName: string;

  /**
   * Create a new repository instance
   * @param knex - Knex instance or transaction
   * @param tableName - Database table name
   */
  constructor(knex: Knex, tableName: string) {
    this.knex = knex;
    this.tableName = tableName;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // QUERY BUILDERS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get raw query builder for this table
   */
  query(): Knex.QueryBuilder<T> {
    return this.knex<T>(this.tableName);
  }

  /**
   * Get query builder with soft-delete filter applied
   */
  queryActive(): Knex.QueryBuilder<T> {
    return this.query().where('IsDeleted', false);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // READ OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get all active records for an organization
   */
  async findAll(orgId: string, columns?: SelectColumns<T>): Promise<T[]> {
    const query = this.queryActive().where('OrgId', orgId);

    if (columns && columns !== '*') {
      query.select(columns as string[]);
    }

    return await query;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findList(
    orgId: string,
    options: ListQueryOptions = {},
    columns?: SelectColumns<T>
  ): Promise<PaginatedResult<T>> {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'CreatedOn',
      sortOrder = 'desc',
      search,
      searchFields,
    } = options;

    const offset = (page - 1) * pageSize;

    // Base query for data
    let dataQuery = this.queryActive().where('OrgId', orgId);

    // Apply search if provided
    if (search && searchFields?.length) {
      dataQuery = dataQuery.where((builder) => {
        searchFields.forEach((field, index) => {
          const method = index === 0 ? 'where' : 'orWhere';
          builder[method](field, 'like', `%${search}%`);
        });
      });
    }

    // Clone for count query before applying pagination
    const countQuery = dataQuery.clone();

    // Get total count
    const countResult = await countQuery.count('* as count').first();
    const total = Number(countResult?.count ?? 0);

    // Apply column selection
    if (columns && columns !== '*') {
      dataQuery = dataQuery.select(columns as string[]);
    }

    // Apply sorting and pagination
    const data = await dataQuery
      .orderBy(sortBy, sortOrder)
      .limit(pageSize)
      .offset(offset);

    const totalPages = Math.ceil(total / pageSize);

    return {
      data,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  /**
   * Find a single record by ID
   */
  async findById(
    id: string,
    orgId: string,
    columns?: SelectColumns<T>
  ): Promise<T | null> {
    const query = this.queryActive()
      .where('Uid', id)
      .where('OrgId', orgId)
      .first();

    if (columns && columns !== '*') {
      query.select(columns as string[]);
    }

    const result = await query;
    return result || null;
  }

  /**
   * Find records matching conditions
   */
  async findWhere(
    conditions: WhereCondition<T>,
    orgId?: string
  ): Promise<T[]> {
    let query = this.queryActive();

    if (orgId) {
      query = query.where('OrgId', orgId);
    }

    // Apply conditions
    if (Array.isArray(conditions)) {
      const [field, operator, value] = conditions;
      query = query.whereRaw(`?? ${operator} ?`, [field as string, value]);
    } else {
      query = query.where(conditions as Record<string, unknown>);
    }

    return await query;
  }

  /**
   * Find first record matching conditions
   */
  async findOneWhere(
    conditions: WhereCondition<T>,
    orgId?: string
  ): Promise<T | null> {
    const results = await this.findWhere(conditions, orgId);
    return results[0] || null;
  }

  /**
   * Check if record exists
   */
  async exists(id: string, orgId: string): Promise<boolean> {
    const result = await this.queryActive()
      .where('Uid', id)
      .where('OrgId', orgId)
      .select('Uid')
      .first();

    return !!result;
  }

  /**
   * Count records for organization
   */
  async count(orgId: string): Promise<number> {
    const result = await this.queryActive()
      .where('OrgId', orgId)
      .count('* as count')
      .first();

    return Number(result?.count ?? 0);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // WRITE OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Create a new record
   */
  async create(entity: T): Promise<T> {
    await this.knex(this.tableName).insert(entity as Record<string, unknown>);
    return entity;
  }

  /**
   * Create multiple records
   */
  async createMany(entities: T[]): Promise<T[]> {
    if (!entities.length) return [];

    // Knex handles batching automatically
    await this.knex(this.tableName).insert(entities as Record<string, unknown>[]);
    return entities;
  }

  /**
   * Update a record by ID
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    // Remove fields that shouldn't be updated
    const updateData: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (!['Uid', 'CreatedOn', 'CreatedBy', 'OrgId'].includes(key)) {
        updateData[key] = value;
      }
    }
    
    updateData['UpdatedOn'] = new Date();

    await this.knex(this.tableName)
      .where('Uid', id)
      .update(updateData);

    return { Uid: id, ...data } as T;
  }

  /**
   * Update multiple records
   */
  async updateMany(
    updates: { id: string; data: Partial<T> }[]
  ): Promise<void> {
    if (!updates.length) return;

    // Use transaction for batch updates
    await this.knex.transaction(async (trx) => {
      for (const { id, data } of updates) {
        const updateData: Record<string, unknown> = {};
        
        for (const [key, value] of Object.entries(data)) {
          if (!['Uid', 'CreatedOn', 'CreatedBy', 'OrgId'].includes(key)) {
            updateData[key] = value;
          }
        }
        
        updateData['UpdatedOn'] = new Date();

        await trx(this.tableName)
          .where('Uid', id)
          .update(updateData);
      }
    });
  }

  /**
   * Soft delete (set IsDeleted = true)
   */
  async softDelete(id: string): Promise<boolean> {
    const affected = await this.knex(this.tableName)
      .where('Uid', id)
      .update({
        IsDeleted: true,
        DeletedOn: new Date(),
      });

    return Number(affected) > 0;
  }

  /**
   * Soft delete multiple records
   */
  async softDeleteMany(ids: string[]): Promise<boolean> {
    if (!ids.length) return false;

    const affected = await this.knex(this.tableName)
      .whereIn('Uid', ids)
      .update({
        IsDeleted: true,
        DeletedOn: new Date(),
      });

    return Number(affected) > 0;
  }

  /**
   * Permanently delete a record
   */
  async hardDelete(id: string): Promise<boolean> {
    const affected = await this.knex(this.tableName).where('Uid', id).del();
    return Number(affected) > 0;
  }

  /**
   * Permanently delete multiple records
   */
  async hardDeleteMany(ids: string[]): Promise<boolean> {
    if (!ids.length) return false;

    const affected = await this.knex(this.tableName).whereIn('Uid', ids).del();
    return Number(affected) > 0;
  }
}
