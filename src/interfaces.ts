export interface Milestone {
  id: string;
  owner: string;
  repo: string;
  number: number;
  title: string;
  description: string | null;
  createdAt: string;
  dueOn: string | null;
  issues: Issue[];
}

export interface Issue {
  number: number;
  title: string;
  closedAt: string | null;
  labels: string[];
}

export interface Stats {
  // milestone.createdAt OR closedAt of the first issue if it's earlier.
  startDate: string;
  // milestone.dueOn OR closedAt of the last issue if milestone is complete.
  endDate: string | null;
  // How many days is 1% of the time from createdAt to now.
  days: number;
  // The number of days from start to now.
  span: number;
  // Progress in points and time; 0..100%
  progress: {
    points: number;
    time: number;
  };
  meta: {
    isDone: boolean;
    isOnTime: boolean;
    isOverdue: boolean;
    isEmpty: boolean;
  };
}

export type WithSize<T extends Issue> = T & {
  size: number;
};

export type WithStats<T extends Milestone> = Omit<T, "issues"> & {
  issues: {
    open: {
      size: number;
      nodes: WithSize<T["issues"][number]>[];
    };
    closed: {
      size: number;
      nodes: WithSize<T["issues"][number]>[];
    };
  };
  stats: Stats;
};

export interface ChartD {
  x: string; // time
  y: number; // points
  meta?: Pick<Issue, "number" | "title">;
}

export interface ErrorWithVars {
  message: string;
  variables?: { [key: string]: unknown };
}
