import moment from "moment";
import sortOn from "sort-on";
import config from "../config";
import { Issue, Milestone, WithSize, WithStats } from "../interfaces";

// Progress in %.
const progress = (a: number, b: number) => {
  if (a + b === 0) {
    return 0;
  }
  return 100 * (a / (b + a));
};

// Get an issue size.
const calc = (issue: Issue) => {
  switch (config.chart.points) {
    // Sum of the labels (numbers).
    case "LABELS":
      return issue.labels.reduce((sum, label) => {
        let matches;
        if (!(matches = label.match(config.chart.size_label))) {
          return sum;
        }
        return (sum += parseInt(matches[1], 10));
      }, 0);

    case "ONE_SIZE":
    default:
      return 1;
  }
};

const addSize = <T extends Issue>(issues: T[]) => {
  const [size, nodes] = issues.reduce(
    (acc, issue) => {
      const $size = calc(issue);
      return [acc[0] + $size, acc[1].concat([{ ...issue, size: $size }])];
    },
    [0, new Array<WithSize<T>>()]
  );

  return { nodes, size };
};

// Calculate the stats for a milestone.
// NOTE: modifies milestone.createAt
const addStats = (milestone: Milestone): WithStats<Milestone> => {
  // Sort the issues and add their size.
  const sorted = sortOn(milestone.issues, "closedAt");
  const i = sorted.findIndex((d) => !d.closedAt);
  const [closed, open] = [
    addSize(sorted.slice(0, i)),
    addSize(sorted.slice(i)),
  ];

  // Progress in points.
  let points = 0;

  const meta = {
    isDone: false,
    isOnTime: true,
    isOverdue: false,
    isEmpty: true,
  };

  if (closed.size) {
    meta.isEmpty = false;
    if (closed.size + open.size > 0) {
      points = progress(closed.size, open.size);
      if (points === 100) {
        meta.isDone = true;
      }
    }

    // Check that milestone hasn't been created after issue close; #100.
    const [first] = closed.nodes;
    if (first.closedAt) {
      // always...
      milestone.createdAt =
        first.closedAt < milestone.createdAt
          ? first.closedAt
          : milestone.createdAt;
    }
  }

  // The dates in this milestone.
  const a = moment(milestone.createdAt, moment.ISO_8601);
  const b = moment.utc();

  // Milestones with no due date are always on track.
  if (!milestone.dueOn) {
    const span = b.diff(a, "days");
    return {
      ...milestone,
      issues: { open, closed },
      stats: {
        meta,
        days: 1e3,
        // The number of days from start to now.
        span: b.diff(a, "days"),
        progress: { points, time: 0 },
      },
    };
  }

  const c = moment(milestone.dueOn, moment.ISO_8601);

  // Overdue? Regardless of the date, if we have closed all
  //  issues, we are no longer overdue.
  if (b.isAfter(c) && !meta.isDone) {
    meta.isOverdue = true;
  }

  // Progress in time.
  const time = progress(b.diff(a), c.diff(b));

  // Number of days between start and due date or today if overdue.
  const span = (meta.isOverdue ? b : c).diff(a, "days");

  // How many days is 1% of the time until now?
  const days = b.diff(a, "days") / 100;

  // If we have closed all issues, we are "on time".
  meta.isOnTime = meta.isDone || points > time;

  return {
    ...milestone,
    issues: { open, closed },
    stats: {
      meta,
      days,
      span,
      progress: { points, time },
    },
  };
};

export default addStats;
