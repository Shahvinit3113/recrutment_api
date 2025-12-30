import { DatabaseConnection } from "@/db/connection/connection";
import { BaseQueries } from "@/db/queries/base/base.query";
import { inject, injectable } from "inversify";
import { TYPES } from "@/core/container/types";
import { BaseEntities } from "@/data/entities/base-entities";
import { PaginationParams, calculateOffset } from "@/data/filters/filter";

/**
 * Paginated result from repository
 */
export interface PaginatedData<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Base repository implementation providing common CRUD operations
 * @template T - Entity type that extends IBaseEntity
 */
@injectable()
export class BaseRepository<T extends BaseEntities> extends BaseQueries<T> {
  protected readonly _db: DatabaseConnection;

  constructor(
    @inject(TYPES.DatabaseConnection) db: DatabaseConnection,
    table: string
  ) {
    super(table);
    this._db = db;
  }

  /**
   * Retrieves all active records for a given organization
   * @param params Array of parameters including organization ID
   * @param columns Optional array of column names to select
   * @returns Promise resolving to array of entities
   */
  async getAll(params: any[], columns?: (keyof T)[]): Promise<T[]> {
    const [rows] = await this._db.execute(this.seletAllQuery(columns), params);
    return rows as T[];
  }

  /**
   * Retrieves paginated records for a given organization
   * @param tenantId Tenant/organization ID
   * @param pagination Pagination parameters
   * @param columns Optional array of column names to select
   * @returns Promise resolving to paginated result
   */
  async getAllPaginated(
    tenantId: string,
    pagination: PaginationParams,
    columns?: (keyof T)[]
  ): Promise<PaginatedData<T>> {
    const { page, limit, sortBy, sortOrder } = pagination;
    const offset = calculateOffset(page, limit);

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM ${this.table} WHERE TenantId = ? AND IsDeleted = 0`;
    const [countResult] = await this._db.execute(countQuery, [tenantId]);
    const total = (countResult as any[])[0]?.total || 0;

    // Get paginated data
    const fields = columns?.length ? columns.join(", ") : "*";
    const orderField =
      sortBy && this.isValidColumn(sortBy) ? sortBy : "CreatedOn";
    const order = sortOrder?.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const dataQuery = `
      SELECT ${fields} 
      FROM ${this.table} 
      WHERE TenantId = ? AND IsDeleted = 0 
      ORDER BY ${orderField} ${order}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await this._db.execute(dataQuery, [tenantId, limit, offset]);

    return {
      data: rows as T[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Search records with pagination
   * @param tenantId Tenant/organization ID
   * @param searchTerm Search term to match against searchable columns
   * @param searchColumns Columns to search in
   * @param pagination Pagination parameters
   * @param columns Optional array of column names to select
   */
  async searchPaginated(
    tenantId: string,
    searchTerm: string | undefined,
    searchColumns: (keyof T)[],
    pagination: PaginationParams,
    columns?: (keyof T)[]
  ): Promise<PaginatedData<T>> {
    const { page, limit, sortBy, sortOrder } = pagination;
    const offset = calculateOffset(page, limit);

    let whereClause = "TenantId = ? AND IsDeleted = 0";
    const params: any[] = [tenantId];

    // Add search condition if search term provided
    if (searchTerm && searchColumns.length > 0) {
      const searchConditions = searchColumns
        .map((col) => `${String(col)} LIKE ?`)
        .join(" OR ");
      whereClause += ` AND (${searchConditions})`;

      const searchPattern = `%${searchTerm}%`;
      searchColumns.forEach(() => params.push(searchPattern));
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM ${this.table} WHERE ${whereClause}`;
    const [countResult] = await this._db.execute(countQuery, params);
    const total = (countResult as any[])[0]?.total || 0;

    // Get paginated data
    const fields = columns?.length ? columns.join(", ") : "*";
    const orderField =
      sortBy && this.isValidColumn(sortBy) ? sortBy : "CreatedOn";
    const order = sortOrder?.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const dataQuery = `
      SELECT ${fields} 
      FROM ${this.table} 
      WHERE ${whereClause}
      ORDER BY ${orderField} ${order}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await this._db.execute(dataQuery, [
      ...params,
      limit,
      offset,
    ]);

    return {
      data: rows as T[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Check if a column name is valid (basic SQL injection prevention)
   */
  private isValidColumn(column: string): boolean {
    // Only allow alphanumeric and underscore
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(column);
  }

  /**
   * Retrieves a single record by its unique identifier
   * @param id Unique identifier of the record
   * @param params Array of parameters including organization ID
   * @param columns Optional array of column names to select
   * @returns Promise resolving to entity or null if not found
   */
  async getById(
    id: string,
    params: any[],
    columns?: (keyof T)[]
  ): Promise<T | null> {
    const [rows] = await this._db.execute(this.selectByIdQuery(columns), [
      id,
      ...params,
    ]);
    const result = (rows as T[])[0];
    return result || null;
  }

  /**
   * Creates a new record in the database
   * @param entity Entity to create
   * @returns Promise resolving to created entity
   */
  async create(entity: T): Promise<T> {
    const query = this.insertQuery(entity);
    const values = Object.values(entity).map((value) =>
      value === undefined ? null : value
    );
    await this._db.execute(query, values);
    return entity;
  }

  /**
   * Creates multiple records in the database using a single query
   * @param entities Array of entities to create
   * @returns Promise resolving to array of created entities
   */
  async createMany(entities: T[]): Promise<T[]> {
    if (!entities.length) {
      return [];
    }

    const query = this.insertManyQuery(entities);
    const values = entities.flatMap((entity) =>
      Object.values(entity).map((value) => (value === undefined ? null : value))
    );

    await this._db.execute(query, values);
    return entities;
  }

  /**
   * Updates an existing record in the database
   * @param entity Updated entity data
   * @param id Unique identifier of the record to update
   * @returns Promise resolving to updated entity
   */
  async update(entity: T, id: string): Promise<T> {
    const query = this.putQuery(entity);
    const values = [...Object.values(entity).slice(1), id];
    await this._db.execute(query, values);
    return entity;
  }

  /**
   * Updates multiple records in the database using a single query
   * @param entities Array of entities with updated values (must include Uid)
   * @param excludeFields Optional array of field names to exclude from update (Uid is always excluded)
   * @returns Promise resolving to array of updated entities
   */
  async updateMany(entities: T[], excludeFields?: (keyof T)[]): Promise<T[]> {
    if (!entities.length) {
      return [];
    }

    // Get all fields from first entity, excluding Uid and specified fields
    const allFields = Object.keys(entities[0]) as (keyof T)[];
    const fieldsToExclude = Array.from(
      new Set([...(excludeFields || []), "Uid" as keyof T])
    );

    const updateFields = allFields.filter(
      (field) => !fieldsToExclude.includes(field)
    );

    const query = this.updateManyQuery(entities, fieldsToExclude);

    const caseValues: any[] = [];
    updateFields.forEach((field) => {
      entities.forEach((entity) => {
        caseValues.push(entity.Uid);
        caseValues.push(entity[field] === undefined ? null : entity[field]);
      });
    });

    const uids = entities.map((e) => e.Uid);
    const values = [...caseValues, ...uids];

    await this._db.execute(query, values);
    return entities;
  }

  /**
   * Upserts multiple records in a single query (bulk operation)
   * Requires a UNIQUE constraint on the key field (default: Uid)
   * @param entities Array of entities to upsert
   * @param uniqueKey The unique constraint column (defaults to 'Uid')
   * @param excludeFromUpdate Optional fields to exclude from update
   * @returns Promise resolving to array of upserted entities
   */
  async upsertMany(
    entities: T[],
    uniqueKey: keyof T = "Uid" as keyof T,
    excludeFromUpdate?: (keyof T)[]
  ): Promise<T[]> {
    if (!entities.length) {
      return [];
    }

    const query = this.upsertManyQuery(entities, uniqueKey, excludeFromUpdate);

    // Flatten all entity values in the same order as keys
    const values = entities.flatMap((entity) =>
      Object.keys(entity)
        .filter((k) => entity[k as keyof T] !== undefined)
        .map((k) => {
          const value = entity[k as keyof T];
          return value === undefined ? null : value;
        })
    );

    await this._db.execute(query, values);
    return entities;
  }

  /**
   * Marks a record as deleted without removing it from the database
   * @param id Unique identifier of the record to delete
   * @returns Promise resolving to boolean indicating success
   */
  async softDelete(id: string): Promise<boolean> {
    const query = this.softDeleteQuery();
    await this._db.execute(query, [id]);

    return true;
  }

  /**
   * Permanently removes a record from the database
   * @param id Unique identifier of the record to delete
   * @returns Promise resolving to boolean indicating success
   */
  async hardDelete(id: string): Promise<boolean> {
    const query = this.hardDeleteQuery();
    await this._db.execute(query, [id]);

    return true;
  }

  async softDeleteMultiple(ids: string[]): Promise<boolean> {
    const query = this.softDeleteManyQuery();
    await this._db.execute(query, [ids]);

    return true;
  }

  async hardDeleteMultiple(ids: string[]): Promise<boolean> {
    const query = this.hardDeleteManyQuery();
    await this._db.execute(query, [ids]);

    return true;
  }
}
