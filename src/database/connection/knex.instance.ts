import knex, { Knex } from "knex";
import { config } from "@/core/config/environment";
import { createKnexConfig } from "../config/knex.config";

/**
 * Singleton class for managing the Knex database connection
 *
 * Provides a single Knex instance shared across the application.
 * Handles connection testing and graceful shutdown.
 */
class KnexConnection {
  private static instance: Knex | null = null;

  /**
   * Get the Knex instance (creates if not exists)
   * This is the main entry point for database access
   */
  static getInstance(): Knex {
    if (!KnexConnection.instance) {
      const knexConfig = createKnexConfig({
        host: config.DB_HOST,
        port: config.DB_PORT,
        user: config.DB_USER,
        password: config.DB_PASSWORD,
        database: config.DB_NAME,
        connectionLimit: config.DB_CONNECTION_LIMIT,
        isDevelopment: config.NODE_ENV === "development",
      });

      KnexConnection.instance = knex(knexConfig);
    }

    return KnexConnection.instance;
  }

  /**
   * Test the database connection
   * @returns true if connection is successful, false otherwise
   */
  static async testConnection(): Promise<boolean> {
    try {
      const db = KnexConnection.getInstance();
      await db.raw("SELECT 1");
      console.log("✅ Database connection established");
      return true;
    } catch (error) {
      console.error("❌ Database connection failed:", error);
      return false;
    }
  }

  /**
   * Gracefully close the database connection pool
   * Call this during application shutdown
   */
  static async destroy(): Promise<void> {
    if (KnexConnection.instance) {
      await KnexConnection.instance.destroy();
      KnexConnection.instance = null;
      console.log("📤 Database connection closed");
    }
  }
}

/**
 * Get the Knex database instance
 * @returns Knex instance
 */
export const getKnex = (): Knex => KnexConnection.getInstance();

/**
 * Test the database connection
 * @returns true if connection is successful
 */
export const testDbConnection = (): Promise<boolean> =>
  KnexConnection.testConnection();

/**
 * Close the database connection pool
 */
export const closeDbConnection = (): Promise<void> => KnexConnection.destroy();
