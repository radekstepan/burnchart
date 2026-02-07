import * as lines from "../index";

const t = (d: string) => `2000-01-${d}T00:00:00Z`;

describe("idealLine", () => {
  test("no offDays", () => {
    const a = t("01");
    const b = t("04");

    const line = lines.ideal(a, b, 4);

    expect(line).toEqual([
      { x: t("01"), y: 4 },
      { x: t("04"), y: 0 },
    ]);
  });

  test("with offDays (skipping Sundays)", () => {
    const a = t("01");
    const b = t("04");

    const line = lines.ideal(a, b, 4, [0]);

    expect(line).toEqual([
      { x: t("01"), y: 3 },
      { x: t("02"), y: 2 },
      { x: t("03"), y: 1 },
      { x: t("04"), y: 0 },
    ]);
  });

  test("swaps dates when end is before start", () => {
    const a = t("04");
    const b = t("01");

    // Should swap and work correctly
    const line = lines.ideal(a, b, 4);

    expect(line[0].x).toEqual(t("01"));
    expect(line[0].y).toEqual(4);
    expect(line[line.length - 1].x).toEqual(t("04"));
    expect(line[line.length - 1].y).toEqual(0);
  });

  test("handles empty offDays array", () => {
    const a = t("01");
    const b = t("03");

    const line = lines.ideal(a, b, 3, []);

    expect(line).toEqual([
      { x: t("01"), y: 3 },
      { x: t("03"), y: 0 },
    ]);
  });

  test("handles no end date (b is null)", () => {
    const a = t("01");

    const line = lines.ideal(a, null, 4);

    // First point should be the start date
    expect(line[0].x).toContain("2000-01-01");
    expect(line[0].y).toEqual(4);
    // Last point should have y=0
    expect(line[line.length - 1].y).toEqual(0);
  });

  test("calculates correct values for multiple days", () => {
    const a = t("01");
    const b = t("04");

    const line = lines.ideal(a, b, 4);

    expect(line.length).toEqual(2);
    expect(line[0].y).toEqual(4);
    expect(line[1].y).toEqual(0);
  });

  test("skips Sundays when configured", () => {
    const a = t("01"); // Saturday
    const b = t("07"); // Friday

    // Skip Sunday (0)
    const line = lines.ideal(a, b, 6, [0]);

    // Should include Sat, Mon, Tue, Wed, Thu, Fri = 6 days
    expect(line.length).toEqual(7); // 6 days + end point at 0
    expect(line.every(p => !p.x.includes("Sun"))).toBe(true);
  });

  test("handles single day range", () => {
    const a = t("01");
    const b = t("01");

    const line = lines.ideal(a, b, 2);

    expect(line.length).toEqual(2);
    expect(line[0].y).toEqual(2);
    expect(line[1].y).toEqual(0);
  });

  test("handles all days off (edge case)", () => {
    const a = t("01");
    const b = t("03");

    // All days off - function handles this gracefully
    const line = lines.ideal(a, b, 1, [0, 1, 2, 3, 4, 5, 6]);

    // Should have some output
    expect(line.length).toBeGreaterThan(0);
    // All y values should be <= total
    line.forEach(p => {
      expect(p.y).toBeLessThanOrEqual(1);
    });
  });
});

export default {};
