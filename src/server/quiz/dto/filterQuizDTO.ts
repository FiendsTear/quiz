import { z } from "zod";

const tagDTO = z.object({
  id: z.number(),
  name: z.string()
});

export const filterQuizDTO = z.object({
  tags: z.array(tagDTO),
  quizName: z.string()
});
export type FilterQuizDTO = z.infer<typeof filterQuizDTO>;
