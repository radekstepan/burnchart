// The app store needs to go last because it loads user.
import projectsStore from './projectsStore.js';
import appStore from './appStore.js';

export default {
  'app': appStore,
  'projects': projectsStore
};
