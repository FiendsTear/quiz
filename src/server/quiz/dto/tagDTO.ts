import { z } from "zod";
export const tagDTO = z.object({
  tagID: z.number(),
  quizID: z.number()
});
export type TagDTO = z.infer<typeof tagDTO>;
