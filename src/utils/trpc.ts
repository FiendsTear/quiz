import { clientEnv } from "@/env/client.js";
import type { AppRouter } from "@/server/mainRouter";
import {
  createWSClient,
  httpBatchLink,
  loggerLink,
  splitLink,
  wsLink,
} from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { NextPageContext } from "next";
import getConfig from "next/config";
import SuperJSON from "superjson";

function getBaseUrl() {
  if (typeof window !== "undefined") {
    // In the browser, we return a relative URL
    return "";
  }
  // When rendering on the server, we return an absolute URL

  // reference for vercel.com
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

// const { publicRuntimeConfig } = getConfig();
// const { NEXT_PUBLIC_WS_URL } = publicRuntimeConfig;
function getEndingLink(ctx: NextPageContext | undefined) {
  if (typeof window === "undefined") {
    return httpBatchLink({
      url: getBaseUrl() + "/api/trpc",
      headers() {
        if (ctx?.req) {
          // on ssr, forward client's headers to the server
          return {
            ...ctx.req.headers,
            "x-ssr": "1",
          };
        }
        return {};
      },
    });
  }
  const client = createWSClient({
    url: clientEnv.NEXT_PUBLIC_WS_URL,
  });
  return wsLink<AppRouter>({
    client,
  });
}

export const trpc = createTRPCNext<AppRouter>({
  config({ ctx }) {
    return {
      transformer: SuperJSON,
      queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        splitLink({
          condition(op) {
            return op.path.split(".")[0] === "game";
          },
          true: getEndingLink(ctx),
          false: httpBatchLink({
            url: getBaseUrl() + "/api/trpc",
          }),
        }),
      ],
    };
  },
  ssr: false,
});

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export enum GameStatus {
  Created,
  Ongoing,
  Finished,
}
