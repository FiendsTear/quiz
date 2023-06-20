import { z } from "zod";
export const createRatingDTO = z.object({
  quizID: z.number(),
  value: z.number().min(1).max(5)
});
export type CreateRatingDTO = z.infer<typeof createRatingDTO>;
