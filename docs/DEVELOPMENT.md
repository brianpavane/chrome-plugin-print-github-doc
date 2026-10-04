# Development

How the extension works and how to change and release it.

## Requirements

**To run the extension:** nothing besides Google Chrome (or another Chromium
browser such as Edge or Brave). The extension is plain JavaScript and CSS with
no build step, no dependencies, and no package manager. Everything Chrome loads
is in this repository.

**To regenerate the icons (optional):** [Node.js](https://nodejs.org/) 18 or
newer. The generated PNGs are committed, so this is only needed if you change
the icon design in `scripts/make-icons.mjs`. The script uses only Node's
built-in modules.

## Files

```
manifest.json            Extension manifest (Manifest V3)
VERSION                  Current version; must match manifest.json
CHANGELOG.md             Release notes
src/background.js        Service worker: enables the button on github.com,
                         injects CSS + scripts when the button/shortcut fires
src/selectors.js         Every GitHub DOM selector the extension depends on
src/content/print.js     Finds the document, prepares the page, prints, restores
src/content/print.css    Print-only rules, active while <html> has .ghp-printing
src/options/             Options page (options.html, options.js)
icons/                   Toolbar and store icons (16, 32, 48, 128 px)
scripts/make-icons.mjs   Generates icons/
docs/INSTALL.md          Step-by-step install and usage guide
docs/UPGRADING.md        How to upgrade, plus per-version upgrade notes
docs/DEVELOPMENT.md      This file
```

## How it works

1. **Button state.** On install, `background.js` disables the toolbar button
   and adds a `declarativeContent` rule that enables it on `https://github.com`
   pages.
2. **Trigger.** The toolbar button and the shortcut (`_execute_action` command,
   default Alt+Shift+P) both fire `chrome.action.onClicked`.
3. **Injection.** The click grants temporary access to that tab
   (`activeTab`). `background.js` inserts `print.css`, then runs
   `selectors.js` and `print.js` in the page.
4. **Preparation** (`print.js`):
   - Finds the rendered markdown using `GHP_SELECTORS.content`, in order. The
     first selector with a non-empty match wins; among its matches, the
     element with the most text is used.
   - Forces light theme by setting `data-color-mode="light"` and
     `data-light-theme="light"` on `<html>`. GitHub's Primer CSS uses these
     attributes to choose its color variables.
   - Rewrites `<picture><source media="(prefers-color-scheme: …)">` so the
     light image is used (these follow the OS setting, not GitHub's).
   - Marks the document with `data-ghp-root` and each ancestor with
     `data-ghp-path`. The print CSS hides every element that is neither.
   - Adds the header (title, repository, file, URL) as the document's first
     child.
   - Opens closed `<details>` elements.
   - If the option is on, sets `data-ghp-href` on links; the CSS prints it
     with `::after`.
   - Switches lazy images to eager and waits up to 5 s for them to decode.
   - If the page was in dark mode, adds `.ghp-invert` (an
     `invert + hue-rotate` filter) to diagram iframes whose `src` doesn't say
     `color_mode=light`. These iframes are cross-origin, so their contents
     can't be restyled.
5. **Print.** `window.print()` opens the dialog. In Chrome it blocks until the
   dialog closes.
6. **Restore.** Every change pushed an undo function onto a stack; they run in
   reverse order in a `finally` block, leaving the page as it was.

All print rules are inside `@media print` and scoped to `html.ghp-printing`,
so the page looks unchanged on screen apart from the theme switch while the
dialog is open.

## Permissions

| Permission           | Why                                                        |
| -------------------- | ---------------------------------------------------------- |
| `activeTab`          | Access the current tab only after the user clicks          |
| `scripting`          | Inject `print.css` and the scripts into that tab           |
| `storage`            | Save the options (synced via the user's Chrome profile)    |
| `declarativeContent` | Enable the button only on github.com, without host access  |

The extension has no host permissions and makes no network requests.

## Making changes

1. Edit the files.
2. Go to `chrome://extensions` and click the reload arrow on the extension's
   card. Content-script and CSS changes take effect on the next click; reload
   the GitHub tab if anything looks stale.
3. Run through the [manual test checklist](#manual-test-checklist).

Debugging:

- `print.js` logs to the **GitHub tab's** DevTools console (prefix
  `Print GitHub Doc:`).
- `background.js` logs to the service worker console: on `chrome://extensions`,
  click **service worker** on the extension's card.
- To inspect the print layout without the dialog, open DevTools on the GitHub
  tab → **⋮** → **More tools** → **Rendering** → **Emulate CSS media type:
  print**, then run the steps in `print.js` by hand, or comment out
  `window.print()` and the restore loop temporarily.

### When GitHub changes its markup

If the extension reports it can't find a document, or prints too much, update
`src/selectors.js`. Use DevTools (right-click the document → **Inspect**) to
find the element that wraps the rendered markdown; it usually has the class
`markdown-body`.

## Manual test checklist

Use **Save as PDF** for each. Run the whole list with GitHub in light mode and
again in dark mode (Settings → Appearance), and once with the link-URL option
on.

- [ ] A `.md` file with code blocks, tables, and images
- [ ] A `.md` file with a Mermaid diagram
- [ ] A `.md` file with `<details>` sections
- [ ] A repository home page README
- [ ] A wiki page
- [ ] A `.md` file in **Code** (raw) view shows the "couldn't find" message
- [ ] The keyboard shortcut works
- [ ] After closing the dialog, the page looks exactly as before
- [ ] The button is grey on a non-GitHub site

## Releasing a version

The project uses [Semantic Versioning](https://semver.org/): bump the patch
number for fixes, minor for new features, major for breaking changes.

1. Update the version in **both** `VERSION` and `manifest.json` (`"version"`).
2. In `CHANGELOG.md`, rename `[Unreleased]` entries into a new
   `## [x.y.z] - YYYY-MM-DD` section, leave an empty `[Unreleased]` heading,
   and update the comparison links at the bottom.
   If the release changes behavior users will notice (a default, a
   shortcut, a permission), add a section to `docs/UPGRADING.md` under
   "What's new in each version".
3. Commit, then tag and push:

   ```sh
   git commit -am "Release vX.Y.Z"
   git tag -a vX.Y.Z -m "vX.Y.Z"
   git push origin main --tags
   ```

4. Optional: create a GitHub release from the tag with the changelog section as
   its notes.

## Regenerating icons

```sh
node scripts/make-icons.mjs
```

This overwrites `icons/icon16.png`, `icon32.png`, `icon48.png`, and
`icon128.png`.
