# Install and use Print Doc for GitHub, step by step

This guide assumes you've never added an extension to Chrome by hand. It takes
about five minutes. You don't need to install any other software: this folder
already contains everything the extension needs.

## What you're doing, in plain words

Chrome extensions are usually installed from the Chrome Web Store with one
click. This one isn't in the store. Instead, you give Chrome a folder on your
computer and tell it "run the extension in here." Chrome calls this
**loading an unpacked extension**. It's a normal, supported feature; you just
have to switch on **Developer mode** first to see the button for it.

Two things to know before you start:

- **Chrome runs the extension straight from the folder.** If you delete or move
  the folder later, the extension stops working. So put it somewhere permanent
  first (Step 1).
- **It's private to you.** It doesn't send anything anywhere. It only does
  something when you click its button on a GitHub page.

---

## Step 1: Get the folder onto your computer

Pick **one** of these.

### Option A: Download a ZIP (easiest)

1. Go to <https://github.com/brianpavane/chrome-plugin-print-github-doc>.
2. Click the green **Code** button, then **Download ZIP**.
3. Find the downloaded file (usually in your **Downloads** folder). It's called
   something like `chrome-plugin-print-github-doc-main.zip`.
4. Unzip it:
   - **Mac:** double-click the ZIP file.
   - **Windows:** right-click the ZIP file, choose **Extract All…**, then
     **Extract**.
5. You now have a folder called `chrome-plugin-print-github-doc-main`.
   **Move it somewhere permanent**, for example your **Documents** folder.
   Don't leave it in Downloads if you tend to clean that out.

### Option B: Clone with git (if you already use git)

```sh
git clone https://github.com/brianpavane/chrome-plugin-print-github-doc.git
```

### Check you have the right folder

Open the folder. You should see a file called **`manifest.json`** directly
inside it, next to folders named `src`, `icons`, and `docs`. (There are a few
other files and folders too, such as `scripts`, `test`, and `package.json`.
They're only for working on the extension's code; you can ignore them, and you
don't need to install anything for them.)

If you instead see one more folder with the same name, go into that one: the
folder you want is the one where `manifest.json` sits.

---

## Step 2: Open Chrome's extensions page

1. Open Chrome.
2. Click the address bar at the top, type `chrome://extensions`, and press
   **Enter**.

   (Or: click the **⋮** menu at the top right → **Extensions** →
   **Manage Extensions**.)

## Step 3: Turn on Developer mode

At the **top right** of the extensions page there's a switch labeled
**Developer mode**. Click it so it turns on (blue).

Three new buttons appear at the top left: **Load unpacked**, **Pack extension**,
and **Update**.

## Step 4: Load the extension

1. Click **Load unpacked**.
2. A file picker opens. Go to the folder from Step 1, the one that has
   `manifest.json` directly inside it.
3. Select that folder (click it once) and click **Select** (Mac: **Open**,
   Windows: **Select Folder**). Don't open `manifest.json` itself; choose the
   folder.

A card called **Print Doc for GitHub** now appears on the extensions page. If you
see a red error instead, see [Troubleshooting](#troubleshooting).

## Step 5: Pin the button to your toolbar

Chrome hides new extension buttons by default.

1. At the top right of Chrome, next to the address bar, click the **puzzle
   piece** icon (Extensions).
2. Find **Print Doc for GitHub** in the list and click the **pin** icon next to it.

A small icon (a white page on a dark square) now sits in your toolbar.

You can leave Developer mode on or turn it back off. The extension keeps
working either way.

---

## Using it

### Print one document

1. Open a GitHub document, for example the GitHub CLI's Linux install guide:
   <https://github.com/cli/cli/blob/trunk/docs/install_linux.md>.
   It works on:
   - a Markdown (`.md`) file,
   - a repository's front page (it prints the README),
   - a wiki page.
2. Start the extension in any of these three ways:
   - click its button in the toolbar,
   - press **Alt+Shift+P** (on a Mac: **Option+Shift+P**),
   - right-click anywhere on the page and choose
     **Print this GitHub document**.
3. A small **Print Doc for GitHub** panel appears in the top-right corner of the
   page. It shows the settings for this print (see
   [The options panel](#the-options-panel)). Change any you like, then click
   **Print** (or press **Enter**). To back out, click **Cancel** or press
   **Esc**.
4. Chrome's print window opens, showing only the document, in light colors.
5. Choose where it goes:
   - **To paper:** pick your printer under **Destination** and click **Print**.
   - **To a PDF file:** set **Destination** to **Save as PDF**, click **Save**,
     and pick where to save it. The file name is filled in for you, like
     `cli - install_linux.pdf`.
6. Close the print window. The GitHub page goes back to how it looked before.

Tip: pressing the shortcut a second time while the panel is open is the same
as clicking **Print**, so **Alt+Shift+P** twice prints right away.

The button looks grey, and the right-click item doesn't appear, on sites other
than GitHub. That's expected.

### Print a whole folder as one document

If the document is in a folder with other Markdown files, you can print them
all together as one PDF. For example, the GitHub CLI's
[`docs` folder](https://github.com/cli/cli/tree/trunk/docs) has 22 Markdown
guides; from the install guide above, you can print all of them as one
document.

1. Open any one of the files in that folder, the folder itself, or the
   repository's front page (for the top-level files).
2. Start the extension. After a moment, the panel shows
   **Print all N Markdown files in docs/ as one document**. Tick it.
3. Click **Print folder**. The panel shows "Loading documents… 3 of 22" while
   it gathers them. Then the print window opens. Click **Cancel** (or press
   **Esc**) at any time to stop.

The printout has a contents page listing every document, then each document
starting on a new page with its file name and address at the top. Files are
in name order, with `README.md` first and numbers sorted naturally
(`2-…` comes before `10-…`). Only files directly in that folder are included,
not ones in subfolders. It works in private repositories you have access to.

Diagrams (Mermaid) in a folder printout: GitHub usually draws them; if it
hasn't within a few seconds, the diagram's source text is printed instead. To
get the drawn diagram in that case, print that file on its own.

### If there's no document on the page

On GitHub pages without a rendered document (an issue list, a code file, or a
`.md` file in **Code** view instead of **Preview**), the panel says so and
offers **Print whole page**. That prints the page as it is, but in light
colors. If the folder has Markdown files, you can tick the folder option
instead.

### The options panel

Each tick box applies to this print only, unless you also tick
**Remember these settings**.

- **Include header:** the title, repository, file path, and page address at
  the top of the first page.
- **Print link URLs after link text:** a link like "the guide" prints as
  "the guide (https://github.com/…)" so the address is readable on paper.
- **Expand collapsed sections:** opens "click to expand" sections so their
  contents print.
- **Start each section on a new page:** each top-level heading starts a new
  page. The first section stays on page one with the title.
- **Remember these settings:** saves your choices as the new defaults.

### Tips for the print window

- **More settings → Headers and footers:** Chrome adds its own date, page title,
  and page numbers at the edges of each page. Untick this for a cleaner look;
  the extension already prints the title, repository, and URL at the top.
- **More settings → Background graphics:** leave it ticked to keep the light
  grey backgrounds behind code blocks.
- **Paper size and margins** are under **More settings** too.

### Settings

To change the defaults:

1. Right-click the extension's toolbar button and choose **Options**.
   (Or on `chrome://extensions`, click **Details** on the Print Doc for GitHub card,
   then **Extension options**.)
2. Tick or untick:
   - **Show the options panel:** on by default. Turn it off to skip the panel
     and print straight away with your defaults. (Folder printing needs the
     panel.)
   - **Include header**, **Print link URLs**, **Expand collapsed sections**,
     **Start each section on a new page:** the defaults the panel starts with.
     Out of the box: header on, link URLs off, expand on, new pages off.

Changes save automatically.

### Changing the keyboard shortcut

The default is **Alt+Shift+P** (Mac: **Option+Shift+P**). You can change it to
any letter or key combination you like, but Chrome only lets you do that on its
own shortcuts page, not inside the extension:

1. Open the extension's **Options** (see above). It shows the current shortcut
   and a **Change shortcut…** button. Click it.
   (Or type `chrome://extensions/shortcuts` in the address bar.)
2. Find **Print Doc for GitHub** and click the **pencil** icon next to the
   shortcut box.
3. Press the keys you want, for example **Ctrl+Shift+L**.
   Chrome requires **Ctrl** or **Alt** (Mac: **Command**, **Ctrl**, or
   **Option**) plus a letter or number; **Shift** is optional on top.
4. It saves right away. The dropdown next to it should say **In Chrome**.

If Alt+Shift+P is already used by another extension, the shortcut box will be
empty; set one here.

---

## Updating to a new version

1. Get the new files:
   - **ZIP:** download the ZIP again (Step 1) and replace the contents of your
     existing folder with the new files. Keep the folder in the same place.
   - **git:** run `git pull` in the folder.
2. Go to `chrome://extensions`.
3. On the **Print Doc for GitHub** card, click the circular **reload** arrow.
4. Reload any GitHub tabs you already had open.

Chrome does **not** update this extension by itself, even when the files
change; step 3 is what makes it use them. Your settings and custom shortcut
are kept. The full guide, including what changed in each version and how to go
back to an older one, is in [UPGRADING.md](UPGRADING.md).

To see which version you have, look at the number on the card, or the
[`VERSION`](../VERSION) file. What changed in each version is in
[`CHANGELOG.md`](../CHANGELOG.md).

## Removing it

1. Go to `chrome://extensions`.
2. On the **Print Doc for GitHub** card, click **Remove**, then confirm.
3. You can now delete the folder.

---

## Troubleshooting

**"Manifest file is missing or unreadable" when loading.**
You selected the wrong folder. Pick the folder that has `manifest.json`
directly inside it (see "Check you have the right folder" in Step 1).

**The extension disappeared, or shows an error after I moved files.**
Chrome runs it from the folder. If the folder moved or was deleted, remove the
extension and load it again from its new location.

**The button is grey.**
You're not on `github.com`. It only works there. If you are on GitHub and it's
still grey, reload the page.

**I click the button and nothing happens.**
Reload the GitHub page and try again. If you just installed or reloaded the
extension, pages that were already open need a reload.

**The panel says "No rendered document was found on this page."**
- On a `.md` file, GitHub may be showing the raw text. Click **Preview** above
  the file and try again.
- The page might not be a supported one (for example an issue or pull
  request). You can still use **Print whole page** to print it in light
  colors.
- GitHub may have changed its page layout. Please
  [open an issue](https://github.com/brianpavane/chrome-plugin-print-github-doc/issues).

**The folder option doesn't appear in the panel.**
- The folder has no other Markdown files, or you're on a page that isn't
  inside a repository folder (a wiki page, for example).
- Folder printing relies on how GitHub's website works internally, which can
  change. If it stops appearing everywhere, please open an issue.

**"N documents failed (…)" or "Couldn't load the folder: …"**
Some or all of the files couldn't be fetched from GitHub (each request gives
up after 15 seconds). Check you're still signed in to GitHub (for private
repositories). Then:
- **Retry failed** (or **Retry**) tries those files again; files that already
  loaded aren't fetched again.
- **Print N loaded** prints the files that did load. The contents page names
  the ones left out.
- **Cancel** or **Esc** closes the message.

**"Folder printing is temporarily unavailable…"**
GitHub didn't answer the request for the folder's file list the way the
extension expects. Reload the page and try again; you can still print the
single document. If it keeps happening, GitHub may have changed how its
website works. Please open an issue.

**The header says "Path from URL" instead of "File".**
The extension couldn't confirm which part of the address is the branch name,
which happens with branch names containing `/` (like `release/v2`). The path
shown may then include part of the branch name. Reloading the page usually
lets the extension confirm it.

**Checking what the extension last saw.**
The Options page shows the installed version and, under **Diagnostics**, the
last time you used the extension: the kind of page and whether a document was
found. "Document not found" on a normal Markdown page suggests GitHub changed
its layout; please open an issue.

**The panel is in the way / I never change the settings.**
Turn off **Show the options panel** in the extension's Options. Printing then
starts right away with your defaults.

**A diagram prints with odd colors.**
Mermaid diagrams are drawn by GitHub in a way the extension can't restyle. When
GitHub is in dark mode, the extension inverts the diagram's colors to make it
light, which can shift some colors slightly. For exact colors, switch GitHub
to light mode (profile picture → **Settings** → **Appearance**) before
printing.

**The keyboard shortcut doesn't work.**
Another extension or app may already use it. Set a different one at
`chrome://extensions/shortcuts`.

**Chrome warns about developer mode extensions.**
Some versions of Chrome show a reminder that you have developer-mode
extensions. That's about this extension, which you loaded yourself; you can
dismiss it.
