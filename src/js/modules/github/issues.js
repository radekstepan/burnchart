import _ from 'lodash';
import async from 'async';

import config from '../../models/config.js';
import request from './request.js';

// Fetch issues for a milestone.
export default {
  fetchAll: (user, repo, cb) => {
    // For each `open` and `closed` issues in parallel.
    async.parallel([
      _.partial(oneStatus, user, repo, 'open'),
      _.partial(oneStatus, user, repo, 'closed')
    ], (err=null, [ open, closed ]) => {
      cb(err, { open, closed });
    });
  }
};

// Calculate size of either open or closed issues.
//  Modifies issues by ref.
let calcSize = (list) => {
  let size;

  switch (config.chart.points) {
    case 'ONE_SIZE':
      size = list.length;
      // TODO: check we have an object?
      for (let issue of list) issue.size = 1;
      break;

    case 'LABELS':
      size = 0;
      list = _.filter(list, (issue) => {
        let labels;
        // Skip if no labels exist.
        if (!(labels = issue.labels)) {
          return false;
        }

        // Determine the total issue size from all labels.
        issue.size = _.reduce(labels, (sum, label) => {
          let matches;
          if (!(matches = label.name.match(config.chart.size_label))) {
            return sum;
          }
          // Increase sum.
          return sum += parseInt(matches[1], 10);
        }, 0);

        // Increase the total.
        size += issue.size;

        // Issues without size (no matching labels) are not saved.
        return !!issue.size;
      });
      break;

    default:
      throw 500;
  }

  // Sync return.
  return { list, size };
};

// For each state...
let oneStatus = (user, repo, state, cb) => {
  // Concat them here.
  let results = [];
  
  let done = (err) => {
    if (err) return cb(err);
    // Sort by closed time and add the size.
    cb(null, calcSize(_.sortBy(results, 'closed_at')));
  };
  
  let fetchPage;
  // One pageful fetch (next pages in series).
  return (fetchPage = (page) => {
    request.allIssues(user, repo, { state, page }, (err, data) => {
      // Errors?
      if (err) return done(err);
      // Empty?
      if (!data.length) return done(null, results);
      // Append the data.
      results = results.concat(data);
      // < 100 results?
      if (data.length < 100) return done(null, results);
      // Fetch the next page then.
      fetchPage(page + 1);
    });
  })(1);
};
