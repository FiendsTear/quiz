import { observable } from "@trpc/server/observable";
import { EventEmitter } from "events";
import { z } from "zod";
import { router, procedure } from "../trpc";

const ee = new EventEmitter();

export const gameRouter = router({
  onAdd: procedure.subscription(() => {
    return observable<string>((emit) => {
      const onAdd = (data: string) => {
        emit.next(data);
      };
      ee.on("add", onAdd);
      return () => {
        ee.off("add", onAdd);
      };
    });
  }),

  add: procedure.input(z.string()).mutation(async ({ input }) => {
    ee.emit("add", input);
    return input;
  }),
});
