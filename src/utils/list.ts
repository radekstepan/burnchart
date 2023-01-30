export type Flatten<Arr> = Arr extends (infer T)[][] ? T[] : Arr;

export const flatten = <A extends any[]>(arrayOfArrays: A): Flatten<A> =>
  arrayOfArrays.reduce(
    (acc, item) => [...acc, ...(Array.isArray(item) ? item : [item])],
    []
  );
