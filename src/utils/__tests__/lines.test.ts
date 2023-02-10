import * as lines from "../lines";
import { Issue, WithSize } from "../../interfaces";

type ToIssue = (obj: Partial<WithSize<Issue>>) => WithSize<Issue>;

const toIssue: ToIssue = (obj) => ({
  number: 0,
  title: "",
  closedAt: null,
  labels: [],
  size: 1,
  ...obj,
});

describe("lines", () => {
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
    const a = "2011-04-01T00:00:00Z";
    const b = "2011-04-04T00:00:00Z";

    const line = lines.ideal(a, b, 4);

    expect(line).toEqual([
      { x: "2011-04-01T00:00:00.000Z", y: 3 },
      { x: "2011-04-02T00:00:00.000Z", y: 2 },
      { x: "2011-04-03T00:00:00.000Z", y: 1 },
      { x: "2011-04-04T00:00:00.000Z", y: 0 },
    ]);
  });
});
