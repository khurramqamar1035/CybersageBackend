import { z } from "zod";

export const clientCreateSchema = z.object({
  name: z.string().min(1),
  logo: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  industry: z.string().nullable().optional(),
  featured: z.boolean().optional().default(true),
  order: z.number().optional().default(0),
});

export const clientUpdateSchema = z.object({
  name: z.string().optional(),
  logo: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  industry: z.string().nullable().optional(),
  featured: z.boolean().optional(),
  order: z.number().optional(),
});
