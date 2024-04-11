import { useRouter } from 'next/router'
import { RegionalBreakdownSchema } from 'types'
import { api } from '~/utils/api'

type SortOptions = 'state' | 'spend'

const Page = () => {
  const router = useRouter()
  const id = (router.query.id ?? '') as string
  const { data: frontGroup, isLoading } = api.frontGroup.get.useQuery({ id })
  const regionalBreakdown = RegionalBreakdownSchema.parse(
    frontGroup?.regionalBreakdown,
  )

  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [sortBy, setSortBy] = useState<SortOptions>('spend')

  const sorted = useMemo(() => {
    if (!regionalBreakdown) return null

    console.log('here', regionalBreakdown.length)

    let sorted = regionalBreakdown
      .sort((a, b) => a.upperbound - b.upperbound)
      .slice()

    if (sortBy === 'state') {
      sorted = regionalBreakdown.sort((a, b) => a.name.localeCompare(b.name))
    }

    return sortDirection === 'asc' ? sorted : sorted.slice().reverse()
  }, [regionalBreakdown, sortBy, sortDirection])

  const handleSortChange = (sb: SortOptions) => {
    console.log('handleSortChange', sb)
    if (sortBy === sb) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(sb)
      setSortDirection('asc')
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className='flex flex-col items-center w-full py-5'>
      <button className='font-bold underline' onClick={() => router.back()}>
        Back
      </button>
      <h1 className='text-3xl font-semibold py-4'>{frontGroup?.name}</h1>
      {sorted && (
        <table>
          <thead>
            <tr className='border-b border-gray-400'>
              <HeaderItem
                title='State'
                onSort={() => handleSortChange('state')}
              />
              <HeaderItem
                title='Spend'
                onSort={() => handleSortChange('spend')}
              />
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr key={i} className='border-b border-gray-400'>
                <td className='px-5 py-2'>{row.name}</td>
                <td className='px-5 py-2'>
                  {`$${row.lowerbound.toFixed(0)} - $${row.upperbound.toFixed(0)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Page

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { faSort } from '@fortawesome/free-solid-svg-icons'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Home = () => {
  const [startDate, setStartDate] = useState<string>()
  const [endDate, setEndDate] = useState<string>()
  const { data: frontGroups, isLoading } =
    api.frontGroup.dynamicFrontGroups.useQuery({
      startDate,
      endDate,
    })
  const totalAds = frontGroups?.reduce((acc, curr) => acc + curr.numAds, 0)
  const totalSpendUpper = frontGroups?.reduce(
    (acc, curr) => acc + curr.adSpendUpper,
    0,
  )
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>()
  const [sortBy, setSortBy] = useState<SortOptions>()

  const sorted = frontGroups

  const handleSortChange = (sb: SortOptions) => {
    console.log('handleSortChange', sb)
    if (sortBy === sb) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(sb)
      setSortDirection('asc')
    }
  }

  return (
    <div className='flex flex-col w-full items-center py-5'>
      <h1 className='py-5 text-3xl font-semibold'>Ad Tracker V2</h1>
      <div className='max-w-[800px]'>
        <div className='flex gap-x-3 border-b border-gray-200 py-2'>
          <div className='flex gap-x-1'>
            <span className='text-gray-600'>Total # of ads:</span>
            <span className='font-semibold tracking-wide'>{totalAds}</span>
          </div>
          <div className='flex gap-x-1'>
            <span className='text-gray-600'>Total spend:</span>
            <span className='font-semibold tracking-wide'>{`$${totalSpendUpper?.toLocaleString('en', { useGrouping: true })}`}</span>
          </div>
        </div>
        <div className='flex justify-end gap-x-2 py-2'>
          <input
            type='date'
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className='px-2 border border-gray-400 rounded-md bg-gray-100 text-gray-700'
          />
          <span>to</span>
          <input
            type='date'
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className='px-2 border border-gray-400 rounded-md bg-gray-100 text-gray-700'
          />
        </div>
        <table className='w-full max-w-[800px]'>
          <thead>
            <tr className='bg-gray-100'>
              <HeaderItem
                title='Rank'
                onSort={() => handleSortChange('state')}
              />
              <HeaderItem
                title='Status'
                onSort={() => handleSortChange('state')}
              />
              <HeaderItem
                title='Name'
                onSort={() => handleSortChange('state')}
              />
              <HeaderItem
                title='Total # of ads'
                onSort={() => handleSortChange('state')}
              />
              <HeaderItem
                title='Money spent'
                onSort={() => handleSortChange('state')}
              />
            </tr>
          </thead>
          <tbody className='text-gray-500'>
            {!isLoading ? (
              sorted?.map((row) => (
                <tr key={row.id} className='border-b border-gray-200'>
                  <td className='px-5 py-2'>{row.rank}</td>
                  <td className='px-5 py-2'>
                    {row.active ? (
                      <div className='rounded-md bg-green-300 text-green-800 inline-block px-2 text-sm font-semibold'>
                        Active
                      </div>
                    ) : (
                      <div className='rounded-md bg-red-300 text-red-800 inline-block px-2 text-sm font-semibold'>
                        Inactive
                      </div>
                    )}
                  </td>
                  <td className='px-5 py-2'>
                    <Link
                      href={`/frontgroup/${encodeURIComponent(row.id)}`}
                      className='text-blue-500 hover:underline'
                    >
                      {row.name}
                    </Link>
                  </td>
                  <td className='px-5 py-2'>{row.numAds}</td>
                  <td className='px-5 py-2'>
                    {`$${row.adSpendLower} - $${row.adSpendUpper}`}
                  </td>
                </tr>
              ))
            ) : (
              <tr className='flex justify-center py-2'>
                <td>Loading...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const HeaderItem = ({
  title,
  onSort,
}: {
  title: string
  onSort?: () => void
}) => {
  return (
    <th className='py-2'>
      <span>{title}</span>
      <span> </span>
      {onSort && (
        <button className='text-xs fong-regular' onClick={onSort}>
          <FontAwesomeIcon icon={faSort} />
        </button>
      )}
    </th>
  )
}
