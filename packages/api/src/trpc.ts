import { db } from "@repo/db";
import { initTRPC } from "@trpc/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";
import { ZodError } from "zod";

export type CreateTRPCContextOptions = {
  headers: Headers;
};

export const createTRPCContext = async ({ headers }: CreateTRPCContextOptions) => {
  return {
    db,
    headers
  };
};

const nodeHeadersToWebHeaders = (source: CreateNextContextOptions["req"]["headers"]) => {
  const headers = new Headers();

  for (const [key, value] of Object.entries(source)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(key, item);
      }
      continue;
    }

    if (typeof value === "string") {
      headers.set(key, value);
    }
  }

  return headers;
};

export const createNextPagesTRPCContext = (opts: CreateNextContextOptions) => {
  return createTRPCContext({
    headers: nodeHeadersToWebHeaders(opts.req.headers)
  });
};

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null
      }
    };
  }
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
