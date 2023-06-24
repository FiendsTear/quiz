import { z } from "zod";
export const createAnswerDTO = z.object({
  questionID: z.number().optional(),
  order: z.number(),
});
export type CreateAnswerDTO = z.infer<typeof createAnswerDTO>;
