import Image from 'next/image'
import Link from 'next/link'
import { api } from '~/utils/api'

const Page = () => {
  const { data: ads } = api.frontGroup.ads.useQuery()
  return (
    <div className='w-full flex flex-col items-center gap-y-3 py-10'>
      {ads?.map((ad) => (
        <Link
          key={ad.id}
          className='drop-shadow-sm rounded-lg hover:drop-shadow-md p-3 flex gap-x-3 transition-all bg-white'
          href={`/ad/${ad.id}`}
        >
          <Image
            width={100}
            height={100}
            src={ad.ad_screenshot_url}
            alt='ad screenshot'
          />
          <h1>{ad.page_name}</h1>
        </Link>
      ))}
    </div>
  )
}

export default Page
