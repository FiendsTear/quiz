import { quizRouter } from "./quiz/quizRouter";
import { router } from "./trpc";
import { userRouter } from "./user/userRouter";
export const appRouter = router({
  quiz: quizRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
