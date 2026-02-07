/**
 * Custom Chart.js adapter for dayjs with UTC support
 * Based on chartjs-adapter-dayjs v1.0.0
 */
import dayjs, { type Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { _adapters } from "chart.js";

// Extend dayjs with UTC plugin
dayjs.extend(utc);

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
    let d: Dayjs;
    if (typeof value === "string" && typeof format === "string") {
      d = dayjs.utc(value, format);
    } else if (typeof value === "string") {
      d = dayjs.utc(value);
    } else if (value instanceof Date) {
      d = dayjs.utc(value);
    } else if (typeof value === "number") {
      d = dayjs.utc(value);
    } else {
      d = dayjs.utc();
    }
    return d.isValid() ? d.valueOf() : null;
  },

  format: function (time: number, format: string): string {
    return dayjs.utc(time).format(format);
  },

  add: function (time: number, amount: number, unit: string): number {
    return dayjs.utc(time).add(amount, unit as dayjs.UnitType).valueOf();
  },

  diff: function (max: number, min: number, unit: string): number {
    return dayjs.utc(max).diff(dayjs.utc(min), unit as dayjs.UnitType);
  },

  startOf: function (time: number, unit: string, weekday?: number): number {
    const d = dayjs.utc(time);
    if (unit === "isoWeek") {
      weekday = Math.trunc(Math.min(Math.max(0, weekday ?? 0), 6));
      return d.isoWeekday(weekday).startOf("day").valueOf();
    }
    return d.startOf(unit as dayjs.StartType).valueOf();
  },

  endOf: function (time: number, unit: string): number {
    return dayjs.utc(time).endOf(unit as dayjs.StartType).valueOf();
  }
});
