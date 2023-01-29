export const sortBy = <T>(array: T[], key: keyof T) =>
  array.sort((a, b) => (a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0));
