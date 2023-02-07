import { observable } from "@trpc/server/observable";
import { EventEmitter } from "events";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { createGame, getGame, getGames, updateGame } from "./gameService";
import { gameDTO } from "./dto/createGameDTO";
import { TRPCError } from "@trpc/server";
import { updateGameDTO } from "./dto/updateGameDTO";

interface IEmittersist {
  [key: string]: EventEmitter;
}
const emitters: IEmittersist = {};

export const gameRouter = createTRPCRouter({
  // onCreate: publicProcedure.subscription(() => {
  // return observable<string>((emit) => {
  //   const onCreate = (data: string) => {
  //     emit.next(data);
  //   };
  //   ee.on("add", onCreate);
  //   return () => {
  //     ee.off("add", onCreate);
  //   };
  // });
  // }),

  getGames: publicProcedure.query(async () => {
    const activeGamesID = Object.keys(emitters);
    if (!activeGamesID) return [];
    return await getGames(activeGamesID.map(Number));
  }),

  getGame: publicProcedure.input(z.number()).query(({ input }) => {
    const game = getGame(input);
    return game;
  }),

  // host created a game
  create: publicProcedure.input(gameDTO).mutation(async ({ input }) => {
    const game = await createGame(input);
    emitters[game.id] = new EventEmitter();
    return game;
  }),

  // player entered a game
  enter: publicProcedure.input(z.string()).mutation(({ input }) => {
    if (!emitters[input]) throw new TRPCError({ code: "BAD_REQUEST" });
    emitters[input].emit("PLAYER_ENTERED", input);
    return "entered";
  }),

  onEnter: publicProcedure.input(z.number()).subscription(({ input }) => {
    return observable<string>((emit) => {
      const onEnter = (data: string) => {
        emit.next(data);
      };
      emitters[input].on("PLAYER_ENTERED", onEnter);
      return () => {
        emitters[input].off("PLAYER_ENTERED", onEnter);
      };
    });
  }),

  // host started a game
  start: publicProcedure.input(updateGameDTO).mutation(async ({ input }) => {
    emitters[input.id].emit("GAME_STARTED", input);
    return await updateGame(input);
  }),

  onStart: publicProcedure.input(z.number()).subscription(({ input }) => {
    return observable<string>((emit) => {
      const onStart = (data: string) => {
        emit.next(data);
      };
      emitters[input].on("GAME_STARTED", onStart);
      return () => {
        emitters[input].off("GAME_STARTED", onStart);
      };
    });
  }),
});
