import { z } from "zod";

export const validAnswerSchema = z.object({
  body: z.string().min(1),
});

export const validQuestionSchema = z
  .object({
    id: z.number(),
    body: z.string().min(3),
    answers: z.array(validAnswerSchema),
  })
  .superRefine(
    (val, ctx) => {
        ctx.addIssue({});
      return "";
    },
    (data) => {
      return { path: ["questionErrors", data.id] };
    }
  );

export const validQuizSchema = z.object({
  name: z.string().min(3),
  questions: z.array(validQuestionSchema).min(1),
});
export type QuizSchema = z.infer<typeof validQuizSchema>;
