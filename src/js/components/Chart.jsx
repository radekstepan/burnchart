import React from 'react';
import d3 from 'd3';
import d3Tip from 'd3-tip';

d3Tip(d3);

import Format from '../mixins/Format.js';

export default React.createClass({

  displayName: 'Chart.jsx',

  mixins: [ Format ],

  render() {
    let milestone = this.props.milestone;

    return (
      <div>
        <div id="title">
          <div className="wrap">
            <h2 className="title">{this._title(milestone.title)}</h2>
            <span className="sub">{this._due(milestone.due_on)}</span>
            <div className="description">{this._markdown(milestone.description)}</div>
          </div>
        </div>
        <div id="content" className="wrap">
          <div id="chart" ref="el" />
        </div>
      </div>
    );
  },

  componentDidMount() {
    console.log(this.refs);
  }

});
