# Install and use Print GitHub Doc, step by step

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
inside it, next to folders named `src`, `icons`, and `docs`.

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

A card called **Print GitHub Doc** now appears on the extensions page. If you
see a red error instead, see [Troubleshooting](#troubleshooting).

## Step 5: Pin the button to your toolbar

Chrome hides new extension buttons by default.

1. At the top right of Chrome, next to the address bar, click the **puzzle
   piece** icon (Extensions).
2. Find **Print GitHub Doc** in the list and click the **pin** icon next to it.

A small icon (a white page on a dark square) now sits in your toolbar.

You can leave Developer mode on or turn it back off. The extension keeps
working either way.

---

## Using it

1. Open a GitHub document, for example
   <https://github.com/brianpavane/alexa-personal-audio/blob/main/docs/11-upgrading.md>.
   It works on:
   - a markdown (`.md`) file,
   - a repository's front page (it prints the README),
   - a wiki page.
2. Click the extension's toolbar button, or press **Alt+Shift+P**
   (on a Mac: **Option+Shift+P**).
3. Chrome's print window opens, showing only the document, in light colors.
4. Choose where it goes:
   - **To paper:** pick your printer under **Destination** and click **Print**.
   - **To a PDF file:** set **Destination** to **Save as PDF**, click **Save**,
     and pick where to save it.
5. Close the print window. The GitHub page goes back to how it looked before.

The button looks grey and does nothing on sites other than GitHub. That's
expected.

### Tips for the print window

- **More settings → Headers and footers:** Chrome adds its own date, page title,
  and page numbers at the edges of each page. Untick this for a cleaner look;
  the extension already prints the title, repository, and URL at the top.
- **More settings → Background graphics:** leave it ticked to keep the light
  grey backgrounds behind code blocks.
- **Paper size and margins** are under **More settings** too.

### Settings

To change what gets printed:

1. Right-click the extension's toolbar button and choose **Options**.
   (Or on `chrome://extensions`, click **Details** on the Print GitHub Doc card,
   then **Extension options**.)
2. **Print link URLs after link text:** off by default. When ticked, a link
   like "the guide" prints as "the guide (https://github.com/…)" so the address
   is readable on paper.

Changes save automatically.

### Changing the keyboard shortcut

The default is **Alt+Shift+P** (Mac: **Option+Shift+P**). You can change it to
any letter or key combination you like, but Chrome only lets you do that on its
own shortcuts page, not inside the extension:

1. Open the extension's **Options** (see above). It shows the current shortcut
   and a **Change shortcut…** button. Click it.
   (Or type `chrome://extensions/shortcuts` in the address bar.)
2. Find **Print GitHub Doc** and click the **pencil** icon next to the
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
3. On the **Print GitHub Doc** card, click the circular **reload** arrow.
4. Reload any GitHub tabs you already had open.

Chrome does **not** notice changed files on its own while it's running, so
step 3 matters. Quitting and reopening Chrome also picks up the new files, but
the reload arrow is quicker and certain.

Your settings and custom shortcut are kept when you update.

To see which version you have, look at the number on the card, or the
[`VERSION`](../VERSION) file. What changed in each version is in
[`CHANGELOG.md`](../CHANGELOG.md).

## Removing it

1. Go to `chrome://extensions`.
2. On the **Print GitHub Doc** card, click **Remove**, then confirm.
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

**"Couldn't find a rendered document on this page."**
- On a `.md` file, GitHub may be showing the raw text. Click **Preview** above
  the file and try again.
- The page might not be a supported one (for example an issue or pull request).
- GitHub may have changed its page layout. Please
  [open an issue](https://github.com/brianpavane/chrome-plugin-print-github-doc/issues).

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
