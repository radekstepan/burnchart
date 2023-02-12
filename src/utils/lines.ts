import moment from "moment";
import regression from "regression";
import { scaleTime } from "d3";
import config from "../config";
import { ChartD, Issue, WithSize } from "../interfaces";

export const FORMAT = "YYYY-MM-DDTHH:mm:ss[Z]";

// A graph of closed issues.
// `issues`:     closed issues list
// `created_at`: milestone start date
// `total`:      total number of points (open & closed issues)
export const actual = (
  issues: WithSize<Issue>[],
  createdAt: string,
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
        x: createdAt,
        y: total,
      },
    ]
  );

// A graph of an ideal progression..
// `a`:     milestone start date
// `b`:     milestone end date
// `total`: total number of points (open & closed issues)
export const ideal = (a: string, b: string | null, total: number): ChartD[] => {
  // Swap if end is before the start...
  if (b && b < a) [b, a] = [a, b];

  // Make sure off days are numbers.
  const offDays = config.chart.off_days.map((n) => parseInt(n, 10));

  const $a = moment.utc(a);
  // Do we have a due date?
  const $b = b ? moment.utc(b) : moment.utc();

  // Skip early if we have no off days.
  if (!offDays.length) {
    return [
      { x: $a.format(FORMAT), y: total },
      { x: $b.format(FORMAT), y: 0 },
    ];
  }

  // Go through the begging to the end skipping off days.
  const days: string[] = [];
  let d = $a;
  while (d <= $b) {
    if (!offDays.includes(d.day() || 7)) {
      // 0 = Sunday
      days.push(d.format(FORMAT));
    }
    d.add(1, "days");
  }

  // Map points on the array of days now.
  const v = total / days.length;

  let t = total;
  return days.map((x) => ({
    x,
    y: (t -= v),
  }));
};

// Graph representing a trendline of closed issues.
export const trend = (actual: ChartD[]): ChartD[] | null => {
  if (actual.length < 2) {
    return null;
  }

  const [first] = actual;
  const last = actual[actual.length - 1];
  // The last point is either the due date when we are done, or today.
  const b = {
    x: last.y ? moment.utc() : moment.utc(last.x),
    y: last.y,
  };

  const scale = scaleTime()
    // The first point is milestone creation date.
    .domain([moment.utc(first.x), b.x])
    .range([0, 100]);

  const reg = regression.linear(
    new Array()
      .concat(
        actual,
        // Make sure not to double-count the end if the sprint is done.
        last.y ? b : null
      )
      .filter(Boolean)
      .map((d: ChartD) => [scale(moment.utc(d.x)), d.y])
  );

  return reg.points.map(([x, y]) => ({
    x: moment.utc(scale.invert(x)).format(FORMAT),
    y,
  }));
};
