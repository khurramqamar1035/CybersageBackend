import { z } from "zod";

export const serviceRequestSchema = z.object({
  serviceId: z.string().min(1),
});

export const pricingRequestSchema = z.object({
  serviceId: z.string().min(1),
});

export const adminServiceUpdateSchema = z.object({
  userId: z.string().min(1),
  serviceId: z.string().min(1),
  paymentStatus: z.string().max(40).optional(),
  status: z.string().max(40).optional(),
  price: z.number().nonnegative().optional(),
  deliveryDate: z.string().max(40).optional(),
  riskLevel: z.string().max(40).optional(),
});
