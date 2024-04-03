import Link from 'next/link'
import { useMemo, useState } from 'react'
import { api } from '~/utils/api'
import { faSort } from '@fortawesome/free-solid-svg-icons'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

type SortOptions = 'rank' | 'status' | 'name' | 'numAds' | 'adSpend'

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

  const sorted = useMemo(() => {
    console.log('updating sorted', sortBy, sortDirection)

    if (!frontGroups) return null

    let sorted = frontGroups.sort((a, b) => a.rank - b.rank).slice()

    if (sortBy === 'status') {
      sorted = frontGroups.sort(
        (a, b) => (a.active ? 1 : 0) - (b.active ? 1 : 0),
      )
    }

    if (sortBy === 'name') {
      sorted = frontGroups.sort((a, b) => a.name.localeCompare(b.name))
    }

    if (sortBy === 'numAds') {
      console.log('here')
      sorted = frontGroups.sort((a, b) => a.numAds - b.numAds)
    }

    if (sortBy === 'adSpend') {
      sorted = frontGroups.sort((a, b) => a.adSpendUpper - b.adSpendUpper)
    }

    return sortDirection === 'asc' ? sorted : sorted.slice().reverse()
  }, [frontGroups, sortBy, sortDirection])

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
                onSort={() => handleSortChange('rank')}
              />
              <HeaderItem
                title='Status'
                onSort={() => handleSortChange('status')}
              />
              <HeaderItem
                title='Name'
                onSort={() => handleSortChange('name')}
              />
              <HeaderItem
                title='Total # of ads'
                onSort={() => handleSortChange('numAds')}
              />
              <HeaderItem
                title='Money spent'
                onSort={() => handleSortChange('adSpend')}
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

export default Home
