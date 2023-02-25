import moment, { type Moment } from "moment";

// export const timeScale = (a: Moment, b: Moment): ScaleTime<number, number> => {
//   return scaleTime()
//     .domain([a, b])
//     .range([0, 100]);
// };

export type TimeScale = (
  start: Moment,
  end: Moment
) => {
  scale: (date: Moment) => number;
  invert: (percentage: number) => Moment;
};

/**
 * Creates a time scale function that maps a date to a percentage value between 0 and 100,
 * representing the position of the date within a time range defined by the start and end parameters.
 *
 * @param start - The start date of the time range.
 * @param end - The end date of the time range.
 * @returns An object containing the default `scale` and `invert` functions of the time scale.
 */
export const timeScale: TimeScale = (start, end) => {
  const startTime = start.toDate().getTime();
  const endTime = end.toDate().getTime();
  const timeRange = endTime - startTime;

  /**
   * Maps a date to a percentage value between 0 and 100, representing the position of the date within the time range.
   *
   * @param date - The date to map to a percentage value.
   * @returns A percentage value between 0 and 100.
   */
  const scale = (date: Moment) => {
    const dateTime = date.toDate().getTime();
    const percentage = (dateTime - startTime) / timeRange;
    return percentage * 100;
  };

  /**
   * Maps a percentage value between 0 and 100 to a date, representing the position of the percentage value within the time range.
   *
   * @param percentage - The percentage value to map to a date.
   * @returns A `moment` object representing the date that corresponds to the given percentage value within the time range.
   */
  const invert = (percentage: number) => {
    const dateTime = startTime + (percentage / 100) * timeRange;
    return moment(dateTime);
  };

  return { scale, invert };
};
