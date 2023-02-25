import { ChartD, Issue, WithSize } from "../../interfaces";

/**
 * Creates a line of closed issues.
 * @param issues The list of closed issues.
 * @param startDate The milestone start date.
 * @param total The total number of points (open and closed issues).
 * @returns The chart dataset.
 */
export const actualLine = (
  issues: WithSize<Issue>[],
  startDate: string,
  total: number
): ChartD[] =>
  issues.reduce(
    (acc, issue) => [
      ...acc,
      {
        x: issue.closedAt!,
        y: acc[acc.length - 1].y - issue.size,
        meta: {
          number: issue.number,
          title: issue.title,
        },
      },
    ],
    [
      {
        x: startDate,
        y: total,
      },
    ]
  );

export default actualLine;
