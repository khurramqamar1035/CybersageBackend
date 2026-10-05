import { z } from "zod";

// Mirrors the required-field check in applyInternship.
export const internApplySchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(6).max(30),
  degree: z.string().min(1).max(120),
  universityYear: z.string().min(1).max(40),
  university: z.string().max(160).optional(),
  skills: z.union([z.string().max(1000), z.array(z.string().max(80))]).optional(),
});

// Matches the enum on InternModel.status.
export const internStatusSchema = z.object({
  status: z.enum(["pending", "reviewed", "accepted", "rejected"]),
});
