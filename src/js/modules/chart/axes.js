import d3 from 'd3';
import _ from 'lodash';

export default {

  time(height, x, span) {
    return d3.svg.axis().scale(x)
    .orient("bottom")
    // Show vertical lines...
    .tickSize(-height)
    //  limit the number of ticks
    .ticks(7)
    //  tick time format...
    .tickFormat(d3.time.format((() => {
      switch (true) {
        case span < 4:
          return '';
        // Two weeks.
        case span < 14:
          return '%a';
        // 3 months.
        case span < 3 * 30:
          return '%m/%d';
        default:
          return '%b';
      }
    })()));
  },

  year(height, xAxis, span) {
    return xAxis
    .orient("top")
    .tickSize(height)
    .tickFormat((d) => d.getFullYear())
    .ticks(span / 365);
  },

  points(width, y) {
    return d3.svg.axis().scale(y)
    .orient("left")
    .tickSize(-width)
    .ticks(5)
    .tickPadding(10);
  }

};
