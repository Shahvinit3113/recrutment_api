import { Request } from "express";

/**
 * ============================================================================
 * TYPED EXPRESS REQUEST HELPERS
 * ============================================================================
 *
 * Type-safe wrappers for Express Request types to improve developer experience
 * and catch type errors at compile time.
 */

/**
 * Request with typed body
 */
export type BodyRequest<TBody> = Request<any, any, TBody, any>;

/**
 * Request with typed params
 */
export type ParamsRequest<TParams> = Request<TParams, any, any, any>;

/**
 * Request with typed query
 */
export type QueryRequest<TQuery> = Request<any, any, any, TQuery>;

/**
 * Request with typed params and body
 */
export type TypedRequest<TParams, TBody, TQuery> = Request<TParams, any, TBody, TQuery>;
