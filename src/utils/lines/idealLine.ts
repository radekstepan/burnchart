import moment from "moment";
import config from "../../config";
import { FORMAT } from "./index";
import { ChartD } from "../../interfaces";

/**
 * Creates an ideal milestone progression.
 * @param a The milestone start date.
 * @param b The milestone end date or null if there is no end date.
 * @param total The total number of points (open and closed issues).
 * @param off_days A list of off days to skip.
 * @returns The chart dataset.
 */
const idealLine = (
  a: string,
  b: string | null,
  total: number,
  off_days: string[] = config.chart.off_days
): ChartD[] => {
  // Swap if end is before the start...
  if (b && b < a) [b, a] = [a, b];

  // Make sure off days are numbers.
  const offDays = off_days.map((n) => parseInt(n, 10));

  const $a = moment.utc(a);
  // Do we have a due date?
  const $b = b ? moment.utc(b) : moment.utc();

  // Skip early if we have no off days.
  if (!offDays.length) {
    return [
      { x: $a.format(FORMAT), y: total },
      { x: $b.format(FORMAT), y: 0 },
    ];
  }

  // Go through the begging to the end skipping off days.
  const days: string[] = [];
  let d = $a;
  while (d <= $b) {
    if (!offDays.includes(d.day() || 7)) {
      // 0 = Sunday
      days.push(d.format(FORMAT));
    }
    d.add(1, "days");
  }

  // Map points on the array of days now.
  const v = total / days.length;

  let t = total;
  return days.map((x) => ({
    x,
    y: (t -= v),
  }));
};

export default idealLine;
