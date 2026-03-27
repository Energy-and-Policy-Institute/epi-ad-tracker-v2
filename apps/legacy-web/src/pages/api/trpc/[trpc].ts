import { createNextApiHandler } from "@trpc/server/adapters/next";
import { appRouter, createNextPagesTRPCContext } from "@repo/api";

import { env } from "~/env";

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createNextPagesTRPCContext,
  onError:
    env.NODE_ENV === "development"
      ? ({ path, error }) => {
          console.error(
            `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
          );
        }
      : undefined,
});
