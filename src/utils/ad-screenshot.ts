type AdWithScreenshot = {
  id: string
  ad_screenshot_url?: string | null
}

export const getAdScreenshotSrc = (ad?: AdWithScreenshot | null) => {
  if (!ad?.id) {
    return ''
  }

  if (ad.ad_screenshot_url && ad.ad_screenshot_url !== 'null') {
    return ad.ad_screenshot_url
  }

  return `/api/ad-screenshot/${encodeURIComponent(ad.id)}`
}
