# TODO

- fix: npx command not worky
- update README

## Nice to have

- reduce gql bundle size
- empty milestone/repo state
- "This milestone is overdue" and similar topbar messages
- due date on the milestone page
- link to milestone(s) from the title
- convert `x` to a Date so we don't convert multiple times over
- render milestone end date as a tick if overdue; https://apexcharts.com/docs/annotations/
- back button to navigate away from milestone page
- d3/d3 has no milestones
- use Vercel and Next.js Github auth instead of Firebase
- conventional-commit

## FAQ

### Browser 404 Errors

If you are running a dev mode on localhost (`yarn start`) and start the app by navigating to a URL that contains a `.` character - `Vite` serves a 404. To fix this either navigate to the page through homepage or start the app through the cli - `yarn start:preview`.

### GitHub Bugs

Some milestones show "incorrect" issues associated. Consider the two following views of a milestones:

- https://github.com/nhn/tui.calendar/milestone/6 - 21 closed issues
- https://github.com/nhn/tui.calendar/issues?q=is%3Aissue+milestone%3Av1.12.13+is%3Aclosed - 11 closed issues (what we show)
