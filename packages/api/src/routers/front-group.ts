import { type FrontGroup } from "@repo/db";
import dayjs from "dayjs";
import { z } from "zod";
import { adDatesWithinRange, getInLast3Months } from "../domain/front-groups";
import { AdRegionItem } from "../schemas/meta";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const frontGroupRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.frontGroup.findMany();
  }),
  dynamicFrontGroups: publicProcedure
    .input(
      z
        .object({
          startDate: z.string().nullish(),
          endDate: z.string().nullish()
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const ads = await ctx.db.ad.findMany({
        select: {
          ad_delivery_start_time: true,
          ad_delivery_stop_time: true,
          page_id: true,
          page_name: true,
          spend_upper_bound: true,
          spend_lower_bound: true
        }
      });

      const frontGroups: Omit<FrontGroup, "createdAt" | "updatedAt">[] = [];

      for (const ad of ads) {
        const inRange =
          !input?.startDate ||
          !input.endDate ||
          adDatesWithinRange(
            ad.ad_delivery_start_time ?? input.startDate,
            ad.ad_delivery_stop_time ?? input.endDate,
            input.startDate,
            input.endDate
          );

        const active = getInLast3Months(ad.ad_delivery_stop_time);

        const existingFrontGroup = frontGroups.find((frontGroup) => frontGroup.id === ad.page_id);

        if (!existingFrontGroup) {
          frontGroups.push({
            id: ad.page_id,
            name: ad.page_name,
            numAds: inRange ? 1 : 0,
            adSpendUpper: inRange ? ad.spend_upper_bound : 0,
            adSpendLower: inRange ? ad.spend_lower_bound : 0,
            regionalBreakdown: [],
            rank: 0,
            active
          });

          continue;
        }

        if (!inRange) {
          existingFrontGroup.active = active || existingFrontGroup.active;
          continue;
        }

        existingFrontGroup.numAds += 1;
        existingFrontGroup.adSpendUpper += ad.spend_upper_bound;
        existingFrontGroup.adSpendLower += ad.spend_lower_bound;
        existingFrontGroup.active = active || existingFrontGroup.active;
      }

      return frontGroups
        .sort((a, b) => b.adSpendUpper - a.adSpendUpper)
        .map((frontGroup, index) => ({
          ...frontGroup,
          rank: index + 1
        }));
    }),
  getTenMostExpensiveAds: publicProcedure
    .input(z.object({ frontGroupId: z.string() }))
    .query(async ({ ctx, input }) => {
      const ads = await ctx.db.ad.findMany({
        where: {
          ad_screenshot_url: { not: "null" },
          page_id: input.frontGroupId
        },
        orderBy: { spend_upper_bound: "desc" },
        take: 10
      });

      return ads.map((ad) => {
        const deliveryByRegion = AdRegionItem.array().parse(ad.delivery_by_region);
        const largestRegion = deliveryByRegion.reduce((accumulator, current) =>
          accumulator.percentage > current.percentage ? accumulator : current
        );

        return { ...ad, largestRegion };
      });
    }),
  getStatic: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return ctx.db.frontGroup.findFirst({
      where: { id: input }
    });
  }),
  get: publicProcedure
    .input(
      z.object({
        frontGroupId: z.string(),
        startDate: z.string().nullish(),
        endDate: z.string().nullish()
      })
    )
    .query(async ({ ctx, input }) => {
      const ads = await ctx.db.ad.findMany({
        where: { page_id: input.frontGroupId },
        select: {
          delivery_by_region: true,
          ad_delivery_start_time: true,
          ad_creative_bodies: true,
          ad_snapshot_url: true,
          bylines: true,
          impressions_lower_bound: true,
          impressions_upper_bound: true,
          ad_delivery_stop_time: true,
          spend_lower_bound: true,
          spend_upper_bound: true,
          page_id: true,
          page_name: true
        }
      });

      for (const ad of ads) {
        if (!ad.delivery_by_region) {
          ad.delivery_by_region = [];
        }
      }

      const filteredAds = ads.filter((ad) => {
        if (!ad.ad_delivery_start_time || !ad.ad_delivery_stop_time || !input.startDate || !input.endDate) {
          return false;
        }

        return adDatesWithinRange(
          ad.ad_delivery_start_time,
          ad.ad_delivery_stop_time,
          input.startDate,
          input.endDate
        );
      });

      const regionalBreakdown: Array<{
        state: string;
        lowerBound: number;
        upperBound: number;
      }> = [];

      let active = false;
      let lastAdDate: string | null = null;

      for (const ad of ads) {
        if (getInLast3Months(ad.ad_delivery_stop_time)) {
          active = true;
        }

        if (dayjs(ad.ad_delivery_stop_time).isAfter(lastAdDate ?? "2000-01-01")) {
          lastAdDate = ad.ad_delivery_stop_time;
        }
      }

      for (const ad of filteredAds) {
        const parsedByRegion = AdRegionItem.array().parse(ad.delivery_by_region);

        for (const region of parsedByRegion) {
          const existingRegion = regionalBreakdown.find((entry) => entry.state === region.region);
          const incrementUpperBound = region.percentage * ad.spend_upper_bound;
          const incrementLowerBound = region.percentage * ad.spend_lower_bound;

          if (existingRegion) {
            existingRegion.lowerBound += incrementLowerBound;
            existingRegion.upperBound += incrementUpperBound;
            continue;
          }

          regionalBreakdown.push({
            state: region.region,
            lowerBound: incrementLowerBound,
            upperBound: incrementUpperBound
          });
        }
      }

      const totalAds = filteredAds.length;
      const totalSpend = filteredAds.reduce((total, current) => total + current.spend_upper_bound, 0);

      const frontGroup = await ctx.db.frontGroup.findFirst({
        where: { id: input.frontGroupId },
        select: {
          updatedAt: true
        }
      });

      return {
        id: ads[0]?.page_id,
        name: ads[0]?.page_name,
        lastAdDate,
        active,
        updatedAt: frontGroup?.updatedAt,
        totalAds,
        totalSpend,
        regionalBreakdown,
        exportableAds: filteredAds.map((ad) => ({
          frontGroupName: ad.page_name,
          bylines: ad.bylines,
          impressionsLowerBound: ad.impressions_lower_bound,
          impressionsUpperBound: ad.impressions_upper_bound,
          adDeliveryStartTime: ad.ad_delivery_start_time,
          adDeliveryStopTime: ad.ad_delivery_stop_time,
          spendLowerBound: ad.spend_lower_bound,
          spendUpperBound: ad.spend_upper_bound,
          adBlurb: ad.ad_creative_bodies.join(" "),
          deliveryByRegion: AdRegionItem.array().parse(ad.delivery_by_region)
        }))
      };
    }),
  ads: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.ad.findMany({
      where: { ad_screenshot_url: { not: "null" } }
    });
  }),
  ad: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return ctx.db.ad.findFirst({
      where: { id: input }
    });
  })
});
