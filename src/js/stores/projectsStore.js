import _ from 'lodash';
import lscache from 'lscache';
import opa from 'object-path';
import semver from 'semver';
import sortedIndex from 'sortedindex-compare';

import Store from '../core/Store.js';

import actions from '../actions/appActions.js';

import stats from '../modules/stats.js';
import milestones from '../modules/github/milestones.js';
import issues from '../modules/github/issues.js';

class ProjectsStore extends Store {

  // Initial payload.
  constructor() {
    // Init the projects.
    let list = lscache.get('projects') || [];

    super({
      // A stack of projects.
      list: list,
      // A sorted projects and milestones index.
      'index': [],
      // The default sort order.
      'sortBy': 'priority',
      // Sort functions to toggle through.
      'sortFns': [ 'progress', 'priority', 'name' ]
    });

    // Listen to only projects actions.
    actions.on('projects.*', (obj, event) => {
      let fn = ('on.' + event).replace(/[.]+(\w|$)/g, (m, p) => {
        return p.toUpperCase();
      });

      (fn in this) && this[fn](obj);
    });

    // Listen to when user is ready and save info on us.
    actions.on('user.ready', (user) => {
      this.set('user', user);
    });

    // Persist projects in local storage (sans milestones and issues).
    this.on('list.*', () => {
      if (process.browser) {
        lscache.set('projects', _.pluckMany(this.get('list'), [ 'owner', 'name' ]));
      }
    });

    // Reset our index and re-sort.
    this.on('sortBy', () => {
      this.set('index', []);
      // Run the sort again.
      this.sort();
    });
  }

  // Fetch milestone(s) and issues for a project(s).
  onProjectsLoad(args) {
    let projects = this.get('list');

    // Quit if we have no projects.
    if (!projects.length) return;

    // Wait for the user to get resolved.
    this.get('user', this.cb((user) => { // async
      if (args) {
        if ('milestone' in args) {
          // For a single milestone.
          this.getMilestone(user, {
            'owner': args.owner,
            'name': args.name
          }, args.milestone);
        } else {
          // For a single project.
          _.find(this.get('list'), (obj) => {
            if (args.owner == obj.owner && args.name == obj.name) {
              args = obj; // expand by saved properties
              return true;
            };
            return false;
          });
          this.getProject(user, args);
        }
      } else {
        // For all projects.
        _.each(projects, _.partial(this.getProject, user), this);
      }
    }));
  }

  // Push to the stack unless it exists already.
  onProjectsAdd(project) {
    if (!_.find(this.get('list'), project)) {
      this.push('list', project);
    }
  }

  // Cycle through projects sort order.
  onProjectsSort() {
    let { sortBy, sortFns } = this.get();

    let idx = 1 + sortFns.indexOf(sortBy);
    if (idx === sortFns.length) idx = 0;

    this.set('sortBy', sortFns[idx]);
  }

  // Demonstration projects.
  onProjectsDemo() {
    this.set({
      'list': [
        { 'owner': 'mbostock', 'name': 'd3' },
        { 'owner': 'radekstepan', 'name': 'disposable' },
        { 'owner': 'rails', 'name': 'rails' }
      ],
      'index': []
    });
  }

  // Return a sort order comparator.
  comparator() {
    let { list, sortBy } = this.get();

    // Convert existing index into actual project milestone.
    let deIdx = (fn) => {
      return ([ i, j ], ...rest) => {
        return fn.apply(this, [ [ list[i], list[i].milestones[j] ] ].concat(rest));
      };
    };

    // Set default fields.
    let defaults = (arr, hash) => {
      for (let item of arr) {
        for (let key in hash) {
          if (!opa.has(item, key)) {
            opa.set(item, key, hash[key]);
          }
        }
      }
    };

    // The actual fn selection.
    switch (sortBy) {
      // From highest progress points.
      case 'progress':
        return deIdx(([ , aM ], [ , bM ]) => {
          defaults([ aM, bM ], { 'stats.progress.points': 0 });
          // Simple points difference.
          return aM.stats.progress.points - bM.stats.progress.points;
        });
    
      // From most delayed in days.
      case 'priority':
        return deIdx(([ , aM ], [ , bM ]) => {
          // Milestones with no deadline are always at the "beginning".
          defaults([ aM, bM ], { 'stats.progress.time': 0, 'stats.days': 1e3 });
          // % difference in progress times the number of days ahead or behind.
          let [ $a, $b ] = _.map([ aM, bM ], ({ stats }) => {
            return (stats.progress.points - stats.progress.time) * stats.days;
          });
          
          return $b - $a;
        });
    
      // Based on project then milestone name including semver.
      case 'name':
        return deIdx(([ aP, aM ], [ bP, bM ]) => {
          let owner, name;

          if (owner = bP.owner.localeCompare(aP.owner)) {
            return owner;
          }
          if (name = bP.name.localeCompare(aP.name)) {
            return name;
          }

          // Try semver.
          if (semver.valid(bM.title) && semver.valid(aM.title)) {
            return semver.gt(bM.title, aM.title);
          // Back to string compare.
          } else {
            return bM.title.localeCompare(aM.title);
          }
        });
      
      // The "whatever" sort order...
      default:
        return () => { return 0; }
    }
  }

  // Fetch milestones and issues for a project.
  getProject(user, p) {
    // Fetch their milestones.
    milestones.fetchAll(user, p, this.cb((err, milestones) => { // async
      // Save the error if project does not exist.
      if (err) return this.saveError(p, err);
      // Now add in the issues.
      milestones.forEach((milestone) => {
        // Do we have this milestone already? Skip fetching issues then.
        if (!_.find(p.milestones, ({ number }) => {
          return milestone.number === number;
        })) {
          // Fetch all the issues for this milestone.
          this.getIssues(user, p, milestone);
        }
      });
    }));
  }

  // Fetch a single milestone.
  getMilestone(user, p, m) {
    // Fetch the single milestone.
    milestones.fetch(user, {
      'owner': p.owner,
      'name': p.name,
      'milestone': m
    }, this.cb((err, milestone) => { // async
      // Save the error if project does not exist.
      if (err) return this.saveError(p, err);
      // Now add in the issues.
      this.getIssues(user, p, milestone);
    }));
  }

  // Fetch all issues for a milestone.
  getIssues(user, p, m) {
    issues.fetchAll(user, {
      'owner': p.owner,
      'name': p.name,
      'milestone': m.number
    }, this.cb((err, obj) => { // async
      // Save any errors on the project.
      if (err) return this.saveError(p, err);
      // Add in the issues to the milestone.
      _.extend(m, { 'issues': obj });
      // Save the milestone.
      this.addMilestone(p, m);
    }));
  }

  // Add a milestone for a project.
  addMilestone(project, milestone) {
    // Add in the stats.
    let i, j;
    _.extend(milestone, { 'stats': stats(milestone) });
    // We are supposed to exist already.
    if ((i = this.findIndex(project)) < 0) { throw 500; } 

    // Does the milestone exist already?
    let milestones;
    if (milestones = this.get(`list.${i}.milestones`)) {
      j = _.findIndex(milestones, { 'number': milestone.number });
      // Just make an update then.
      if (j != -1) {
        return this.set(`list.${i}.milestones.${j}`, milestone);
      }
    }

    // Push the milestone and return the index.
    j = this.push(`list.${i}.milestones`, milestone);

    // Now index this milestone.
    this.sort([ i, j ], [ project, milestone ]);
  }

  // Find index of a project.
  findIndex({ owner, name }) {
    return _.findIndex(this.get('list'), { owner, name });
  }

  // Save an error from loading milestones or issues
  saveError(project, err) {
    var idx;
    if ((idx = this.findIndex(project)) > -1) {
      return this.push(`list.${idx}.errors`, err);
    } else {
      // We are supposed to exist already.
      throw 500;  
    }
  }

  // Sort projects (update the index). Can pass reference to the
  //  project and milestone index in the stack.
  sort(ref, data) {
    let idx;
    // Get the existing index.
    let index = this.get('index');
   
    // Index one milestone in an already sorted index.
    if (ref) {
      idx = sortedIndex(index, data, this.comparator());
      index.splice(idx, 0, ref);
    // Sort them all.
    } else {
      let list = this.get('list');
      for (let i = 0; i < list.length; i++) {
        let p = list[i];
        // TODO: need to show projects that failed too...
        if (p.milestones == null) continue;
        // Walk the milestones.
        for (let j = 0; j < p.milestones.length; j++) {
          let m = p.milestones[j];
          // Run a comparator here inserting into index.
          idx = sortedIndex(index, [ p, m ], this.comparator());
          index.splice(idx, 0, [ i, j ]);
        }
      }
    }

    this.set('index', index);
  }

}

export default new ProjectsStore();
