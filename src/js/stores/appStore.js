import _ from 'lodash';

import Store from '../core/Store.js';

import actions from '../actions/appActions.js';

class AppStore extends Store {

  // Initial payload.
  constructor() {
    super({
      articles: [
        {
          id: 1,
          title: 'Winklevoss Twins Aim to Take Bitcoin Mainstream with a Regulated Exchange',
          url: 'nytimes.com'
        }, {
          id: 2,
          title: 'Gotham Air: Manhattan to JFK in 6 minutes for $99',
          url: 'gothamair.com'
        }, {
          id: 3,
          title: 'Gitlet: Git implemented in JavaScript',
          url: 'maryrosecook.com'
        }
      ]
    });

    // Listen to all app actions
    // articles.comment -> onArticlesComment
    actions.onAny((obj, event) => {
      let fn = ('on.' + event).replace(/[.]+(\w|$)/g, (m, p) => {
        return p.toUpperCase();
      });

      (fn in this) && this[fn](obj);
    });
  }
  
  // Add article comment action listener.
  onArticlesComment(obj) {
    let key;
    // Find the article.
    let article = _.find(this.get('articles'), (a, i) => {
      if (a.id == obj.id) {
        key = [ 'articles', i, 'comments' ];
        return true;
      }
    });

    // Init new or add to array.
    if ('comments' in article) {
      this.set(key.concat([ article.comments.length ]), obj.value);
    } else {
      this.set(key, [ obj.value ]);
    }
  }

}

export default new AppStore();
