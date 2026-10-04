# Print GitHub Doc

A Chrome extension that cleanly prints a GitHub document, or saves it as a PDF.

GitHub pages are full of things you don't want on paper: the header, the file
tree, sidebars, buttons, the footer. And if you use GitHub in dark mode, you'd
print white text on a black background. This extension prints **only the
document**, always in **light colors**, using Chrome's normal print window, so
you can send it to a printer or choose **Save as PDF**.

**Version:** 0.1.0 ([changelog](CHANGELOG.md))

## Get started

**New to installing extensions? Follow the
[step-by-step install guide](docs/INSTALL.md).** It takes about five minutes
and needs no other software.

Short version, if you've done this before:

1. Download or clone this repository and keep the folder somewhere permanent.
2. Open `chrome://extensions`, turn on **Developer mode**, click
   **Load unpacked**, and choose this folder.
3. Pin the extension from the puzzle-piece menu.
4. On a GitHub document, click the button or press **Alt+Shift+P**
   (Mac: **Option+Shift+P**).

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
- Link addresses printed after link text (can be turned off in **Options**).
- Long code lines wrapped instead of cut off, tables shown in full, fewer
  awkward page breaks, and all images loaded before printing.
- The page goes back to normal when you close the print window.

Mermaid diagrams are drawn by GitHub in a way the extension can't restyle. In
dark mode they're color-inverted so they print light; colors may shift
slightly.

## Privacy

The extension only runs when you click its button (or press the shortcut) on
a github.com page, and only on that tab. It collects nothing and makes no
network requests. Your one setting (print link URLs) is stored in your Chrome
profile.

## Documentation

- [Install and use, step by step](docs/INSTALL.md), including updating,
  removing, and troubleshooting
- [Development](docs/DEVELOPMENT.md): how it works, permissions, testing, and
  releasing a new version
- [Changelog](CHANGELOG.md)

## Requirements

Google Chrome, or another Chromium-based browser (Edge, Brave, and others).
Nothing else needs to be installed: the extension is plain JavaScript and CSS
with no dependencies or build step, and everything it needs is in this
repository. Node.js is only needed if you want to regenerate the icons (see
[Development](docs/DEVELOPMENT.md#regenerating-icons)).
