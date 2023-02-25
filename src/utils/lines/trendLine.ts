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

  const { scale, invert } = timeScale(moment.utc(first.x), b.x);

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
    x: moment.utc(invert(x)).format(FORMAT),
    y,
  }));
};

export default trendLine;
