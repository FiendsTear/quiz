import { z } from "zod";
export const updateAnswerDTO = z.object({
    id: z.number(),
    body: z.string().nullable().optional(),
    isCorrect: z.boolean().optional(),
});
export type UpdateAnswerDTO = z.infer<typeof updateAnswerDTO>;
