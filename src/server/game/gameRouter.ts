import { observable } from "@trpc/server/observable";
import { EventEmitter } from "events";
import { z } from "zod";
import { router, procedure } from "../trpc";
import { createGame, getGames } from "./gameService";
import { gameDTO } from "./createGameDTO";
import { TRPCError } from "@trpc/server";

interface IEmittersist {
  [key: string]: EventEmitter;
}
const emitters: IEmittersist = {};

export const gameRouter = router({
  // onCreate: procedure.subscription(() => {
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

  getGames: procedure.query(async () => {
    return await getGames(Object.keys(emitters).map(Number));
  }),

  // host created a game
  create: procedure.input(gameDTO).mutation(async ({ input }) => {
    const game = await createGame(input);
    emitters[game.id] = new EventEmitter();
    return game;
  }),

  // player entered a game
  enter: procedure.input(z.string()).mutation(({ input }) => {
    if (!emitters[input]) throw new TRPCError({ code: "BAD_REQUEST" });
    emitters[input].emit("PLAYER_ENTERED", input);
    return "entered";
  }),

  onEnter: procedure.input(z.string()).subscription(({ input }) => {
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
  start: procedure.mutation(() => {
    return "started";
  }),

  onStart: procedure.subscription(() => {
    return observable<string>((emit) => {
      const onStart = (data: string) => {
        emit.next(data);
      };
      emitters["1"].on("start", onStart);
      return () => {
        emitters["1"].off("start", onStart);
      };
    });
  }),
});
