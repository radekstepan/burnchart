import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { timeScale } from "../scales";

// Extend dayjs with UTC plugin
dayjs.extend(utc);

describe("scales", () => {
  describe("timeScale", () => {
    test("should return a time scale", () => {
      const { scale } = timeScale(dayjs("2024-02-01"), dayjs("2024-02-29"));

      expect(scale).toBeDefined();
      expect(typeof scale).toBe("function");
    });

    test("should map domain values to range values using scale()", () => {
      const { scale } = timeScale(dayjs("2024-02-01"), dayjs("2024-02-29"));

      expect(scale(dayjs("2024-02-01"))).toBe(0);
      expect(scale(dayjs("2024-02-15"))).toBe(50); // toBeCloseTo
      expect(scale(dayjs("2024-02-29"))).toBe(100);
    });

    test("should map range values to domain values using scale.invert()", () => {
      const { invert } = timeScale(dayjs("2024-02-01"), dayjs("2024-02-29"));

      expect(invert(0).isSame(dayjs("2024-02-01"))).toBeTruthy();
      expect(invert(50).isSame(dayjs("2024-02-15"))).toBeTruthy();
      expect(invert(100).isSame(dayjs("2024-02-29"))).toBeTruthy();
    });
  });
});
