/**
 * Test that simulates what Chart.js TimeScale does
 */
import { describe, test, expect } from "vitest";
import moment from "moment";
import { formatTimeRange } from "../../../utils/format";

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
    const start = moment.utc("2022-01-01").valueOf();
    const end = moment.utc("2022-12-31").valueOf();
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

  test("moment.utc() handles timestamps correctly", () => {
    const ts = 1640995200000;
    const m = moment.utc(ts);
    expect(m.isValid()).toBe(true);
    expect(m.format()).toBe("2022-01-01T00:00:00Z");
  });

  test("handles invalid inputs gracefully", () => {
    const nullResult = moment(null as unknown as moment.MomentInput);
    expect(nullResult.isValid()).toBe(false);

    const emptyResult = moment("" as unknown as moment.MomentInput);
    expect(emptyResult.isValid()).toBe(false);
  });
});
