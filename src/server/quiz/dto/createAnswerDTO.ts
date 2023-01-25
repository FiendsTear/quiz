import { z } from "zod";
export const createAnswerDTO = z.object({
  body: z.string(),
  isCorrect: z.boolean(),
  questionID: z.number(),
});
export type CreateAnswerDTO = z.infer<typeof createAnswerDTO>;
