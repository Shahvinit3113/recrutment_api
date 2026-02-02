import { BaseEntities } from '@/data/entities/base-entities';
import { Result } from '@/data/response/response';
import { PaginatedResult, ListQueryOptions } from '@/database/types';

/**
 * Service interface for controller compatibility
 * 
 * Both VmService and BaseService implement this interface,
 * allowing controllers to work with either.
 */
export interface IService<T extends BaseEntities, TVm = T> {
  /**
   * Get all records
   */
  getAllAsync(columns?: (keyof T)[]): Promise<Result<T>>;

  /**
   * Get record by ID
   */
  getByIdAsync(id: string, columns?: (keyof T)[]): Promise<Result<T>>;

  /**
   * Create a new record
   */
  createAsync(model: TVm): Promise<Result<T>>;

  /**
   * Update a record
   */
  updateAsync(model: TVm, id: string): Promise<Result<T>>;

  /**
   * Delete a record
   */
  deleteAsync(id: string): Promise<boolean>;
}
