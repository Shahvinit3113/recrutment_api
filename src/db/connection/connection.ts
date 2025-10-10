import mysql, { Pool } from "mysql2/promise";
import { injectable } from "inversify";
import { config } from "@/core/config/environment";

@injectable()
export class DatabaseConnection {
  private pool: Pool;

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
