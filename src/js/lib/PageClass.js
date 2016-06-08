import React from 'react';
import _ from 'lodash';

import stores from '../stores';

export default class Page extends React.Component {

  constructor(props) {
    super(props);
    // State contains our store data.
    // NOTE top-level page components shouldn't modify the state.
    this.state = this._getData();
    // Bindings.
    this._onChange = this._onChange.bind(this);
  }

  // Get the POJO of the store.
  _getData(store) {
    let obj = {};
    if (store) {
      obj[store] = stores[store].get();
    } else {
      // Get all stores.
      for (let key in stores) {
        obj[key] = stores[key].get();
      }
    }

    return obj;
  }

  // Update the state when store changes.
  _onChange(store, val, key) {
    if (!this._isMounted) return;
    this.setState(this._getData(store));
  }

  // Listen to all events (data changes).
  componentDidMount() {
    this._isMounted = true;

    for (let key in stores) {
      stores[key].onAny(_.partial(this._onChange, key));
    }
  }

  // Stop listening to store changes.
  componentWillUnmount() {
    this._isMounted = false;

    for (let key in stores) {
      stores[key].clean(this._onChange);
    }
  }

}
