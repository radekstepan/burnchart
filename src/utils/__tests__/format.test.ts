import mockDate from "mockdate";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { formatTimeRange, fromNow, due } from "../format";

// Extend dayjs with UTC plugin
dayjs.extend(utc);

describe("format", () => {
  describe("formatTimeRange", () => {
    test("uses today when the second argument is not provided", () => {
      mockDate.set("2023-03-04T01:00:00.000Z");

      const formatter = formatTimeRange("2023-03-04T00:00:00.000Z", null);
      expect(formatter("2023-03-04T12:00:00.000Z")).toEqual("12:00");
    });

    test("formats time in 'HH:mm' when the time range is less than a day", () => {
      const formatter = formatTimeRange(
        "2022-12-31T23:00:00.000Z",
        "2023-01-01T01:30:00.000Z"
      );
      expect(formatter("2023-01-01T00:15:00.000Z")).toEqual("00:15");
    });

    test("returns a function that formats time in 'ddd DD' when the time range is less than a week", () => {
      const formatter = formatTimeRange(
        "2022-12-31T23:00:00.000Z",
        "2023-01-07T01:30:00.000Z"
      );
      expect(formatter("2023-01-01T00:15:00.000Z")).toEqual("Sun 01");
    });

    test("returns a function that formats time in 'MMM DD' when the time range is less than two months", () => {
      const formatter = formatTimeRange(
        "2022-12-31T23:00:00.000Z",
        "2023-02-28T01:30:00.000Z"
      );
      expect(formatter("2023-01-01T00:15:00.000Z")).toEqual("Jan 01");
    });

    test("returns a function that formats time in 'MMM' when the time range is less than a year", () => {
      const formatter = formatTimeRange(
        "2022-12-31T23:00:00.000Z",
        "2023-12-31T01:30:00.000Z"
      );
      expect(formatter("2023-01-01T00:15:00.000Z")).toEqual("Jan");
    });

    test("returns a function that formats time in 'MMM YYYY' when the time range is less than two years", () => {
      const formatter = formatTimeRange(
        "2022-12-31T23:00:00.000Z",
        "2024-12-31T01:30:00.000Z"
      );
      expect(formatter("2023-01-01T00:15:00.000Z")).toEqual("Jan 2023");
    });

    test("returns a function that formats time in 'MMM YYYY' when the time range is more than two years (default case)", () => {
      const formatter = formatTimeRange(
        "2020-12-31T23:00:00.000Z",
        "2024-12-31T01:30:00.000Z"
      );
      expect(formatter("2021-01-01T00:15:00.000Z")).toEqual("Jan 2021");
    });

    test("handles timestamps directly", () => {
      const formatter = formatTimeRange(
        "2022-01-01T00:00:00.000Z",
        "2022-12-31T00:00:00.000Z"
      );
      // Timestamp for Feb 15, 2022
      expect(formatter(1644892800000)).toEqual("Feb");
    });

    test("handles Date objects", () => {
      const formatter = formatTimeRange(
        "2022-01-01T00:00:00.000Z",
        "2022-12-31T00:00:00.000Z"
      );
      const dateObj = new Date("2022-06-15T00:00:00.000Z");
      expect(formatter(dateObj)).toEqual("Jun");
    });

    test("handles dayjs objects", () => {
      const formatter = formatTimeRange(
        "2022-01-01T00:00:00.000Z",
        "2022-12-31T00:00:00.000Z"
      );
      const dayjsObj = dayjs("2022-06-15T00:00:00.000Z");
      expect(formatter(dayjsObj)).toEqual("Jun");
    });
  });

  describe("fromNow", () => {
    test("returns relative time from now", () => {
      mockDate.set("2023-03-04T01:00:00.000Z");

      // 1 day ago
      expect(fromNow("2023-03-03T01:00:00.000Z")).toEqual("a day ago");
      // 2 days ago
      expect(fromNow("2023-03-02T01:00:00.000Z")).toEqual("2 days ago");
    });
  });

  describe("due", () => {
    test("returns non-breaking space when date is undefined", () => {
      expect(due(undefined)).toEqual("\u00a0");
    });

    test("returns 'due X' when date is provided", () => {
      mockDate.set("2023-03-04T01:00:00.000Z");
      expect(due("2023-03-03T01:00:00.000Z")).toContain("due");
    });
  });
});
