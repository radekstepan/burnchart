// Force UTC timezone for all tests
process.env.TZ = 'UTC';

// Suppress React act() warnings from async hook tests
const originalError = console.error;
console.error = (...args) => {
  if (
    args[0]?.includes?.('act(...)') ||
    String(args[0]).includes('An update to') ||
    String(args[0]).includes('was not wrapped in act')
  ) {
    return;
  }
  originalError.call(console, ...args);
};
