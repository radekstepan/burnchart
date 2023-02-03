export interface Milestone {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  dueOn: string | null;
  issues: Issue[];
}

export interface Issue {
  closedAt: string | null;
  labels: string[];
}

export interface Stats {
  days: number;
  span: number;
  isOverdue: boolean;
  isOnTime: boolean;
  progress: {
    points: number;
    time: number;
  };
}

export type WithStats<T> = T & { stats: Stats };
