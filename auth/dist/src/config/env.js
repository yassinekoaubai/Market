import { z } from 'zod';
const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(16),
    JWT_EXPIRES_IN: z.string().default('7d'),
    JWT_REFRESH_EXPIRE_IN: z.string().default('30d'),
    PORT: z.coerce.number().default(3000),
    NODE_ENV: z.string().default('development'),
});
export const env = envSchema.parse(process.env);
export const ENV = env;
export const isDevelopment = ENV.NODE_ENV === 'development';
//# sourceMappingURL=env.js.map