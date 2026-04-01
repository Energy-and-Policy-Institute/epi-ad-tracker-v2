import dayjs, { type Dayjs } from "dayjs";

export const adDatesWithinRange = (
  adStartDate: string,
  adEndDate: string,
  rangeStartDate: string,
  rangeEndDate: string
) => {
  const start = dayjs(adStartDate);
  const end = dayjs(adEndDate);
  const rangeStart = dayjs(rangeStartDate);
  const rangeEnd = dayjs(rangeEndDate);

  const isBetween = (date: Dayjs, from: Dayjs, to: Dayjs) =>
    date.isAfter(from, "date") && date.isBefore(to, "date");

  return isBetween(start, rangeStart, rangeEnd) || isBetween(end, rangeStart, rangeEnd);
};

export const getInLast3Months = (date: string | null) => {
  if (!date) {
    return false;
  }

  return dayjs(date).isAfter(dayjs().subtract(3, "month"));
};
