# AGENTS

This file provides guidance for AI agents and automated tools working with the burnchart codebase.

## Project Overview

**burnchart** is a GitHub Burndown Chart service that helps teams track project progress and answer "are my projects on track?". It's a React/TypeScript application that visualizes GitHub milestone progress through burndown charts.

- **Repository**: https://github.com/radekstepan/burnchart
- **Live Demo**: https://burnchart.netlify.app
- **Version**: 5.0.0
- **License**: AGPL-3.0

## Technology Stack

- **Frontend**: React 19.x with TypeScript
- **Build Tool**: Vite
- **Styling**: Less CSS
- **Routing**: Wouter
- **Charts**: Chart.js 4.x with Day.js adapter
- **Testing**: Vitest with React Testing Library
- **Package Manager**: Yarn

## Project Structure

```
src/
├── components/      # React UI components (Box, Button, Chart, etc.)
├── hooks/          # Custom React hooks (useAuth, useIssues, useReposStore, etc.)
├── pages/          # Page-level components (AddRepo, Milestone, Milestones, etc.)
├── providers/      # React context providers (AuthProvider, RemountProvider)
├── utils/          # Utility functions (format, scales, sort, getIssues, etc.)
├── styles/         # Global styles
├── App.tsx         # Main application component
├── routes.ts       # Application routing
└── config.ts       # Application configuration
```

## Key Features

1. **GitHub Integration**: Fetches issues and milestones from GitHub API
2. **Authentication**: Uses Firebase backend for GitHub OAuth
3. **Private Repos**: Supports authenticated access to private repositories
4. **Customizable**: Configurable off days, point counting strategies, trend lines
5. **Browser-based**: Runs entirely in the browser (except auth)

## Development Commands

```bash
yarn install          # Install dependencies
yarn start           # Start dev server (Vite)
yarn start:preview   # Start preview server via CLI (port 1234)
yarn test            # Run tests once
yarn test:dev        # Run tests in watch mode
yarn ci:test         # Run tests with coverage
yarn build           # Build for production
```

## Guidelines for AI Agents

### Code Style

- Use TypeScript for all new code
- Follow React functional component patterns with hooks
- Use Less for styling
- Prefer named exports over default exports
- Keep components small and focused

### Testing

- Tests are located in `__tests__` directories alongside source code
- Use Vitest and React Testing Library
- Write tests for new utilities and components
- Run tests before committing: `yarn test`

### State Management

- Local component state via `useState`
- Shared state via custom hooks (e.g., `useReposStore`, `useTokenStore`)
- Context providers for cross-cutting concerns (Auth, Remount)
- Local storage hooks for persistence

### Common Tasks

#### Adding a New Component

1. Create component directory in `src/components/`
2. Add TypeScript component file (e.g., `MyComponent.tsx`)
3. Add Less styles if needed (e.g., `myComponent.less`)
4. Create tests in `__tests__/MyComponent.test.tsx`
5. Export from component directory

#### Adding a New Hook

1. Create hook file in `src/hooks/` (e.g., `useMyHook.ts`)
2. Follow naming convention: `use[Name]`
3. Add tests in `src/hooks/__tests__/`
4. Document parameters and return values

#### Adding a New Utility

1. Create utility file in `src/utils/` (e.g., `myUtil.ts`)
2. Write pure, testable functions
3. Add tests in `src/utils/__tests__/`
4. Export from `src/utils/index.ts` if needed

#### Working with GitHub API

- Main API integration is in `src/utils/getIssues.ts`
- Uses authentication token from `useTokenStore`
- Handles rate limiting and pagination
- Returns typed data matching `src/interfaces.ts`

### File Naming Conventions

- React components: PascalCase (e.g., `MyComponent.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useMyHook.ts`)
- Utilities: camelCase (e.g., `myUtil.ts`)
- Styles: camelCase with `.less` extension (e.g., `myComponent.less`)
- Tests: Same as source with `.test.tsx` or `.test.ts` suffix

### Important Considerations

1. **GitHub API Rate Limits**: Be mindful of API calls, implement caching where appropriate
2. **Authentication**: Firebase is used for GitHub OAuth flow
3. **Off Days**: Configuration allows excluding certain weekdays from ideal burndown
4. **Point Counting**: Supports two strategies - `ONE_SIZE` (1 point per issue) and `LABELS` (size from labels)
5. **Vite Dev Mode**: URLs with `.` character may cause 404s in dev mode - use preview mode or navigate via homepage

### Configuration

- App config is in [src/config.ts](src/config.ts)
- Can be overridden via URL query parameters
- No UI for configuration editing currently

### Known Issues

- Vite dev server has 404 issues with URLs containing `.` characters
- GitHub API may show different issue counts in milestone views vs filtered searches

## API Surface

### Key Interfaces

Located in [src/interfaces.ts](src/interfaces.ts):
- Repository data structures
- Milestone and issue types
- Chart data formats
- Authentication types

### Key Hooks

- `useAuth`: GitHub authentication state
- `useIssues`: Fetch and manage GitHub issues
- `useReposStore`: Repository list management
- `useTokenStore`: GitHub token storage
- `useRouter`: Routing utilities
- `useLocalStorage`/`useSessionStorage`: Persistent state

### Key Utilities

- `getIssues`: Fetch issues from GitHub API
- `format`: Date and number formatting
- `scales`: Chart scaling functions
- `sort`: Sorting utilities
- `addStats`: Calculate burndown statistics

## Testing Strategy

- Unit tests for utilities and pure functions
- Component tests using React Testing Library
- Coverage reports generated in `coverage/` directory
- Tests run on CI via `yarn ci:test`

## Deployment

- Deployed to Netlify
- Build command: `yarn build`
- Output directory: `dist/` (Vite default)

## Contributing Guidelines

When making changes:

1. Ensure TypeScript types are accurate
2. Write or update tests for changes
3. Run `yarn test` to verify tests pass
4. Maintain existing code style and patterns
5. Update this AGENTS file if making structural changes

## Resources

- [Chart.js Documentation](https://www.chartjs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [GitHub REST API](https://docs.github.com/en/rest)
- [Wouter Routing](https://github.com/molefrog/wouter)

## Questions & Issues

For questions or issues with the AI agent experience, please refer to the main repository's issue tracker or documentation.
