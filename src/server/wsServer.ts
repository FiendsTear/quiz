import { applyWSSHandler } from "@trpc/server/adapters/ws";
import ws from "ws";
import { createContext } from "./trpc";
import { appRouter } from "./mainRouter";

const wss = new ws.Server({
  port: 3100,
});
const handler = applyWSSHandler({ wss, router: appRouter, createContext });
wss.on("connection", (ws) => {
  console.log(`➕➕ Connection (${wss.clients.size})`);
  ws.once("close", () => {
    console.log(`➖➖ Connection (${wss.clients.size})`);
  });
});
console.log("✅ WebSocket Server listening on ws://localhost:3001");
process.on("SIGTERM", () => {
  console.log("SIGTERM");
  handler.broadcastReconnectNotification();
  wss.close();
});
