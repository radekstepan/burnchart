import * as d3 from "d3";
import moment from "moment";
import config from "../config";
import { Issue, WithSize } from "../interfaces";

// A graph of closed issues.
// `issues`:     closed issues list
// `created_at`: milestone start date
// `total`:      total number of points (open & closed issues)
export const actual = (
  issues: WithSize<Issue>[],
  createdAt: string,
  total: number
) => {
  let min: number, max: number;
  const head = [
    {
      date: moment(createdAt, moment.ISO_8601).toJSON(),
      points: total,
    },
  ];

  (min = +Infinity), (max = -Infinity);

  // Generate the actual closes.
  const rest = issues.map((issue) => {
    const { size, closedAt } = issue;
    // Determine the range.
    if (size < min) min = size;
    if (size > max) max = size;

    return {
      ...issue,
      // Dropping points remaining.
      date: moment(closedAt, moment.ISO_8601).toJSON(),
      points: (total -= size),
    };
  });

  // Now add a radius in a range (will be used for a circle).
  const range = d3.scaleLinear().domain([min, max]).range([5, 8]);

  return head.concat(
    rest.map((issue) => ({
      ...issue,
      radius: range(issue.size),
    }))
  );
};

// A graph of an ideal progression..
// `a`:     milestone start date
// `b`:     milestone end date
// `total`: total number of points (open & closed issues)
export const ideal = (a: string, b: string, total: number) => {
  // Swap if end is before the start...
  if (b < a) [b, a] = [a, b];

  // Make sure off days are numbers.
  const off_days = config.chart.off_days.map((n) => parseInt(n, 10));

  const $a = moment(a, moment.ISO_8601);
  // Do we have a due date?
  const $b = b != null ? moment(b, moment.ISO_8601) : moment.utc();

  // Go through the beginning to the end skipping off days.
  // TODO refactor.
  let days = [],
    length = 0,
    once;
  (once = (inc) => {
    // A new day. TODO: deal with hours and minutes!
    let day = $a.add(1, "days");

    // Does this day count?
    let day_of;
    if (!(day_of = day.weekday())) day_of = 7;

    if (off_days.indexOf(day_of) != -1) {
      days.push({ date: day.toJSON(), off_day: true });
    } else {
      length += 1;
      days.push({ date: day.toJSON() });
    }

    // Go again?
    if (!(day > $b)) once(inc + 1);
  })(0);

  // Map points on the array of days now.
  let velocity = total / (length - 1);

  // TODO refactor
  days = days.map((day, i) => {
    day.points = total;
    if (days[i] && !days[i].off_day) total -= velocity;
    return day;
  });

  // Do we need to make a link to right now?
  let now;
  if ((now = moment.utc()) > $b) {
    days.push({ date: now.toJSON(), points: 0 });
  }

  return days;
};

// Graph representing a trendling of actual issues.
export const trend = (actual, createdAt: string, dueOn: string | null) => {
  if (!actual.length) return [];

  const first = actual[0],
    last = actual[actual.length - 1];

  const start = moment(first.date, moment.ISO_8601);

  // Values is a list of time from the start and points remaining.
  const values = actual.map(({ date, points }) => [
    moment(date, moment.ISO_8601).diff(start),
    points,
  ]);

  // Now is an actual point too.
  const now = moment.utc();
  values.push([now.diff(start), last.points]);

  // http://classroom.synonym.com/calculate-trendline-2709.html
  const b1 = 0,
    e = 0,
    c1 = 0,
    l = values.length;
  const a =
    l *
    values.reduce((sum, [$a, $b]) => {
      b1 += $a;
      e += $b;
      c1 += Math.pow(a, 2);
      return sum + $a * $b;
    }, 0);

  const slope = (a - b1 * e) / (l * c1 - Math.pow(b1, 2));
  const intercept = (e - slope * b1) / l;

  // Milestone always has a creation date.
  const $createdAt = moment(createdAt, moment.ISO_8601);

  // Due date specified.
  let $dueOn = now;
  if (dueOn) {
    $dueOn = moment(dueOn, moment.ISO_8601);
    // In the past?
    if (now > $dueOn) $dueOn = now;
  }

  const $$a = $createdAt.diff(start);
  const b = $dueOn.diff(start);

  return [
    { date: $createdAt.toJSON(), points: slope * a + intercept },
    { date: $dueOn.toJSON(), points: slope * b + intercept },
  ];
};
