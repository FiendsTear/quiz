import { z } from "zod";
export const createQuestionDTO = z.object({
  quizID: z.number(),
  body: z.string(),
});
export type CreateQuestionDTO = z.infer<typeof createQuestionDTO>;
