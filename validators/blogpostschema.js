import { z } from "zod";

export const blogPostCreateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().min(1),
  author: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string()).optional().default([]),
  featured_image: z.string().nullable().optional(),
  published: z.boolean().optional().default(true),
});

export const blogPostUpdateSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  author: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  featured_image: z.string().nullable().optional(),
  published: z.boolean().optional(),
});
