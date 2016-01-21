import _ from 'lodash';

_.mixin({
  pluckMany: (source, keys) => {
    if (!_.isArray(keys)) {
      throw '`keys` needs to be an Array';
    }
    
    return _.map(source, (item) => {
      let obj = {};
      for (let key of keys) {
        obj[key] = item[key];
      }
      return obj;
    });
  }
});
