import { flatten, Flatten } from "./list";

type Job<T> = () => Promise<T>;

// Async job runner in series.
export const series = <T>(
  jobs: Job<T>[]
): [Promise<null | Flatten<T>>, () => void] => {
  let cancelled = false;

  const cancel = (): void => (cancelled = true) && undefined;

  const run = async () => {
    const res = [];
    for (const job of jobs) {
      if (cancelled) {
        return null;
      }
      res.push(await job());
    }
    return flatten(res);
  };

  const promise = run();

  // TODO fix
  return [promise as any, cancel];
};
