import config from "../config";
import { Issue } from "../interfaces";

// Get an issue size.
export const size = (issue: Issue) => {
  switch (config.chart.points) {
    // Sum of the labels (numbers).
    case "LABELS":
      return issue.labels.reduce((sum, label) => {
        let matches;
        if (!(matches = label.match(config.chart.size_label))) {
          return sum;
        }
        return (sum += parseInt(matches[1], 10));
      }, 0);

    case "ONE_SIZE":
    default:
      return 1;
  }
};
