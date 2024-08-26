import { useRouter } from 'next/router'
import { api } from '~/utils/api'
import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { debounce } from 'lodash'

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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'

type SortOptions = 'state' | 'spend'

const defaultStartDate = '2018-05-24'
const defaultEndDate = dayjs().format('YYYY-MM-DD')

const Page = () => {
  const router = useRouter()
  const id = (router.query.id ?? '') as string
  const [startDate, setStartDate] = useState<string>(defaultStartDate)
  const [endDate, setEndDate] = useState<string>(defaultEndDate)
  const [debouncedStartDate, setDebouncedStartDate] =
    useState<string>(defaultStartDate)
  const [debouncedEndDate, setDebouncedEndDate] =
    useState<string>(defaultEndDate)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const debouncedSetStartDate = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    () => debounce(setDebouncedStartDate, 1000),
    [],
  )
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const debouncedSetEndDate = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    () => debounce(setDebouncedEndDate, 1000),
    [],
  )

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    debouncedSetStartDate(startDate)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    debouncedSetEndDate(endDate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate])

  const { data: frontGroup, isLoading: fullDataLoading } =
    api.frontGroup.get.useQuery({
      frontGroupId: id,
      startDate: debouncedStartDate,
      endDate: debouncedEndDate,
    })

  const { data: frontGroupStatic, isLoading: staticDataLoading } =
    api.frontGroup.getStatic.useQuery(id)

  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [sortBy, setSortBy] = useState<SortOptions>('spend')
  const { data: tenMost } = api.frontGroup.getTenMostExpensiveAds.useQuery({
    frontGroupId: id,
  })
  const ROWS_SHOWN_DEFAULT = 7
  const [rowsShown, setRowsShown] = useState(ROWS_SHOWN_DEFAULT)

  const sorted = useMemo(() => {
    if (!frontGroup?.regionalBreakdown) return null

    let sorted = frontGroup.regionalBreakdown
      .sort((a, b) => a.upperBound - b.upperBound)
      .filter(
        (r) => Math.floor(r.upperBound) > 0 && Math.floor(r.lowerBound) > 0,
      )
      .slice()

    if (sortBy === 'state') {
      sorted = frontGroup.regionalBreakdown.sort((a, b) =>
        a.state.localeCompare(b.state),
      )
    }

    sorted = sortDirection === 'asc' ? sorted : sorted.slice().reverse()
    return sorted
  }, [frontGroup?.regionalBreakdown, sortBy, sortDirection])

  const onShowMore = () => {
    // const STEP_SIZE = 5
    if (!sorted) return
    const max = sorted.length
    setRowsShown(max)
  }

  const onShowLess = () => {
    setRowsShown(ROWS_SHOWN_DEFAULT)
  }

  const showMoreVisible = rowsShown < (sorted?.length ?? 0)
  const showLessVisible = rowsShown > ROWS_SHOWN_DEFAULT
  const numMore = (sorted?.length ?? 0) - rowsShown

  const handleSortChange = (sb: SortOptions) => {
    if (sortBy === sb) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(sb)
      setSortDirection('asc')
    }
  }

  const [adShown, setAdShown] = useState(0)
  const adUrl = tenMost?.[adShown]?.ad_screenshot_url
  const resetDates = () => {
    setStartDate(defaultStartDate)
    setEndDate(defaultEndDate)
  }

  const datesDiffer =
    startDate !== defaultStartDate || endDate !== defaultEndDate

  if (fullDataLoading && staticDataLoading) return <div>Loading</div>

  if (!frontGroup && !fullDataLoading) return <div>Not found</div>

  return (
    <div className='flex justify-center'>
      <div className='max-w-[600px] w-full py-5'>
        <div className='flex gap-x-2 items-center'>
          {frontGroup && <ActiveChip active={frontGroup.active} />}
          <div className='text-3xl font-semibold text-primary'>
            {frontGroup?.name ?? frontGroupStatic?.name}
          </div>
        </div>
        {frontGroup && (
          <p className='text-secondary text-sm py-1'>
            Last ad: {dayjs(frontGroup.lastAdDate).format('MMMM DD, YYYY')}
          </p>
        )}
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
          {frontGroup && (
            <DownloadCSVButton
              fileName={`${frontGroup.name}_${dayjs(startDate).format('MM-DD-YY')}_to_${dayjs(endDate).format('MM-DD-YY')}`}
              csv={convertToCSV(frontGroup.exportableAds, [])}
            />
          )}
        </div>
        {!frontGroup && <div className='text-secondary'>Loading...</div>}
        {frontGroup && (
          <p className='text-secondary pb-5'>
            During this time frame, {frontGroup.name} ran{' '}
            {withCommas(frontGroup.totalAds)} <b>ad(s)</b> on Meta{"'"}s
            platforms, spending at least ${withCommas(frontGroup.totalSpend)}.
            <br />
            <br />
            Below is it{"'"}s ad spending by region:
          </p>
        )}
        {sorted && (
          <>
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
                {fullDataLoading
                  ? null
                  : sorted.slice(0, rowsShown).map((row, i) => (
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
            <div className='flex justify-center gap-x-3 w-full py-2'>
              {showMoreVisible && (
                <button
                  onClick={onShowMore}
                  className='text-secondary text-sm underline'
                >
                  Show {numMore} more...
                </button>
              )}
              {showLessVisible && (
                <button
                  onClick={onShowLess}
                  className='text-secondary text-sm underline'
                >
                  Show less
                </button>
              )}
            </div>
            {frontGroup?.updatedAt && (
              <div className='text-secondary text-sm italic'>{`Last Updated: ${dayjs(frontGroup.updatedAt).format('M/DD/YYYY')}`}</div>
            )}
          </>
        )}
        {frontGroup && tenMost && (
          <>
            <div className='text-secondary pt-7'>
              Click on the arrows to view the top 10 most expensive ads by{' '}
              {frontGroup.name}.
            </div>
            <div className='w-full flex flex-col items-center'>
              <div className='flex relative'>
                <div className='absolute top-2 right-2 text-secondary tracking-wider'>{`${adShown + 1}/${tenMost?.length}`}</div>
                <div className='font-bold'>{`$${tenMost?.[adShown]?.spend_upper_bound}`}</div>
                {/* <a href={tenMost?.[adShown]?.ad_snapshot_url}>Snapshoturl</a> */}
                <a
                  target='_blank'
                  rel='noreferrer'
                  href={tenMost?.[adShown]?.ad_snapshot_url}
                >
                  <Image
                    width={500}
                    height={500}
                    src={adUrl ?? ''}
                    alt='ad screenshot'
                  />
                  <p className='text-secondary text-sm w-full text-center py-2'>{`Most targeted state: ${tenMost?.[adShown]?.largestRegion.region} (${((tenMost?.[adShown]?.largestRegion.percentage ?? 0) * 100).toFixed(1)}%)`}</p>
                </a>
                <div className='flex flex-col items-center justify-center gap-y-2 px-2'>
                  <button
                    onClick={() => setAdShown((prev) => prev - 1)}
                    disabled={adShown === 0}
                    className='bg-secondary text-white rounded-full h-10 w-10 disabled:opacity-30'
                  >
                    <FontAwesomeIcon icon={faChevronUp} size='1x' />
                  </button>
                  <button
                    onClick={() => setAdShown((prev) => prev + 1)}
                    disabled={adShown === tenMost?.length - 1}
                    className='bg-secondary text-white rounded-full h-10 w-10 disabled:opacity-30'
                  >
                    <FontAwesomeIcon icon={faChevronDown} size='1x' />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
        <Disclaimer />
      </div>
    </div>
  )
}

export default Page
