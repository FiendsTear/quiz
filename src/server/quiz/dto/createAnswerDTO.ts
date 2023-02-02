import { z } from "zod";
export const answerDTO = z.object({
  id: z.number().optional().default(0),
  body: z.string().nullable().optional(),
  isCorrect: z.boolean().optional().default(false),
  questionID: z.number().optional(),
});
export type AnswerDTO = z.infer<typeof answerDTO>;
