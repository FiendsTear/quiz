import { z } from "zod";

export const validAnswerSchema = z.object({
  body: z.string().min(1),
});

export const validQuestionSchema = z.object({
  id: z.number(),
  body: z.string().min(3),
  answers: z.array(z.object({ isCorrect: z.boolean() })).refine((val) => {
    let isValid = false;
    val.forEach((answer) => {
      if (answer.isCorrect) isValid = true;
    });
    return isValid;
  }, "At least one answer must be correct"),
});

export const validQuizSchema = z.object({
  name: z.string().min(3),
  questions: z.array(z.any()).min(1),
});
export type QuizSchema = z.infer<typeof validQuizSchema>;
