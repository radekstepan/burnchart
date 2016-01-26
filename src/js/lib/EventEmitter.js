import _ from 'lodash';

// TODO: add `onOnce` fn.
export default class EventEmitter {

  constructor() {
    this.list = [];
  }

  // Trigger an event with obj and context.
  emit(event, obj, ctx) {
    if (!event.length) return;

    this.list.forEach((sub) => {
      if (sub.pattern.test(event)) {
        sub.cb.call(ctx, obj, event);
      }
    });
  }

  // Add a listener on this path/regex.
  on(path, cb) {
    if (!_.isRegExp(path)) path = new RegExp(`^${path}$`);
    this.list.push({ pattern: path, cb: cb });
  }

  // Add a listener to all events.
  onAny(cb) {
    this.list.push({ pattern: /./, cb: cb });
  }

  // Assume we can have multiple.
  off(path, cb) {
    _.remove(this.list, (sub) => sub.pattern.test(path) && sub.cb === cb);
  }

  // Remove all listeners with this callback.
  offAny(cb) {
    _.remove(this.list, (sub) => sub.cb === cb);
  }

}
