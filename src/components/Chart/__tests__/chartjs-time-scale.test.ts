/**
 * Test that simulates what Chart.js TimeScale does
 */
import { describe, test, expect } from "vitest";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { formatTimeRange } from "../../../utils/format";

// Extend dayjs with UTC plugin
dayjs.extend(utc);

describe("Chart.js TimeScale simulation", () => {
  test("formats dates using formatTimeRange", () => {
    const formatter = formatTimeRange("2022-01-01", "2022-12-31");

    const testTimestamps = [
      1640995200000, // Jan 1, 2022
      1643673600000, // Feb 1, 2022
      1646092800000, // Mar 1, 2022
    ];

    testTimestamps.forEach(ts => {
      const result = formatter(ts);
      expect(result).not.toBe("Invalid Date");
      expect(typeof result).toBe("string");
    });
  });

  test("simulates TimeScale tick generation", () => {
    const start = dayjs.utc("2022-01-01").valueOf();
    const end = dayjs.utc("2022-12-31").valueOf();
    const diff = end - start;

    const tickCount = 12;
    const interval = diff / (tickCount - 1);

    for (let i = 0; i < tickCount; i++) {
      const tickTime = start + (interval * i);
      const formatter = formatTimeRange("2022-01-01", "2022-12-31");
      const formatted = formatter(tickTime);
      expect(formatted).not.toBe("Invalid Date");
    }
  });

  test("dayjs.utc() handles timestamps correctly", () => {
    const ts = 1640995200000;
    const d = dayjs.utc(ts);
    expect(d.isValid()).toBe(true);
    expect(d.format()).toBe("2022-01-01T00:00:00Z");
  });

  test("handles invalid inputs gracefully", () => {
    const nullResult = dayjs(null);
    expect(nullResult.isValid()).toBe(false);

    const emptyResult = dayjs("");
    expect(emptyResult.isValid()).toBe(false);
  });
});
