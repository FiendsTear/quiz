// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck 
import ws from "ws";
import { createWSContext } from "../trpc.js";
import { appRouter } from "../mainRouter.js";
import { applyWSSHandler } from "@trpc/server/adapters/ws";

import fetch, { Headers, Request, Response } from "node-fetch";

if (!globalThis.fetch) {
  globalThis.fetch = fetch;
  globalThis.Headers = Headers;
  globalThis.Request = Request;
  globalThis.Response = Response;
}

const wss = new ws.Server({
  port: 3100,
});

const handler = applyWSSHandler({
  wss,
  router: appRouter,
  createContext: createWSContext,
});

wss.on("connection", (ws) => {
  console.log(`➕➕ Connection (${wss.clients.size})`);
  ws.on("error", (err) => console.error(err));
  ws.once("close", () => {
    console.log(`➖➖ Connection (${wss.clients.size})`);
  });
});

console.log("✅ WebSocket Server listening on ws://localhost:3100");
process.on("SIGTERM", () => {
  console.log("SIGTERM");
  handler.broadcastReconnectNotification();
  wss.close();
});
