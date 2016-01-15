import _ from 'lodash';
import moment from 'moment';
import marked from 'marked';

export default {

  // Time from now.
  // TODO: Memoize.
  _fromNow(jsonDate) {
    return moment(jsonDate, moment.ISO_8601).fromNow();
  },

  // When is a milestone due?
  _due(jsonDate) {
    if (!jsonDate) {
      return '\u00a0'; // for React
    } else {
      return [ 'due', this._fromNow(jsonDate) ].join(' ');
    }
  },

  // Markdown formatting.
  // TODO: works?
  _markdown(...args) {
    marked.apply(args);
  },

  // Format milestone title.
  _title(text) {
    if (text.toLowerCase().indexOf('milestone') > -1) {
      return text;
    } else {
      return [ 'Milestone', text ].join(' ');
    }
  },

  // Hex to decimal.
  _hexToDec(hex) {
    return parseInt(hex, 16);
  }

};
