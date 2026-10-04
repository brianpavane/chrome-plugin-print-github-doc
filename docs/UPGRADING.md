# Upgrading Print Doc for GitHub

How to move to a new version of the extension, what happens to your settings,
and what changed between versions.

## The one thing to know

**Chrome never updates an unpacked copy of this extension on its own.**

If you installed it from the Chrome Web Store, it updates automatically and
you can skip this guide. This page is for a copy loaded from a folder on
your computer ("unpacked"). Chrome only reads those files when it starts or when you tell it to reload. If the files in the folder
change while Chrome is open, Chrome keeps running the old version until you
reload it.

| What you do                                   | Does Chrome use the new files?                  |
| --------------------------------------------- | ----------------------------------------------- |
| Change the files in the folder                | No, not by itself                               |
| Click **reload** on the extension's card      | Yes, right away                                 |
| Quit Chrome completely and open it again      | Yes                                             |
| Reload or open a GitHub tab                   | No, the extension itself must be reloaded first |
| Turn the extension off and on                 | Yes, but reload is simpler                      |

## How to upgrade

### Step 1: Put the new files in the folder

Use the same folder you originally loaded into Chrome. Don't create a second
copy somewhere else; Chrome is tied to the original folder's location.

Pick the way you got the extension in the first place:

- **You cloned it with git:** open a terminal in the folder and run

  ```sh
  git pull
  ```

- **You downloaded a ZIP:**
  1. Download the new ZIP from
     <https://github.com/brianpavane/chrome-plugin-print-github-doc>
     (green **Code** button → **Download ZIP**) and unzip it.
  2. Open the new folder, select everything inside it, and copy it.
  3. Paste it into your existing extension folder, choosing **Replace** for
     every file.
  4. Delete the new download so you don't load the wrong copy by mistake.

- **The files were changed in place** (for example, someone edited the code in
  the folder Chrome reads from): nothing to do here; go to Step 2.

### Step 2: Reload the extension in Chrome

1. Type `chrome://extensions` in the address bar and press **Enter**.
2. Find the **Print Doc for GitHub** card.
3. Click the circular **reload** arrow (↻) on the card.

If the card shows a red **Errors** button after reloading, see
[Troubleshooting](#troubleshooting).

### Step 3: Reload your GitHub tabs

Reload any GitHub tabs that were open before you upgraded (press
**Ctrl+R**, or **Command+R** on a Mac). Tabs opened after the upgrade are fine.

### Step 4: Check the version

On `chrome://extensions`, the Print Doc for GitHub card shows the version number
(for example `0.2.0`). It should match the [`VERSION`](../VERSION) file in the
folder.

## What's kept when you upgrade

- **Your settings** (Options page): kept. They're stored in your Chrome
  profile, not in the folder.
- **Your keyboard shortcut:** kept, if you changed it.
- **The pinned toolbar button:** kept.

These are only lost if you **remove** the extension and load it again, rather
than reloading it. Removing it also clears its settings.

## What's new in each version

The full list is in [`CHANGELOG.md`](../CHANGELOG.md). Notes that affect how
the extension behaves after upgrading:

### 0.5.0 → 0.5.1

- **Fixes a stuck extension after a folder error.** In 0.5.0, closing the
  panel while it showed a folder loading problem left the extension
  unresponsive on that tab until you reloaded the page.
- **"File" is back in the header** whenever the branch can be confirmed.
  "Path from URL" now appears only for branch names containing `/` that
  GitHub's page doesn't confirm.
- **Retry failed** fetches only the documents that failed, and a folder
  printout names any documents it leaves out.
- **Enter on a panel checkbox prints** again.
- **Privacy:** the Options page's last-run diagnostic no longer stores the
  page address; one saved by 0.5.0 is removed when you update.

### 0.4.1 → 0.5.0

- **Folder printing is more resilient.** Slow requests time out, Cancel stops
  outstanding requests, and failed documents can be retried or omitted from
  an otherwise successful folder print.
- **Options shows the installed version and last-run diagnostics.** This can
  help distinguish a GitHub markup change from a page with no document.
- **Ambiguous branch paths are labeled “Path from URL.”** GitHub URLs do not
  reliably distinguish branch names containing slashes from file paths.
- The options panel has improved keyboard and screen-reader behavior. Existing
  settings and shortcuts are preserved.

### 0.4.0 → 0.4.1

- Documentation only (the publishing guide). The extension itself didn't
  change.

### 0.3.0 → 0.4.0

- **New name: Print Doc for GitHub.** The card on `chrome://extensions`, the
  panel, and the Options page use the new name; nothing else changes.
- **Chrome 102 or newer** is required.
- **Store and unpacked copies are separate.** Once the extension is on the
  Chrome Web Store, installing it from there gives you a second, separate
  extension. Remove the unpacked card, and re-apply your Options settings in
  the store copy (they don't carry over).

### 0.2.0 → 0.3.0

- **A panel now appears before printing.** It lets you change settings for
  one print and print a whole folder. If you'd rather print straight away as
  before, open **Options** and untick **Show the options panel**. Pressing the
  shortcut twice also prints right away.
- **New: print a whole folder** of Markdown files as one document. See
  [Print a whole folder](INSTALL.md#print-a-whole-folder-as-one-document).
- **New: right-click menu item** "Print this GitHub document". This needs a
  new permission (`contextMenus`). For an extension loaded from a folder,
  Chrome doesn't ask you to approve it; reloading is enough. The menu item
  appears after you reload the extension.
- **New settings** in Options: include header, expand collapsed sections,
  start each section on a new page, and show the panel. The defaults match
  what 0.2.0 did, so printouts look the same unless you change them.
- **Save as PDF file names** are now short, like `cli - install_linux.pdf`,
  instead of GitHub's long page title.
- **Pages without a document** now offer to print the whole page in light
  colors, instead of only showing a message.
- The repository now includes development tools (`package.json`, `scripts/`,
  `test/`). You don't need to install or run anything for them to use the
  extension.

### 0.1.0 → 0.2.0

- **Link URLs are no longer printed by default.** If you never touched this
  setting, links will now print as plain text. To get the old behavior back,
  open **Options** and tick **Print link URLs after link text**.
  If you had already changed the setting yourself, your choice is kept.
- **The Options page shows your shortcut** and has a **Change shortcut…**
  button. See [Changing the keyboard shortcut](INSTALL.md#changing-the-keyboard-shortcut).

## Going back to an older version

Each version is tagged in git (`v0.1.0`, `v0.2.0`, …).

- **git:** in the folder, run `git checkout v0.1.0` (use the version you want),
  then reload the extension. Run `git checkout main` to return to the latest.
- **ZIP:** on GitHub, open the repository's **Tags** list, pick the version,
  download its ZIP, and replace the folder contents as in Step 1.

## Troubleshooting

**The version number on the card didn't change.**
Chrome hasn't reloaded the files. Click the reload arrow again. If it still
shows the old number, check that the card's **Details → Source** points to the
folder you updated, not another copy.

**A red "Errors" button appeared after reloading.**
Some files may be missing or mixed between versions (common when a ZIP is only
partly copied). Replace the whole folder contents again, then reload. If it
persists, click **Errors** and copy the message into an
[issue](https://github.com/brianpavane/chrome-plugin-print-github-doc/issues).

**The button does nothing on a GitHub tab after upgrading.**
That tab was open before the upgrade. Reload the tab.

**My settings were reset.**
The extension was removed and loaded again instead of reloaded. Set them again
in **Options**.
