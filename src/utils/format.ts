import dayjs, { type Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";

// Extend dayjs with UTC plugin
dayjs.extend(utc);

// Extend dayjs with relativeTime plugin for fromNow()
dayjs.extend(relativeTime);

/**
 * Parse a date string as UTC, ensuring consistent handling
 */
const parseUtc = (date: string | number | Date | Dayjs): Dayjs => {
  if (!date) return dayjs.utc();
  // If already a dayjs object, return it
  if (dayjs.isDayjs(date)) return dayjs.utc(date);
  // If number (timestamp), create from milliseconds
  if (typeof date === "number") return dayjs.utc(date);
  // If Date object, convert to UTC
  if (date instanceof Date) return dayjs.utc(date);
  // Parse as ISO string for consistent results
  return dayjs.utc(date);
};

/**
 * Returns the amount of time that has passed since the given date.
 * @param date The date to calculate the time from now for.
 * @returns The amount of time that has passed since the given date.
 */
export const fromNow = (date: string) =>
  parseUtc(date).fromNow();

/**
 * Returns a human readable text indicating when a milestone is due.
 * @param date The due date of the milestone.
 * @returns A string indicating when the milestone is due
 */
export const due = (date?: string) => {
  if (!date) {
    return "\u00a0"; // for React
  }
  return `due ${fromNow(date)}`;
};

const DAY = 1e3 * 60 * 60 * 24;
const WEEK = DAY * 7;
const MONTH = DAY * 30;
const YEAR = DAY * 365;

export const formatTimeRange = (a: string, b: string | null) => {
  const start = parseUtc(a);
  const end = b ? parseUtc(b) : dayjs.utc();
  const diff = end.diff(start);

  switch (true) {
    case diff < DAY: // 05:50
      return (d: Dayjs | Date | number | string) => parseUtc(d).format("HH:mm");
    case diff < WEEK: // Sat 04
      return (d: Dayjs | Date | number | string) => parseUtc(d).format("ddd DD");
    case diff < MONTH * 2: // Mar 04
      return (d: Dayjs | Date | number | string) => parseUtc(d).format("MMM DD");
    case diff < YEAR: // Mar
      return (d: Dayjs | Date | number | string) => parseUtc(d).format("MMM");
    case diff < YEAR * 2: // Oct 2025
      return (d: Dayjs | Date | number | string) => parseUtc(d).format("MMM YYYY");
    default: // Oct 2023
      return (d: Dayjs | Date | number | string) => parseUtc(d).format("MMM YYYY");
  }
};
