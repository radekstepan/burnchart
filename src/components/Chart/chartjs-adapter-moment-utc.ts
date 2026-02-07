/**
 * Custom Chart.js adapter for moment.js with UTC support
 * Based on chartjs-adapter-moment v1.0.1
 */
import moment from "moment";
import { _adapters } from "chart.js";

const FORMATS = {
  datetime: "MMM D, YYYY, h:mm:ss a",
  millisecond: "h:mm:ss.SSS a",
  second: "h:mm:ss a",
  minute: "h:mm a",
  hour: "hA",
  day: "MMM D",
  week: "ll",
  month: "MMM YYYY",
  quarter: "[Q]Q - YYYY",
  year: "YYYY"
};

(_adapters._date as { override: (config: unknown) => void }).override({
  formats: function () {
    return FORMATS;
  },

  parse: function (value: unknown, format: unknown): number | null {
    // Force UTC parsing
    let m: moment.Moment;
    if (typeof value === "string" && typeof format === "string") {
      m = moment.utc(value, format);
    } else if (typeof value === "string") {
      m = moment.utc(value);
    } else if (value instanceof Date) {
      m = moment.utc(value);
    } else if (typeof value === "number") {
      m = moment.utc(value);
    } else {
      m = moment.utc();
    }
    return m.isValid() ? m.valueOf() : null;
  },

  format: function (time: number, format: string): string {
    return moment.utc(time).format(format);
  },

  add: function (time: number, amount: number, unit: moment.unitOfTime.DurationConstructor): number {
    return moment.utc(time).add(amount, unit).valueOf();
  },

  diff: function (max: number, min: number, unit: moment.unitOfTime.DurationConstructor): number {
    return moment.utc(max).diff(moment.utc(min), unit);
  },

  startOf: function (time: number, unit: moment.unitOfTime.StartOf, weekday?: number): number {
    const m = moment.utc(time);
    if (unit === "isoWeek") {
      weekday = Math.trunc(Math.min(Math.max(0, weekday ?? 0), 6));
      return m.isoWeekday(weekday).startOf("day").valueOf();
    }
    return m.startOf(unit).valueOf();
  },

  endOf: function (time: number, unit: moment.unitOfTime.StartOf): number {
    return moment.utc(time).endOf(unit).valueOf();
  }
});
