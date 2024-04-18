import { faDownload, faSort } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export const DatePicker = ({
  date,
  setDate,
}: {
  date: string
  setDate: (date: string) => void
}) => {
  return (
    <input
      type='date'
      className='px-2 border border-background rounded-md bg-white text-secondary h-[30px]'
      value={date}
      onChange={(e) => setDate(e.target.value)}
    />
  )
}

export const ActiveChip = ({ active }: { active: boolean }) => {
  return (
    <div
      className={`rounded-md inline-flex px-2 h-[25px] items-center text-sm font-semibold ${
        active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}
    >
      {active ? 'Active' : 'Inactive'}
    </div>
  )
}

export const HeaderItem = ({
  title,
  onSort,
}: {
  title: string
  onSort?: () => void
}) => {
  return (
    <th className='py-2 text-primary text-sm'>
      <span className='uppercase'>{title}</span>
      <span> </span>
      {onSort && (
        <button className='text-xs fong-regular' onClick={onSort}>
          <FontAwesomeIcon icon={faSort} />
        </button>
      )}
    </th>
  )
}

export const convertToCSV = <T,>(data: T[], omit: string[]) => {
  if (data.length === 0) return ''

  const columnDelimiter = ','
  const lineDelimiter = '\n'
  const keys = Object.keys(data[0] ?? {}).filter(
    (k) => !omit.includes(k),
  ) as (keyof T)[]
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

export const DownloadCSVButton = ({
  csv,
  fileName,
}: {
  csv: string
  fileName: string
}) => {
  const downloadCSV = () => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
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
      className='px-3 h-[30px] cursor-pointer hover:bg-gray-100 bg-white border border-background text-secondary font-semibold flex items-center gap-x-2 rounded-md transition-all'
      onClick={downloadCSV}
    >
      <FontAwesomeIcon icon={faDownload} />
      <span> Export</span>
    </button>
  )
}

export const Disclaimer = () => {
  return (
    <p className='text-secondary text-sm py-10'>
      Tool built by{' '}
      <a
        href='https://www.energyandpolicy.org/shelby-green/'
        className='text-blue-500 underline'
      >
        Shelby Green
      </a>{' '}
      with the Energy and Policy Institute. Having issues using the tool or want
      to make a suggestion? Please{' '}
      <a
        href='https://www.energyandpolicy.org/contact-us/'
        className='text-blue-500 underline'
      >
        contact us
      </a>
      !
    </p>
  )
}
