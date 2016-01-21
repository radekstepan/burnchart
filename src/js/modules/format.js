import _ from 'lodash';
import moment from 'moment';
import marked from 'marked';

export default {

  // Time from now.
  // TODO: Memoize.
  fromNow(jsonDate) {
    return moment(jsonDate, moment.ISO_8601).fromNow();
  },

  // When is a milestone due?
  due(jsonDate) {
    if (!jsonDate) {
      return '\u00a0'; // for React
    } else {
      return `due ${this.fromNow(jsonDate)}`;
    }
  },

  // Markdown formatting.
  // TODO: works?
  markdown(...args) {
    marked.apply(null, args);
  },

  // Format milestone title.
  title(text) {
    if (text.toLowerCase().indexOf('milestone') > -1) {
      return text;
    } else {
      return `Milestone ${text}`;
    }
  },

  // Hex to decimal.
  hexToDec(hex) {
    return parseInt(hex, 16);
  }

};
