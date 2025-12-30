/**
 * ============================================================================
 * API RESPONSE TYPES
 * ============================================================================
 *
 * These types provide a consistent API response structure with clear
 * differentiation between single entity and paged list responses.
 */

/**
 * Standard API response wrapper
 * Used for all API responses to provide consistent structure
 */
export class Response<T> {
  IsSuccess: boolean;
  Status: number;
  Message: string;
  Model: T;

  constructor(success: boolean, status: number, message: string, model: T) {
    this.IsSuccess = success;
    this.Status = status;
    this.Message = message;
    this.Model = model;
  }
}

/**
 * ============================================================================
 * SINGLE ENTITY RESULT
 * ============================================================================
 */

/**
 * Result wrapper for a single entity
 * Use this for getById, create, update operations
 */
export class SingleResult<T> {
  Data: T | null;

  constructor(data: T | null) {
    this.Data = data;
  }

  static of<T>(entity: T): SingleResult<T> {
    return new SingleResult<T>(entity);
  }

  static empty<T>(): SingleResult<T> {
    return new SingleResult<T>(null);
  }

  get hasData(): boolean {
    return this.Data !== null;
  }
}

/**
 * ============================================================================
 * PAGED LIST RESULT
 * ============================================================================
 */

/**
 * Result wrapper for paginated lists
 * Use this for getAll, search operations
 */
export class PagedListResult<T> {
  Data: T[];
  Pagination: PaginationInfo;

  constructor(data: T[], pagination: PaginationInfo) {
    this.Data = data;
    this.Pagination = pagination;
  }

  static of<T>(
    data: T[],
    pageIndex: number,
    pageSize: number,
    totalRecords: number
  ): PagedListResult<T> {
    return new PagedListResult<T>(
      data,
      new PaginationInfo(pageIndex, pageSize, totalRecords)
    );
  }

  static empty<T>(): PagedListResult<T> {
    return new PagedListResult<T>([], new PaginationInfo(1, 10, 0));
  }

  get isEmpty(): boolean {
    return this.Data.length === 0;
  }

  get totalPages(): number {
    return this.Pagination.TotalPages;
  }
}

/**
 * Pagination metadata
 */
export class PaginationInfo {
  PageIndex: number;
  PageSize: number;
  TotalRecords: number;
  TotalPages: number;
  HasPreviousPage: boolean;
  HasNextPage: boolean;

  constructor(pageIndex: number, pageSize: number, totalRecords: number) {
    this.PageIndex = pageIndex;
    this.PageSize = pageSize;
    this.TotalRecords = totalRecords;
    this.TotalPages = Math.ceil(totalRecords / pageSize);
    this.HasPreviousPage = pageIndex > 1;
    this.HasNextPage = pageIndex < this.TotalPages;
  }
}

/**
 * ============================================================================
 * LEGACY RESULT TYPE (Deprecated - kept for backward compatibility)
 * ============================================================================
 */

/**
 * @deprecated Use SingleResult<T> or PagedListResult<T> instead
 * This class conflates single and paged results which causes type confusion
 */
export class Result<T> {
  Entity: T | null;
  Result: PagedResult<T> | null;

  private constructor(entity: T | null, result: PagedResult<T> | null) {
    this.Entity = entity;
    this.Result = result;
  }

  static toEntityResult<T>(entity: T): Result<T> {
    return new Result<T>(entity, null);
  }

  static toPagedResult<T>(
    pageIndex: number,
    pageSize: number,
    totalRecords: number,
    result: T[] | null = null
  ): Result<T> {
    return new Result<T>(
      null,
      new PagedResult<T>(pageIndex, pageSize, totalRecords, result)
    );
  }

  /**
   * Convert legacy Result to new SingleResult
   */
  toSingleResult(): SingleResult<T> {
    return new SingleResult<T>(this.Entity);
  }

  /**
   * Convert legacy Result to new PagedListResult
   */
  toPagedListResult(): PagedListResult<T> {
    if (!this.Result) {
      return PagedListResult.empty<T>();
    }
    return PagedListResult.of(
      this.Result.Records || [],
      this.Result.PageIndex,
      this.Result.PageSize,
      this.Result.TotalRecords
    );
  }
}

/**
 * @deprecated Use PaginationInfo instead
 */
export class PagedResult<T> {
  PageIndex: number;
  PageSize: number;
  TotalRecords: number;
  Records: T[] | null;

  constructor(
    pageindex: number,
    pageSize: number,
    totalRecords: number,
    result: T[] | null
  ) {
    this.PageIndex = pageindex;
    this.PageSize = pageSize;
    this.TotalRecords = totalRecords;
    this.Records = result;
  }
}

/**
 * ============================================================================
 * TYPE ALIASES FOR COMMON RESPONSE PATTERNS
 * ============================================================================
 */

/** API response containing a single entity */
export type SingleResponse<T> = Response<SingleResult<T>>;

/** API response containing a paginated list */
export type PagedResponse<T> = Response<PagedListResult<T>>;

/** API response containing just a success/failure message */
export type MessageResponse = Response<null>;

/**
 * ============================================================================
 * RESPONSE FACTORY HELPERS
 * ============================================================================
 */

export const ApiResponse = {
  /** Create a success response with single entity */
  single<T>(data: T, message = "Success"): Response<SingleResult<T>> {
    return new Response(true, 200, message, SingleResult.of(data));
  },

  /** Create a success response with paginated list */
  paged<T>(
    data: T[],
    pageIndex: number,
    pageSize: number,
    totalRecords: number,
    message = "Success"
  ): Response<PagedListResult<T>> {
    return new Response(
      true,
      200,
      message,
      PagedListResult.of(data, pageIndex, pageSize, totalRecords)
    );
  },

  /** Create a success response with no data */
  success(message = "Success"): Response<null> {
    return new Response(true, 200, message, null);
  },

  /** Create a created response (201) with single entity */
  created<T>(
    data: T,
    message = "Created successfully"
  ): Response<SingleResult<T>> {
    return new Response(true, 201, message, SingleResult.of(data));
  },

  /** Create a not found response */
  notFound(message = "Resource not found"): Response<null> {
    return new Response(false, 404, message, null);
  },

  /** Create a bad request response */
  badRequest(message = "Bad request"): Response<null> {
    return new Response(false, 400, message, null);
  },

  /** Create an error response */
  error(status: number, message: string): Response<null> {
    return new Response(false, status, message, null);
  },
};
