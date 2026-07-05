import * as z from "zod";

const envSchema = z.object({
  HOST: z.string().default("localhost"),
  PORT: z.string().default("8080").transform(Number),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  POSTGRES_HOST: z.string().default("localhost"),
  POSTGRES_PORT: z.string().default("5432").transform(Number),
  POSTGRES_USER: z.string().default("restaurants"),
  POSTGRES_PASSWORD: z.string().default("S3cureP@ssw0rd"),
  POSTGRES_DB: z.string().default("restaurants"),
});

const env = z.parse(envSchema, process.env);

export const config = {
  host: env.HOST,
  port: env.PORT,
  envMode: env.NODE_ENV,
  postgres: {
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
  },
} as const;
