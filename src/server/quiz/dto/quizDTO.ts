import { z } from "zod";
export const quizDTO = z.string();
export type QuizDTO = z.infer<typeof quizDTO>;
