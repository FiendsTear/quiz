import { quizRouter } from "./quiz/quizRouter";
import { createTRPCRouter } from "./trpc";
// import { userRouter } from "./user/userRouter";
import { gameRouter } from "./game/gameRouter";
export const appRouter = createTRPCRouter({
  quiz: quizRouter,
  // user: userRouter,
  game: gameRouter,
});

export type AppRouter = typeof appRouter;
