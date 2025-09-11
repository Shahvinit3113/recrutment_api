import dotenv from "dotenv";
import { Algorithm } from "jsonwebtoken";
import { CipherGCMTypes } from "crypto";

dotenv.config();

interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;

  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_CONNECTION_LIMIT: number;

  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD?: string;

  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  JWT_ALGORITHM: Algorithm;

  BCRYPT_ROUNDS: number;
  BCRYPT_ALGORITHM: CipherGCMTypes;

  MAX_FILE_SIZE: number;
  ALLOWED_FILE_TYPES: string[];
  CORS_ORIGINS: string[];

  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
}

const requiredEnvVars: (keyof Partial<EnvironmentConfig>)[] = [
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
  "JWT_SECRET",
];

// Validate required environment variables
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

export const config: EnvironmentConfig = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3000", 10),

  // Database Configuration
  DB_HOST: process.env.DB_HOST!,
  DB_PORT: parseInt(process.env.DB_PORT || "3306", 10),
  DB_USER: process.env.DB_USER!,
  DB_PASSWORD: process.env.DB_PASSWORD!,
  DB_NAME: process.env.DB_NAME!,
  DB_CONNECTION_LIMIT: parseInt(process.env.DB_CONNECTION_LIMIT || "10", 10),

  // Redis Configuration
  REDIS_HOST: process.env.REDIS_HOST || "localhost",
  REDIS_PORT: parseInt(process.env.REDIS_PORT || "6379", 10),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "24h",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  JWT_ALGORITHM: (process.env.JWT_ALGORITHM as Algorithm) || "HS256",

  // Security Configuration
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || "12", 10),
  BCRYPT_ALGORITHM:
    (process.env.BCRYPT_ALGORITHM as CipherGCMTypes) || "aes-256-gcm",

  // File Upload Configuration
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || "5242880", 10), // 5MB
  ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES?.split(",") || [
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
  ],

  // CORS Configuration
  CORS_ORIGINS: process.env.CORS_ORIGINS?.split(",") || [
    "http://localhost:3000",
  ],

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(
    process.env.RATE_LIMIT_WINDOW_MS || "900000",
    10
  ),
  RATE_LIMIT_MAX_REQUESTS: parseInt(
    process.env.RATE_LIMIT_MAX_REQUESTS || "100",
    10
  ),
};

export const isDevelopment = config.NODE_ENV === "development";
export const isProduction = config.NODE_ENV === "production";
export const isTest = config.NODE_ENV === "test";
