import { quizRouter } from "./quiz/quizRouter";
import { router } from "./trpc";
import { userRouter } from "./user/userRouter";
import { gameRouter } from "./game/gameRouter";
export const appRouter = router({
  quiz: quizRouter,
  user: userRouter,
  game: gameRouter,
});

export type AppRouter = typeof appRouter;
