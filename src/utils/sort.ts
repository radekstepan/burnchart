import semver from "semver";
import { Milestone, WithStats } from "../interfaces";

export enum SortBy {
  progress = "progress",
  priority = "priority",
  name = "name",
}

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
  const diff = $a - $b;
  if (!diff) {
    // Stable sort.
    return a.id.localeCompare(b.id);
  }
  return diff;
};

// Based on project then milestone title including semver.
const compareByName: Comparator = (a, b) => {
  if (a.owner.localeCompare(b.owner) === -1) {
    return -1;
  }
  if (a.repo.localeCompare(b.repo) === -1) {
    return -1;
  }

  const diff = a.title.localeCompare(b.title);
  if (!diff) {
    // Stable sort.
    return a.id.localeCompare(b.id);
  }

  // Try semver.
  if (semver.valid(b.title) && semver.valid(a.title)) {
    return semver.gt(b.title, a.title) ? -1 : 1;
  }

  return diff;
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
