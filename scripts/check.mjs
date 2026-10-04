// Static checks that need nothing but Node:
// - every .js/.mjs file parses
// - manifest.json is valid and its version matches VERSION
// - every file the manifest, background script, and options page reference exists
// - Chrome Web Store rules: field lengths, no remote code, no host access,
//   icon sizes, and a store justification for every permission
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

// 4. Chrome Web Store readiness.
if (manifest) {
  if (manifest.manifest_version !== 3) fail("manifest_version must be 3");
  if (!manifest.name || manifest.name.length > 75) fail("name must be 1-75 characters");
  if (manifest.short_name && manifest.short_name.length > 12) fail("short_name must be at most 12 characters");
  if (!manifest.description || manifest.description.length > 132) {
    fail(`description must be 1-132 characters (is ${manifest.description?.length ?? 0})`);
  }
  // Store policy: a third-party brand may describe compatibility ("for
  // GitHub") but must not lead the name, which reads as official.
  if (/^github/i.test(manifest.name)) fail(`name "${manifest.name}" must not start with "GitHub"`);

  for (const key of ["host_permissions", "optional_host_permissions", "content_scripts", "externally_connectable", "web_accessible_resources"]) {
    if (manifest[key]) fail(`manifest.${key} is set; it widens access and must be justified in docs/PUBLISHING.md first`);
  }
  const csp = manifest.content_security_policy?.extension_pages || "";
  if (/unsafe-eval|unsafe-inline|https?:|\*/.test(csp)) fail(`CSP allows remote or inline code: ${csp}`);

  // Every permission needs a justification in the store listing notes.
  const publishing = readFileSync(join(ROOT, "docs/PUBLISHING.md"), "utf8");
  for (const perm of manifest.permissions || []) {
    if (!publishing.includes(`| \`${perm}\``)) fail(`Permission "${perm}" has no justification row in docs/PUBLISHING.md`);
  }

  for (const [size, file] of Object.entries(manifest.icons || {})) {
    const dims = pngSize(join(ROOT, file));
    if (!dims || dims.w !== Number(size) || dims.h !== Number(size)) {
      fail(`${file} should be ${size}x${size} PNG (is ${dims ? `${dims.w}x${dims.h}` : "not a PNG"})`);
    }
  }
}

// No remote or dynamic code: the store rejects extensions that can run code
// not included in the package.
const REMOTE_CODE = [
  [/\beval\s*\(/, "eval()"],
  [/\bnew\s+Function\s*\(/, "new Function()"],
  [/\bimportScripts\s*\(/, "importScripts()"],
  [/\bimport\s*\(/, "dynamic import()"],
  [/<script[^>]+src=["']?(https?:)?\/\//i, "remote <script>"],
  [/\bset(?:Timeout|Interval)\s*\(\s*["'`]/, "string passed to setTimeout/setInterval"],
  [/fetch\(\s*["'`]https?:/, "fetch() to an absolute URL"],
];
for (const file of walk(join(ROOT, "src"))) {
  if (!/\.(m?js|html)$/.test(file)) continue;
  const text = readFileSync(file, "utf8");
  for (const [re, what] of REMOTE_CODE) {
    if (re.test(text)) fail(`${relative(ROOT, file)} uses ${what}`);
  }
}

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s):\n\n${errors.join("\n\n")}`);
  process.exit(1);
}
console.log(`✓ checks passed (version ${version}, ${referenced.size} referenced files)`);

function pngSize(file) {
  try {
    const b = readFileSync(file);
    if (b.readUInt32BE(0) !== 0x89504e47) return null;
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  } catch {
    return null;
  }
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
