import moment from "moment";
import regression from "regression";
import { scaleTime } from "d3";
import { ChartD } from "../../interfaces";
import { FORMAT } from "./index";

/**
 * Creates a trendline of closed issues.
 * @param actual The line of closed issues.
 * @returns The chart dataset, orn ull if the input dataset has less than two points.
 */
const trendLine = (actual: ChartD[]): ChartD[] | null => {
  if (actual.length < 2) {
    return null;
  }

  const [first] = actual;
  const last = actual[actual.length - 1];
  // The last point is either the due date when we are done, or today.
  const b = {
    x: last.y ? moment.utc() : moment.utc(last.x),
    y: last.y,
  };

  const scale = scaleTime()
    // The first point is milestone creation date.
    .domain([moment.utc(first.x), b.x])
    .range([0, 100]);

  const reg = regression.linear(
    new Array()
      .concat(
        actual,
        // Make sure not to double-count the end if the sprint is done.
        last.y ? b : null
      )
      .filter(Boolean)
      .map((d: ChartD) => [scale(moment.utc(d.x)), d.y])
  );

  return reg.points.map(([x, y]) => ({
    x: moment.utc(scale.invert(x)).format(FORMAT),
    y,
  }));
};

export default trendLine;
