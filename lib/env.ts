import { z } from 'zod';

const envSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET should be at least 32 characters"),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_API_KEY_BACKUP: z.string().optional(),
  NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: z.string().optional(),
  NEXT_PUBLIC_BASE_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const processEnv = {
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_API_KEY_BACKUP: process.env.GEMINI_API_KEY_BACKUP,
  NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  NODE_ENV: process.env.NODE_ENV,
};

const parsed = envSchema.safeParse(processEnv);

if (!parsed.success) {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Missing required production environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  } else {
    console.warn('⚠️ Missing some environment variables in development:', parsed.error.flatten().fieldErrors);
  }
}

export const env = parsed.success ? parsed.data : (processEnv as unknown as z.infer<typeof envSchema>);
