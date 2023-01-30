import { flatten, Flatten } from "./list";

type Job<T> = () => Promise<T>;

// Async job runner in series.
export const series = <T extends any[]>(
  jobs: Job<T>[]
): [Promise<null | Flatten<T[]>>, () => void] => {
  let cancelled = false;

  const cancel = (): void => (cancelled = true) && undefined;

  const run = async () => {
    const res: T[] = [];
    for (const job of jobs) {
      if (cancelled) {
        return null;
      }
      res.push(await job());
    }
    return flatten(res);
  };

  const promise = run();

  return [promise, cancel];
};
