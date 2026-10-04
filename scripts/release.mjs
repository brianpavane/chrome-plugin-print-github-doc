// Cuts a release: bumps the version everywhere, turns the changelog's
// "Unreleased" entries into the new version's section, runs checks and
// tests, builds the zip, then commits and tags. Pushing is left to you.
//
// Usage:
//   node scripts/release.mjs patch|minor|major|X.Y.Z [--skip-tests] [--dry-run]
//   (or npm run release -- minor)
//
// Before running: commit your changes, with notes under "## [Unreleased]" in
// CHANGELOG.md (and an upgrade note in docs/UPGRADING.md if behavior changed).
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildPackage } from "./package.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const bump = args.find((a) => !a.startsWith("--"));
const dryRun = args.includes("--dry-run");
const skipTests = args.includes("--skip-tests");

const read = (f) => readFileSync(join(ROOT, f), "utf8");
const write = (f, s) => (dryRun ? null : writeFileSync(join(ROOT, f), s));
const run = (cmd, cmdArgs, opts = {}) =>
  execFileSync(cmd, cmdArgs, { cwd: ROOT, encoding: "utf8", stdio: opts.stdio || "pipe" });
const die = (msg) => {
  console.error(`✗ ${msg}`);
  process.exit(1);
};

if (!bump) die("Say which version: patch, minor, major, or X.Y.Z (e.g. npm run release -- minor)");

// 1. Preconditions.
if (run("git", ["status", "--porcelain"]).trim()) {
  die("Working tree has uncommitted changes. Commit or stash them first.");
}
const oldVersion = read("VERSION").trim();
const newVersion = nextVersion(oldVersion, bump);
if (run("git", ["tag", "--list", `v${newVersion}`]).trim()) die(`Tag v${newVersion} already exists.`);

let changelog = read("CHANGELOG.md");
const unreleased = changelog.match(/## \[Unreleased\]\n([\s\S]*?)(?=\n## \[)/);
if (!unreleased || !unreleased[1].trim()) {
  die('CHANGELOG.md has nothing under "## [Unreleased]". Add release notes there first.');
}

console.log(`Releasing ${oldVersion} → ${newVersion}${dryRun ? " (dry run)" : ""}`);

// 2. Tests run against the code as committed.
if (!skipTests) {
  console.log("Running tests…");
  run("npm", ["test"], { stdio: "inherit" });
}

// 3. Bump version in VERSION, manifest.json, README.md.
write("VERSION", newVersion + "\n");
write(
  "manifest.json",
  read("manifest.json").replace(/("version":\s*")[^"]+(")/, `$1${newVersion}$2`)
);
write(
  "README.md",
  read("README.md").replace(/^\*\*Version:\*\* \S+/m, `**Version:** ${newVersion}`)
);

// 4. Changelog: new section under Unreleased, and comparison links.
const today = new Date().toISOString().slice(0, 10);
changelog = changelog.replace("## [Unreleased]\n", `## [Unreleased]\n\n## [${newVersion}] - ${today}\n`);
changelog = changelog.replace(
  /^\[Unreleased\]: (.+)\/compare\/v[^.\s]+\.[^.\s]+\.[^.\s]+\.\.\.HEAD$/m,
  (_, base) =>
    `[Unreleased]: ${base}/compare/v${newVersion}...HEAD\n` +
    `[${newVersion}]: ${base}/compare/v${oldVersion}...v${newVersion}`
);
write("CHANGELOG.md", changelog);

if (dryRun) {
  console.log("Dry run: no files changed. Would update VERSION, manifest.json, README.md, CHANGELOG.md,");
  console.log(`build dist/print-github-doc-${newVersion}.zip, commit, and tag v${newVersion}.`);
  process.exit(0);
}

// 5. Verify and package.
run(process.execPath, ["scripts/check.mjs"], { stdio: "inherit" });
const pkg = buildPackage();
console.log(`✓ ${pkg.out}`);

// 6. Commit and tag.
run("git", ["add", "VERSION", "manifest.json", "README.md", "CHANGELOG.md"]);
run("git", ["commit", "-m", `Release v${newVersion}`]);
run("git", ["tag", "-a", `v${newVersion}`, "-m", `v${newVersion}`]);
console.log(`✓ Committed and tagged v${newVersion}.`);
console.log("\nNext:");
console.log("  git push origin main --tags");
console.log("  Reload the extension at chrome://extensions");

function nextVersion(current, how) {
  const [maj, min, pat] = current.split(".").map(Number);
  if (how === "major") return `${maj + 1}.0.0`;
  if (how === "minor") return `${maj}.${min + 1}.0`;
  if (how === "patch") return `${maj}.${min}.${pat + 1}`;
  if (/^\d+\.\d+\.\d+$/.test(how)) return how;
  die(`"${how}" isn't patch, minor, major, or X.Y.Z`);
}
