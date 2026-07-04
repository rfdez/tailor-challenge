import * as z from "zod";

const envSchema = z.object({
  HOST: z.string().default("localhost"),
  PORT: z.string().default("8080").transform(Number),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const env = z.parse(envSchema, process.env);

export const config = {
  host: env.HOST,
  port: env.PORT,
  envMode: env.NODE_ENV,
} as const;
