import { z } from 'zod';

// --- auth ---
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['volunteer', 'ngo']),
  skills: z.array(z.string()).optional(),
  organizationName: z.string().optional(),
  availability: z.array(z.string()).optional(),
  profileImageUrl: z.string().url().optional(),
});

// --- tasks ---
export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  requiredVolunteers: z.number().int().positive(),
  requiredSkills: z.array(z.string()).optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  dateTime: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date' }),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
});

// formats zod errors into something the frontend can display
export function formatZodError(error: any) {
  return error.errors.map((e: any) => ({ path: e.path, message: e.message }));
}
