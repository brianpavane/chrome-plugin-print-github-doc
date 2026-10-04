# Print Doc for GitHub

A Chrome extension that cleanly prints a GitHub document, or saves it as a PDF.

GitHub pages are full of things you don't want on paper: the header, the file
tree, sidebars, buttons, the footer. And if you use GitHub in dark mode, you'd
print white text on a black background. This extension prints **only the
document**, always in **light colors**, using Chrome's normal print window, so
you can send it to a printer or choose **Save as PDF**.

**Version:** 0.3.0 ([changelog](CHANGELOG.md))

## Get started

**New to installing extensions? Follow the
[step-by-step install guide](docs/INSTALL.md).** It takes about five minutes
and needs no other software.

Short version, if you've done this before:

1. Download or clone this repository and keep the folder somewhere permanent.
2. Open `chrome://extensions`, turn on **Developer mode**, click
   **Load unpacked**, and choose this folder.
3. Pin the extension from the puzzle-piece menu.
4. On a GitHub document, click the button, press **Alt+Shift+P**
   (Mac: **Option+Shift+P**), or right-click → **Print this GitHub document**.
   Pick options in the panel that appears and click **Print**. The shortcut can
   be changed; see the
   [install guide](docs/INSTALL.md#changing-the-keyboard-shortcut).

## What it prints

Works on:

- Markdown files: `github.com/<owner>/<repo>/blob/<branch>/<path>.md`
- Repository front pages (prints the README): `github.com/<owner>/<repo>`
- Wiki pages: `github.com/<owner>/<repo>/wiki/<page>`

What you get:

- Just the document: no GitHub header, sidebars, file tree, or footer.
- Light colors, even when GitHub is in dark mode, including images that have
  separate light and dark versions.
- A header with the title, repository, file path, and page URL.
- Collapsed sections (`<details>`) opened up so their contents print.
- Long code lines wrapped instead of cut off, tables shown in full, fewer
  awkward page breaks, and all images loaded before printing.
- A short **Save as PDF** file name, like `cli - install_linux.pdf`.
- The page goes back to normal when you close the print window.

Choose per print, in a small panel before the print window opens (or set
defaults in **Options**):

- Include the header or not.
- Print link addresses after link text (off by default).
- Start each top-level section on a new page.
- **Print a whole folder** of Markdown files as one document: a contents page,
  then every file in order, each starting on a new page. Works in private
  repositories too.

On a GitHub page with no document, it offers to print the whole page in light
colors instead.

Mermaid diagrams are drawn by GitHub in a way the extension can't restyle. In
dark mode they're color-inverted so they print light; colors may shift
slightly.

## Privacy

The extension only runs when you use it (button, shortcut, or right-click) on
a github.com page, and only on that tab. It collects nothing and sends nothing
anywhere. The only network requests it makes are to github.com itself, to
fetch the other documents when you print a whole folder. Your settings are
stored in your Chrome profile. See the full [privacy policy](PRIVACY.md).

## Documentation

- [Install and use, step by step](docs/INSTALL.md), including removing and
  troubleshooting
- [Upgrading](docs/UPGRADING.md): how to update to a new version (Chrome does
  not do it automatically), what is kept, and what changed
- [Development](docs/DEVELOPMENT.md): how it works, permissions, testing, and
  releasing a new version
- [Publishing to the Chrome Web Store](docs/PUBLISHING.md): developer
  account, listing text, review answers, and shipping updates
- [Privacy policy](PRIVACY.md)
- [Changelog](CHANGELOG.md)

## Requirements

**To use it:** Google Chrome, or another Chromium-based browser (Edge, Brave,
and others). Nothing else needs to be installed: the extension is plain
JavaScript and CSS with no dependencies or build step, and everything it needs
is in this repository.

**To work on the code:** Node.js 20+ and `npm install`, which adds the test
runner. See [Development](docs/DEVELOPMENT.md#requirements).

---

Print Doc for GitHub is an independent project and is not affiliated with,
endorsed by, or sponsored by GitHub, Inc. GitHub is a trademark of GitHub,
Inc.
