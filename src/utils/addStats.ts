import moment from "moment";
import { Milestone, WithStats } from "../interfaces";
import { size } from "./issues";

// Progress in %.
let progress = (a: number, b: number) => {
  if (a + b === 0) {
    return 0;
  }
  return 100 * (a / (b + a));
};

// Calculate the stats for a milestone.
const addStats = (milestone: Milestone): WithStats<Milestone> => {
  let points = 0;

  const meta = {
    isDone: false,
    isOnTime: true,
    isOverdue: false,
    isEmpty: true,
  };

  // Progress in points.
  const [closedSize, openSize] = milestone.issues.reduce(
    (acc, issue) =>
      issue.closedAt
        ? [acc[0] + size(issue), acc[1]]
        : [acc[0], acc[1] + size(issue)],
    [0, 0]
  );

  if (closedSize) {
    meta.isEmpty = false;
    if (closedSize + openSize > 0) {
      points = progress(closedSize, openSize);
      if (points === 100) {
        meta.isDone = true;
      }
    }

    // Check that milestone hasn't been created after issue close; #100.
    milestone.createdAt = milestone.issues.reduce(
      (min, { closedAt }) =>
        closedAt ? (min > closedAt ? closedAt : min) : min,
      milestone.createdAt
    );
  }

  // The dates in this milestone.
  const a = moment(milestone.createdAt, moment.ISO_8601);
  const b = moment.utc();

  // Milestones with no due date are always on track.
  if (!milestone.dueOn) {
    const span = b.diff(a, "days");
    return {
      ...milestone,
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
    stats: {
      meta,
      days,
      span,
      progress: { points, time },
    },
  };
};

export default addStats;
