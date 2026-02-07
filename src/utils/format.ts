import moment from "moment";

/**
 * Force UTC mode for all moment operations
 */
moment.suppressDeprecationWarnings = true;

/**
 * Returns the amount of time that has passed since the given date.
 * @param date The date to calculate the time from now for.
 * @returns The amount of time that has passed since the given date.
 */
export const fromNow = (date: string) =>
  moment.utc(date, moment.ISO_8601).fromNow();

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
  const start = moment.utc(a, moment.ISO_8601);
  const end = b ? moment.utc(b, moment.ISO_8601) : moment.utc();
  const diff = end.diff(start);

  switch (true) {
    case diff < DAY: // 05:50
      return (d: number | string) => moment.utc(d, moment.ISO_8601).format("HH:mm");
    case diff < WEEK: // Sat 04
      return (d: number | string) => moment.utc(d, moment.ISO_8601).format("ddd DD");
    case diff < MONTH * 2: // Mar 04
      return (d: number | string) => moment.utc(d, moment.ISO_8601).format("MMM DD");
    case diff < YEAR: // Mar
      return (d: number | string) => moment.utc(d, moment.ISO_8601).format("MMM");
    case diff < YEAR * 2: // Mar 2023
      return (d: number | string) => moment.utc(d, moment.ISO_8601).format("MMM YYYY");
    default: // 03 2023
      return (d: number | string) => moment.utc(d, moment.ISO_8601).format("MM YYYY");
  }
};
