import { Knex } from "knex";
import { BaseEntities } from "@/data/entities/base-entities";
import { TableName } from "@/database/tables";
import { IRepository } from "./repository.interface";

/**
 * Unit of Work Interface
 *
 * Central access point for all repositories.
 * Manages repository instances and provides transaction support.
 *
 * Similar to .NET's IUnitOfWork pattern:
 * - Get repositories for any entity type
 * - Execute operations in transactions
 * - Share database context across repositories
 *
 * @example
 * ```typescript
 * // Get repository for any entity
 * const userRepo = unitOfWork.getRepository<User>(TableNames.User);
 * const taskRepo = unitOfWork.getRepository<Task>(TableNames.Task);
 *
 * // Use in transaction
 * await unitOfWork.transaction(async (trx) => {
 *   const userRepo = unitOfWork.getTransactionalRepository<User>(TableNames.User, trx);
 *   await userRepo.create(newUser);
 * });
 * ```
 */
interface IUnitOfWork {
  /**
   * Get a repository for the specified table
   *
   * Repositories are cached for performance within the same UnitOfWork instance.
   *
   * @template T - Entity type
   * @param tableName - Database table name
   * @returns Repository instance for the entity
   */
  getRepository<T extends BaseEntities>(tableName: TableName): IRepository<T>;

  /**
   * Get a transactional repository
   *
   * Use this inside transaction callback for transaction-scoped operations.
   * These repositories share the same transaction context.
   *
   * @template T - Entity type
   * @param tableName - Database table name
   * @param trx - Knex transaction object
   * @returns Repository instance bound to the transaction
   */
  getTransactionalRepository<T extends BaseEntities>(
    tableName: TableName,
    trx: Knex.Transaction,
  ): IRepository<T>;

  /**
   * Execute operations within a database transaction
   *
   * Automatically commits on success, rolls back on error.
   * All repositories obtained via getTransactionalRepository share the same transaction.
   *
   * @template TResult - Return type of the callback
   * @param callback - Function containing transaction operations
   * @returns Result of the callback function
   * @throws Re-throws any error after rollback
   */
  transaction<TResult>(
    callback: (trx: Knex.Transaction) => Promise<TResult>,
  ): Promise<TResult>;

  /**
   * Execute a raw SQL query
   *
   * Use for complex queries not supported by the repository interface.
   *
   * @template TResult - Expected result type
   * @param sql - Raw SQL query string with ? placeholders
   * @param bindings - Values to bind to placeholders
   * @returns Query result
   */
  raw<TResult = unknown>(
    sql: string,
    bindings?: readonly unknown[],
  ): Promise<TResult>;

  /**
   * Clear the repository cache
   *
   * Useful when you need fresh repository instances.
   */
  clearCache(): void;
}

export type { IUnitOfWork };
