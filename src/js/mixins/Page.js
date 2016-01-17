import _ from 'lodash';

// TODO: the app store needs to go last because it loads user.
import projectsStore from '../stores/projectsStore.js';
import appStore from '../stores/appStore.js';

let stores = {
  'app': appStore,
  'projects': projectsStore
};

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
