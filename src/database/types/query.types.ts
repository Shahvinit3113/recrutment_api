/**
 * Query helper types for database operations
 */

/**
 * Pagination options for list queries
 */
export interface PaginationOptions {
  /** Page number (1-indexed) */
  page?: number;
  /** Number of items per page */
  pageSize?: number;
}

/**
 * Sorting options for list queries
 */
export interface SortOptions {
  /** Field to sort by */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Search options for list queries
 */
export interface SearchOptions {
  /** Search term */
  search?: string;
  /** Fields to search in */
  searchFields?: string[];
}

/**
 * Combined list query options
 */
export interface ListQueryOptions extends PaginationOptions, SortOptions, SearchOptions {}

/**
 * Pagination metadata in response
 */
export interface PaginationMeta {
  /** Total number of records */
  total: number;
  /** Current page number */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a next page */
  hasNext: boolean;
  /** Whether there is a previous page */
  hasPrevious: boolean;
}

/**
 * Paginated result wrapper
 */
export interface PaginatedResult<T> {
  /** Data items for current page */
  data: T[];
  /** Pagination metadata */
  pagination: PaginationMeta;
}

/**
 * Select columns type - can be array of keys or '*' for all
 */
export type SelectColumns<T> = (keyof T)[] | '*';

/**
 * Where condition - either partial object or tuple [field, operator, value]
 */
export type WhereCondition<T> = Partial<T> | [keyof T, string, unknown];
