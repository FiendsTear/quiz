import { z } from "zod";
export const quizDTO = z.object({
  id: z.number().optional().default(0),
  name: z.string()
});
export type QuizDTO = z.infer<typeof quizDTO>;
