import { Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";

/**
 * ============================================================================
 * TYPED EXPRESS REQUEST/RESPONSE HELPERS
 * ============================================================================
 *
 * These types solve the problem of confusing Express generic parameters.
 * Instead of remembering: Request<Params, ResBody, ReqBody, Query>
 * You can use named properties that are self-documenting.
 */

/**
 * Named configuration for typed requests
 * Use this interface to clearly specify what types you expect
 */
export interface TypedRequestConfig<
  TBody = unknown,
  TParams = ParamsDictionary,
  TQuery = ParsedQs
> {
  body: TBody;
  params: TParams;
  query: TQuery;
}

/**
 * TypedRequest - A more intuitive Request type
 *
 * @example
 * // Instead of confusing: Request<{id: string}, any, CreateUserDto, any>
 * // Use clear named properties:
 *
 * interface GetUserParams { id: string }
 * type GetUserRequest = TypedRequest<{ params: GetUserParams }>
 *
 * interface CreateUserBody { name: string; email: string }
 * type CreateUserRequest = TypedRequest<{ body: CreateUserBody }>
 *
 * interface SearchQuery { page: number; limit: number }
 * type SearchRequest = TypedRequest<{ query: SearchQuery }>
 *
 * // Combined:
 * type UpdateUserRequest = TypedRequest<{
 *   params: { id: string };
 *   body: { name: string };
 * }>
 */
export type TypedRequest<TConfig extends Partial<TypedRequestConfig> = {}> =
  Request<
    TConfig extends { params: infer P } ? P : ParamsDictionary,
    any,
    TConfig extends { body: infer B } ? B : unknown,
    TConfig extends { query: infer Q } ? Q : ParsedQs
  >;

/**
 * TypedResponse - Response with typed body
 *
 * @example
 * type UserResponse = TypedResponse<ApiResponse<User>>
 */
export type TypedResponse<TBody = any> = Response<TBody>;

/**
 * ============================================================================
 * SIMPLIFIED REQUEST TYPES FOR COMMON PATTERNS
 * ============================================================================
 */

/**
 * Request with typed body only (POST/PUT with JSON body)
 * @example
 * async create(req: BodyRequest<CreateUserDto>, res: Response) { }
 */
export type BodyRequest<TBody> = TypedRequest<{ body: TBody }>;

/**
 * Request with typed params only (GET/DELETE with URL params)
 * @example
 * async getById(req: ParamsRequest<{ id: string }>, res: Response) { }
 */
export type ParamsRequest<TParams extends ParamsDictionary> = TypedRequest<{
  params: TParams;
}>;

/**
 * Request with typed query only (GET with query string)
 * @example
 * async search(req: QueryRequest<{ page: string; limit: string }>, res: Response) { }
 */
export type QueryRequest<TQuery extends ParsedQs> = TypedRequest<{
  query: TQuery;
}>;

/**
 * Request with typed params and body (PUT/PATCH with ID and body)
 * @example
 * async update(req: ParamsBodyRequest<{ id: string }, UpdateUserDto>, res: Response) { }
 */
export type ParamsBodyRequest<
  TParams extends ParamsDictionary,
  TBody
> = TypedRequest<{ params: TParams; body: TBody }>;

/**
 * Request with typed params and query (GET with ID and filters)
 * @example
 * async getDetails(req: ParamsQueryRequest<{ id: string }, { include: string }>, res: Response) { }
 */
export type ParamsQueryRequest<
  TParams extends ParamsDictionary,
  TQuery extends ParsedQs
> = TypedRequest<{ params: TParams; query: TQuery }>;

/**
 * Full typed request with all properties
 * @example
 * async complexOperation(
 *   req: FullRequest<{ id: string }, UpdateDto, { dryRun: string }>,
 *   res: Response
 * ) { }
 */
export type FullRequest<
  TParams extends ParamsDictionary,
  TBody,
  TQuery extends ParsedQs
> = TypedRequest<{ params: TParams; body: TBody; query: TQuery }>;

/**
 * ============================================================================
 * COMMON PARAM PATTERNS
 * ============================================================================
 */

/** Standard ID parameter */
export interface IdParams {
  id: string;
}

/** Standard pagination query */
export interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/** Standard search query */
export interface SearchQuery extends PaginationQuery {
  search?: string;
}

/**
 * ============================================================================
 * REQUEST HANDLER TYPE
 * ============================================================================
 */

/**
 * Typed request handler for use with decorators
 */
export type TypedRequestHandler<
  TConfig extends Partial<TypedRequestConfig> = {},
  TResponse = any
> = (
  req: TypedRequest<TConfig>,
  res: TypedResponse<TResponse>,
  next: NextFunction
) => Promise<void> | void;

/**
 * ============================================================================
 * AUTHENTICATED REQUEST
 * ============================================================================
 */

/**
 * Extended request with authentication context
 * Includes the requestId and authenticated user info
 */
export interface AuthenticatedRequestExtras {
  requestId: string;
  userId?: string;
  tenantId?: string;
}

export type AuthenticatedRequest<
  TConfig extends Partial<TypedRequestConfig> = {}
> = TypedRequest<TConfig> & AuthenticatedRequestExtras;
