import moment from "moment";
import config from "../config";
import { ChartD, Issue, WithSize } from "../interfaces";

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
  // TODO reset to start and end of the day
  if (b && b < a) [b, a] = [a, b];

  // Make sure off days are numbers.
  const offDays = config.chart.off_days.map((n) => parseInt(n, 10));

  const $a = moment(a, moment.ISO_8601);
  // Do we have a due date?
  const $b = b !== null ? moment(b, moment.ISO_8601) : moment.utc();

  // Go through the begging to the end skipping off days.
  const days: string[] = [];
  let d = $a;
  while (d <= $b) {
    if (!offDays.includes(d.weekday() || 7)) {
      days.push(d.toJSON());
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

// Graph representing a trendling of actual issues.
export const trend = (
  actual: ChartD[],
  createdAt: string,
  dueOn: string | null
): ChartD[] => {
  if (!actual.length) {
    return [];
  }

  const [first] = actual;
  const last = actual[actual.length - 1];

  const start = moment(first.x, moment.ISO_8601);

  // Values is a list of time from the start and points remaining.
  const values = actual.map(({ x, y }) => [
    moment(x, moment.ISO_8601).diff(start),
    y,
  ]);

  // Now is an actual point too.
  const now = moment.utc();
  values.push([now.diff(start), last.y]);

  // http://classroom.synonym.com/calculate-trendline-2709.html
  let b1 = 0,
    e = 0,
    c1 = 0,
    l = values.length;
  let a =
    l *
    values.reduce((sum, [a, b]) => {
      b1 += a;
      e += b;
      c1 += Math.pow(a, 2);
      return sum + a * b;
    }, 0);

  let slope = (a - b1 * e) / (l * c1 - Math.pow(b1, 2));
  let intercept = (e - slope * b1) / l;

  let fn = (x: number) => slope * x + intercept;

  // Milestone always has a creation date.
  const $createdAt = moment(createdAt, moment.ISO_8601);

  let $dueOn = now;
  // Due date specified.
  if (dueOn) {
    $dueOn = moment(dueOn, moment.ISO_8601);
    // In the past?
    if (now > $dueOn) $dueOn = now;
    // No due date
  }

  a = $createdAt.diff(start);
  let b = $dueOn.diff(start);

  return [
    { x: $createdAt.toJSON(), y: fn(a) },
    { x: $dueOn.toJSON(), y: fn(b) },
  ];
};
