import moment from "moment";
import { Milestone, WithStats } from "../interfaces";

// Progress in %.
let progress = (a: number, b: number) => {
  if (a + b === 0) {
    return 0;
  }
  return 100 * (a / (b + a));
};

// Calculate the stats for a milestone.
//  Is it on time? What is the progress?
const stats = (milestone: Milestone): WithStats<Milestone> => {
  let points = 0;

  const stats = {
    isDone: false,
    isOnTime: true,
    isOverdue: false,
    isEmpty: true,
  };

  // Progress in points.
  const {
    issues: {
      closed: { size: closedSize },
      open: { size: openSize },
    },
  } = milestone;

  if (closedSize) {
    stats.isEmpty = false;
    if (closedSize + openSize > 0) {
      points = progress(closedSize, openSize);
      if (points === 100) {
        stats.isDone = true;
      }
    }
  }

  // Check that milestone hasn't been created after issue close; #100.
  if (milestone.issues.closed.size) {
    milestone.created_at = milestone.issues.closed.list.reduce(
      (x, { closed_at }) => (x > closed_at ? closed_at : x),
      milestone.created_at
    );
  }

  // The dates in this milestone.
  const a = moment(milestone.created_at, moment.ISO_8601);
  const b = moment.utc();
  const c = moment(milestone.due_on, moment.ISO_8601);

  // Milestones with no due date are always on track.
  if (!(milestone.due_on !== null)) {
    // The number of days from start to now.
    const span = b.diff(a, "days");
    return { ...stats, span, progress: { points } };
  }

  // Overdue? Regardless of the date, if we have closed all
  //  issues, we are no longer overdue.
  if (b.isAfter(c) && !stats.isDone) {
    stats.isOverdue = true;
  }

  // Progress in time.
  const time = progress(b.diff(a), c.diff(b));

  // Number of days between start and due date or today if overdue.
  const span = (stats.isOverdue ? b : c).diff(a, "days");

  // How many days is 1% of the time until now?
  const days = b.diff(a, "days") / 100;

  // If we have closed all issues, we are "on time".
  stats.isOnTime = stats.isDone || points > time;

  return {
    ...stats,
    days,
    span,
    progress: { points, time },
  };
};
