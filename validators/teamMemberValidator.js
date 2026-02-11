import { z } from "zod";

export const createTeamMemberSchema = z.object({
  teamid:z.string().min(1),
  name: z.string().min(1),
  position: z.string().min(1),
  image: z.string().url(),
  bio: z.string().min(1),
  expertise: z.array(z.string()).optional().default([]),
  education: z.string().min(1)
});
