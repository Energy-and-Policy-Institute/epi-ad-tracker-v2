import { useRouter } from 'next/router'
import { api } from '~/utils/api'
import { useMemo, useState } from 'react'

import {
  ActiveChip,
  DatePicker,
  Disclaimer,
  DownloadCSVButton,
  HeaderItem,
  convertToCSV,
} from '~/components/common'
import dayjs from 'dayjs'
import { withCommas } from '~/utils/functions'

type SortOptions = 'state' | 'spend'

const defaultStartDate = '2018-05-24'
const defaultEndDate = dayjs().format('YYYY-MM-DD')

const Page = () => {
  const router = useRouter()
  const id = (router.query.id ?? '') as string
  const [startDate, setStartDate] = useState<string>(defaultStartDate)
  const [endDate, setEndDate] = useState<string>(defaultEndDate)
  const { data: frontGroup, isLoading } = api.frontGroup.get.useQuery({
    frontGroupId: id,
    startDate,
    endDate,
  })

  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [sortBy, setSortBy] = useState<SortOptions>('spend')

  const sorted = useMemo(() => {
    if (!frontGroup?.regionalBreakdown) return null

    let sorted = frontGroup.regionalBreakdown
      .sort((a, b) => a.upperBound - b.upperBound)
      .slice()

    if (sortBy === 'state') {
      sorted = frontGroup.regionalBreakdown.sort((a, b) =>
        a.state.localeCompare(b.state),
      )
    }

    return sortDirection === 'asc' ? sorted : sorted.slice().reverse()
  }, [frontGroup?.regionalBreakdown, sortBy, sortDirection])

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

  if (isLoading) return <div>Loading...</div>

  if (!frontGroup) return <div>Not found</div>

  return (
    <div className='flex justify-center'>
      <div className='max-w-[600px] w-full py-5'>
        <div className='flex gap-x-2 items-center'>
          <ActiveChip active={frontGroup?.active} />
          <div className='text-3xl font-semibold text-primary'>
            {frontGroup?.name}
          </div>
        </div>
        <p className='text-secondary text-sm py-1'>
          Last ad: {dayjs(frontGroup.lastAdDate).format('MMMM DD, YYYY')}
        </p>
        <div className='flex gap-x-2 items-center py-5'>
          <DatePicker setDate={setStartDate} date={startDate} />
          <span className='text-secondary text-sm'>to</span>
          <DatePicker setDate={setEndDate} date={endDate} />
          {datesDiffer && (
            <button
              type='button'
              onClick={resetDates}
              className='px-3 text-reset'
            >
              Reset
            </button>
          )}
          <DownloadCSVButton
            fileName={`${frontGroup.name}_${dayjs(startDate).format('MM-DD-YY')}_to_${dayjs(endDate).format('MM-DD-YY')}`}
            csv={convertToCSV(frontGroup.regionalBreakdown, [])}
          />
        </div>
        <p className='text-secondary pb-5'>
          During this time frame, {frontGroup.name} ran{' '}
          {withCommas(frontGroup.numAds)} <b>ad(s)</b> on Meta{"'"}s platforms,
          spending at least ${withCommas(frontGroup.adSpendUpper)}.
          <br />
          <br />
          Below is it{"'"}s ad spending by region:
        </p>
        {sorted && (
          <table className='w-full'>
            <thead>
              <tr className='bg-backgroundLight'>
                <HeaderItem
                  title='State'
                  onSort={() => handleSortChange('state')}
                />
                <HeaderItem
                  title='Money Spent'
                  onSort={() => handleSortChange('spend')}
                />
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => (
                <tr key={i} className='border-b border-backgroundLight'>
                  <td className='px-5 py-2 text-secondary text-center'>
                    {row.state}
                  </td>
                  <td className='px-5 py-2 text-secondary'>
                    <div className='pl-[100px]'>
                      {`$${row.lowerBound.toFixed(0)} - $${row.upperBound.toFixed(0)}`}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Disclaimer />
      </div>
    </div>
  )
}

export default Page
