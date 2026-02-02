import type { Knex } from "knex";
import { DatabaseConfigOptions } from "../types/database.types";

/**
 * Create Knex configuration from environment options
 *
 * @param options - Database connection options
 * @returns Knex configuration object
 */
export function createKnexConfig(options: DatabaseConfigOptions): Knex.Config {
  return {
    client: "mysql2",
    connection: {
      host: options.host,
      port: options.port,
      user: options.user,
      password: options.password,
      database: options.database,
    },
    pool: {
      min: 2,
      max: options.connectionLimit,
      // Cleanup idle connections after 30 seconds
      idleTimeoutMillis: 30000,
    },
    // Acquire connection timeout (10 seconds)
    acquireConnectionTimeout: 10000,
    // Enable debug logging in development
    debug: options.isDevelopment,
  };
}
