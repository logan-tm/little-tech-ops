import { z } from "zod/v3";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]),
  DB_FILE_NAME: z.string(),
  REDIS_URL: z.string(),
  JWT_ACCESS_TOKEN_SECRET: z.string(),
  JWT_REFRESH_TOKEN_SECRET: z.string(),
});

export const env = envSchema.parse(process.env);
