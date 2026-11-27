# Retro Game Hub testing

Run from the repository root with Node.js 20 or newer, npm, and Python 3.

```sh
npm ci
npx playwright install chromium
npm run test:browser
```

With a compatible system Chromium, you can skip the browser download and run `RETRO_TEST_CHROMIUM=/usr/bin/chromium npm run test:browser`. Playwright starts a static server on `127.0.0.1:4173` and stops it on exit. A managed cloud command sandbox may require approval for the local server and browser processes to communicate over loopback.

## Browser coverage

Each test runs in desktop Chromium and a Pixel 7 Chromium device profile. The suite checks catalog search and filters, game launch, shared navigation and sharing controls, sign-in and logout across reloads, two completed Heads or Tails runs with distinct reward responses, device-best persistence, Brick Blitz account save restoration, and a device-to-account conflict resolution and write.

Import `test` and `expect` from `tests/browser/fixtures.js` in all browser specs. The automatic fixture intercepts external requests before navigation. It serves the local Supabase SDK fixture for supported pages and blocks ads, analytics, WebSockets, and outbound services, including when a game opens in a new tab. Use fictitious accounts and keep new external service fixtures behind request interception. Keep selectors tied to visible roles or stable page IDs, use assertions that wait for UI state, and make random game outcomes deterministic at an appropriate boundary.

Use `npm run test:browser -- --project=mobile` to isolate the mobile project. Use `--headed` to inspect a flow in a desktop environment. Open a retained failure trace with `npx playwright show-trace <path-to-trace.zip>` under `test-results/`. Verify that a failure comes from the application before updating expected behavior or fixture responses.

## Save service regressions

Run `node tests/retro-save-auth.test.cjs` to exercise the service with synthetic accounts and controlled request ordering. The tests cover stale initial sessions, rapid auth changes, delayed reads and writes, token refresh and failed conflict reads.

## Additional verification

The mocks verify client behavior. Verify real auth providers, deployed Row Level Security, XP transaction and concurrent replay behavior, and real save writes/conflict recovery separately in an isolated Supabase environment with synthetic users. Exercise a second device for conflicting writes and login persistence. Test OAuth redirects, email confirmation, recovery and sign-out before promoting auth changes. Use browser emulation for responsive regression tests and real phones for touch, keyboard and screen-reader checks. For performance, capture loading and interaction traces on a throttled mobile profile before and after changes with the same ad test configuration.

Review integration and monetization changes with ads blocked, provider test mode, or local placeholders. Track manual QA in Jira In Review until the project owner approves it.

## Catalog smoke coverage

Run `npm run test:browser -- catalog.spec.js` to open every catalog entry on desktop and mobile, check that the route loads and shared navigation appears, and confirm that Classics URLs open the selected mode. These checks cover game entry and navigation. The game matrix tracks deeper gameplay and progression coverage.
