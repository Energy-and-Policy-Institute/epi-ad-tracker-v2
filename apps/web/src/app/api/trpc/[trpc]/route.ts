import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter, createTRPCContext } from "@repo/api";

const handler = async (request: Request) => {
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set("x-trpc-source", "route-handler");

  return fetchRequestHandler({
    createContext: () =>
      createTRPCContext({
        headers: requestHeaders
      }),
    endpoint: "/api/trpc",
    onError:
      process.env.NODE_ENV === "development"
        ? ({ error, path }) => {
            console.error(`tRPC failed on ${path ?? "<no-path>"}: ${error.message}`);
          }
        : undefined,
    req: request,
    router: appRouter
  });
};

export { handler as GET, handler as POST };
