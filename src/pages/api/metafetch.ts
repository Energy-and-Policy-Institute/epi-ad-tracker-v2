/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NextApiRequest, NextApiResponse } from 'next'
import { env } from '~/env'
import { runDataPull } from '~/server/functions'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // eslint-disable-next-line @typescript-eslint/dot-notation
  if (req.headers['Authorization'] !== `Bearer ${env.CRON_SECRET}`) {
    return res.status(401).end('Unauthorized')
  }

  try {
    await runDataPull(env.INSTANCE_ID)
    res.status(200).json({ message: 'Started Successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to start' })
  }
}
