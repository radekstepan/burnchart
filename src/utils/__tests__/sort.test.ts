import { Milestone, WithStats } from "../../interfaces";
import { sortBy, SortBy } from "../sort";

type ToMilestone = (obj: Partial<WithStats<Milestone>>) => WithStats<Milestone>;

const toMilestone: ToMilestone = (obj) => ({
  id: "",
  owner: "",
  repo: "",
  number: 0,
  title: "",
  description: null,
  createdAt: "",
  dueOn: null,
  ...obj,
  issues: {
    open: {
      size: 0,
      nodes: [],
    },
    closed: {
      size: 0,
      nodes: [],
    },
  },
  stats: {
    days: 0,
    span: 0,
    ...obj.stats,
    progress: {
      points: 0,
      time: 0,
      ...obj.stats?.progress,
    },
    meta: {
      isDone: false,
      isOnTime: false,
      isOverdue: false,
      isEmpty: false,
      ...obj.stats?.meta,
    },
  },
});

describe("sort", () => {
  test("by progress", () => {
    const ordered = sortBy(
      [
        {
          number: 1,
          stats: {
            progress: {
              points: 5,
            },
          },
        },
        {
          number: 2,
          stats: {
            progress: {
              points: 7,
            },
          },
          // @ts-expect-error TODO fix
        },
      ].map((d) => toMilestone(d)),
      SortBy.progress
    );

    expect(ordered.map((d) => d.number)).toEqual([2, 1]);
  });

  // test("by priority", () => {
  //   projects.set({ 'list': [], 'index': [], 'sortBy': 'priority' });

  //   let project = {
  //     'owner': 'radekstepan',
  //     'name': 'burnchart'
  //   };
  //   let milestone1 = {
  //     'title': '1.0.0',
  //     'stats': {
  //       'progress': {
  //         'points': 2,
  //         'time': 1
  //       },
  //       'days': 2
  //     }
  //   };
  //   let milestone2 = {
  //     'title': '2.0.0',
  //     'stats': {
  //       'progress': {
  //         'points': 2,
  //         'time': 1
  //       },
  //       'days': 3
  //     }
  //   };
  //   let milestone3 = {
  //     'title': '3.0.0',
  //     'stats': {
  //       'progress': {
  //         'points': 1,
  //         'time': 2
  //       },
  //       'days': 4
  //     }
  //   };

  //   projects.push('list', project);
  //   projects.addMilestone(project, milestone1);
  //   projects.addMilestone(project, milestone2);
  //   projects.addMilestone(project, milestone3);

  //   assert.deepEqual(projects.get('index'), [[0, 2], [0, 0], [0, 1]]);
  // });

  // test("by priority defaults", () => {
  //   projects.set({ 'list': [], 'index': [], 'sortBy': 'priority' });

  //   let project = {
  //     'owner': 'radekstepan',
  //     'name': 'burnchart'
  //   };
  //   let milestone1 = {
  //     'title': '1.0.0',
  //     'stats': {
  //       'progress': {
  //         'points': 3
  //       }
  //     }
  //   };
  //   let milestone2 = {
  //     'title': '2.0.0',
  //     'stats': {
  //       'progress': {
  //         'points': 2
  //       }
  //     }
  //   };
  //   let milestone3 = {
  //     'title': '3.0.0',
  //     'stats': {
  //       'progress': {
  //         'points': 1
  //       }
  //     }
  //   };

  //   projects.push('list', project);
  //   projects.addMilestone(project, milestone1);
  //   projects.addMilestone(project, milestone2);
  //   projects.addMilestone(project, milestone3);

  //   assert.deepEqual(projects.get('index'), [[0, 2], [0, 1], [0, 0]]);
  // });

  // test("by name", () => {
  //   projects.set({ 'list': [], 'index': [], 'sortBy': 'name' });

  //   let project = {
  //     'owner': 'radekstepan',
  //     'name': 'burnchart'
  //   };
  //   let milestone1 = {
  //     'title': 'B',
  //     'stats': {}
  //   };
  //   let milestone2 = {
  //     'title': 'A',
  //     'stats': {}
  //   };

  //   projects.push('list', project);
  //   projects.addMilestone(project, milestone1);
  //   projects.addMilestone(project, milestone2);

  //   assert.deepEqual(projects.get('index'), [[0, 1], [0, 0]]);
  // });

  // test("by name semver", () => {
  //   projects.set({ 'list': [], 'index': [], 'sortBy': 'name' });

  //   let project = {
  //     'owner': 'radekstepan',
  //     'name': 'burnchart'
  //   };
  //   let milestone1 = {
  //     'title': '1.2.5',
  //     'stats': {}
  //   };
  //   let milestone2 = {
  //     'title': '1.1.x',
  //     'stats': {}
  //   };
  //   let milestone3 = {
  //     'title': '1.1.7',
  //     'stats': {}
  //   };

  //   projects.push('list', project);
  //   projects.addMilestone(project, milestone1);
  //   projects.addMilestone(project, milestone2);
  //   projects.addMilestone(project, milestone3);

  //   assert.deepEqual(projects.get('index'), [[0, 2], [0, 1], [0, 0]]);
  // });
});

export default {};
