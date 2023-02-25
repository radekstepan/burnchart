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
});

export default {};
