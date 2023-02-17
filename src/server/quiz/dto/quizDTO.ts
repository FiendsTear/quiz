import { z } from "zod";
export const quizDTO = z.object({
  id: z.number().optional().default(0),
  name: z.string().optional(),
  isPublished: z.boolean().optional(),
  isPrivate: z.boolean().optional(),
});
export type QuizDTO = z.infer<typeof quizDTO>;
