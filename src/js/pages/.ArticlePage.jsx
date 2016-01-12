import React from 'react';
import _ from 'lodash';

import Page from '../mixins/Page.js';

import Link from '../components/Link.jsx';
import Comment from '../components/Comment.jsx';

export default React.createClass({

  displayName: 'ArticlePage.jsx',

  mixins: [ Page ],

  render() {
    let store = this.state,
        id = this.props.id;

    // Find the article.
    let article = _.find(store.articles, a => a.id == id);

    // Any comments?
    let comments;
    if (article.comments) {
      comments = (
        <div>
          {article.comments.map((t, i) => <div key={i}>{t}</div>)}
        </div>
      );
    }

    return (
      <div>
        <div>{article.title}</div>
        <div>Lorem ipsum &hellip;</div>
        <Link route={{ to: 'blog' }}>Back</Link>
        {comments}
        <Comment id={article.id} />
      </div>
    );
  }

});
