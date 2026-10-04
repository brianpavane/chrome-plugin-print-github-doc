# Publishing to the Chrome Web Store

Everything needed to publish Print Doc for GitHub publicly: setting up the
developer account (once), the listing text and answers to paste into the
dashboard, the images, and how to ship updates.

`npm run check` reads the permission table in this file: every permission in
`manifest.json` must have a row in
[Permission justifications](#permission-justifications), so the store answers
can't drift from the code.

## Contents

- [Before you submit](#before-you-submit)
- [1. Create the developer account (once)](#1-create-the-developer-account-once)
- [2. Host the privacy policy](#2-host-the-privacy-policy)
- [3. Build the upload](#3-build-the-upload)
- [4. Create the item and fill in each tab](#4-create-the-item-and-fill-in-each-tab)
- [5. Submit for review](#5-submit-for-review)
- [6. After it's published](#6-after-its-published)
- [Publishing an update](#publishing-an-update)
- [If the review is rejected](#if-the-review-is-rejected)

## Before you submit

The repository stays **private**; only the extension is published. Two
things must be done before the first submission:

1. **Give the privacy policy a public address.** The store requires a
   privacy policy URL that anyone can open without signing in. A link to
   `PRIVACY.md` in this private repository returns "404" for reviewers and
   users, so publish a copy as a public gist instead
   (see [step 2](#2-host-the-privacy-policy)). Keep the gist in step with
   `PRIVACY.md` whenever the policy changes.
2. **Confirm the contact email in [`PRIVACY.md`](../PRIVACY.md).** The
   "Contact" section lists claude@brianpavane.org. The policy is public, so
   this address will be visible to anyone. Change it to the address you
   want to receive user questions at (it can be the same as the developer
   account's contact email) before creating the gist.

The first public release is **0.4.0**: once the changes are committed, run
`npm run release -- minor` to produce it (see
[Publishing an update](#publishing-an-update) for what the script does).

## 1. Create the developer account (once)

You need a Google account, a card for a one-time US $5 fee, and about 15
minutes.

1. **Choose the Google account.** The item belongs to this account, and moving
   it to another account later means a support request. Use an account you
   will keep long-term. A personal Gmail account is fine.
2. **Turn on 2-Step Verification** for that account, if it isn't on already.
   The store won't let you publish without it. Go to
   <https://myaccount.google.com/security>, then **2-Step Verification** →
   **Get started**, and follow the steps (an authenticator app or passkey is
   better than SMS).
3. **Open the developer dashboard** at
   <https://chrome.google.com/webstore/devconsole> and sign in with that
   account.
4. **Accept the developer agreement** and read the
   [Program Policies](https://developer.chrome.com/docs/webstore/program-policies/)
   it links to.
5. **Pay the $5 registration fee.** It's charged once, not per extension or
   per year.
6. **Fill in the Account tab** (left sidebar → **Account**):
   - **Publisher name:** shown on the listing as "Offered by". Your name, or
     a project name.
   - **Contact email:** enter it and click the verification link Google
     emails you. You can't publish until it's verified. This address is
     where review results and policy notices arrive, so use one you read.
   - **Trader status:** the EU Digital Services Act requires you to declare
     whether you're a *trader* (acting for a business, or making money from
     the extension) or a *non-trader*. For a free, personal hobby project,
     choose **non-trader**. A trader has to verify and publicly show a
     business address, phone number, and email on the listing.
7. Save. The account is ready; you won't need to repeat these steps.

Optional: under **Account**, set up a **group publisher** later if other
people will help maintain the listing.

## 2. Host the privacy policy

The store needs a public web address for [`PRIVACY.md`](../PRIVACY.md). It
has to be reachable without signing in. **This repository is private**, so
a link to the file here won't work for reviewers or users. Publish a copy as
a public gist:

1. Make sure the contact email in `PRIVACY.md` is the one you want public
   (see [Before you submit](#before-you-submit)).
2. Go to <https://gist.github.com> while signed in to GitHub.
3. Name the file `PRIVACY.md` and paste the full contents of `PRIVACY.md`.
4. Click the arrow next to the green button and choose
   **Create public gist** (not secret).
5. Copy the gist's address, e.g.
   `https://gist.github.com/<username>/<id>`. This is the privacy policy URL
   for the Privacy tab.

When `PRIVACY.md` changes, edit the gist to match. The address stays the
same.

Before submitting, open the address in a private (incognito) window to make
sure it loads.

## 3. Build the upload

From a clean, committed tree with the version you want to publish:

```sh
npm test
npm run package
```

Upload `dist/print-github-doc-<version>.zip`. It contains only
`manifest.json`, `src/`, and `icons/`.

## 4. Create the item and fill in each tab

In the dashboard, click **New item** and upload the zip. Then work through
the tabs in the left sidebar. The text to paste is below.

### Package

Nothing to fill in. It shows the uploaded version.

### Store listing

**Description** (paste as is):

```text
Print a GitHub document, or save it as a PDF, without the rest of GitHub.

GitHub pages are full of things you don't want on paper: the header, the file tree, sidebars, buttons, and the footer. And in dark mode you'd print white text on a black background. Print Doc for GitHub prints only the document, always in light colors, using Chrome's normal print window, so you can send it to a printer or choose Save as PDF.

WORKS ON
• Markdown files in a repository
• Repository front pages (prints the README)
• Wiki pages

WHAT YOU GET
• Just the document: no GitHub header, sidebars, file tree, or footer
• Light colors even when GitHub is in dark mode, including images with separate light and dark versions
• A header with the title, repository, file path, and URL (optional)
• Collapsed sections opened so their contents print
• Long code lines wrapped, tables shown in full, fewer awkward page breaks, all images loaded first
• A short Save as PDF file name, like "cli - install_linux.pdf"
• The page goes back to normal when you close the print window

PRINT A WHOLE FOLDER
Print every Markdown file in a folder as one document: a contents page, then each file on a new page, README first. Works in private repositories you have access to.

HOW TO USE
On a GitHub document, click the toolbar button, press Alt+Shift+P (Option+Shift+P on a Mac), or right-click and choose "Print this GitHub document". Pick options in the small panel and click Print. Defaults, the panel, and the shortcut can be changed in Options.

PRIVACY
The extension runs only when you use it, only on github.com, and only in that tab. It collects nothing and sends nothing anywhere. It has no access to any website until you click it.

Print Doc for GitHub is an independent project and is not affiliated with, endorsed by, or sponsored by GitHub, Inc. GitHub is a trademark of GitHub, Inc.
```

| Field | Value |
| --- | --- |
| Category | **Productivity** → **Developer Tools** (or **Tools** if Developer Tools isn't offered) |
| Language | English |
| Store icon | `icons/icon128.png` (96 px artwork with 16 px transparent padding, as the store recommends) |
| Global promo video | Leave empty |
| Screenshots | `store/screenshot-1-panel.jpg`, `store/screenshot-2-clean.jpg`, `store/screenshot-3-folder.jpg` (1280x800) |
| Small promo tile | `store/promo-small-440x280.jpg` |
| Marquee promo tile | `store/promo-marquee-1400x560.jpg` |
| Official URL | Leave as **None** (it needs a domain verified in Google Search Console) |
| Homepage URL | Leave empty (the repository is private) |
| Support URL | Leave empty; the listing shows the developer contact email for support |
| Mature content | No |

The images are generated from the live, public GitHub CLI docs by
`npm run store-assets`. Rerun it after visible changes to the panel or print
layout.

### Privacy

**Single purpose description:**

```text
Print, or save as PDF, the document shown on a github.com page (a Markdown file, README, or wiki page) without GitHub's surrounding interface, in light colors.
```

#### Permission justifications

Paste the "Justification" text into the box for each permission.

| Permission | Justification |
| --- | --- |
| `activeTab` | When the user clicks the toolbar button, presses the shortcut, or uses the right-click item on a github.com page, the extension needs temporary access to that one tab to prepare the document for printing. It requests no host permissions; activeTab limits access to the tab the user acted on. |
| `scripting` | Used with activeTab to insert the extension's own print stylesheet and scripts into the current github.com tab when the user asks to print. All injected code is included in the package. |
| `storage` | Saves the user's print settings (include header, print link URLs, expand collapsed sections, section page breaks, show options panel) with chrome.storage.sync. No other data is stored. |
| `declarativeContent` | Enables the toolbar button only on https://github.com pages, without needing host permissions to read page URLs. |
| `contextMenus` | Adds a "Print this GitHub document" item to the right-click menu on github.com pages, as an alternative to the toolbar button. |

**Are you using remote code?** No, I am not using remote code.

**Data usage:** leave **every** data-type box unchecked. The extension reads
the GitHub page only to rearrange it for printing, on the user's device; it
never collects or transmits it. Under Chrome Web Store definitions, data that
never leaves the device isn't "collected".

Then tick all three certifications:

- I do not sell or transfer user data to third parties, outside of the
  approved use cases.
- I do not use or transfer user data for purposes that are unrelated to my
  item's single purpose.
- I do not use or transfer user data to determine creditworthiness or for
  lending purposes.

**Privacy policy URL:** the address from
[step 2](#2-host-the-privacy-policy).

### Distribution

| Field | Value |
| --- | --- |
| Payments | Free of charge |
| Visibility | **Public** |
| Regions | All regions |

### Test instructions

Optional, but it helps reviewers. No account is needed:

```text
No login needed. Open https://github.com/cli/cli/blob/trunk/docs/install_linux.md and click the extension's toolbar button (or press Alt+Shift+P). In the panel, click Print: Chrome's print window shows only the document. To test folder printing, tick "Print all … Markdown files in docs/" first. On any non-GitHub site the button is disabled.
```

## 5. Submit for review

1. Click **Submit for review**.
2. In the dialog, **untick "Publish automatically after the review"** for
   the first release. When it's approved you'll get an email, and the item
   waits for you to click **Publish**. That gives you a moment to check the
   listing before it goes live. (Approved items left unpublished for 30 days
   go back to draft.)
3. Review usually takes from a few hours to a few days. The status shows on
   the item's page, and the decision arrives at the contact email.

## 6. After it's published

1. Note the listing URL, `https://chromewebstore.google.com/detail/<id>`.
   The 32-letter ID is on the item's page in the dashboard.
2. Install it from the store, and **remove the unpacked copy** from
   `chrome://extensions`, so you're testing what users get. Settings don't
   carry over between the two copies, since they're different extensions to
   Chrome.
3. Add the store link to the top of the README and to
   [INSTALL.md](INSTALL.md), replacing the load-unpacked steps as the main
   install route (keep them for developers).
4. Store installs update themselves: Chrome checks every few hours.

## Publishing an update

1. Make and commit the changes, with notes under `## [Unreleased]` in the
   changelog.
2. `npm run release -- patch` (or `minor` / `major`). The store rejects an
   upload whose version isn't higher than the published one; the release
   script handles that.
3. `git push origin main --tags`.
4. In the dashboard, open the item → **Package** → **Upload new package**,
   and upload the new zip from `dist/`.
5. If permissions, data use, or the visible behavior changed, update the
   **Privacy** tab answers and this file, then rerun
   `npm run store-assets` and replace the screenshots if they changed.
6. **Submit for review.** Updates are reviewed too, usually faster.

Adding a permission can disable the extension for existing users until they
accept a new warning, so avoid it unless it's essential; `npm run check`
flags any host access or content scripts so they get a deliberate decision.

## If the review is rejected

The email names the policy and a violation ID. Common ones and fixes:

| Rejection | What to check |
| --- | --- |
| **Purple Potassium** (excessive permissions) | Every permission is used and justified in the table above. |
| **Blue Argon** (remotely hosted code) | Nothing outside the zip is executed. `npm run check` scans for this. |
| **Red Titanium** (obfuscation) | The code is shipped as written; don't minify or bundle it. |
| **Purple Lithium** (privacy policy / disclosures) | The policy URL loads in a private window and the Privacy tab answers match `PRIVACY.md`. |
| **Yellow Zinc** (missing or insufficient listing info) | Description, screenshots, and icon are present and match what the extension does. |
| **Yellow Argon** (keyword spam) | The description doesn't repeat keywords or list unrelated terms. |
| Impersonation or trademark | The name doesn't lead with "GitHub" and the description includes the "not affiliated" sentence. |

The email always states the policy in words; trust that over this table.

Fix the issue, upload a new version (bump the version), and resubmit. To
appeal instead, reply through the link in the rejection email.
