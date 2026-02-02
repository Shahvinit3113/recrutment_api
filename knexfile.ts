import type { Knex } from "knex";
import { config } from "./src/core/config/environment";

/**
 * Knex configuration for database migrations and seeding
 *
 * Usage:
 *   npm run db:migrate        - Run pending migrations
 *   npm run db:migrate:make   - Create new migration
 *   npm run db:seed           - Run seed files
 */
const knexConfig: Record<string, Knex.Config> = {
  development: {
    client: "mysql2",
    connection: {
      host: config.DB_HOST,
      port: config.DB_PORT,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DB_NAME,
    },
    pool: {
      min: 2,
      max: config.DB_CONNECTION_LIMIT,
    },
    migrations: {
      directory: "./src/database/migrations",
      extension: "ts",
      tableName: "knex_migrations",
    },
    seeds: {
      directory: "./src/database/seeds",
      extension: "ts",
    },
  },

  staging: {
    client: "mysql2",
    connection: {
      host: config.DB_HOST,
      port: config.DB_PORT,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DB_NAME,
    },
    pool: {
      min: 2,
      max: config.DB_CONNECTION_LIMIT,
    },
    migrations: {
      directory: "./src/database/migrations",
      extension: "ts",
      tableName: "knex_migrations",
    },
    seeds: {
      directory: "./src/database/seeds",
      extension: "ts",
    },
  },

  production: {
    client: "mysql2",
    connection: {
      host: config.DB_HOST,
      port: config.DB_PORT,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DB_NAME,
    },
    pool: {
      min: 2,
      max: config.DB_CONNECTION_LIMIT,
    },
    migrations: {
      directory: "./dist/database/migrations",
      extension: "js",
      tableName: "knex_migrations",
    },
    seeds: {
      directory: "./dist/database/seeds",
      extension: "js",
    },
  },
};

export default knexConfig;
