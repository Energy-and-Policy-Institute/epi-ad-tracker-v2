import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// [{'percentage': '0.000545', 'region': 'Idaho'}, {'percentage': '0.999455', 'region': 'Washington'}]
//calulate WITH PERCENTAGE

export const frontGroupRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ctx}) => {
    const frontGroups = await ctx.db.frontGroup.findMany();
    return frontGroups;
  }),
  get: publicProcedure.input(z.object({id: z.string()})).query(async ({ ctx, input }) => {
    const frontGroup = await ctx.db.frontGroup.findFirst({
      where: { id: input.id },
    });
    return frontGroup;
  }),
  ads: publicProcedure.query(async ({ ctx }) => {
    const ads = await ctx.db.ad.findMany({
      where: { ad_screenshot_url: { not: 'null' },}
    });
    return ads;
  }),
  ad: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const ad = await ctx.db.ad.findFirst({
      where: { id: input },
    });
    return ad;
  })
});
