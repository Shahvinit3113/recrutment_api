/**
 * Database module exports
 *
 * Central export point for all database-related functionality.
 */

// Connection
export { getKnex, testDbConnection, closeDbConnection } from "./connection";

// Configuration
export { createKnexConfig } from "./config/knex.config";

// Tables
export { TableNames, type TableName, type TableKey } from "./tables";

// Types
export type {
  DatabaseTables,
  EntityFromTable,
  PaginationOptions,
  SortOptions,
  SearchOptions,
  ListQueryOptions,
  PaginationMeta,
  PaginatedResult,
  SelectColumns,
  WhereCondition,
} from "./types";

// Seeds
export { SeedRunner, type SeedDefinition } from "./seeds";
