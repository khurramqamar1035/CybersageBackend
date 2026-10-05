import { z } from "zod";

export const serviceCreateSchema = z.object({
  serviceId: z.string().min(1),
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  defaultSelected: z.boolean().optional(),
});

export const serviceUpdateSchema = serviceCreateSchema.partial();
