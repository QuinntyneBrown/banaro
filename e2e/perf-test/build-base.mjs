// Builds the perf-test app of a base ref for a local comparison:
//
//   node perf-test/build-base.mjs <ref> <out-dir>
//   npm run perf-test -- --baseline <out-dir>/browser --fail-on-regression
//
// Checks the ref out into a temporary git worktree, links this checkout's frontend/node_modules
// into it, builds with NG_BUILD_MANGLE=0, then removes the link and the worktree.

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, symlinkSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const [ref, out] = process.argv.slice(2);
if (!ref || !out) {
  console.error("Usage: node perf-test/build-base.mjs <ref> <out-dir>");
  process.exit(2);
}

const repo = resolve(import.meta.dirname, "../..");
const worktree = join(mkdtempSync(join(tmpdir(), "banaro-perf-base-")), "src");
const link = join(worktree, "frontend", "node_modules");
const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, NG_BUILD_MANGLE: "0" },
  });

run("git", ["worktree", "add", "--detach", worktree, ref], repo);
try {
  symlinkSync(join(repo, "frontend", "node_modules"), link, "junction");
  run(
    "npx",
    ["ng", "build", "perf-test", "--output-path", resolve(out)],
    join(worktree, "frontend"),
  );
} finally {
  // unlink removes the junction itself, never the node_modules it points to.
  if (existsSync(link)) unlinkSync(link);
  run("git", ["worktree", "remove", "--force", worktree], repo);
}
