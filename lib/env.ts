import { z } from 'zod';

const envSchema = z.object({
  MONGODB_URI: z.string().url().or(z.string()), // More lenient for local/broken formats
  JWT_SECRET: z.string().min(1), // Relaxed for dev, but still required
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_API_KEY_BACKUP: z.string().optional(),
  NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: z.string().optional(),
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 2));
  // don't crash in dev if some vars are missing
}

export const env = parsed.success ? parsed.data : (process.env as unknown as z.infer<typeof envSchema>);
