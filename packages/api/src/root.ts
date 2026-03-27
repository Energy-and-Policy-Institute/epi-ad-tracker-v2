import { createCallerFactory, createTRPCRouter } from "./trpc";
import { frontGroupRouter } from "./routers/front-group";

export const appRouter = createTRPCRouter({
  frontGroup: frontGroupRouter
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
