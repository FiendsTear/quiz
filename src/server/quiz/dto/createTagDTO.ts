import { z } from "zod";
export const createTagDTO = z.object({
  quizID: z.number(),
  name: z.string()
});
export type CreateTagDTO = z.infer<typeof createTagDTO>;
