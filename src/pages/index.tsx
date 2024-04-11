import Link from 'next/link'
import { useMemo, useState } from 'react'
import { api } from '~/utils/api'
import {
  faDownload,
  faFileExport,
  faSort,
} from '@fortawesome/free-solid-svg-icons'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FrontGroup } from 'types'
import dayjs from 'dayjs'

type SortOptions = 'rank' | 'status' | 'name' | 'numAds' | 'adSpend'
const defaultStartDate = '2018-05-24'

const Home = () => {
  const [startDate, setStartDate] = useState<string>(defaultStartDate)
  const [endDate, setEndDate] = useState<string>(dayjs().format('YYYY-MM-DD'))
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
    setEndDate(dayjs().format('YYYY-MM-DD'))
  }

  const datesDiffer =
    startDate !== defaultStartDate || endDate !== dayjs().format('YYYY-MM-DD')

  return (
    <div className='flex flex-col w-full items-center py-5'>
      <h1 className='py-5 text-3xl font-semibold'>Ad Tracker V2</h1>
      <div className='w-[800px]'>
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
        <div className='flex justify-between gap-x-2 py-2'>
          <input
            type='text'
            placeholder='Search'
            className='px-2 border border-gray-400 rounded-md bg-gray-100 text-gray-700'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className='flex gap-x-2'>
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
            {datesDiffer && (
              <button
                type='button'
                onClick={resetDates}
                className='px-3 text-blue-500'
              >
                Reset
              </button>
            )}
            <DownloadCSV
              jsonData={frontGroups ?? []}
              fileName={`frontgroups_data_${dayjs(startDate).format('MM-DD-YY')}_to_${dayjs(endDate).format('MM-DD-YY')}`}
            />
          </div>
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

const DownloadCSV = ({
  jsonData,
  fileName,
}: {
  jsonData: FrontGroup[]
  fileName: string
}) => {
  const convertToCSV = (data: FrontGroup[]): string => {
    if (data.length === 0) return ''

    const columnDelimiter = ','
    const lineDelimiter = '\n'
    let keys = Object.keys(data[0] ?? {}) as (keyof FrontGroup)[]
    keys = keys.filter((key) => key !== 'id' && key !== 'regionalBreakdown')
    let result = keys.join(columnDelimiter) + lineDelimiter

    data.forEach((item) => {
      keys.forEach((key, index) => {
        result += item[key]?.toString()
        if (index < keys.length - 1) result += columnDelimiter
      })
      result += lineDelimiter
    })

    return result
  }

  const downloadCSV = () => {
    const csvData = convertToCSV(jsonData)
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', fileName + '.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <button
      type='button'
      className='px-3 py-1 bg-gray-200 text-gray-700 font-semibold flex items-center gap-x-2 rounded-md hover:bg-gray-300 transition-all'
      onClick={downloadCSV}
    >
      <FontAwesomeIcon icon={faDownload} />
      <span> Export</span>
    </button>
  )
}
