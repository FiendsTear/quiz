import { z } from "zod";

export const questionDTO = z.object({
  id: z.number().optional().default(0),
  quizID: z.number(),
  body: z.string().nullable().default(""),
  order: z.number(),
  answerWeight: z.number().default(1),
});
export type QuestionDTO = z.infer<typeof questionDTO>;
