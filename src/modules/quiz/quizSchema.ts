import { z } from "zod";

export const validAnswerParameters = {
  body: {
    minLength: 1,
    maxLength: 300,
  },
};

export const validAnswerSchema = z.object({
  body: z
    .string()
    .min(validAnswerParameters.body.minLength)
    .max(validAnswerParameters.body.maxLength),
});

export const validQuestionSchema = z.object({
  id: z.number(),
  body: z.string().min(3).max(300),
  answers: z
    .array(z.object({ isCorrect: z.boolean() }))
    .max(12)
    .refine((val) => {
      let isValid = false;
      val.forEach((answer) => {
        if (answer.isCorrect) isValid = true;
      });
      return isValid;
    }, "At least one answer must be correct"),
});

export const validQuizSchema = z.object({
  name: z.string().min(3).max(100),
  questions: z.array(z.any()).min(1).max(100),
  tags: z.array(z.any()).max(10),
});
export type QuizSchema = z.infer<typeof validQuizSchema>;
