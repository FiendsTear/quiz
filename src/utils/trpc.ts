import { AppRouter } from "@/server/mainRouter";
import {
  createWSClient,
  httpBatchLink,
  loggerLink,
  wsLink,
} from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import { NextPageContext } from "next";
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

const { publicRuntimeConfig } = getConfig();
const { WS_URL } = publicRuntimeConfig;
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
    url: WS_URL,
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
        // httpBatchLink({
        //   url: getBaseUrl() + "/api/trpc",
        // }),
        // loggerLink({
        //   enabled: (opts) =>
        //     (process.env.NODE_ENV === "development" &&
        //       typeof window !== "undefined") ||
        //     (opts.direction === "down" && opts.result instanceof Error),
        // }),
        getEndingLink(ctx),
      ],
    };
  },
  ssr: false,
});
