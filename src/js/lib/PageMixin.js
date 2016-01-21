import _ from 'lodash';

import stores from '../stores';

export default {

  // Get the POJO of the store.
  _getData(store) {
    let obj = {};
    if (store) {
      obj[store] = stores[store].get();
    } else {
      // Get all stores.
      let key;
      for (key in stores) {
        obj[key] = stores[key].get();
      }
    }

    return obj;
  },

  _onChange(store, val, key) {
    if (this.isMounted()) { // not ideal
      this.setState(this._getData(store));
    }
  },

  getInitialState() {
    return this._getData();
  },

  // Listen to all events (data changes).
  componentDidMount() {
    let key;
    for (key in stores) {
      stores[key].onAny(_.partial(this._onChange, key));
    }
  },

  componentWillUnmount() {
    let key;
    for (key in stores) {
      stores[key].clean(this._onChange); 
    }
  }

};
