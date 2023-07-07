import { z } from "zod";

export const questionDTO = z.object({
  id: z.number().optional().default(0),
  quizID: z.number().optional(),
  body: z.string().nullable().default(""),
  order: z.number().optional(),
  answerWeight: z.number().default(1),
  answerDescription: z.string().nullable().default(""),
});
export type QuestionDTO = z.infer<typeof questionDTO>;
