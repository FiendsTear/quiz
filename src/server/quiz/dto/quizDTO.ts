import { z } from "zod";
export const quizDTO = z.object({
    name: z.string()
});
export type QuizDTO = z.infer<typeof quizDTO>;
