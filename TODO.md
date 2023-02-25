# TODO

- fix: tooltips stopped working
- the addStats function is called in Milestone and Table both
- milestones: update createdAt when merging all milestones together by looking at first issue closedAt (addStats)
- reduce gql bundle size
- semantic-release

## Nice to have

- empty milestone/repo state
- "This milestone is overdue" and similar topbar messages
- due date on the milestone page
- link to milestone(s) from the title
- nicer date formatting on the chart, it doesn't have to be relative if in the past
- do not refetch milestones when navigating from repos
- convert `x` to a Date so we don't convert multiple times over
- render milestone end date as a tick if overdue; https://apexcharts.com/docs/annotations/
- back button to navigate away from milestone page
- d3/d3 has no milestones
- use Vercel and Next.js Github auth instead of Firebase
