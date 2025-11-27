type OrderBy = "ASC" | "DESC";

/**
 * Generic filter class for database queries with pagination, sorting, and search
 * @remarks Provides standardized filtering across all entities
 */
export class Filter {
  /**
   * Page number for pagination (1-indexed)
   * @default 1
   */
  Page?: number = 1;

  /**
   * Number of records per page
   * @default 20
   * @maximum 100
   */
  PageSize?: number = 20;

  /**
   * Field name to sort by
   * @example "CreatedOn", "Name", "UpdatedOn"
   */
  SortBy?: string;

  /**
   * Sort direction
   * @default "DESC"
   */
  SortOrder?: "ASC" | "DESC" = "DESC";

  /**
   * Search keyword for text-based filtering
   */
  SearchKeyword?: string;
}
