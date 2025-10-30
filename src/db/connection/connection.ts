import mysql, { Pool } from "mysql2/promise";
import { injectable } from "inversify";
import { config } from "@/core/config/environment";

/**
 * Manages database connections and transactions using a connection pool
 * Provides methods for query execution and transaction management
 */
@injectable()
export class DatabaseConnection {
  private pool: Pool;

  /**
   * Initializes the database connection pool using environment configuration
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
   * Executes a SQL query with optional parameters
   * @param sql The SQL query string to execute
   * @param params Optional array of parameter values for the query
   * @returns Promise resolving to query results and field information
   */
  async execute(
    sql: string,
    params?: any[]
  ): Promise<[mysql.QueryResult, mysql.FieldPacket[]]> {
    return await this.pool.query(sql, params);
  }

  /**
   * Begin a database transaction
   */
  async beginTransaction(): Promise<void> {
    const connection = await this.pool.getConnection();
    await connection.beginTransaction();
  }

  /**
   * Commit the current transaction
   */
  async commit(): Promise<void> {
    const connection = await this.pool.getConnection();
    await connection.commit();
    connection.release();
  }

  /**
   * Rollback the current transaction
   */
  async rollback(): Promise<void> {
    const connection = await this.pool.getConnection();
    await connection.rollback();
    connection.release();
  }

  /**
   * Close the database connection pool
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
}
