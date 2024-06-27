export const withCommas = (num: number) => {
  return num.toLocaleString('en', { useGrouping: true })
}
