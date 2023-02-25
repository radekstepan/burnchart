import mockDate from "mockdate";
import * as lines from "../index";

const t = (d: string) => `2000-01-${d}T00:00:00Z`;

describe("idealLine", () => {
  beforeEach(() => {
    mockDate.reset();
  });

  test("no offDays", () => {
    const a = t("01");
    const b = t("04");

    const line = lines.ideal(a, b, 4);

    expect(line).toEqual([
      { x: t("01"), y: 4 },
      { x: t("04"), y: 0 },
    ]);
  });

  test("with offDays", () => {
    const a = t("01");
    const b = t("04");

    const line = lines.ideal(a, b, 4, ["0"]);

    expect(line).toEqual([
      { x: t("01"), y: 3 },
      { x: t("02"), y: 2 },
      { x: t("03"), y: 1 },
      { x: t("04"), y: 0 },
    ]);
  });
});

export default {};
