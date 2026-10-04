// Builds dist/print-github-doc-<version>.zip containing only what Chrome
// needs (manifest, src, icons): the file a Chrome Web Store upload expects.
// Run: node scripts/package.mjs   (or npm run package)
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createZip } from "./zip.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCLUDE = ["manifest.json", "src", "icons"];

export function buildPackage() {
  const version = readFileSync(join(ROOT, "VERSION"), "utf8").trim();
  const files = INCLUDE.flatMap((p) => walk(join(ROOT, p)))
    // No dotfiles (.DS_Store, editor swap files) in the store upload.
    .filter((f) => !relative(ROOT, f).split(sep).some((part) => part.startsWith(".")))
    .sort();
  const zip = createZip(
    files.map((f) => ({ name: relative(ROOT, f).split(sep).join("/"), data: readFileSync(f) }))
  );
  const out = join(ROOT, "dist", `print-github-doc-${version}.zip`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, zip);
  return { out: relative(ROOT, out), count: files.length, bytes: zip.length };
}

function walk(p) {
  return statSync(p).isDirectory() ? readdirSync(p).flatMap((n) => walk(join(p, n))) : [p];
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { out, count, bytes } = buildPackage();
  console.log(`✓ ${out} (${count} files, ${(bytes / 1024).toFixed(1)} KB)`);
}
