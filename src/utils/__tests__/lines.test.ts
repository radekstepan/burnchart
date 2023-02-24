import mockDate from "mockdate";
import moment, { Moment } from "moment";
import * as lines from "../lines";
import { ChartD, Issue, WithSize } from "../../interfaces";

type ToIssue = (obj: Partial<WithSize<Issue>>) => WithSize<Issue>;

const toIssue: ToIssue = (obj) => ({
  number: 0,
  title: "",
  closedAt: null,
  labels: [],
  size: 1,
  ...obj,
});

const t = (d: string) => `2000-01-${d}T00:00:00Z`;

// Round dates to the nearest date.
const nearest = (d: ChartD) => {
  const x = moment.utc(d.x);
  const [, m] = [
    moment(x).startOf("day").subtract(1, "day"),
    moment(x).startOf("day"),
    moment(x).startOf("day").add(1, "day"),
  ].reduce<[number, Moment | null]>(
    (acc, d) => {
      const diff = Math.abs(d.diff(x, "seconds"));
      if (diff < acc[0]) {
        return [diff, d];
      }
      return acc;
    },
    [+Infinity, null]
  );

  if (!m) {
    throw new Error("Could not find the nearest date");
  }

  return {
    ...d,
    x: m.format(lines.FORMAT),
  };
};

describe("lines", () => {
  beforeEach(() => {
    mockDate.reset();
  });

  test("actual", () => {
    const issues = [
      { size: 3, closedAt: "2" },
      { size: 2, closedAt: "3" },
      { size: 1, closedAt: "4" },
    ].map(toIssue);

    const line = lines.actual(issues, "", 6);

    expect(line.map((d) => d.y)).toEqual([6, 3, 1, 0]);
  });

  test("ideal", () => {
    const a = t("01");
    const b = t("04");

    const line = lines.ideal(a, b, 4);

    expect(line).toEqual([
      { x: t("01"), y: 3 },
      { x: t("02"), y: 2 },
      { x: t("03"), y: 1 },
      { x: t("04"), y: 0 },
    ]);
  });

  test("trend", () => {
    mockDate.set(t("04"));

    const issues = [
      { closedAt: t("02"), size: 1 },
      { closedAt: t("03"), size: 1 },
    ].map(toIssue);

    const actual = lines.actual(issues, t("01"), 3);
    const line = lines.trend(actual);

    expect(line!.map(nearest)).toEqual([
      { x: t("01"), y: 2.75 },
      { x: t("02"), y: 2.08 },
      { x: t("03"), y: 1.42 },
      { x: t("04"), y: 0.75 },
    ]);
  });
});

export default {};
