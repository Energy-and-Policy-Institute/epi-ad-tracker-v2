import type { NextApiRequest, NextApiResponse } from 'next'
import type { PrismaPromise } from '@prisma/client'
import { InputPythonRowSchema as AdSchema } from 'types'
import { env } from '~/env'
import { db } from '~/server/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (
    env.INGEST_API_SECRET &&
    req.headers.authorization !== `Bearer ${env.INGEST_API_SECRET}`
  ) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

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
      const frontGroups = new Map(
        ads.map((ad) => [
          ad.page_id,
          {
            pageId: ad.page_id,
            pageName: ad.page_name,
          },
        ]),
      )

      const transactionOperations: PrismaPromise<unknown>[] = [
        ...Array.from(frontGroups.values()).map((frontGroup) =>
          db.frontGroup.upsert({
            where: { id: frontGroup.pageId },
            update: {
              name: frontGroup.pageName,
              updatedAt: new Date(),
            },
            create: {
              id: frontGroup.pageId,
              updatedAt: new Date(),
              name: frontGroup.pageName,
              numAds: 0,
              adSpendUpper: 0,
              adSpendLower: 0,
            },
          }),
        ),
        ...ads.map((ad) =>
          db.ad.upsert({
            where: { id: ad.id },
            create: ad,
            update: ad,
          }),
        ),
      ]

      await db.$transaction(transactionOperations)

      console.log('Rows added successfully')

      // Respond to the client with the fetched data
      res.status(200).json({ message: 'Rows added successfully' })
    } catch (error) {
      // Handle errors, log them, or send an appropriate response
      console.error('Error:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  } else {
    // Respond to non-POST requests with a 405 Method Not Allowed status
    res.status(405).end()
  }
}
