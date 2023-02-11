import ws from "ws";
import { createWSContext } from '../trpc';
import { AppRouter, appRouter } from "../mainRouter";
import { applyWSSHandler } from '@trpc/server/adapters/ws';

const wss = new ws.Server({
  port: 3100,
});

import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import SuperJSON from "superjson";
const client = createTRPCProxyClient<AppRouter>({
  transformer: SuperJSON,
  links: [
    httpBatchLink({
      url: 'http://localhost:3001/api/trpc',
    }),
  ],
});

const handler = applyWSSHandler({ wss, router: appRouter, createContext: createWSContext });
wss.on("connection", (ws) => {
  console.log(`➕➕ Connection (${wss.clients.size})`);
  ws.once("close", (socket, reason) => {
    console.log(`➖➖ Connection (${wss.clients.size})`);
  });
});

console.log("✅ WebSocket Server listening on ws://localhost:3100");
process.on("SIGTERM", () => {
  console.log("SIGTERM");
  handler.broadcastReconnectNotification();
  wss.close();
});
