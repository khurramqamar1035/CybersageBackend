import { z } from "zod";

export const createOfficeSchema = z.object({
  city: z.string().min(1),
  country: z.string().min(1),
  address: z.string().min(1),
  type: z.string().min(1)
});
