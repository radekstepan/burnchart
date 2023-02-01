const doUntil = async <T>(
  job: () => Promise<T>,
  test: (last: T) => boolean,
  end: (err: Error | null, results: T[]) => void
) => {
  const results: T[] = [];

  let ok = true;
  while (ok) {
    try {
      const res = await job();
      results.push(res);
      ok = test(res);
    } catch (err: any) {
      return end(err, results);
    }
  }

  end(null, results);
};

export default doUntil;
