import Link from 'next/link'
import { useMemo, useState } from 'react'
import { api } from '~/utils/api'
import { faDownload, faSort } from '@fortawesome/free-solid-svg-icons'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { type FrontGroup } from 'types'
import dayjs from 'dayjs'
import {
  DatePicker,
  Disclaimer,
  DownloadCSVButton,
  HeaderItem,
  convertToCSV,
} from '~/components/common'
import { withCommas } from '~/utils/functions'

type SortOptions = 'rank' | 'status' | 'name' | 'numAds' | 'adSpend'
const defaultStartDate = '2018-05-24'
const defaultEndDate = dayjs().format('YYYY-MM-DD')

const Home = () => {
  const [startDate, setStartDate] = useState<string>(defaultStartDate)
  const [endDate, setEndDate] = useState<string>(defaultEndDate)
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
  const [query, setQuery] = useState<string>('')

  const sorted = useMemo(() => {
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
      sorted = frontGroups.sort((a, b) => a.numAds - b.numAds)
    }

    if (sortBy === 'adSpend') {
      sorted = frontGroups.sort((a, b) => a.adSpendUpper - b.adSpendUpper)
    }

    sorted = sortDirection === 'asc' ? sorted : sorted.slice().reverse()
    sorted = sorted.filter((row) =>
      row.name.toLowerCase().includes(query.toLowerCase()),
    )
    return sorted
  }, [frontGroups, query, sortBy, sortDirection])

  const handleSortChange = (sb: SortOptions) => {
    console.log('handleSortChange', sb)
    if (sortBy === sb) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(sb)
      setSortDirection('asc')
    }
  }

  const resetDates = () => {
    setStartDate(defaultStartDate)
    setEndDate(defaultEndDate)
  }

  const datesDiffer =
    startDate !== defaultStartDate || endDate !== defaultEndDate

  return (
    <div className='flex flex-col w-full items-center py-5'>
      <div className='w-[800px]'>
        <div className='flex gap-x-3 border-b border-background py-2'>
          <div className='flex gap-x-1'>
            <span className='text-secondary'>All Groups:</span>
            <span className='font-semibold tracking-wide'>{totalAds}</span>
          </div>
          <div className='flex gap-x-1'>
            <span className='text-secondary'>Total Spent:</span>
            <span className='font-semibold tracking-wide'>{`$${toK(totalSpendUpper ?? 0)}`}</span>
          </div>
        </div>
        <div className='flex justify-between gap-x-2 py-2'>
          <input
            type='text'
            placeholder='Search'
            className='px-2 border border-background rounded-md bg-white text-gray-700 outline-none w-[300px]'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className='flex gap-x-2 items-center'>
            <DatePicker date={startDate} setDate={setStartDate} />
            <span className='text-secondary text-sm'>to</span>
            <DatePicker date={endDate} setDate={setEndDate} />
            {datesDiffer && (
              <button
                type='button'
                onClick={resetDates}
                className='px-3 text-blue-500'
              >
                Reset
              </button>
            )}
            <DownloadCSVButton
              csv={convertToCSV(frontGroups ?? [], ['regionalBreakdown', 'id'])}
              fileName={`frontgroups_data_${dayjs(startDate).format('MM-DD-YY')}_to_${dayjs(endDate).format('MM-DD-YY')}`}
            />
          </div>
        </div>
        <table className='w-full max-w-[800px]'>
          <thead>
            <tr className='bg-backgroundLight'>
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
                title='Ads'
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
                  <td className='px-5 py-2 text-center'>{row.rank}</td>
                  <td className='px-5 py-2'>
                    {row.active ? (
                      <div className='rounded-full bg-green-100 py-1 text-green-600 inline-block px-3 text-sm font-semibold'>
                        Active
                      </div>
                    ) : (
                      <div className='rounded-full bg-red-100 py-1 text-red-600 inline-block px-3 text-sm font-semibold'>
                        Inactive
                      </div>
                    )}
                  </td>
                  <td className='px-5 py-2'>
                    <Link
                      href={`/frontgroup/${encodeURIComponent(row.id)}`}
                      className='text-secondary hover:underline text-center'
                    >
                      {row.name}
                    </Link>
                  </td>
                  <td className='px-5 py-2 text-center'>{row.numAds}</td>
                  <td className='px-5 py-2 text-center'>
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
        <Disclaimer />
      </div>
    </div>
  )
}

export default Home

const toK = (num: number) => {
  if (num < 1000) return num.toString()
  if (num > 999 && num < 1000000) {
    return `${(num / 1000).toFixed(1)}k`
  }

  if (num > 999999 && num < 1000000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }

  return num
}
