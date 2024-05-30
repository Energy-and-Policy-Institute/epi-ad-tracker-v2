/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NextApiRequest, NextApiResponse } from 'next'

import { runDataPull } from '~/utils/functions'
const INSTANCE_ID = 'i-055464ed9b76e9e3a'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    await runDataPull(INSTANCE_ID)
    res.status(200).json({ message: 'Started Successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to start' })
  }
}
