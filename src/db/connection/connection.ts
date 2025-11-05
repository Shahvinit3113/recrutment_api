import mysql from "mysql2/promise";
import type {
  FieldPacket,
  Pool,
  PoolConnection,
  QueryResult,
} from "mysql2/promise";
import { injectable } from "inversify";
import { config } from "@/core/config/environment";

/**
 * Defines the contract for database connection and transaction management.
 */
export interface IDatabaseConnection {
  /**
   * Executes a SQL query with optional parameters.
   * @param sql The SQL query string to execute.
   * @param params Optional array of parameter values for the query.
   * @returns Promise resolving to query results and field information.
   */
  execute(
    sql: string,
    params?: any[]
  ): Promise<[mysql.QueryResult, mysql.FieldPacket[]]>;

  /**
   * Begins a new database transaction.
   */
  beginTransaction(): Promise<void>;

  /**
   * Commits the current transaction.
   */
  commit(): Promise<void>;

  /**
   * Rolls back the current transaction.
   */
  rollback(): Promise<void>;

  /**
   * Closes the database connection pool.
   */
  close(): Promise<void>;
}

/**
 * Manages database connections and transactions using a connection pool.
 * Provides methods for query execution and transaction management.
 */
@injectable()
export class DatabaseConnection implements IDatabaseConnection {
  private pool: Pool;
  private transactionConnection: PoolConnection | null = null;

  /**
   * Initializes the database connection pool using environment configuration.
   */
  constructor() {
    this.pool = mysql.createPool({
      host: config.DB_HOST,
      port: config.DB_PORT,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DB_NAME,
      connectionLimit: config.DB_CONNECTION_LIMIT,
    });
  }

  /**
   * Executes a SQL query with optional parameters.
   * If a transaction is active, it uses the same connection.
   */
  async execute(
    sql: string,
    params?: any[]
  ): Promise<[QueryResult, FieldPacket[]]> {
    const connection = this.transactionConnection || this.pool;
    return await connection.query(sql, params);
  }

  /**
   * Begins a new database transaction.
   * Reuses the same connection for all subsequent operations.
   */
  async beginTransaction(): Promise<void> {
    if (this.transactionConnection) {
      throw new Error("A transaction is already in progress.");
    }
    this.transactionConnection = await this.pool.getConnection();
    await this.transactionConnection.beginTransaction();
  }

  /**
   * Commits the current transaction and releases the connection.
   */
  async commit(): Promise<void> {
    if (!this.transactionConnection) {
      throw new Error("No transaction in progress to commit.");
    }
    await this.transactionConnection.commit();
    this.transactionConnection.release();
    this.transactionConnection = null;
  }

  /**
   * Rolls back the current transaction and releases the connection.
   */
  async rollback(): Promise<void> {
    if (!this.transactionConnection) {
      throw new Error("No transaction in progress to roll back.");
    }
    await this.transactionConnection.rollback();
    this.transactionConnection.release();
    this.transactionConnection = null;
  }

  /**
   * Closes the database connection pool.
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
}
