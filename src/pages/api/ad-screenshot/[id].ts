import type { NextApiRequest, NextApiResponse } from 'next'
import chromium from '@sparticuz/chromium-min'
import { BlobNotFoundError, head, put } from '@vercel/blob'
import puppeteer from 'puppeteer-core'
import { db } from '~/server/db'

const SCREENSHOT_PREFIX = 'ad-screenshots'

const getBlobPath = (adId: string) => `${SCREENSHOT_PREFIX}/${adId}.png`

const findExistingScreenshot = async (adId: string) => {
  try {
    const existing = await head(getBlobPath(adId))
    return existing.url
  } catch (error) {
    if (error instanceof BlobNotFoundError) {
      return null
    }

    throw error
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).end('Method Not Allowed')
    return
  }

  const { id } = req.query

  if (typeof id !== 'string' || !id) {
    res.status(400).json({ message: 'Invalid ad id' })
    return
  }

  const ad = await db.ad.findUnique({
    where: { id },
    select: {
      ad_screenshot_url: true,
      ad_snapshot_url: true,
      id: true,
    },
  })

  if (!ad) {
    res.status(404).json({ message: 'Ad not found' })
    return
  }

  if (ad.ad_screenshot_url && ad.ad_screenshot_url !== 'null') {
    res.redirect(307, ad.ad_screenshot_url)
    return
  }

  if (!ad.ad_snapshot_url) {
    res.status(404).json({ message: 'Ad snapshot is unavailable' })
    return
  }

  const existingUrl = await findExistingScreenshot(ad.id)

  if (existingUrl) {
    await db.ad.update({
      where: { id: ad.id },
      data: { ad_screenshot_url: existingUrl },
    })
    res.redirect(307, existingUrl)
    return
  }

  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: {
        width: 1440,
        height: 1800,
        deviceScaleFactor: 1,
      },
      executablePath: await chromium.executablePath(),
      headless: true,
    })

    const page = await browser.newPage()
    await page.goto(ad.ad_snapshot_url, {
      timeout: 60_000,
      waitUntil: 'networkidle2',
    })

    const screenshot = await page.screenshot({
      fullPage: true,
      type: 'png',
    })

    const blob = await put(getBlobPath(ad.id), screenshot, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'image/png',
    })

    await db.ad.update({
      where: { id: ad.id },
      data: { ad_screenshot_url: blob.url },
    })

    res.redirect(307, blob.url)
  } catch (error) {
    console.error('Failed to generate ad screenshot', { adId: ad.id, error })
    res.status(500).json({ message: 'Failed to generate screenshot' })
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}
