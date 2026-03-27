import { z } from "zod";

const numberInString = (float = false) =>
  z.string().transform((value, ctx) => {
    const parsed = float ? Number.parseFloat(value) : Number.parseInt(value, 10);

    if (Number.isNaN(parsed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Not a number"
      });

      return z.NEVER;
    }

    return parsed;
  });

export const RegionalBreakdownSchema = z
  .object({
    name: z.string(),
    upperbound: z.number(),
    lowerbound: z.number(),
    numberOfAds: z.number()
  })
  .array()
  .nullish();

export const RawAdRegionItem = z.object({
  percentage: numberInString(true),
  region: z.string()
});

export const AdRegionItem = z.object({
  percentage: z.number(),
  region: z.string()
});

const DemographicDistributionSchema = z.object({
  percentage: numberInString(true),
  age: z.string(),
  gender: z.string()
});

export const InputPythonRowSchema = z.object({
  id: z.string(),
  ad_delivery_start_time: z.string(),
  ad_delivery_stop_time: z.string(),
  ad_snapshot_url: z.string(),
  bylines: z.string().nullish(),
  delivery_by_region: RawAdRegionItem.array().nullish(),
  demographic_distribution: DemographicDistributionSchema.array().nullish(),
  publisher_platforms: z.string().array().nullish(),
  ad_creative_bodies: z.string().array().nullish(),
  ad_creative_link_captions: z.string().array().nullish(),
  ad_creative_link_descriptions: z.string().array().nullish(),
  ad_creative_link_titles: z.string().array().nullish(),
  page_name: z.string(),
  page_id: z.string(),
  impressions_lower_bound: numberInString().nullish(),
  impressions_upper_bound: numberInString().nullish(),
  spend_lower_bound: z.number(),
  spend_upper_bound: z.number(),
  ad_start_month: z.number(),
  ad_start_year: z.number(),
  ad_screenshot_url: z.string().optional()
});

export type InputPythonRow = z.infer<typeof InputPythonRowSchema>;
export type RegionalBreakdown = z.infer<typeof RegionalBreakdownSchema>;
