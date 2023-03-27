import { z } from "zod";
import { createWSRouter, protectedWSProcedure } from "../trpc";
import { addPlayerAnswerDTO } from "./dto.ts/addPlayerAnswerDTO";
import { nextQuestion, getGame } from "./gameService";
import { createGameDTO } from "./dto.ts/createGameDTO";
import { enterGameDTO } from "./dto.ts/enterGameDTO";
import {
  addGame,
  addPlayerAnswer,
  enterGame,
  getActiveGames,
  getGameState,
  leaveGame,
  startGame,
  subscribeToGame,
} from "./gameService";

export const gameRouter = createWSRouter({
  getActiveGames: protectedWSProcedure.query(async ({}) => {
    return await getActiveGames();
  }),

  getGameState: protectedWSProcedure.input(z.number()).query(({ input }) => {
    const game = getGameState(input);
    return game;
  }),

  // host created a game
  create: protectedWSProcedure
    .input(createGameDTO)
    .mutation(async ({ input }) => {
      const game = await addGame(input);
      return game.gameData.id;
    }),

  subcribeToGame: protectedWSProcedure
    .input(z.number())
    .subscription(({ input }) => {
      return subscribeToGame(input);
    }),

  // player entered a game
  enter: protectedWSProcedure.input(enterGameDTO).mutation(({ ctx, input }) => {
    const player = ctx.session.user;
    const gameState = enterGame(input, player);
    ctx.req?.socket.on("close", () => {
      leaveGame(input.gameID, player.id);
    });
    return gameState;
  }),

  // host started a game
  start: protectedWSProcedure.input(z.number()).mutation(({ input }) => {
    return startGame(input);
  }),

  answer: protectedWSProcedure
    .input(addPlayerAnswerDTO)
    .mutation(({ input, ctx }) => {
      return addPlayerAnswer(input, ctx.session.user.id);
    }),

  nextQuestion: protectedWSProcedure.input(z.number()).mutation(({ input }) => {
    const game = getGame(input);
    nextQuestion(game);
  }),

  disconnect: protectedWSProcedure.mutation(() => {
    console.log("disconnect");
  }),
});
