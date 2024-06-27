import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '~/server/db'
import { InputPythonRowSchema as AdSchema } from 'types'
import { turnOffMachine } from '~/server/functions'
import { PrismaPromise } from '@prisma/client'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    let ads = []

    /*
  delivery_by_region: RawAdRegionItem.array().nullish(),
  demographic_distribution: DemographicDistributionSchema.array().nullish(),
  publisher_platforms: z.string().array().nullish(),
  ad_creative_bodies: z.string().array().nullish(),
  ad_creative_link_captions: z.string().array().nullish(),
  ad_creative_link_descriptions: z.string().array().nullish(),
  ad_creative_link_titles: z.string().array().nullish(),
    */

    try {
      ads = AdSchema.array()
        .parse(req.body)
        .map((ad) => ({
          ...ad,
          delivery_by_region: ad.delivery_by_region ?? [],
          demographic_distribution: ad.demographic_distribution ?? [],
          publisher_platforms: ad.publisher_platforms ?? [],
          ad_creative_bodies: ad.ad_creative_bodies ?? [],
          ad_creative_link_captions: ad.ad_creative_link_captions ?? [],
          ad_creative_link_descriptions: ad.ad_creative_link_descriptions ?? [],
          ad_creative_link_titles: ad.ad_creative_link_titles ?? [],
          impressions_lower_bound: ad.impressions_lower_bound ?? 0,
          impressions_upper_bound: ad.impressions_upper_bound ?? 0,
          bylines: ad.bylines ?? '',
        }))
    } catch (err) {
      console.error(err)
      res.status(400).json({ message: 'Invalid request body' })
      return
    }

    try {
      // Fetch all existing ads in a single query
      const existingAds = await db.ad.findMany({
        where: {
          id: {
            in: ads.map((ad) => ad.id),
          },
        },
      })

      const existingAdsMap = new Map(existingAds.map((ad) => [ad.id, ad]))

      const transactionOperations = ads
        .map((ad) => {
          const existingAd = existingAdsMap.get(ad.id)

          if (!existingAd) {
            return db.ad.create({ data: ad })
          } else if (existingAd.ad_screenshot_url !== ad.ad_screenshot_url) {
            return db.ad.update({ where: { id: ad.id }, data: ad })
          } else {
            return null
          }
        })
        .filter(Boolean) // Filter out null operations

      await db.$transaction(transactionOperations as PrismaPromise<unknown>[]) // make the types line up

      console.log('Rows added successfully')

      // Respond to the client with the fetched data
      res.status(200).json({ message: 'Rows added successfully' })
      // await turnOffMachine()
    } catch (error) {
      // Handle errors, log them, or send an appropriate response
      console.error('Error:', error)
      res.status(500).json({ error: 'Internal Server Error' })
      // await turnOffMachine()
    }
  } else {
    // Respond to non-POST requests with a 405 Method Not Allowed status
    res.status(405).end()
  }
}
