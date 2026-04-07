import { z } from "zod";

export const testimonialCreateSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  company: z.string().min(1),
  content: z.string().min(1),
  rating: z.number().min(1).max(5).optional().default(5),
  avatar: z.string().nullable().optional(),
  featured: z.boolean().optional().default(false),
});

export const testimonialUpdateSchema = z.object({
  name: z.string().optional(),
  role: z.string().optional(),
  company: z.string().optional(),
  content: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  avatar: z.string().nullable().optional(),
  featured: z.boolean().optional(),
});
