import moment from "moment";

/**
 * Force UTC mode for all moment operations
 */
moment.suppressDeprecationWarnings = true;

/**
 * Parse a date string as UTC, ensuring consistent handling
 */
const parseUtc = (date: string | number | Date | moment.Moment): moment.Moment => {
  if (!date) return moment.utc();
  // If already a moment object, return it
  if (moment.isMoment(date)) return date.utc();
  // If number (timestamp), create from milliseconds
  if (typeof date === "number") return moment.utc(date);
  // If Date object, convert to UTC
  if (date instanceof Date) return moment.utc(date);
  // Parse as ISO string for consistent results
  return moment.utc(date);
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
  const end = b ? parseUtc(b) : moment.utc();
  const diff = end.diff(start);

  switch (true) {
    case diff < DAY: // 05:50
      return (d: moment.Moment | Date | number | string) => parseUtc(d).format("HH:mm");
    case diff < WEEK: // Sat 04
      return (d: moment.Moment | Date | number | string) => parseUtc(d).format("ddd DD");
    case diff < MONTH * 2: // Mar 04
      return (d: moment.Moment | Date | number | string) => parseUtc(d).format("MMM DD");
    case diff < YEAR: // Mar
      return (d: moment.Moment | Date | number | string) => parseUtc(d).format("MMM");
    case diff < YEAR * 2: // Mar 2023
      return (d: moment.Moment | Date | number | string) => parseUtc(d).format("MMM YYYY");
    default: // 03 2023
      return (d: moment.Moment | Date | number | string) => parseUtc(d).format("MM YYYY");
  }
};
