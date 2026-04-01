import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "./root";

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type FrontGroupListItem = NonNullable<RouterOutputs["frontGroup"]["dynamicFrontGroups"]>[number];
