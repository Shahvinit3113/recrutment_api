type OrderBy = "ASC" | "DESC";

/**
 * Base filter class for search and pagination operations
 */
export class Filter {
  Query: string;
  PageIndex: number;
  PageSize: number;
  Date: Date;
  OrderBy: OrderBy;
}

/**
 * ============================================================================
 * PAGINATION REQUEST
 * ============================================================================
 *
 * Standard pagination parameters for list endpoints.
 * Use this in your controller/service methods to handle pagination consistently.
 */
export interface PaginationParams {
  /** Current page (1-indexed) */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Field to sort by */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: "asc" | "desc";
}

/**
 * Search parameters including pagination
 */
export interface SearchParams extends PaginationParams {
  /** Search query string */
  search?: string;
}

/**
 * Default pagination values
 */
export const DEFAULT_PAGINATION: PaginationParams = {
  page: 1,
  limit: 10,
  sortBy: "CreatedOn",
  sortOrder: "desc",
};

/**
 * Parse pagination from request query
 * Handles string-to-number conversion and defaults
 */
export function parsePagination(query: any): PaginationParams {
  return {
    page: Math.max(1, parseInt(query?.page, 10) || DEFAULT_PAGINATION.page),
    limit: Math.min(
      100,
      Math.max(1, parseInt(query?.limit, 10) || DEFAULT_PAGINATION.limit)
    ),
    sortBy: query?.sortBy || DEFAULT_PAGINATION.sortBy,
    sortOrder: query?.sortOrder === "asc" ? "asc" : "desc",
  };
}

/**
 * Parse search params from request query
 */
export function parseSearchParams(query: any): SearchParams {
  return {
    ...parsePagination(query),
    search: query?.search?.trim() || undefined,
  };
}

/**
 * Calculate SQL OFFSET from page and limit
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}
