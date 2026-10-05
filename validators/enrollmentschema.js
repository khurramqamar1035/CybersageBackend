import { z } from "zod";

export const waitlistSchema = z.object({
  email: z.string().email(),
});

export const enrollmentStatusSchema = z.object({
  enrollmentOpen: z.boolean(),
});
