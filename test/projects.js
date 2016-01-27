import { assert } from 'chai';
import path from 'path';
import { noCallThru } from 'proxyquire'
let proxy = noCallThru();

let request = {};

// Proxy the request module.
let lib = path.resolve(__dirname, '../src/js/stores/projectsStore.js');
let projects = proxy(lib, { '../modules/github/request.js': request }).default;

export default {
  'projects - initializes empty': (done) => {
    assert.deepEqual(projects.get('list'), []);
    done();
  },
  
  'projects - sorts on new milestones': (done) => {
    projects.set({ 'list': [], 'index': [] });

    let project = {
      'owner': 'radekstepan',
      'name': 'burnchart'
    };
    let milestone = {
      'title': '1.0.0',
      'stats': {}
    };
    
    projects.push('list', project);
    projects.addMilestone(project, milestone);

    assert.deepEqual(projects.get('index'), [[0, 0]]);
    
    done();
  },

  'projects - sort by progress': (done) => {
    projects.set({ 'list': [], 'index': [], 'sortBy': 'progress' });

    let project = {
      'owner': 'radekstepan',
      'name': 'burnchart'
    };
    let milestone1 = {
      'title': '1.0.0',
      'stats': {
        'progress': {
          'points': 5
        }
      }
    };
    let milestone2 = {
      'title': '2.0.0',
      'stats': {
        'progress': {
          'points': 7
        }
      }
    };

    projects.push('list', project);
    projects.addMilestone(project, milestone1);
    projects.addMilestone(project, milestone2);
    
    assert.deepEqual(projects.get('index'), [[0, 1], [0, 0]]);
    
    done();
  },

  'projects - sort by priority': (done) => {
    projects.set({ 'list': [], 'index': [], 'sortBy': 'priority' });

    let project = {
      'owner': 'radekstepan',
      'name': 'burnchart'
    };
    let milestone1 = {
      'title': '1.0.0',
      'stats': {
        'progress': {
          'points': 2,
          'time': 1
        },
        'days': 2
      }
    };
    let milestone2 = {
      'title': '2.0.0',
      'stats': {
        'progress': {
          'points': 2,
          'time': 1
        },
        'days': 3
      }
    };
    let milestone3 = {
      'title': '3.0.0',
      'stats': {
        'progress': {
          'points': 1,
          'time': 2
        },
        'days': 4
      }
    };

    projects.push('list', project);
    projects.addMilestone(project, milestone1);
    projects.addMilestone(project, milestone2);
    projects.addMilestone(project, milestone3);
    
    assert.deepEqual(projects.get('index'), [[0, 2], [0, 0], [0, 1]]);
    
    done();
  },

  'projects - sort by priority defaults': (done) => {
    projects.set({ 'list': [], 'index': [], 'sortBy': 'priority' });

    let project = {
      'owner': 'radekstepan',
      'name': 'burnchart'
    };
    let milestone1 = {
      'title': '1.0.0',
      'stats': {
        'progress': {
          'points': 3
        }
      }
    };
    let milestone2 = {
      'title': '2.0.0',
      'stats': {
        'progress': {
          'points': 2
        }
      }
    };
    let milestone3 = {
      'title': '3.0.0',
      'stats': {
        'progress': {
          'points': 1
        }
      }
    };

    projects.push('list', project);
    projects.addMilestone(project, milestone1);
    projects.addMilestone(project, milestone2);
    projects.addMilestone(project, milestone3);
    
    assert.deepEqual(projects.get('index'), [[0, 2], [0, 1], [0, 0]]);
    
    done();
  },

  'projects - sort by name': (done) => {
    projects.set({ 'list': [], 'index': [], 'sortBy': 'name' });

    let project = {
      'owner': 'radekstepan',
      'name': 'burnchart'
    };
    let milestone1 = {
      'title': 'B',
      'stats': {}
    };
    let milestone2 = {
      'title': 'A',
      'stats': {}
    };

    projects.push('list', project);
    projects.addMilestone(project, milestone1);
    projects.addMilestone(project, milestone2);
    
    assert.deepEqual(projects.get('index'), [[0, 1], [0, 0]]);
    
    done();
  },

  'projects - sort by name semver': (done) => {
    projects.set({ 'list': [], 'index': [], 'sortBy': 'name' });

    let project = {
      'owner': 'radekstepan',
      'name': 'burnchart'
    };
    let milestone1 = {
      'title': '1.2.5',
      'stats': {}
    };
    let milestone2 = {
      'title': '1.1.x',
      'stats': {}
    };
    let milestone3 = {
      'title': '1.1.7',
      'stats': {}
    };

    projects.push('list', project);
    projects.addMilestone(project, milestone1);
    projects.addMilestone(project, milestone2);
    projects.addMilestone(project, milestone3);
    
    assert.deepEqual(projects.get('index'), [[0, 2], [0, 1], [0, 0]]);
    
    done();
  },

  'projects - search': (done) => {
    projects.set({ 'list': [
      { 'owner': 'radek', 'name': 'A' }
    ], 'index': [], 'sortBy': 'name', 'user': null });

    // Skip search.
    request.repos = (user, owner, cb) => assert(false);
    projects.onProjectsSearch();

    // Search on text.
    request.repos = (user, owner, cb) => assert(owner == undefined);
    projects.onProjectsSearch('radek');

    // Search on owner.
    request.repos = (user, owner, cb) => assert(owner == 'radek');
    projects.onProjectsSearch('radek/project');

    request.repos = (user, owner, cb) => {
      cb(null, [
        { 'has_issues': true, 'owner': { 'login': 'Radek' }, 'name': 'A', 'full_name': 'Radek/A' }, // exists
        { 'has_issues': true, 'owner': { 'login': 'radek' }, 'name': 'aA', 'full_name': 'radek/aA' }, // ok
        { 'has_issues': true, 'owner': { 'login': 'a' }, 'name': 'A', 'full_name': 'a/A' }, // wrong owner
        { 'has_issues': false, 'owner': { 'login': 'radek' }, 'name': 'aaa', 'full_name': 'radek/aaa' } // no issues
      ]);
    };
    projects.onProjectsSearch('radek/a');
    assert.deepEqual(projects.get('suggestions'), [ 'radek/aA' ]);

    done();
  }
};
