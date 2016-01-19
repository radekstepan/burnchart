import d3 from 'd3';

export default {

  horizontal(height, x) {
    return d3.svg.axis().scale(x)
    .orient("bottom")
    // Show vertical lines...
    .tickSize(-height)
    //  with day of the month...
    .tickFormat((d) => { return d.getDate(); })
    //  and give us a spacer.
    .tickPadding(10);
  },

  vertical(width, y) {
    return d3.svg.axis().scale(y)
    .orient("left")
    .tickSize(-width)
    .ticks(5)
    .tickPadding(10);
  }

};
