# Privacy Policy: Print Doc for GitHub

_Last updated: 2026-10-04_

Print Doc for GitHub is a Chrome extension that prints, or saves as PDF, the
document on a github.com page. This policy explains what it does with your
data. In short: **it collects nothing and sends nothing anywhere.**

## What the extension accesses

- **The GitHub page you print.** The extension can read and change a
  github.com tab only after you click its button, press its keyboard shortcut,
  or choose its right-click menu item, and only in that tab. It changes the
  page so that just the document prints, then puts the page back the way it
  was. Nothing is copied, stored, or sent off your device.
- **Other GitHub documents, when you print a folder.** If you choose to print
  a whole folder, the extension asks github.com for that folder's file list
  and for each Markdown file in it. These requests go only to github.com,
  from the GitHub page you are on, exactly as if you had opened those files
  yourself. They use your existing GitHub session, so private repositories
  you can see work too. The extension never sees or stores your GitHub
  password or session cookies.
- **Your settings.** Your print preferences (for example, whether to include
  a header) are saved with Chrome's `storage.sync` API. Chrome stores them in
  your Chrome profile and, if you have Chrome Sync turned on, syncs them
  between your own devices through your Google account. The extension's
  developer cannot see them.

## What the extension does not do

- It does not collect, log, or transmit personal information, browsing
  history, page content, or usage data.
- It does not use analytics, tracking, advertising, or cookies.
- It does not contact any server other than github.com, and only for folder
  printing as described above.
- It does not sell or share any data with anyone, because it has none.
- It does not run any code that isn't included in the extension package.

## Permissions

| Permission           | Used for                                                         |
| -------------------- | ---------------------------------------------------------------- |
| `activeTab`          | Access the current GitHub tab, only after you use the extension  |
| `scripting`          | Add the print styles and scripts to that tab                     |
| `storage`            | Save your print settings in your Chrome profile                  |
| `declarativeContent` | Enable the toolbar button only on github.com                     |
| `contextMenus`       | The right-click "Print this GitHub document" item                |

The extension has no host permissions: it cannot read any website, including
GitHub, until you use it on a tab.

## Changes

If this policy changes, the new version will be published at this address
with a new "Last updated" date. A change that affects your data would also be
listed in the extension's changelog.

## Contact

Questions about this policy: claude@brianpavane.org

Print Doc for GitHub is an independent project. It is not affiliated with,
endorsed by, or sponsored by GitHub, Inc. GitHub is a trademark of GitHub,
Inc.
