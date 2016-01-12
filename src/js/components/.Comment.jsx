import React from 'react';

import actions from '../actions/appActions.js';

export default React.createClass({

  displayName: 'Comment.jsx',

  // Save the input field value in our state.
  _onChange(evt) {
    this.setState({ 'value': evt.target.value });
  },

  _onAdd() {
    // Emit the event.
    actions.emit('articles.comment', {
      id: this.props.id,
      value: this.state.value
    });

    // Clear the input.
    this.setState({ value: null });
  },

  getInitialState() {
    return { value: null };
  },

  render() {
    return (
      <div>
        <input
          type="text"
          value={this.state.value}
          onChange={this._onChange}
          placeholder="Comment..."
        />
        <button onClick={this._onAdd}>Add</button>
      </div>
    );
  }

});
