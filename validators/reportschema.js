import { z } from "zod";

export const reportCreateSchema = z.object({
  userId: z.string().min(1),
  serviceId: z.string().min(1),
  title: z.string().min(1).max(200),
  date: z.string().max(40).optional(),
  riskLevel: z.string().max(40).optional(),
  executiveSummary: z.string().max(5000).optional(),
  details: z.string().max(20000).optional(),
  pdfUrl: z.string().url().max(500).optional(),
});
