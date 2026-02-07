const config = {
  // GitHub API base URL
  apiUrl: "https://api.github.com",
  // Chart configuration.
  chart: {
    // Days we are not working. Mon = 1
    off_days: [] as number[],
    // How does a size label look like?
    size_label: /^size (\d+)$/,
    // Process all issues as one size (ONE_SIZE) or use labels (LABELS).
    points: "ONE_SIZE",
  },
};

export default config;
