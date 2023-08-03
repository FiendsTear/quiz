import { quizRouter } from "./quiz/quizRouter.js";
import { createTRPCRouter } from "./trpc.js";
// import { userRouter } from "./user/userRouter";
import { gameRouter } from "./game/gameRouter.js";
// all routes of application
// most of them are simple CRUD operations, except game routes, they use websockets
export const appRouter = createTRPCRouter({
  quiz: quizRouter,
  // user: userRouter,
  game: gameRouter,
});

export type AppRouter = typeof appRouter;
