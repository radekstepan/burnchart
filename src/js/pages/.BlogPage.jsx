import React from 'react';

import Page from '../mixins/Page.js';

import Link from '../components/Link.jsx';

export default React.createClass({

  displayName: 'BlogPage.jsx',

  mixins: [ Page ],

  render() {
    let store = this.state;

    // Map through the articles.
    let articles = store.articles.map(a => {
      return (
        <div key={a.id}>
          <Link route={{ to: 'article', params: { id: a.id } }}>
            {a.title}
          </Link>
        </div>
      );
    });

    return <div>{articles}</div>;
  }

});
