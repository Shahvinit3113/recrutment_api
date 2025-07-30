import mysql from "mysql2/promise";
import { config } from '@/config/environment';
import { logger } from '@/utils/logger';

class DatabaseConnection {
  private pool: mysql.Pool;
  private static instance: DatabaseConnection;

  private constructor() {
    this.pool = mysql.createPool({
  host: config.DB_HOST,
  port: config.DB_PORT,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  connectionLimit: config.DB_CONNECTION_LIMIT,
  charset: 'utf8mb4',
  timezone: '+00:00',
  dateStrings: false,
  supportBigNumbers: true,
  bigNumberStrings: false,
});

    this.pool.on('connection', (connection) => {
      logger.info(`Database connection established as id ${connection.threadId}`);
    });

    // this.pool.on('error', (err) => {
    //   logger.error('Database pool error:', err);
    //   if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    //     this.handleDisconnect();
    //   } else {
    //     throw err;
    //   }
    // });
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  private handleDisconnect(): void {
    logger.warn('Re-connecting lost MySQL connection');
    // The pool will automatically handle reconnection
  }

  public getPool(): mysql.Pool {
    return this.pool;
  }

  public async testConnection(): Promise<boolean> {
    try {
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();
      logger.info('Database connection test successful');
      return true;
    } catch (error) {
      logger.error('Database connection test failed:', error);
      return false;
    }
  }

  public async closePool(): Promise<void> {
    try {
      await this.pool.end();
      logger.info('Database pool closed successfully');
    } catch (error) {
      logger.error('Error closing database pool:', error);
    }
  }
}

export const dbConnection = DatabaseConnection.getInstance();
export const db = dbConnection.getPool();