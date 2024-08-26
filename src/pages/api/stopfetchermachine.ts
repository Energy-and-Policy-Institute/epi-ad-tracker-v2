/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NextApiRequest, NextApiResponse } from 'next'
import { env } from '~/env'
import { turnOffMachine } from '~/server/functions'
import { db } from '~/server/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // eslint-disable-next-line @typescript-eslint/dot-notation
  if (req.headers['Authorization'] !== `Bearer ${env.CRON_SECRET}`) {
    return res.status(401).end('Unauthorized')
  }

  // Update all front groups to reflect the current time as the last update
  await db.frontGroup.updateMany({
    data: {
      updatedAt: new Date(),
    },
  })

  try {
    await turnOffMachine(env.INSTANCE_ID)
    res.status(200).json({ message: 'Stopped Successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to stop machine' })
  }
}
