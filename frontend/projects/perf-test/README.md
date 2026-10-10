# perf-test

Measures what each `bn-*` component costs to render. The app renders one scenario many times in
Chromium while the V8 CPU profiler runs; the runner in `e2e/perf-test/` compares this branch with
its base branch. The approach follows Fluent UI's `apps/perf-test`.

## Add a scenario

Every component in the `components` library has a scenario, and so does each composition that
repeats on a screen and the dark theme wrapper.

1. Add `src/scenarios/<Name>.ts`. Its default export is a standalone component that renders one
   realistic instance, using the cast and copy from `docs/mocks/README.md`.
2. Export it from `src/scenarios/index.ts`.
3. Tune its iterations in `e2e/perf-test/config/scenario-iterations.mjs` so it renders in roughly
   100–300 ms (the default is 500).

## Run it

```bash
cd frontend
NG_BUILD_MANGLE=0 npx ng build perf-test
cd ../e2e
npm run perf-test -- --baseline <base-branch dist> --fail-on-regression   # --scenarios Button,TopBar to narrow
```

A `<dist>` is a perf-test browser build, such as `frontend/dist/perf-test/browser`. Build the base
branch into a separate directory (for example in a `git worktree`) and pass it as `--baseline`.

The renderer reads `?scenario=<Name>&iterations=<n>&renderType=mount|update` and writes the result
to `window.__perfResult`.

## Read the report

`e2e/perf-test/logfiles/` holds `perf-test.md` (the comparison table), `results.json` (every run)
and one `.cpuprofile` per scenario and branch. Open a profile in Chrome DevTools (Performance →
Load profile) to find where render time goes.

A row is a **Possible regression** when this branch's median is more than 10% and at least 1 ms
slower than the base branch, and no run of this branch is as fast as the slowest base run. A
flagged row, or a scenario that fails to render, fails the check. Fix the cost; never shrink a
scenario, lower its iterations, exclude it or loosen a threshold to clear a flag.
