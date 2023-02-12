import semver from "semver";
import { Milestone, WithStats } from "../interfaces";

export enum SortBy {
  progress = "progress",
  priority = "priority",
  name = "name",
}

// export const sortBy = <T>(array: T[], key: keyof T) =>
//   array.sort((a, b) => (a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0));

type Comparator = (...args: WithStats<Milestone>[]) => number;

// From highest progress points.
const compareByProgress: Comparator = (a, b) => {
  const diff = b.stats.progress.points - a.stats.progress.points;
  if (!diff) {
    // Stable sort.
    return a.id.localeCompare(b.id);
  }
  return diff;
};

// From most delayed in days.
const compareByPriority: Comparator = (a, b) => {
  // Milestones with no deadline are always at the "beginning".
  // % difference in progress times the number of days ahead or behind.
  const [$a, $b] = [a, b].map(
    (d) => (d.stats.progress.points - d.stats.progress.time) * d.stats.days
  );

  return $b - $a;
};

// Based on project then milestone name including semver.
// TODO verify
const compareByName: Comparator = (a, b) => {
  if (b.owner.localeCompare(a.owner)) {
    return 1;
  }
  if (b.repo.localeCompare(b.repo)) {
    return 1;
  }

  // Try semver.
  if (semver.valid(b.title) && semver.valid(a.title)) {
    return +semver.gt(b.title, a.title);
  }
  return b.title.localeCompare(a.title);
};

export const sortBy = <T extends WithStats<Milestone>>(
  array: T[],
  sortBy: SortBy
) => {
  switch (sortBy) {
    case SortBy.progress:
      return [...array].sort(compareByProgress);
    case SortBy.priority:
      return [...array].sort(compareByPriority);
    case SortBy.name:
      return [...array].sort(compareByName);
    default:
      return array;
  }
};
