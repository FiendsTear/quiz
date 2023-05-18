import { quizRouter } from "./quiz/quizRouter.js";
import { createTRPCRouter } from "./trpc.js";
// import { userRouter } from "./user/userRouter";
import { gameRouter } from "./game/gameRouter.js";
export const appRouter = createTRPCRouter({
  quiz: quizRouter,
  // user: userRouter,
  game: gameRouter,
});

export type AppRouter = typeof appRouter;
