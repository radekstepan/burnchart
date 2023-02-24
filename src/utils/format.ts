import moment from "moment";

/**
 * Returns the amount of time that has passed since the given date.
 * @param date The date to calculate the time from now for.
 * @returns The amount of time that has passed since the given date.
 */
export const fromNow = (date: string) =>
  moment(date, moment.ISO_8601).fromNow();

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
