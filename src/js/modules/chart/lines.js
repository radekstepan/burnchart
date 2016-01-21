import _ from 'lodash';
import d3 from 'd3';
import moment from 'moment';

import config from '../../../config.js';

export default {

  // A graph of closed issues.
  // `issues`:     closed issues list
  // `created_at`: milestone start date
  // `total`:      total number of points (open & closed issues)
  actual(issues, created_at, total) {
    let min, max;
    let head = [{
      'date': moment(created_at, moment.ISO_8601).toJSON(),
      'points': total
    }];
    
    min = +Infinity , max = -Infinity;

    // Generate the actual closes.
    let rest = _.map(issues, (issue) => {
      let { size, closed_at } = issue;
      // Determine the range.
      if (size < min) min = size;
      if (size > max) max = size;

      // Dropping points remaining.
      issue.date = moment(closed_at, moment.ISO_8601).toJSON();
      issue.points = total -= size;
      return issue;
    });
    
    // Now add a radius in a range (will be used for a circle).
    let range = d3.scale.linear().domain([ min, max ]).range([ 5, 8 ]);

    rest = _.map(rest, (issue) => {
      issue.radius = range(issue.size);
      return issue;
    });

    return [].concat(head, rest);
  },

  // A graph of an ideal progression..
  // `a`:     milestone start date
  // `b`:     milestone end date
  // `total`: total number of points (open & closed issues)
  ideal(a, b, total) {
    // Swap if end is before the start...
    if (b < a) [ b, a ] = [ a, b ];

    a = moment(a, moment.ISO_8601);
    // Do we have a due date?
    b = (b != null) ? moment(b, moment.ISO_8601) : moment.utc();

    // Go through the beginning to the end skipping off days.
    let days = [], length = 0, once;
    (once = (inc) => {
      // A new day. TODO: deal with hours and minutes!
      let day = a.add(1, 'days');

      // Does this day count?
      let day_of;
      if (!(day_of = day.weekday())) day_of = 7;

      if (config.chart.off_days.indexOf(day_of) != -1) {
        days.push({ 'date': day.toJSON(), 'off_day': true });
      } else {
        length += 1;
        days.push({ 'date': day.toJSON() });
      }

      // Go again?
      if (!(day > b)) once(inc + 1);
    })(0); 

    // Map points on the array of days now.
    let velocity = total / (length - 1);
    
    days = _.map(days, (day, i) => {
      day.points = total;
      if (days[i] && !days[i].off_day) total -= velocity;
      return day;
    });

    // Do we need to make a link to right now?
    let now;
    if ((now = moment.utc()) > b) {
      days.push({ 'date': now.toJSON(), 'points': 0 });
    }

    return days;
  },

  // Graph representing a trendling of actual issues.
  trend(actual, created_at, due_on) {
    if (!actual.length) return [];

    let first = actual[0], last = actual[actual.length - 1];

    let start = moment(first.date, moment.ISO_8601);

    // Values is a list of time from the start and points remaining.
    let values = _.map(actual, ({ date, points }) => {
      return [ moment(date, moment.ISO_8601).diff(start), points ];
    });

    // Now is an actual point too.
    let now = moment.utc();
    values.push([ now.diff(start), last.points ]);

    // http://classroom.synonym.com/calculate-trendline-2709.html
    let b1 = 0, e = 0, c1 = 0, l = values.length;
    let a = l * _.reduce(values, (sum, [ a, b ]) => {
      b1 += a; e += b;
      c1 += Math.pow(a, 2);
      return sum + (a * b);
    }, 0);

    let slope = (a - (b1 * e)) / ((l * c1) - (Math.pow(b1, 2)));
    let intercept = (e - (slope * b1)) / l;

    let fn = (x) => slope * x + intercept;

    // Milestone always has a creation date.
    created_at = moment(created_at, moment.ISO_8601);

    // Due date specified.
    if (due_on) {
      due_on = moment(due_on, moment.ISO_8601);
      // In the past?
      if (now > due_on) due_on = now;
    // No due date
    } else {
      due_on = now;
    }

    a = created_at.diff(start);
    let b = due_on.diff(start);

    return [
      { 'date': created_at.toJSON(), 'points': fn(a) },
      { 'date': due_on.toJSON(), 'points': fn(b) }
    ];
  }

};
