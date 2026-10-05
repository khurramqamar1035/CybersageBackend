import { z } from "zod";

export const userServiceRefSchema = z.object({
  userServiceId: z.string().min(1),
});
