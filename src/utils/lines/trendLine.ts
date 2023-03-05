import moment from "moment";
import regression from "regression";
import { FORMAT } from "./index";
import { ChartD } from "../../interfaces";
import { timeScale } from "../scales";

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

  // A milestone with one issue closed at the same time as the milestone was created.
  if (moment.utc(first.x).isSame(b.x)) {
    return null;
  }

  const { scale, invert } = timeScale(moment.utc(first.x), b.x);

  const points = linear(
    new Array()
      .concat(
        actual,
        // Make sure not to double-count the end if the sprint is done.
        last.y ? b : null
      )
      .filter(Boolean)
      .map((d: ChartD) => [scale(moment.utc(d.x)), d.y])
  );

  return points.map(([x, y]) => ({
    x: moment.utc(invert(x)).format(FORMAT),
    y,
  }));
};

const linear = (data: regression.DataPoint[]) => {
  const reg = regression.linear(data);

  const [start] = reg.points;
  const [, endY] = reg.points[reg.points.length - 1];

  if (endY < 0) {
    const [a, b] = reg.equation;
    return [start, [-b / a, 0]];
  }

  return [start, [100, endY]];
};

export default trendLine;
