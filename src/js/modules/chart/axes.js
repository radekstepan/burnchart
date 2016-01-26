import d3 from 'd3';
import _ from 'lodash';

export default {

  time(height, x, span) {
    // Tick time format based on number of days we display.
    let specifier = (span < 4) ? '' : (span < 14) ? '%a' : (span < 32) ? '%m/%d' : '%b';
    let format = d3.time.format.utc(specifier);

    return d3.svg.axis().scale(x)
    .orient("bottom")
    // Show vertical lines...
    .tickSize(-height)
    //  tick time format...
    .tickFormat(format)
    //  and give us a spacer.
    .tickPadding(10);
  },

  year(height, xAxis, span) {
    return xAxis
    .orient("top")
    .tickSize(height)
    .tickFormat(d3.time.format.utc('%Y'))
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
