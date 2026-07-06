import * as z from "zod";

const envSchema = z.object({
  HOST: z.string().default("localhost"),
  PORT: z.string().default("8080").transform(Number),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_URL: z
    .string()
    .default("postgresql://restaurants:S3cureP@ssw0rd@localhost/restaurants"),
});

const env = z.parse(envSchema, process.env);

export const config = {
  host: env.HOST,
  port: env.PORT,
  envMode: env.NODE_ENV,
  postgres: {
    url: env.DATABASE_URL,
  },
} as const;
