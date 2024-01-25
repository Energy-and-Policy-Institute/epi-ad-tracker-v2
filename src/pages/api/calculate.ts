import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/server/db";
import { RegionalBreakdownSchema, AdRegionItem } from "types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    try {
      const ads = await db.ad.findMany()

      let i = 0
      for (const ad of ads) {
        console.log(`processing ad ${i++} of ${ads.length}`)
        const deliveryByRegion = AdRegionItem.array().parse(ad.delivery_by_region);
        // see if a front group with this id already exists
        let existingFrontGroup = await db.frontGroup.findFirst({
          where: { id: ad.page_id },
        });

        // if it does, update it
        if (existingFrontGroup) {
          let regionalBreakdown = RegionalBreakdownSchema.parse(
            existingFrontGroup.regionalBreakdown,
          );

          if (!regionalBreakdown) {
            regionalBreakdown = [];
          }

          if (deliveryByRegion) {
          // ad this ad's spend to the front group's spend (per region)
          for (const region of deliveryByRegion) {
            const existingRegion = regionalBreakdown.find(
              (r) => r.name === region.region,
            );

            if (existingRegion) {
              existingRegion.lowerbound += region.percentage * ad.spend_lower_bound;
              existingRegion.upperbound += region.percentage * ad.spend_upper_bound;
              existingRegion.numberOfAds += 1;
            } else {
              regionalBreakdown.push({
                name: region.region,
                lowerbound: region.percentage * ad.spend_lower_bound,
                upperbound: region.percentage * ad.spend_upper_bound,
                numberOfAds: 1,
              });
            }
          }}

          await db.frontGroup.update({
            where: { id: ad.page_id },
            data: {
              numAds: existingFrontGroup.numAds + 1,
              adSpendUpper: existingFrontGroup.adSpendUpper + ad.spend_upper_bound,
              adSpendLower: existingFrontGroup.adSpendLower + ad.spend_lower_bound,
              regionalBreakdown,
              ads: {
                connect: { id: ad.id },
              }
            },
          });
        }
        
        else {
          // otherwise, create a new front group
          console.log('creating new front group', ad.page_id)
          existingFrontGroup = await db.frontGroup.create({
            data: {
              id: ad.page_id,
              name: ad.page_name,
              numAds: 1,
              adSpendUpper: ad.spend_upper_bound,
              adSpendLower: ad.spend_lower_bound,
              regionalBreakdown: deliveryByRegion.map((region) => ({
                name: region.region,
                lowerbound: region.percentage * ad.spend_lower_bound,
                upperbound: region.percentage * ad.spend_upper_bound,
                numberOfAds: 1,
              })),
              ads: {
                connect: { id: ad.id },
              },
            },
          });
        }
      };

      // Respond to the client with the fetched data
      res.status(200).json({ message: "Rows added successfully" });
    } catch (error) {
      // Handle errors, log them, or send an appropriate response
      console.error("Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    // Respond to non-POST requests with a 405 Method Not Allowed status
    res.status(405).end();
  }
}
