import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import config from "../../config";
import { FORMAT } from "./index";
import { ChartD } from "../../interfaces";

// Extend dayjs with UTC plugin
dayjs.extend(utc);

/**
 * Creates an ideal milestone progression.
 * @param a The milestone start date.
 * @param b The milestone end date or null if there is no end date.
 * @param total The total number of points (open and closed issues).
 * @param off_days A list of off days to skip (1=Mon, 7=Sun).
 * @returns The chart dataset.
 */
const idealLine = (
  a: string,
  b: string | null,
  total: number,
  off_days: number[] = config.chart.off_days
): ChartD[] => {
  // Handle edge cases
  if (total <= 0) {
    return [];
  }

  const $a = dayjs.utc(a);
  // Do we have a due date?
  const $b = b ? dayjs.utc(b) : dayjs.utc();

  // Swap if end is before the start using proper date comparison
  if ($b.isBefore($a)) {
    return [
      { x: $a.format(FORMAT), y: total },
      { x: $b.format(FORMAT), y: 0 },
    ];
  }

  // Use off_days directly (already numbers from config: 1=Mon..7=Sun)
  const offDays = off_days;

  // Skip early if we have no off days.
  if (!offDays.length) {
    return [
      { x: $a.format(FORMAT), y: total },
      { x: $b.format(FORMAT), y: 0 },
    ];
  }

  // Go through the beginning to the end skipping off days.
  // dayjs.day() returns 0=Sun..6=Sat, but config uses 1=Mon..7=Sun.
  // Convert: 0=Sun becomes 7, 1=Mon stays 1, etc.
  const days: string[] = [];
  let d = $a;
  while (d <= $b) {
    const dayOfWeek = d.day() || 7; // Convert 0 (Sun) to 7
    if (!offDays.includes(dayOfWeek)) {
      days.push(d.format(FORMAT));
    }
    d = d.add(1, "day");
  }

  // Guard against division by zero
  if (days.length === 0) {
    return [
      { x: $a.format(FORMAT), y: total },
      { x: $b.format(FORMAT), y: 0 },
    ];
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
