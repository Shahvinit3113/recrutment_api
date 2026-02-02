import { injectable } from 'inversify';
import { Knex } from 'knex';
import { getKnex } from '@/database/connection';
import { TableName } from '@/database/tables';
import { BaseEntities } from '@/data/entities/base-entities';
import { IUnitOfWork } from '../interfaces/unit-of-work.interface';
import { IRepository } from '../interfaces/repository.interface';
import { Repository } from '../generic/repository';

/**
 * Unit of Work Implementation
 * 
 * Central access point for all repositories.
 * Manages repository instances and provides transaction support.
 * 
 * This is the main class injected into services. It provides:
 * - Generic repository access for any entity
 * - Transaction support with automatic commit/rollback
 * - Repository caching for performance
 * 
 * Similar to .NET's UnitOfWork pattern where you access DbSets through context.
 * 
 * @example
 * ```typescript
 * // In a service
 * class UserService extends BaseService<User> {
 *   constructor(unitOfWork: IUnitOfWork) {
 *     super(unitOfWork, TableNames.User);
 *   }
 * 
 *   async createUserWithProfile(user: User, profile: UserInfo) {
 *     return await this.unitOfWork.transaction(async (trx) => {
 *       const userRepo = this.unitOfWork.getTransactionalRepository<User>(TableNames.User, trx);
 *       const profileRepo = this.unitOfWork.getTransactionalRepository<UserInfo>(TableNames.UserInfo, trx);
 *       
 *       await userRepo.create(user);
 *       await profileRepo.create(profile);
 *       
 *       return user;
 *     });
 *   }
 * }
 * ```
 */
@injectable()
export class UnitOfWork implements IUnitOfWork {
  private readonly knex: Knex;
  private readonly repositoryCache: Map<string, IRepository<BaseEntities>>;

  constructor() {
    this.knex = getKnex();
    this.repositoryCache = new Map();
  }

  /**
   * Get a repository for the specified table
   * 
   * Repositories are cached for performance. Multiple calls with the same
   * table name return the same repository instance.
   */
  getRepository<T extends BaseEntities>(tableName: TableName): IRepository<T> {
    // Check cache first
    const cached = this.repositoryCache.get(tableName);
    if (cached) {
      return cached as IRepository<T>;
    }

    // Create new repository and cache it
    const repository = new Repository<T>(this.knex, tableName);
    this.repositoryCache.set(tableName, repository as IRepository<BaseEntities>);

    return repository;
  }

  /**
   * Get a transactional repository
   * 
   * Creates a new repository bound to the transaction.
   * Not cached since transactions are short-lived.
   */
  getTransactionalRepository<T extends BaseEntities>(
    tableName: TableName,
    trx: Knex.Transaction
  ): IRepository<T> {
    // Always create new instance for transactions (no caching)
    // The transaction object implements the Knex interface
    return new Repository<T>(trx as unknown as Knex, tableName);
  }

  /**
   * Execute operations within a transaction
   * 
   * Automatically commits on success, rolls back on error.
   */
  async transaction<TResult>(
    callback: (trx: Knex.Transaction) => Promise<TResult>
  ): Promise<TResult> {
    return await this.knex.transaction(callback);
  }

  /**
   * Execute a raw SQL query
   */
  async raw<TResult = unknown>(
    sql: string,
    bindings?: readonly unknown[]
  ): Promise<TResult> {
    const result = await this.knex.raw(sql, bindings as unknown[]);
    // MySQL returns [rows, fields], we want just rows
    return result[0] as TResult;
  }

  /**
   * Clear the repository cache
   */
  clearCache(): void {
    this.repositoryCache.clear();
  }
}
