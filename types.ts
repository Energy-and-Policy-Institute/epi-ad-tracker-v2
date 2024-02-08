import { z } from "zod";

// this is from the zod docs
// https://zod.dev/?id=transform
const numberInString = (float = false) =>
  z.string().transform((val, ctx) => {
    const parsed = float ? parseFloat(val) : parseInt(val);
    if (isNaN(parsed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Not a number",
      });

      // This is a special symbol you can use to
      // return early from the transform function.
      // It has type `never` so it does not affect the
      // inferred return type.
      return z.NEVER;
    }
    return parsed;
  });

export const RegionalBreakdownSchema = z
  .object({
    name: z.string(),
    upperbound: z.number(),
    lowerbound: z.number(),
    numberOfAds: z.number(),
  })
  .array().nullish();

export type RegionalBreakdown = z.infer<typeof RegionalBreakdownSchema>;

export const RawAdRegionItem = z.object({
  percentage: numberInString(true),
  region: z.string(),
});

export const AdRegionItem = z.object({
  percentage: z.number(),
  region: z.string(),
});

const DemographicDistributionSchema = z.object({
  percentage: numberInString(true),
  age: z.string(),
  gender: z.string(),
});

export const InputPythonRowSchema = z.object({
  id: z.string(),
  // pythonid: z.number().optional(), // Uncomment if needed
  ad_delivery_start_time: z.string(),
  ad_delivery_stop_time: z.string(),
  ad_snapshot_url: z.string(),
  bylines: z.string(),
  delivery_by_region: RawAdRegionItem.array(),
  demographic_distribution: DemographicDistributionSchema.array(),
  publisher_platforms: z.string().array(),
  ad_creative_bodies: z.string().array(),
  ad_creative_link_captions: z.string().array(),
  ad_creative_link_descriptions: z.string().array(),
  ad_creative_link_titles: z.string().array(),
  page_name: z.string(),
  page_id: z.string(),
  impressions_lower_bound: numberInString(),
  impressions_upper_bound: numberInString(),
  spend_lower_bound: z.number(),
  spend_upper_bound: z.number(),
  ad_start_month: z.number(),
  ad_start_year: z.number(),
  ad_screenshot_url: z.string().optional(),
});

export type InputPythonRow = z.infer<typeof InputPythonRowSchema>;
