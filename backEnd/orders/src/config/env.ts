import dotenv from "dotenv";

dotenv.config();

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const getOptionalEnv = (key: string, defaultValue: string): string => {
  return process.env[key] ?? defaultValue;
};

export const ENV = {
  // Database
  DATABASE_URL: getRequiredEnv("DATABASE_URL"),

  // Server
  PORT: parseInt(getOptionalEnv("PORT", "3002"), 10),
  NODE_ENV: getOptionalEnv("NODE_ENV", "development"),

  // CORS
  CORS_ORIGIN: getOptionalEnv("CORS_ORIGIN", "http://localhost:3000"),

  // Microservices
  AUTH_SERVICE_URL: getOptionalEnv("AUTH_SERVICE_URL", "http://localhost:3000"),
  CATALOG_SERVICE_URL: getOptionalEnv("CATALOG_SERVICE_URL", "http://localhost:3001"),
} as const;

export const isDevelopment = ENV.NODE_ENV === "development";
export const isProduction = ENV.NODE_ENV === "production";
