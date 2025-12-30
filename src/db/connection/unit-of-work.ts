import mysql from "mysql2/promise";
import type {
  Pool,
  PoolConnection,
  QueryResult,
  FieldPacket,
} from "mysql2/promise";
import { injectable, inject } from "inversify";
import { TYPES } from "@/core/container/types";
import { DatabaseConnection } from "./connection";

/**
 * ============================================================================
 * UNIT OF WORK PATTERN
 * ============================================================================
 *
 * The Unit of Work pattern maintains a list of operations and coordinates
 * the writing of changes as a single transaction.
 *
 * This implementation provides:
 * - Request-scoped transaction isolation
 * - Automatic rollback on errors
 * - Nested transaction support via savepoints
 * - Connection pooling
 *
 * @example
 * // In a service method
 * async createUserWithProfile(userData: UserDto): Promise<User> {
 *   return this.unitOfWork.withTransaction(async (uow) => {
 *     // All queries use the same connection
 *     const [userResult] = await uow.execute(
 *       "INSERT INTO User (id, email) VALUES (?, ?)",
 *       [userId, userData.email]
 *     );
 *
 *     const [profileResult] = await uow.execute(
 *       "INSERT INTO Profile (userId, name) VALUES (?, ?)",
 *       [userId, userData.name]
 *     );
 *
 *     return user;
 *     // Transaction auto-commits on success, rolls back on error
 *   });
 * }
 */

/**
 * Unit of Work interface for transaction management
 */
export interface IUnitOfWork {
  /**
   * Execute a query within the current transaction
   */
  execute(sql: string, params?: any[]): Promise<[QueryResult, FieldPacket[]]>;

  /**
   * Run a callback within a transaction
   * Automatically commits on success, rolls back on error
   */
  withTransaction<T>(callback: (uow: IUnitOfWork) => Promise<T>): Promise<T>;

  /**
   * Create a savepoint for nested transactions
   */
  savepoint(name: string): Promise<void>;

  /**
   * Rollback to a savepoint
   */
  rollbackToSavepoint(name: string): Promise<void>;

  /**
   * Release a savepoint
   */
  releaseSavepoint(name: string): Promise<void>;
}

/**
 * Unit of Work implementation
 * Each instance manages its own connection for transaction isolation
 */
@injectable()
export class UnitOfWork implements IUnitOfWork {
  private pool: Pool;
  private connection: PoolConnection | null = null;
  private transactionDepth = 0;
  private savepointCounter = 0;

  constructor(
    @inject(TYPES.DatabaseConnection) dbConnection: DatabaseConnection
  ) {
    // Get the pool from the existing connection
    // In production, you'd inject the pool directly
    this.pool = (dbConnection as any).pool;
  }

  /**
   * Get a connection for the current transaction
   */
  private async getConnection(): Promise<PoolConnection> {
    if (!this.connection) {
      this.connection = await this.pool.getConnection();
    }
    return this.connection;
  }

  /**
   * Release the connection back to the pool
   */
  private releaseConnection(): void {
    if (this.connection) {
      this.connection.release();
      this.connection = null;
      this.transactionDepth = 0;
    }
  }

  /**
   * Execute a query
   * Uses the transaction connection if one exists, otherwise uses pool
   */
  async execute(
    sql: string,
    params?: any[]
  ): Promise<[QueryResult, FieldPacket[]]> {
    const connection = this.connection || this.pool;
    return await connection.query(sql, params);
  }

  /**
   * Run a callback within a transaction
   * Supports nested transactions via savepoints
   */
  async withTransaction<T>(
    callback: (uow: IUnitOfWork) => Promise<T>
  ): Promise<T> {
    const connection = await this.getConnection();
    const isNested = this.transactionDepth > 0;
    const savepointName = `sp_${++this.savepointCounter}`;

    try {
      if (isNested) {
        // Use savepoint for nested transaction
        await connection.query(`SAVEPOINT ${savepointName}`);
      } else {
        // Start real transaction
        await connection.beginTransaction();
      }

      this.transactionDepth++;

      // Execute the callback
      const result = await callback(this);

      if (isNested) {
        // Release savepoint
        await connection.query(`RELEASE SAVEPOINT ${savepointName}`);
      } else {
        // Commit transaction
        await connection.commit();
      }

      this.transactionDepth--;

      // Release connection only when outermost transaction completes
      if (this.transactionDepth === 0) {
        this.releaseConnection();
      }

      return result;
    } catch (error) {
      this.transactionDepth--;

      if (isNested) {
        // Rollback to savepoint
        await connection.query(`ROLLBACK TO SAVEPOINT ${savepointName}`);
      } else {
        // Rollback transaction
        await connection.rollback();
        this.releaseConnection();
      }

      throw error;
    }
  }

  /**
   * Create a named savepoint
   */
  async savepoint(name: string): Promise<void> {
    if (!this.connection) {
      throw new Error("No active transaction. Call withTransaction first.");
    }
    await this.connection.query(`SAVEPOINT ${name}`);
  }

  /**
   * Rollback to a named savepoint
   */
  async rollbackToSavepoint(name: string): Promise<void> {
    if (!this.connection) {
      throw new Error("No active transaction.");
    }
    await this.connection.query(`ROLLBACK TO SAVEPOINT ${name}`);
  }

  /**
   * Release a named savepoint
   */
  async releaseSavepoint(name: string): Promise<void> {
    if (!this.connection) {
      throw new Error("No active transaction.");
    }
    await this.connection.query(`RELEASE SAVEPOINT ${name}`);
  }
}

/**
 * ============================================================================
 * TRANSACTION DECORATOR
 * ============================================================================
 *
 * Decorator to automatically wrap a method in a transaction
 *
 * @example
 * class UserService {
 *   @Transactional()
 *   async createUserWithProfile(data: CreateUserDto): Promise<User> {
 *     // This method automatically runs in a transaction
 *     // Access transaction via this.unitOfWork
 *   }
 * }
 */
export function Transactional() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (this: any, ...args: any[]) {
      // Expect the class to have a unitOfWork property
      const unitOfWork: IUnitOfWork = this.unitOfWork || this._unitOfWork;

      if (!unitOfWork) {
        throw new Error(
          `@Transactional requires the class to have a 'unitOfWork' or '_unitOfWork' property`
        );
      }

      return unitOfWork.withTransaction(async () => {
        return originalMethod.apply(this, args);
      });
    };

    return descriptor;
  };
}
