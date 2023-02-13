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
    days: 1,
    span: 1,
    ...obj.stats,
    progress: {
      points: 1,
      time: 1,
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
          id: "1",
          stats: {
            progress: {
              points: 5,
            },
          },
        },
        {
          id: "2",
          stats: {
            progress: {
              points: 7,
            },
          },
        },
        // @ts-expect-error TODO fix
      ].map((d) => toMilestone(d)),
      SortBy.progress
    );

    expect(ordered.map((d) => d.id)).toEqual(["2", "1"]);
  });

  describe("by priority", () => {
    test("sort on days", () => {
      const ordered = sortBy(
        [
          {
            id: "1",
            stats: {
              days: 2,
              progress: {
                points: 2,
                time: 1,
              },
            },
          },
          {
            id: "2",
            stats: {
              days: 3,
              progress: {
                points: 2,
                time: 1,
              },
            },
          },
          {
            id: "3",
            stats: {
              days: 4,
              progress: {
                points: 1,
                time: 2,
              },
            },
          },
          // @ts-expect-error TODO fix
        ].map((d) => toMilestone(d)),
        SortBy.priority
      );

      expect(ordered.map((d) => d.id)).toEqual(["3", "1", "2"]);
    });

    test("sort on points", () => {
      const ordered = sortBy(
        [
          {
            id: "1",
            stats: {
              progress: {
                points: 3,
              },
            },
          },
          {
            id: "2",
            stats: {
              progress: {
                points: 2,
              },
            },
          },
          {
            id: "3",
            stats: {
              progress: {
                points: 1,
              },
            },
          },
          // @ts-expect-error TODO fix
        ].map((d) => toMilestone(d)),
        SortBy.priority
      );

      expect(ordered.map((d) => d.id)).toEqual(["3", "2", "1"]);
    });
  });

  describe("by name", () => {
    test("sort on owner", () => {
      const ordered = sortBy(
        [
          {
            id: "2",
            owner: "B",
          },
          {
            id: "1",
            owner: "A",
          },
          {
            id: "3",
            owner: "C",
          },
        ].map((d) => toMilestone(d)),
        SortBy.name
      );

      expect(ordered.map((d) => d.id)).toEqual(["1", "2", "3"]);
    });

    test("sort on owner", () => {
      const ordered = sortBy(
        [
          {
            id: "2",
            owner: "rails",
            repo: "b",
          },
          {
            id: "1",
            owner: "rails",
            repo: "a",
          },
          {
            id: "3",
            owner: "rails",
            repo: "c",
          },
        ].map((d) => toMilestone(d)),
        SortBy.name
      );

      expect(ordered.map((d) => d.id)).toEqual(["1", "2", "3"]);
    });

    test("sort on title", () => {
      const ordered = sortBy(
        [
          {
            id: "2",
            title: "B",
            owner: "rails",
            repo: "rails",
          },
          {
            id: "1",
            title: "A",
            owner: "rails",
            repo: "rails",
          },
          {
            id: "3",
            title: "B",
            owner: "rails",
            repo: "rails",
          },
        ].map((d) => toMilestone(d)),
        SortBy.name
      );

      expect(ordered.map((d) => d.id)).toEqual(["1", "2", "3"]);
    });

    test("sort on semver", () => {
      const ordered = sortBy(
        [
          {
            id: "2",
            title: "2.0.0",
            owner: "rails",
            repo: "rails",
          },
          {
            id: "1",
            title: "2.0.0-rc.1",
            owner: "rails",
            repo: "rails",
          },
          {
            id: "3",
            title: "11.0.0",
            owner: "rails",
            repo: "rails",
          },
        ].map((d) => toMilestone(d)),
        SortBy.name
      );

      expect(ordered.map((d) => d.title)).toEqual([
        "2.0.0-rc.1",
        "2.0.0",
        "11.0.0",
      ]);
    });
  });
});

export default {};
