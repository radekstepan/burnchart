import mockDate from "mockdate";
import { formatTimeRange } from "../format";

describe("format", () => {
  describe("formatTimeRange", () => {
    test("uses today when the second argument is not provided", () => {
      mockDate.set("2023-03-04T01:00:00.000Z");

      const formatter = formatTimeRange("2023-03-04T00:00:00.000Z", null);
      expect(formatter("2023-03-04T12:00:00.000Z")).toEqual("04:00");
    });

    test("formats time in 'HH:mm' when the time range is less than a day", () => {
      const formatter = formatTimeRange(
        "2022-12-31T23:00:00.000Z",
        "2023-01-01T01:30:00.000Z"
      );
      expect(formatter("2023-01-01T00:15:00.000Z")).toEqual("16:15");
    });

    test("returns a function that formats time in 'ddd DD' when the time range is less than a week", () => {
      const formatter = formatTimeRange(
        "2022-12-31T23:00:00.000Z",
        "2023-01-07T01:30:00.000Z"
      );
      expect(formatter("2023-01-01T00:15:00.000Z")).toEqual("Sat 31");
    });

    test("returns a function that formats time in 'MMM DD' when the time range is less than two months", () => {
      const formatter = formatTimeRange(
        "2022-12-31T23:00:00.000Z",
        "2023-02-28T01:30:00.000Z"
      );
      expect(formatter("2023-01-01T00:15:00.000Z")).toEqual("Dec 31");
    });

    test("returns a function that formats time in 'MMM' when the time range is less than a year", () => {
      const formatter = formatTimeRange(
        "2022-12-31T23:00:00.000Z",
        "2023-12-31T01:30:00.000Z"
      );
      expect(formatter("2023-01-01T00:15:00.000Z")).toEqual("Dec");
    });

    test("returns a function that formats time in 'MMM YYYY' when the time range is less than two years", () => {
      const formatter = formatTimeRange(
        "2022-12-31T23:00:00.000Z",
        "2024-12-31T01:30:00.000Z"
      );
      expect(formatter("2023-01-01T00:15:00.000Z")).toEqual("12 2022");
    });
  });
});
