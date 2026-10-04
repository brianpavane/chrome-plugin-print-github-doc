# Changelog

All notable changes to this project are recorded here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project uses [Semantic Versioning](https://semver.org/).

The version number lives in two places that must match:
[`VERSION`](VERSION) and `"version"` in [`manifest.json`](manifest.json).

## [Unreleased]

## [0.2.0] - 2026-10-03

### Changed

- Link URLs are no longer printed by default. Turn them on in Options.
  If you had already changed this setting yourself, your choice is kept.

### Added

- Options page shows the current keyboard shortcut and a button that opens
  Chrome's shortcuts page to change it.
- Install guide: how to change the shortcut, and why updates need the reload
  button.

## [0.1.0] - 2026-10-03

### Added

- Toolbar button and keyboard shortcut (Alt+Shift+P) that print only the
  rendered document on GitHub markdown file pages, repository READMEs, and
  wiki pages, using Chrome's print dialog (print or Save as PDF).
- Forces GitHub's light theme while printing, including light variants of
  `<picture>` images and color-inverting dark Mermaid diagrams.
- Printed header with the document title, repository, file path, and URL.
- Expands collapsed `<details>` sections for printing.
- Prints link URLs after link text, with an option to turn this off.
- Print layout fixes: wrapped code lines, unclipped tables, fewer awkward page
  breaks, lazy images loaded before printing.
- Page is restored to its normal state after the print dialog closes.
- Button is enabled only on github.com.
- Options page, icons, and full documentation.

[Unreleased]: https://github.com/brianpavane/chrome-plugin-print-github-doc/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/brianpavane/chrome-plugin-print-github-doc/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/brianpavane/chrome-plugin-print-github-doc/releases/tag/v0.1.0
