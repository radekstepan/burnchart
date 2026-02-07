# Production Readiness Issues

> **Verdict: Not production-ready.** There are runtime bugs, ~88 TypeScript errors, security risks, and dependency problems that must be addressed first.

---

## P0 — Critical (must fix)

### 1. Runtime bug: `getMilestone` references undefined `retryCount`
- **File:** `src/utils/getIssues.ts:55-57`
- `retryCount` is used but never declared as a parameter of `getMilestone`. The recursive call also passes a 5th argument the function doesn't accept. This causes a `ReferenceError` at runtime whenever a rate-limit response is received.
- **Fix:** Add `retryCount = 2` parameter to `getMilestone` and accept it in the recursive call.

### 2. Runtime bug: `useIssues` cleanup sets `exited = false` instead of `true`
- **File:** `src/hooks/useIssues.ts:103`
- The effect cleanup (unmount/re-run) sets `exited = false`, which is the opposite of the intent. State updates after unmount will proceed, causing memory leaks and potential React warnings.
- **Fix:** Change to `exited = true`.

### 3. TypeScript: ~88 compiler errors across the codebase
- `useAuth.ts` does not export `AuthState`, but `AuthProvider.tsx` imports it as a named export.
- `AuthContextValue` interface is missing fields (`token`, `isAuthenticated`, `isValidating`, `error`) that components rely on.
- `useTokenStore` passes a type argument to `useLocalStorage` incorrectly.
- `chartjs-adapter-moment-utc.ts` has type mismatches with Chart.js `DateAdapter` API.
- `Tooltip.tsx` uses `TooltipModel` without a required type argument.
- `TextInput.tsx` passes unknown `withInput` prop via `cloneElement`.
- Multiple test files have type errors from loosely typed fetch mocks.
- **Fix:** Export `AuthState` or define shared types; align `AuthContextValue` with `useAuth` return type; fix adapter types; address all TS errors to zero.

### 4. Security: GitHub PAT stored in `localStorage` in plaintext
- **File:** `src/hooks/useTokenStore.ts`, `src/hooks/useLocalStorage.ts`
- Any XSS vulnerability allows exfiltration of the token. With `repo` scope, this grants full access to private repositories.
- **Fix:** Default to in-memory-only storage; if persisting, use `sessionStorage` at minimum. Add a warning about token scope. Long-term: move to OAuth or a backend proxy.

### 5. Security: Token input uses `type="text"`
- **File:** `src/components/TokenInput/TokenInput.tsx:34`
- The PAT is visible on screen — shoulder-surfing, screen recordings, screenshots.
- **Fix:** Change to `type="password"`.

### 6. Security: `node-static` is abandoned with known directory traversal CVEs
- **File:** `package.json`, `cli.js`
- `node-static@0.7.11` has no maintainer and known CVE for path traversal.
- **Fix:** Replace with `sirv`, `serve-handler`, or a minimal custom static server.

### 7. Build: Vite aliases `node-fetch` → `cross-fetch` but `cross-fetch` is not installed
- **File:** `vite.config.ts`
- If any dependency imports `node-fetch`, the build/runtime will fail.
- **Fix:** Remove the alias (browser has native `fetch`) or install `cross-fetch`.

---

## P1 — High (serious correctness / reliability)

### 8. No pagination for issues — only fetches first 100 per milestone
- **File:** `src/utils/getIssues.ts:66-75`
- Milestones with >100 issues will show incorrect burndown charts and stats.
- **Fix:** Paginate via `Link` header or increment `page` until results < `per_page`.

### 9. `/issues` endpoint returns pull requests too
- **File:** `src/utils/getIssues.ts`
- GitHub REST `/repos/{o}/{r}/issues` includes PRs. Without filtering on `!item.pull_request`, point counts and charts will be wrong.
- **Fix:** Filter out items that have a `pull_request` key.

### 10. Rate limit handling is naive
- **File:** `src/utils/getIssues.ts`
- Fixed 2s sleep, no `X-RateLimit-Reset` header parsing, no jitter, no distinction between primary and secondary rate limits. Many non-OK responses silently return `null`/`[]`.
- **Fix:** Read rate limit headers, compute wait time, add jitter, propagate structured errors.

### 11. No `AbortController` for in-flight fetches on cancel/unmount
- **Files:** `src/utils/getIssues.ts`, `src/hooks/useIssues.ts`
- Queue is cleared but running fetches continue and may mutate shared state.
- **Fix:** Pass an `AbortSignal` to each `fetch` call; abort on cancel.

### 12. Global singleton cache leaks memory and serves stale/cross-session data
- **File:** `src/hooks/useIssues.ts:9`
- Module-level `Map` persists across auth sessions. On sign-out/sign-in with a different token, stale data from the previous user is shown.
- **Fix:** Scope cache to auth session (e.g., React context or keyed by token); clear on sign out; add TTL/size bounds.

### 13. Concurrent queue results in non-deterministic milestone order
- **File:** `src/utils/getIssues.ts` — `results.push` from concurrent tasks
- UI order depends on network timing; may flicker on re-renders.
- **Fix:** Collect results by key and sort after all tasks complete.

### 14. Dependencies misclassified in `package.json`
- All runtime browser deps (`react`, `react-dom`, `chart.js`, `moment`, `wouter`, `p-queue`, etc.) are in `devDependencies`. `vite` is in `dependencies`.
- Installing with `--omit=dev` (e.g., as a CLI consumer) breaks everything.
- **Fix:** Move runtime deps to `dependencies`; move `vite` to `devDependencies`.

### 15. `prepare` script runs `build` on every `npm install`
- **File:** `package.json:18`
- Hostile for contributors and consumers (slow installs, build failures block install).
- **Fix:** Use `prepublishOnly` instead, or remove if `dist` is committed.

### 16. `TokenInput` submit button is `type="button"` with a form submit handler
- **File:** `src/components/TokenInput/TokenInput.tsx:63-64`
- The `onClick` handler receives a `MouseEvent` but the handler expects `FormEvent`. Also prevents Enter-to-submit from using the button path.
- **Fix:** Change to `type="submit"` and remove `onClick`; rely on `<form onSubmit>`.

---

## P2 — Medium (product polish / maintenance)

### 17. Missing Error Boundary
- A render error anywhere blanks the entire UI with no recovery.
- **Fix:** Add a root `ErrorBoundary` component with a fallback UI.

### 18. `index.html` missing `<title>`, viewport meta, charset, description
- **File:** `index.html`
- Impacts mobile rendering, SEO, share previews, and basic professionalism.
- **Fix:** Add `<meta charset="utf-8">`, `<meta name="viewport" ...>`, `<title>`, and `<meta name="description">`.

### 19. No catch-all route for unknown paths
- The router defines five routes but has no wildcard. Unknown paths render nothing.
- **Fix:** Add a `*` catch-all route that redirects to `/404` or renders `NotFound`.

### 20. `moment.js` is in maintenance mode and adds ~70kB to bundle
- **Fix:** Consider migrating to `dayjs` or `date-fns` with matching Chart.js adapter.

### 21. `define: { global: "window" }` is a brittle bundler hack
- **File:** `vite.config.ts:16`
- Can mask compatibility issues and break dependencies expecting Node globals.
- **Fix:** Remove if not needed; use targeted polyfills only where required.

### 22. `serializeError` imported but never used
- **File:** `src/utils/getIssues.ts:2`
- Dead import; indicates incomplete error handling.
- **Fix:** Remove or use for structured error logging.

### 23. `off_days` config type mismatch
- **Files:** `src/config.ts`, `src/utils/lines/idealLine.ts`
- Config declares `off_days: []` (inferred as `never[]`); `idealLine` expects `string[]` then parses to numbers.
- **Fix:** Type config as `number[]` and remove the string parsing.

### 24. `dangerouslySetInnerHTML` in Icon component
- **File:** `src/components/Icon/Icon.tsx:37`
- Used for rendering icon character codes. Low risk since the values are hardcoded enum hex codes, but still a code smell.
- **Fix:** Use `String.fromCodePoint()` instead.

### 25. `useAuth` named export mismatch
- **File:** `src/hooks/useAuth.ts:4`
- `AuthState` is defined as a local interface but not exported. The file's default export is the hook.
- **Fix:** Add `export` to the interface, or move shared auth types to `interfaces.ts`.

---

## Summary

| Severity | Count | Key themes |
|----------|-------|------------|
| P0 Critical | 7 | Runtime bugs, TS errors, security, broken build config |
| P1 High | 9 | Data correctness, API reliability, dependency hygiene |
| P2 Medium | 9 | UX polish, bundle size, code quality |
| **Total** | **25** | |
