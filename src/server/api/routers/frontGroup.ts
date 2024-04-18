import { type FrontGroup } from '@prisma/client'
import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import dayjs from 'dayjs'
import { AdRegionItem } from 'types'

// [{'percentage': '0.000545', 'region': 'Idaho'}, {'percentage': '0.999455', 'region': 'Washington'}]
//calulate WITH PERCENTAGE

export const frontGroupRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    const frontGroups = await ctx.db.frontGroup.findMany()
    return frontGroups
  }),
  dynamicFrontGroups: publicProcedure
    .input(
      z
        .object({
          startDate: z.string().nullish(),
          endDate: z.string().nullish(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const ads = await ctx.db.ad.findMany({
        select: {
          ad_delivery_start_time: true,
          ad_delivery_stop_time: true,
          page_id: true,
          page_name: true,
          spend_upper_bound: true,
          spend_lower_bound: true,
        },
      })

      const frontGroups: Omit<FrontGroup, 'createdAt' | 'updatedAt'>[] = []
      let inLast3Months = false
      for (const ad of ads) {
        // NOTE: this filtering could probably be done in the query for speed if it becomes an issue
        const getInRange = () => {
          if (!input?.startDate || !input?.endDate) return true

          const adStartDate = dayjs(ad.ad_delivery_start_time)
          const adEndDate = dayjs(ad.ad_delivery_stop_time)
          const rangeStartDate = dayjs(input?.startDate)
          const rangeEndDate = dayjs(input?.endDate)

          const isBetween = (
            date: dayjs.Dayjs,
            start: dayjs.Dayjs,
            end: dayjs.Dayjs,
          ) => date.isAfter(start, 'date') && date.isBefore(end, 'date')
          // ad in range if start date or end date is between the range
          return (
            isBetween(adStartDate, rangeStartDate, rangeEndDate) ||
            isBetween(adEndDate, rangeStartDate, rangeEndDate)
          )
        }

        const adInRange = getInRange()
        if (getInLast3Months(ad.ad_delivery_stop_time)) inLast3Months = true

        // create the front group for the ad if it doesn't exist already
        if (!frontGroups.find((fg) => fg.id === ad.page_id)) {
          frontGroups.push({
            id: ad.page_id,
            name: ad.page_name,
            numAds: adInRange ? 1 : 0,
            adSpendUpper: adInRange ? ad.spend_upper_bound : 0,
            adSpendLower: adInRange ? ad.spend_lower_bound : 0,
            regionalBreakdown: [],
            rank: 0,
            active: inLast3Months, // for now
          })
        } else {
          const frontGroup = frontGroups.find((fg) => fg.id === ad.page_id)
          if (frontGroup && adInRange) {
            frontGroup.numAds += 1
            frontGroup.adSpendUpper += ad.spend_upper_bound
            frontGroup.adSpendLower += ad.spend_lower_bound
          }
        }
      }

      return frontGroups
        .sort((a, b) => b.adSpendUpper - a.adSpendUpper)
        .map((fg, i) => ({ ...fg, rank: i + 1 }))
    }),
  getTenMostExpensiveAds: publicProcedure
    .input(z.object({ frontGroupId: z.string() }))
    .query(async ({ ctx, input }) => {
      const ads = await ctx.db.ad.findMany({
        where: {
          ad_screenshot_url: { not: 'null' },
          page_id: input.frontGroupId,
        },
        orderBy: { spend_upper_bound: 'desc' },
        take: 10,
      })
      return ads
    }),
  get: publicProcedure
    .input(
      z.object({
        frontGroupId: z.string(),
        startDate: z.string().nullish(),
        endDate: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const frontGroup = await ctx.db.frontGroup.findUnique({
        where: { id: input.frontGroupId },
        include: {
          ads: {
            select: {
              delivery_by_region: true,
              ad_delivery_start_time: true,
              ad_delivery_stop_time: true,
              spend_lower_bound: true,
              spend_upper_bound: true,
            },
          },
        },
      })

      if (!frontGroup) return null

      const filteredAds = frontGroup.ads.filter(
        (ad) =>
          ad.ad_delivery_start_time &&
          ad.ad_delivery_stop_time &&
          input.startDate &&
          input.endDate &&
          adDatesWithinRange(
            ad.ad_delivery_start_time,
            ad.ad_delivery_stop_time,
            input.startDate,
            input.endDate,
          ),
      )

      const regionalBreakdown: {
        state: string
        lowerBound: number
        upperBound: number
      }[] = []

      let active = false
      let lastAdDate = null
      for (const ad of frontGroup.ads) {
        if (getInLast3Months(ad.ad_delivery_stop_time)) active = true
        if (
          dayjs(ad.ad_delivery_stop_time).isAfter(lastAdDate ?? '2000-01-01')
        ) {
          lastAdDate = ad.ad_delivery_stop_time
        }
      }

      for (const ad of filteredAds) {
        const parsedByRegion = AdRegionItem.array().parse(ad.delivery_by_region)
        if (!parsedByRegion) continue
        for (const region of parsedByRegion) {
          const state = region.region
          const existing = regionalBreakdown.find((rb) => rb.state === state)
          const incrementUpperBound = region.percentage * ad.spend_upper_bound
          const incrementLowerBound = region.percentage * ad.spend_lower_bound
          if (existing) {
            existing.lowerBound += incrementLowerBound
            existing.upperBound += incrementUpperBound
          } else {
            regionalBreakdown.push({
              state,
              lowerBound: incrementLowerBound,
              upperBound: incrementUpperBound,
            })
          }
        }
      }

      const totalAds = filteredAds.length
      const totalSpend = filteredAds.reduce(
        (acc, curr) => acc + curr.spend_upper_bound,
        0,
      )

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { ads, ...rest } = frontGroup

      return {
        ...rest,
        lastAdDate,
        active,
        totalAds,
        totalSpend,
        regionalBreakdown,
      }
    }),
  ads: publicProcedure.query(async ({ ctx }) => {
    const ads = await ctx.db.ad.findMany({
      where: { ad_screenshot_url: { not: 'null' } },
    })
    return ads
  }),
  ad: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const ad = await ctx.db.ad.findFirst({
      where: { id: input },
    })
    return ad
  }),
})

type RankDictionary = Record<string, number>

const ids = [
  '106039214814684',
  '102281724942742',
  '738063612887865',
  '341751646428117',
  '591566840920364',
  '105502284969626',
  '49560242814',
  '101691091213750',
  '292970844058835',
  '100801038449520',
  '108095672108380',
  '111394533709201',
  '107500120800840',
  '101242238726088',
  '237209147160346',
  '110124925319299',
  '396341921119746',
  '108203188195224',
  '106656845034469',
  '47710973068',
  '482100658584410',
]

const rankDictionary: RankDictionary = ids.reduce<RankDictionary>(
  (acc, id, index) => {
    acc[id] = index + 1 // ranks start at 1
    return acc
  },
  {},
)

const getRank = (id: string) => rankDictionary[id] ?? 0

const adDatesWithinRange = (
  adStartDate: string,
  adEndDate: string,
  rangeStartDate: string,
  rangeEndDate: string,
) => {
  const _adStartDate = dayjs(adStartDate)
  const _adEndDate = dayjs(adEndDate)
  const _rangeStartDate = dayjs(rangeStartDate)
  const _rangeEndDate = dayjs(rangeEndDate)

  const isBetween = (date: dayjs.Dayjs, start: dayjs.Dayjs, end: dayjs.Dayjs) =>
    date.isAfter(start, 'date') && date.isBefore(end, 'date')
  // ad in range if start date or end date is between the range
  return (
    isBetween(_adStartDate, _rangeStartDate, _rangeEndDate) ||
    isBetween(_adEndDate, _rangeStartDate, _rangeEndDate)
  )
}

const getInLast3Months = (date: string | null) => {
  if (!date) return false
  return dayjs(date).isAfter(dayjs().subtract(6, 'month'))
}
