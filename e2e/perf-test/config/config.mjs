// Runner settings. Never loosen a threshold to clear a flag (AGENTS.md).
export const config = {
  renderTypes: ['mount'],
  runs: 7,
  defaultIterations: 500,
  thresholds: {
    // A row is a possible regression when the median is more than this much slower...
    percent: 10,
    // ...and at least this many milliseconds slower, with no overlap between the runs.
    minMs: 1,
  },
};
