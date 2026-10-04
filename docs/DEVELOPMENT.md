# Development

How the extension works, how to test it, and how to release a new version.

## Requirements

**To run the extension:** only Google Chrome (or another Chromium browser such
as Edge or Brave). The extension is plain JavaScript and CSS with no build
step and no runtime dependencies. Everything Chrome loads is in this
repository.

**To develop it** (run tests, package, release):

- [Node.js](https://nodejs.org/) 20 or newer (includes `npm`).
- Google Chrome installed in the usual place. The tests drive your installed
  Chrome, so no separate browser download is needed.
- One-time setup in the repository folder:

  ```sh
  npm install
  ```

  This installs the only development dependency, the
  [Playwright](https://playwright.dev/) test runner, into `node_modules/`
  (not committed). `package.json` and `package-lock.json` pin exactly what
  gets installed.

The check, package, release, and icon scripts use only Node's built-in
modules.

## Commands

| Command                     | What it does                                                           |
| --------------------------- | ---------------------------------------------------------------------- |
| `npm test`                  | Static checks, then the Playwright tests                               |
| `npm run check`             | Static checks (syntax, manifest, version, files, store rules)          |
| `npm run package`           | Builds `dist/print-github-doc-<version>.zip` (Chrome Web Store format) |
| `npm run release -- <bump>` | Cuts a release (see [Releasing](#releasing-a-version))                 |
| `npm run icons`             | Regenerates `icons/` from `scripts/make-icons.mjs`                     |
| `npm run store-assets`      | Regenerates the store screenshots and promo tiles in `store/`          |

## Files

```
manifest.json              Extension manifest (Manifest V3)
VERSION                    Current version; must match manifest.json
CHANGELOG.md               Release notes
PRIVACY.md                 Privacy policy (linked from the store listing)
src/
  background.js            Service worker: button state, right-click menu,
                           injects the CSS + content scripts on use
  selectors.js             Every GitHub DOM selector the extension depends on
  shared/defaults.js       Default settings (used by content scripts + options)
  content/                 Injected into the GitHub tab, in this order:
    github.js              Page type, finding the document, PDF title, folder
                           listing and rendered Markdown via GitHub's JSON
    prepare.js             Reversible page changes for printing; restore()
    bundle.js              Builds the multi-document folder printout
    panel.js               The options panel shown before printing
    main.js                Entry point: panel → (bundle) → prepare → print → restore
    print.css              Print-only rules, active while <html> has .ghp-printing
  options/                 Options page
icons/                     Toolbar and store icons (16, 32, 48, 128 px)
scripts/
  check.mjs                Static checks
  package.mjs, zip.mjs     Builds the release zip (no external zip tool needed)
  release.mjs              Version bump + changelog + tests + zip + commit + tag
  make-icons.mjs           Generates icons/
  store-assets.mjs         Generates store/ images from the live GitHub CLI docs
store/                     Chrome Web Store screenshots and promo tiles
test/
  print.spec.js            Playwright tests
  helpers.js               Loads fixtures as github.com, injects scripts, records
                           the page state at the moment window.print() is called
  fixtures/                Fake GitHub pages and JSON responses
playwright.config.js       Test runner settings (uses installed Chrome)
docs/                      Install, upgrade, development, and publishing guides
```

## How it works

1. **Button state.** On install and on every reload, `background.js` disables
   the toolbar button and adds a `declarativeContent` rule that enables it on
   `https://github.com` pages. It also creates the right-click menu item,
   limited to github.com pages.
2. **Trigger.** The toolbar button and the shortcut (`_execute_action`, default
   Alt+Shift+P) fire `chrome.action.onClicked`; the menu item fires
   `chrome.contextMenus.onClicked`. Both grant temporary access to that tab
   (`activeTab`) and call `run()`.
3. **Injection.** `run()` inserts `print.css`, then the scripts listed in
   `SCRIPT_FILES`. They share state through `globalThis.GHP`. The scripts are
   re-injected on every use, so each file assigns to globals rather than
   declaring `const`s at the top level.
4. **Panel** (`panel.js`, unless turned off). Shows the settings for this
   print, starting from the saved defaults. In parallel, `github.js` asks
   GitHub for the current folder's file list; if it holds Markdown files, a
   "Print all N Markdown files" choice appears. If no document was found, the
   panel offers "Print whole page" instead. Triggering the extension again
   while the panel is open acts as **Print**.
5. **Folder bundle** (`bundle.js`, if chosen). Fetches each file's rendered
   HTML (up to 4 at a time) and builds one element: a contents list, then a
   section per file. It's inserted off-screen next to the page's document so
   GitHub's page script has a chance to render diagrams inside it; any it
   doesn't render within 4 seconds print as their source text.
6. **Prepare** (`prepare.js`). Every change pushes an undo function onto a
   stack:
   - Forces light theme: `data-color-mode="light"` and
     `data-light-theme="light"` on `<html>`. GitHub's Primer CSS picks its
     color variables from these.
   - Pins `<picture><source media="(prefers-color-scheme: …)">` to the light
     image (those follow the OS setting, not GitHub's).
   - Sets `document.title` to a short name; Chrome uses it as the default
     **Save as PDF** file name.
   - Marks the document (or bundle) with `data-ghp-root` and each ancestor
     with `data-ghp-path`; the print CSS hides every other element.
   - Adds the header, opens `<details>`, marks links for URL printing, and
     marks section headings for page breaks, as the options say.
   - Switches lazy images to eager and waits up to 5 s for them.
   - If the page was dark, inverts diagram iframes still rendered dark
     (`invert + hue-rotate`); they're cross-origin and can't be restyled.
7. **Print and restore** (`main.js`). Closes the panel, calls
   `window.print()` (which blocks until the dialog closes in Chrome), then
   runs the undo stack in reverse.

### GitHub's JSON responses

Folder printing uses the JSON GitHub's own web app requests. Asking for a
GitHub URL with the header `Accept: application/json` returns:

- `/<owner>/<repo>/tree/<ref>/<dir>` →
  `payload.codeViewTreeRoute.{path, refInfo.name, tree.items[]}` where each
  item has `name`, `path`, `contentType` (`"file"` / `"directory"`).
- `/<owner>/<repo>/blob/<ref>/<path>` →
  `payload.codeViewBlobRoute.richText`: the rendered Markdown as an
  `<article class="markdown-body">` HTML string.
- For the repository home page, the extension requests `/tree/HEAD`, which
  resolves to the default branch.

The requests come from the GitHub page itself, so they carry the user's login
and work for private repositories. This isn't a documented API; if GitHub
changes it, folder printing will show "Couldn't load the folder". The fixtures
in `test/fixtures/github-json.js` show the shape the code expects.

## Permissions

| Permission           | Why                                                       |
| -------------------- | --------------------------------------------------------- |
| `activeTab`          | Access the current tab only after the user acts           |
| `scripting`          | Inject the CSS and scripts into that tab                  |
| `storage`            | Save settings (synced via the user's Chrome profile)      |
| `declarativeContent` | Enable the button only on github.com, without host access |
| `contextMenus`       | The right-click "Print this GitHub document" item         |

No host permissions. The only network requests are the same-origin GitHub
requests made for folder printing.

## Testing

### Automated tests

```sh
npm install   # once
npm test
```

The tests (`test/print.spec.js`) open fake GitHub pages in headless Chrome,
with every `github.com` request answered from `test/fixtures/`, so they run
offline and don't depend on GitHub. They inject the same scripts, in the same
order, as `background.js`, replace `chrome.storage` with a stand-in, and
replace `window.print()` with a function that records what the page looks
like in print media at that moment. They cover:

- only the document visible; light theme; header contents; PDF file name
- `<details>` expansion, link URLs on/off, header off, section page breaks
- the light `<picture>` variant with a dark OS; inverting dark diagrams
- the page being exactly restored afterwards
- the panel: per-print settings, remembering settings, Escape to cancel,
  triggering again to print
- folder printing: order (README first, natural sort), contents, headers,
  diagram source fallback, and the error path
- the "no document" fallback, with and without the panel

If `npm test` can't find Chrome, install Google Chrome, or run
`npx playwright install chromium` and remove `channel: "chrome"` from
`playwright.config.js`.

What the tests can't cover: the real Chrome print dialog, the extension's
service worker and permissions, and GitHub's live pages. That's what the
manual checklist is for.

### Manual test checklist

Load the extension (see [INSTALL.md](INSTALL.md)) and use **Save as PDF** for
each. Run the list with GitHub in light mode and again in dark mode
(Settings → Appearance).

- [ ] A `.md` file with code blocks, tables, and images
- [ ] A `.md` file with a Mermaid diagram
- [ ] A `.md` file with `<details>` sections
- [ ] A repository home page README
- [ ] A wiki page
- [ ] Folder printing from a `.md` file page, a folder page, and the
      repository home page, including in a private repository
- [ ] Folder printing of a folder with Mermaid diagrams
- [ ] A `.md` file in **Code** (raw) view offers "Print whole page"
- [ ] The toolbar button, the keyboard shortcut, and the right-click item
- [ ] The **Save as PDF** file name is short (e.g. `repo - file.pdf`)
- [ ] After closing the dialog, the page looks exactly as before
- [ ] The button is grey and the right-click item absent on a non-GitHub site

### Debugging

- Content scripts log to the **GitHub tab's** DevTools console (prefix
  `Print Doc for GitHub:`).
- `background.js` logs to the service worker console: on `chrome://extensions`,
  click **service worker** on the extension's card.
- Content scripts run in their own JavaScript context. To inspect their state
  (`GHP`, `GHP_DEFAULTS`), pick **Print Doc for GitHub** in the context dropdown at
  the top of the DevTools console (it says **top** by default) after
  triggering the extension once.
- To see the print layout without the dialog: in that same context, run
  `window.print = () => { debugger; }`, open DevTools → **⋮** → **More tools**
  → **Rendering** → **Emulate CSS media type: print**, then trigger the
  extension. Execution pauses with the page prepared.

### When GitHub changes its markup

If the extension can't find a document, or prints too much, update
`src/selectors.js`. Use DevTools (right-click the document → **Inspect**) to
find the element wrapping the rendered Markdown; it usually has the class
`markdown-body`. Then update the fixture in `test/fixtures/doc.html` to match
and run `npm test`.

## Making changes

1. Edit the files.
2. `npm test`.
3. Reload the extension at `chrome://extensions` (circular arrow on its card)
   and try it on a real GitHub page.
4. Add a line under `## [Unreleased]` in `CHANGELOG.md`. If users will notice
   a change in behavior (a default, a shortcut, a permission), also add a note
   to [UPGRADING.md](UPGRADING.md) under "What's new in each version".
5. Commit.

## Releasing a version

The project uses [Semantic Versioning](https://semver.org/): `patch` for
fixes, `minor` for new features, `major` for breaking changes.

With your changes committed and notes under `## [Unreleased]`:

```sh
npm run release -- minor              # or patch, major, or an exact 1.2.3
npm run release -- minor --dry-run    # show what would happen, change nothing
```

The script:

1. Refuses to run with uncommitted changes, an empty `[Unreleased]` section,
   or an existing tag for the new version.
2. Runs `npm test` (skip with `--skip-tests`).
3. Writes the new version to `VERSION`, `manifest.json`, and the README.
4. Moves the `[Unreleased]` notes into a new dated section in `CHANGELOG.md`
   and updates the comparison links.
5. Runs the static checks and builds `dist/print-github-doc-<version>.zip`.
6. Commits (`Release vX.Y.Z`) and creates the tag `vX.Y.Z`.

Then push it yourself:

```sh
git push origin main --tags
```

Optionally, create a GitHub release from the tag with the changelog section
as notes, and attach the zip.

## Security and store rules

The extension runs inside github.com pages, where a mistake could expose a
user's GitHub session, so:

- **No remote or dynamic code.** Everything that runs is in the package; no
  `eval`, `new Function`, remote scripts, or string timers. The extension
  pages' CSP is `script-src 'self'; object-src 'none'; base-uri 'none'`.
- **Least privilege.** No host permissions or content scripts: the extension
  touches a tab only after the user acts (`activeTab`), and only on
  `https://github.com`.
- **Fetched HTML is sanitized.** Folder printing inserts HTML from GitHub's
  JSON into the live page. GitHub sanitizes it already, but `bundle.js`
  also strips scripts, frames, forms, styles, event-handler attributes, and
  `javascript:`/non-image `data:` URLs before inserting it.
- **Same-origin only.** `fetchJson` refuses any URL, or redirect, that
  leaves github.com, and file paths from GitHub's JSON are rejected if they
  contain `..` or empty segments.
- **Bounded work.** Folder printing is capped at 100 files, fetched 4 at a
  time.
- **The panel is built safely.** Its static markup lives in a shadow root;
  all text from the page or GitHub is set with `textContent`.

`npm run check` enforces the store-facing parts: manifest field lengths, no
host permissions or content scripts, a strict CSP, icon sizes, no
remote-code patterns in `src/`, a name that doesn't start with "GitHub", and
a justification in [PUBLISHING.md](PUBLISHING.md) for every permission.

## Chrome Web Store

See [PUBLISHING.md](PUBLISHING.md) for the developer account, the listing
text and review answers, and how to ship updates. The store images in
`store/` come from `npm run store-assets`, which opens the public
[GitHub CLI docs](https://github.com/cli/cli/tree/trunk/docs) in Chrome,
injects the extension's scripts the same way the tests do, and composes the
1280x800 screenshots and promo tiles. It needs network access.

## Regenerating icons

```sh
npm run icons
```

This overwrites `icons/icon16.png`, `icon32.png`, `icon48.png`, and
`icon128.png`. The 128 px icon keeps the store's recommended 16 px of
transparent padding around 96 px of artwork.
