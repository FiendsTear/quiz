import { appRouter } from "@/server/mainRouter";
import * as trpcNext from "@trpc/server/adapters/next";

// export API handler
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: () => ({}),
  onError({ error, type, path, input, ctx, req }) {
    console.error('Error:', error);
    if (error.code === 'INTERNAL_SERVER_ERROR') {
      // send to bug reporting
    }
  },
});