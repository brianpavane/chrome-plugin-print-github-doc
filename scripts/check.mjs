// Static checks that need nothing but Node:
// - every .js/.mjs file parses
// - manifest.json is valid and its version matches VERSION
// - every file the manifest, background script, and options page reference exists
// Run: node scripts/check.mjs   (or npm run check)
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const fail = (msg) => errors.push(msg);

// 1. Syntax.
for (const file of walk(join(ROOT, "src")).concat(walk(join(ROOT, "scripts")))) {
  if (!/\.m?js$/.test(file)) continue;
  try {
    execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
  } catch (err) {
    fail(`Syntax error in ${relative(ROOT, file)}:\n${err.stderr}`);
  }
}

// 2. Manifest and version.
let manifest;
try {
  manifest = JSON.parse(readFileSync(join(ROOT, "manifest.json"), "utf8"));
} catch (err) {
  fail(`manifest.json is not valid JSON: ${err.message}`);
}
const version = readFileSync(join(ROOT, "VERSION"), "utf8").trim();
if (!/^\d+\.\d+\.\d+$/.test(version)) fail(`VERSION "${version}" is not x.y.z`);
if (manifest && manifest.version !== version) {
  fail(`manifest.json version ${manifest.version} doesn't match VERSION ${version}`);
}
const changelog = readFileSync(join(ROOT, "CHANGELOG.md"), "utf8");
if (!changelog.includes(`## [${version}]`)) fail(`CHANGELOG.md has no "## [${version}]" section`);

// 3. Referenced files exist.
const referenced = new Set();
if (manifest) {
  referenced.add(manifest.background?.service_worker);
  referenced.add(manifest.options_ui?.page);
  Object.values(manifest.icons || {}).forEach((f) => referenced.add(f));
  Object.values(manifest.action?.default_icon || {}).forEach((f) => referenced.add(f));
}
const background = readFileSync(join(ROOT, "src/background.js"), "utf8");
for (const [, f] of background.matchAll(/"(src\/[^"]+\.(?:js|css))"/g)) referenced.add(f);
const optionsHtml = readFileSync(join(ROOT, "src/options/options.html"), "utf8");
for (const [, f] of optionsHtml.matchAll(/src="([^"]+)"/g)) {
  referenced.add(relative(ROOT, join(ROOT, "src/options", f)));
}
for (const f of referenced) {
  if (f && !existsSync(join(ROOT, f))) fail(`Missing file referenced by the extension: ${f}`);
}

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s):\n\n${errors.join("\n\n")}`);
  process.exit(1);
}
console.log(`✓ checks passed (version ${version}, ${referenced.size} referenced files)`);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
