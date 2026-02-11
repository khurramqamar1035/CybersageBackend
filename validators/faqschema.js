import { z } from "zod";

export const faqCreateSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.string().min(1),
  order: z.number().optional().default(0),
});

export const faqUpdateSchema = z.object({
  question: z.string().optional(),
  answer: z.string().optional(),
  category: z.string().optional(),
  order: z.number().optional(),
});
