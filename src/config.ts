const config = {
  // Firebase.
  firebase: {
    apiKey: "AIzaSyD_kfzkAPA87PoRFIZa8JEzZkT66CqUDpU",
    authDomain: "burnchart.firebaseapp.com",
  },
  // Data source provider.
  provider: "github",
  // Chart configuration.
  chart: {
    // Days we are not working. Mon = 1
    off_days: [],
    // How does a size label look like?
    size_label: /^size (\d+)$/,
    // Process all issues as one size (ONE_SIZE) or use labels (LABELS).
    points: "ONE_SIZE",
  },
};

export default config;
