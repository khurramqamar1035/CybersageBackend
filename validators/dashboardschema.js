import { z } from "zod";

export const dashboardUpdateSchema = z.object({
  userId: z.string().min(1),
  securityScore: z.number().min(0).max(100).optional(),
  threatLevel: z.string().max(40).optional(),
  resolvedIssues: z.number().int().nonnegative().optional(),
  foundIssues: z.number().int().nonnegative().optional(),
  blockedThreats: z.number().int().nonnegative().optional(),
  latestReport: z.string().max(200).optional(),
  nextDelivery: z.string().max(40).optional(),
});
