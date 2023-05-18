import { appRouter } from "./mainRouter.js";
import { createWSContext } from "./trpc.js";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import http from "http";
import next from "next";
// import next from "next";
import { parse } from "url";
import { WebSocketServer } from "ws";
// import { createWSContext } from "./trpc";
// import { appRouter } from "./mainRouter";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

void app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    void handle(req, res, parsedUrl);
  });
  const wss = new WebSocketServer({ server });
  const handler = applyWSSHandler({
    wss,
    router: appRouter,
    createContext: createWSContext,
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM");
    handler.broadcastReconnectNotification();
  });
  server.listen(port);

  // tslint:disable-next-line:no-console
  console.log(
    `> Server listening at http://localhost:${port} as ${
      dev ? "development" : process.env.NODE_ENV
    }`
  );
});
