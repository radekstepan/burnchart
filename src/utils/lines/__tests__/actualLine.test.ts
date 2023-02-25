import mockDate from "mockdate";
import * as lines from "../index";
import { Issue, WithSize } from "../../../interfaces";

type ToIssue = (obj: Partial<WithSize<Issue>>) => WithSize<Issue>;

const toIssue: ToIssue = (obj) => ({
  number: 0,
  title: "",
  closedAt: null,
  labels: [],
  size: 1,
  ...obj,
});

describe("actualLine", () => {
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

  test("should return an empty array if issues is empty", () => {
    const issues = [].map(toIssue);
    const startDate = "2022-01-01";
    const total = 0;

    const result = lines.actual(issues, startDate, total);

    expect(result).toEqual([{ x: startDate, y: total }]);
  });

  test("should calculate the correct chart dataset for a non-empty list of issues", () => {
    const issues = [
      {
        closedAt: "2022-01-02",
        size: 3,
        number: 1,
        title: "Issue 1",
      },
      {
        closedAt: "2022-01-03",
        size: 2,
        number: 2,
        title: "Issue 2",
      },
    ].map(toIssue);

    const startDate = "2022-01-01";
    const total = 10;

    const result = lines.actual(issues, startDate, total);

    expect(result).toEqual([
      { x: startDate, y: total },
      {
        x: "2022-01-02",
        y: total - issues[0].size,
        meta: { number: issues[0].number, title: issues[0].title },
      },
      {
        x: "2022-01-03",
        y: total - issues[0].size - issues[1].size,
        meta: { number: issues[1].number, title: issues[1].title },
      },
    ]);
  });
});

export default {};
