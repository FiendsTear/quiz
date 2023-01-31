import { z } from "zod";

export const questionDTO = z.object({
  id: z.number().optional().default(0),
  quizID: z.number(),
  body: z.string().optional().default("")
});
export type QuestionDTO = z.infer<typeof questionDTO>;
