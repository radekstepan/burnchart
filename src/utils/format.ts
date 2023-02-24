import moment from "moment";

// Time from now.
export const fromNow = (date: string) =>
  moment(date, moment.ISO_8601).fromNow();

// When is a milestone due?
export const due = (date?: string) => {
  if (!date) {
    return "\u00a0"; // for React
  }
  return `due ${fromNow(date)}`;
};
