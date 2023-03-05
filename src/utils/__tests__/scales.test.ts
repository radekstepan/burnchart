import moment from "moment";
import { timeScale } from "../scales";

describe("scales", () => {
  describe("timeScale", () => {
    test("should return a time scale", () => {
      const { scale } = timeScale(moment("2024-02-01"), moment("2024-02-29"));

      expect(scale).toBeDefined();
      expect(typeof scale).toBe("function");
    });

    test("should map domain values to range values using scale()", () => {
      const { scale } = timeScale(moment("2024-02-01"), moment("2024-02-29"));

      expect(scale(moment("2024-02-01"))).toBe(0);
      expect(scale(moment("2024-02-15"))).toBe(50); // toBeCloseTo
      expect(scale(moment("2024-02-29"))).toBe(100);
    });

    test("should map range values to domain values using scale.invert()", () => {
      const { invert } = timeScale(moment("2024-02-01"), moment("2024-02-29"));

      expect(invert(0).isSame(moment("2024-02-01"))).toBeTruthy;
      expect(invert(50).isSame(moment("2024-02-15"))).toBeTruthy();
      expect(invert(100).isSame(moment("2024-02-29"))).toBeTruthy();
    });
  });
});
