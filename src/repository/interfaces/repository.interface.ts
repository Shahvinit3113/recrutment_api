import { Knex } from 'knex';
import { BaseEntities } from '@/data/entities/base-entities';
import {
  ListQueryOptions,
  PaginatedResult,
  SelectColumns,
  WhereCondition,
} from '@/database/types';

/**
 * Generic Repository Interface
 * 
 * Defines all CRUD operations available for any entity.
 * Implement this interface to create custom repositories with additional methods.
 * 
 * @template T - Entity type extending BaseEntities
 */
interface IRepository<T extends BaseEntities> {
  // ═══════════════════════════════════════════════════════════════════════════
  // READ OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get all active records for an organization
   * @param orgId - Organization ID
   * @param columns - Optional columns to select
   */
  findAll(orgId: string, columns?: SelectColumns<T>): Promise<T[]>;

  /**
   * Get paginated list with filtering and sorting
   * @param orgId - Organization ID
   * @param options - Query options (pagination, sorting, search)
   * @param columns - Optional columns to select
   */
  findList(
    orgId: string,
    options?: ListQueryOptions,
    columns?: SelectColumns<T>
  ): Promise<PaginatedResult<T>>;

  /**
   * Find a single record by ID
   * @param id - Record unique identifier
   * @param orgId - Organization ID
   * @param columns - Optional columns to select
   */
  findById(
    id: string,
    orgId: string,
    columns?: SelectColumns<T>
  ): Promise<T | null>;

  /**
   * Find records matching conditions
   * @param conditions - Where conditions
   * @param orgId - Optional organization ID
   */
  findWhere(conditions: WhereCondition<T>, orgId?: string): Promise<T[]>;

  /**
   * Find first record matching conditions
   * @param conditions - Where conditions
   * @param orgId - Optional organization ID
   */
  findOneWhere(conditions: WhereCondition<T>, orgId?: string): Promise<T | null>;

  /**
   * Check if record exists
   * @param id - Record unique identifier
   * @param orgId - Organization ID
   */
  exists(id: string, orgId: string): Promise<boolean>;

  /**
   * Count records for organization
   * @param orgId - Organization ID
   */
  count(orgId: string): Promise<number>;

  // ═══════════════════════════════════════════════════════════════════════════
  // WRITE OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Create a new record
   * @param entity - Entity to create
   */
  create(entity: T): Promise<T>;

  /**
   * Create multiple records
   * @param entities - Array of entities to create
   */
  createMany(entities: T[]): Promise<T[]>;

  /**
   * Update a record by ID
   * @param id - Record unique identifier
   * @param data - Partial entity with fields to update
   */
  update(id: string, data: Partial<T>): Promise<T>;

  /**
   * Update multiple records
   * @param updates - Array of {id, data} objects
   */
  updateMany(updates: { id: string; data: Partial<T> }[]): Promise<void>;

  /**
   * Soft delete (set IsDeleted = true)
   * @param id - Record unique identifier
   */
  softDelete(id: string): Promise<boolean>;

  /**
   * Soft delete multiple records
   * @param ids - Array of record identifiers
   */
  softDeleteMany(ids: string[]): Promise<boolean>;

  /**
   * Permanently delete a record
   * @param id - Record unique identifier
   */
  hardDelete(id: string): Promise<boolean>;

  /**
   * Permanently delete multiple records
   * @param ids - Array of record identifiers
   */
  hardDeleteMany(ids: string[]): Promise<boolean>;

  // ═══════════════════════════════════════════════════════════════════════════
  // QUERY BUILDER ACCESS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get raw query builder for custom queries
   * Use this for complex queries not covered by standard methods
   */
  query(): Knex.QueryBuilder<T>;

  /**
   * Get query builder with soft-delete filter applied
   * Returns only records where IsDeleted = false
   */
  queryActive(): Knex.QueryBuilder<T>;
}

export type { IRepository };