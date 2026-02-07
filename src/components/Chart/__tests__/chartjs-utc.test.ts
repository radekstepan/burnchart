/**
 * Test for chart.js UTC date parsing
 * Investigates the "Invalid date" issue
 */
import { describe, test, expect } from "vitest";
import moment from "moment";

// This is what chartjs-adapter-moment does
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

// The parse function from chartjs-adapter-moment
function adapterParse(value: unknown, format: unknown): number | null {
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
}

describe("Chart.js UTC date parsing", () => {
  // These are the types of dates that might come from GitHub API
  const testCases = [
    { label: "ISO 8601 with Z", value: "2022-01-01T00:00:00Z", desc: "ISO with Z" },
    { label: "ISO 8601 with offset", value: "2022-01-01T00:00:00+00:00", desc: "ISO with +00:00" },
    { label: "Date only ISO", value: "2022-01-01", desc: "YYYY-MM-DD only" },
    { label: "Date with time no TZ", value: "2022-01-01T00:00:00", desc: "ISO without timezone" },
  ];

  testCases.forEach(({ label, value, desc }) => {
    test(`parses ${desc}: "${value}"`, () => {
      const result = adapterParse(value, undefined);
      expect(result).not.toBeNull();
      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThan(0);
    });
  });

  test("parses milestone dates from the app", () => {
    const milestoneDates = [
      "2022-01-01", // startDate
      "2022-12-31", // endDate
    ];

    milestoneDates.forEach(date => {
      const result = adapterParse(date, undefined);
      expect(result).not.toBeNull();
    });
  });

  test("moment() handles date strings correctly", () => {
    const dateStr = "2022-01-01";
    const m = moment(dateStr);
    expect(m.isValid()).toBe(true);
    expect(m.valueOf()).toBe(1640995200000);
  });

  test("moment.utc() returns valid UTC moment", () => {
    const timestamp = 1640995200000;
    const m = moment.utc(timestamp);
    expect(m.isValid()).toBe(true);
    expect(m.format()).toBe("2022-01-01T00:00:00Z");
  });
});
