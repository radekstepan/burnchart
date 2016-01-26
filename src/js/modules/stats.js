import moment from 'moment';

// Progress in %.
let progress = (a, b) => {
  if (a + b === 0) {
    return 0;
  } else {
    return 100 * (a / (b + a));
  }
};

// Calculate the stats for a milestone.
//  Is it on time? What is the progress?
export default (milestone) => {
  // Makes testing easier...
  if (milestone.stats != null) return milestone.stats;

  let isDone = false, isOnTime = true, isOverdue = false,
      isEmpty = true, points = 0, a, b, c, time, days;

  // Progress in points.
  a = milestone.issues.closed.size;
  b = milestone.issues.open.size;
  if (a + b > 0) {
    isEmpty = false;
    points = progress(a, b);
    if (points === 100) isDone = true;
  }

  // Milestones with no due date are always on track.
  if (!(milestone.due_on != null)) {
    return { isOverdue, isOnTime, isDone, isEmpty, 'progress': { points } };
  }

  a = moment(milestone.created_at, moment.ISO_8601);
  b = moment.utc();
  c = moment(milestone.due_on, moment.ISO_8601);

  // Overdue? Regardless of the date, if we have closed all
  //  issues, we are no longer overdue.
  if (b.isAfter(c) && !isDone) isOverdue = true;

  // Progress in time.
  time = progress(b.diff(a), c.diff(b));

  // How many days is 1% of the time?
  days = (b.diff(a, 'days')) / 100;

  // Are we on time?
  isOnTime = points > time;

  // If we have closed all issues, we are "on time".
  if (isDone) isOnTime = true;

  return { isDone, days, isOnTime, isOverdue, 'progress': { points, time } };
};
