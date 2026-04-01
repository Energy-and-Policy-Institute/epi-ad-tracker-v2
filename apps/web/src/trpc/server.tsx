import "server-only";

import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { type AppRouter, createCaller, createTRPCContext } from "@repo/api";
import { headers } from "next/headers";
import { cache } from "react";
import { makeQueryClient } from "./query-client";

const createContext = cache(async () => {
  const requestHeaders = new Headers(await headers());

  requestHeaders.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: requestHeaders
  });
});

const getServerQueryClient = cache(makeQueryClient);
const caller = createCaller(createContext);

export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getServerQueryClient
);

export { caller };
