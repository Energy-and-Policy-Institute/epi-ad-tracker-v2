import { type AppType } from 'next/app'
import { Analytics } from '@vercel/analytics/react'

import { api } from '~/utils/api'

import '~/styles/globals.css'

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Analytics />
      <Component className='text-primary' {...pageProps} />
    </>
  )
}

export default api.withTRPC(MyApp)
