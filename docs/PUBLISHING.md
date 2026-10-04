# Publishing to the Chrome Web Store

Everything needed to publish Print Doc for GitHub publicly: setting up the
developer account (once), the listing text and answers to paste into the
dashboard, the images, and how to ship updates.

`npm run check` reads the permission table in this file: every permission in
`manifest.json` must have a row in
[Permission justifications](#permission-justifications), so the store answers
can't drift from the code.

## Contents

- [At a glance](#at-a-glance)
- [Before you submit](#before-you-submit)
- [1. Create the developer account (once)](#1-create-the-developer-account-once)
- [2. Host the privacy policy](#2-host-the-privacy-policy)
- [3. Build and check the zip](#3-build-and-check-the-zip)
- [4. Upload the zip (create the item)](#4-upload-the-zip-create-the-item)
- [5. Fill in each tab](#5-fill-in-each-tab)
- [6. Submit for review](#6-submit-for-review)
- [7. Publish and check the live listing](#7-publish-and-check-the-live-listing)
- [Publishing an update](#publishing-an-update)
- [If the upload is refused](#if-the-upload-is-refused)
- [If the review is rejected](#if-the-review-is-rejected)

## At a glance

The whole process, first time through. Each step links to the details.

1. Decide on the public contact email and put it in `PRIVACY.md`
   ([Before you submit](#before-you-submit)).
2. Create the developer account: 2-Step Verification, $5 fee, verified
   email, non-trader ([step 1](#1-create-the-developer-account-once)).
3. Publish `PRIVACY.md` as a public gist and copy its address
   ([step 2](#2-host-the-privacy-policy)).
4. Build the zip with `npm run package` and check it
   ([step 3](#3-build-and-check-the-zip)).
5. In the dashboard, click **New item** and upload the zip
   ([step 4](#4-upload-the-zip-create-the-item)).
6. Fill in **Store listing**, **Privacy**, **Distribution**, and
   **Test instructions**, pasting the text from this file
   ([step 5](#5-fill-in-each-tab)).
7. Click **Submit for review**, with automatic publishing turned off
   ([step 6](#6-submit-for-review)).
8. When the approval email arrives, click **Publish**, then install it from
   the store ([step 7](#7-publish-and-check-the-live-listing)).

Plan on about an hour for steps 1-7, then a wait of hours to days for the
review.

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

The version to upload first is the latest release tag (**0.5.1** at the
time of writing): the `VERSION` file always holds the current version.

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

## 3. Build and check the zip

The store takes the extension as a single `.zip` file with `manifest.json`
at its top level. `npm run package` builds exactly that.

### Simple version

In Terminal, in the repository folder:

```sh
git checkout main
git pull
npm test
npm run package
```

The last line printed names the file, for example:

```text
✓ dist/print-github-doc-0.5.1.zip (16 files, 24.2 KB)
```

That file, in the `dist/` folder of the repository, is what you upload.

### Details

- **Build from the released version.** Run this on a clean `main` at the
  release tag (`git status` should say "nothing to commit"). The version in
  the zip comes from `manifest.json`, and the store refuses a version it has
  already seen, so each upload has to be a new release
  ([Publishing an update](#publishing-an-update)).
- **`dist/` isn't in git.** It's ignored on purpose, so a fresh clone or a
  different computer won't have the zip. Run `npm install` once there, then
  `npm run package` again; the result is the same.
- **What's inside.** Only `manifest.json`, `src/`, and `icons/`: no tests,
  docs, scripts, store images, or hidden files like `.DS_Store`. To see the
  list:

  ```sh
  unzip -l dist/print-github-doc-$(cat VERSION).zip
  ```

  `manifest.json` must appear with no folder in front of it (not
  `print-github-doc/manifest.json`).
- **Don't open or rebuild the zip by hand.** On a Mac, double-clicking the
  zip unpacks it into a folder; that's fine for looking, but upload the
  original `.zip`, not the folder. Don't create the zip with Finder's
  **Compress** command either: it puts everything inside a folder and adds a
  `__MACOSX` folder, and the store then can't find `manifest.json`.
- **Optional: try the exact zip in Chrome first.** This tests what reviewers
  will run, rather than your working folder:

  ```sh
  rm -rf /tmp/pdg-check && mkdir /tmp/pdg-check
  unzip -q dist/print-github-doc-$(cat VERSION).zip -d /tmp/pdg-check
  ```

  Then on `chrome://extensions`, with **Developer mode** on, click
  **Load unpacked** and choose `/tmp/pdg-check`. Try it on a GitHub page,
  then click **Remove** on that card. (Turn your normal unpacked copy off
  while testing so you know which one runs.)

## 4. Upload the zip (create the item)

Uploading creates the item as a **draft**. Nothing is public, and nothing is
sent for review, until you click **Submit for review** in
[step 6](#6-submit-for-review). You can upload, look around, and come back
later.

### Simple version

1. Open <https://chrome.google.com/webstore/devconsole> and sign in with
   the developer account.
2. Make sure **Items** is selected in the left sidebar.
3. Click **New item** (top right).
4. Drag `print-github-doc-<version>.zip` from the `dist/` folder onto the
   upload box, or click **Browse files** and choose it.
5. Wait a few seconds. The dashboard opens the new item on its
   **Store listing** tab. The upload is done.

### Details

- **Finding `dist/` in the file picker.** In the **Browse files** window on
  a Mac, press **Cmd+Shift+G**, paste the repository's path followed by
  `/dist` (for example
  `~/projects/chrome-plugin-print-github-doc/dist`), press **Return**, and
  pick the zip. Or, in Terminal, run `open dist` to show the folder in
  Finder and drag the zip from there onto the upload box.
- **What the upload checks.** Chrome reads `manifest.json` as soon as the
  file arrives: that it's at the top level, valid, Manifest V3, with a
  version and icons. If something's wrong you get an error straight away
  and no item is created; see [If the upload is refused](#if-the-upload-is-refused).
  The policy review happens later, after you submit.
- **The item ID.** The new item gets a permanent 32-letter ID (shown under
  the name at the top of the item's page, and in its address). The public
  store address will be
  `https://chromewebstore.google.com/detail/<id>`. The ID never changes, even
  across updates.
- **Name, description, and icon come from the zip.** The listing takes the
  name `Print Doc for GitHub`, the short description, and the 128 px icon
  from `manifest.json`. To change them, change the manifest and upload a new
  version; the long description is the only text you edit in the dashboard.
- **Check the Package tab.** Click **Package** in the left sidebar. It should
  show the version you just uploaded (for example 0.4.1) as a draft. If it
  shows the wrong version, upload the right zip there with
  **Upload new package**; while the item is a draft that simply replaces it.
- **Uploaded the wrong file?** A draft can be overwritten as above. If you
  created a duplicate item by clicking **New item** twice, open the extra
  one and delete it (**⋮** menu or the item's settings → **Delete item**)
  before it's ever submitted.

## 5. Fill in each tab

Work down the tabs in the left sidebar. Each tab has a **Save draft**
button: click it before moving to the next tab, or your changes on that tab
are lost. The text to paste is below.

**Uploading images.** On the **Store listing** tab, each image box has an
upload area: drag the file onto it or click it to choose. The files are in
the repository's `store/` folder (`open store` in Terminal shows it in
Finder). Screenshots can be dragged to reorder; keep them in the numbered
order. If an image is refused, it's usually the wrong size: the screenshots
must be exactly 1280x800 and the tiles exactly 440x280 and 1400x560, which
the files in `store/` are.

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
| `storage` | Saves the user's print settings (include header, print link URLs, expand collapsed sections, section page breaks, show options panel) with chrome.storage.sync, and, with chrome.storage.local, a last-run diagnostic shown on the Options page (page type, whether a document was found, and the time). No URLs, page content, or other data are stored, and nothing leaves the device. |
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

## 6. Submit for review

### Simple version

1. Click **Submit for review** (top right of the item's page).
2. In the dialog, **untick "Publish automatically after the review"** (the
   wording may be slightly different, e.g. a "deferred publishing" option).
3. Click **Submit**.

The status changes to **Pending review**. Wait for an email at the
developer contact address. That's all until the decision arrives.

### Details

- **The button is greyed out?** Something required is missing. The
  dashboard lists what (look for a "Why can't I submit?" link or red marks
  on the tabs). Usual causes: the contact email isn't verified, a tab wasn't
  saved, a permission justification is empty, the privacy policy URL is
  missing, or no screenshot was uploaded.
- **Why turn off automatic publishing.** With it off, an approved item
  waits for you to click **Publish**, so you can check the listing first and
  choose when it goes live. If you don't publish within 30 days, it goes
  back to draft and must be submitted again.
- **How long.** Usually a few hours to a few days. New developer accounts and
  first submissions can take longer. There's no way to speed it up, and
  resubmitting resets your place in the queue.
- **Changing something while it's pending.** Choose **Cancel review**
  (on the item's page), make the change, and submit again.
- **The emails.** You'll get one when it's approved ("ready to publish" if
  automatic publishing is off) or rejected. A rejection names the policy
  ([If the review is rejected](#if-the-review-is-rejected)).

## 7. Publish and check the live listing

### Simple version

1. When the approval email arrives, open the item in the dashboard and
   click **Publish**.
2. Wait up to an hour, then open the listing at
   `https://chromewebstore.google.com/detail/<id>` and click
   **Add to Chrome**.
3. On `chrome://extensions`, **remove the unpacked copy** so only the store
   copy is installed.

### Details

- **Why remove the unpacked copy.** To Chrome they're two different
  extensions, both on the toolbar and both claiming Alt+Shift+P. Settings
  don't carry over; set your preferences again in the store copy's
  **Options**.
- **Check the listing in a private window** (not signed in): the name,
  description, screenshots, privacy policy link, and "Offered by" name are
  what everyone else sees. A freshly published item can take a little while
  to appear in store search, even though the direct link works.
- **Add the store link to the docs.** Put it at the top of the README and in
  [INSTALL.md](INSTALL.md) as the main way to install (keep the
  load-unpacked steps for development).
- **Updates reach users automatically.** Chrome checks for new versions
  every few hours, so a published update reaches most users within a day.
- **Watch the dashboard.** The item's page shows weekly users, ratings, and
  reviews; policy notices also go to the contact email.

## Publishing an update

### Simple version

1. Make and commit the changes, with notes under `## [Unreleased]` in
   `CHANGELOG.md`.
2. Release, push, and build:

   ```sh
   npm run release -- patch     # or minor / major
   git push origin main --tags
   ```

   The release script also builds the new zip in `dist/`.
3. In the dashboard: open the item → **Package** →
   **Upload new package** → choose the new zip.
4. Click **Submit for review**.

Users keep the current version until the new one is approved and
published.

### Details

- **Version numbers.** The store refuses any upload whose version isn't
  higher than the last one uploaded, even one that was never published.
  The release script always bumps it. Never reuse or lower a version.
- **If the update changes what users see** (the panel, the print layout, the
  Options page), run `npm run store-assets` and replace the screenshots on
  the **Store listing** tab. Commit the new images.
- **If permissions or data use change**, update the
  [Permission justifications](#permission-justifications) table and the
  **Privacy** tab, and `PRIVACY.md` plus its gist. A new permission that
  shows a new warning makes Chrome disable the extension for existing users
  until they accept it, so avoid adding permissions unless essential.
  `npm run check` flags any host access or content scripts so that choice is
  deliberate.
- **Listing-only changes** (description, screenshots) don't need a new zip:
  edit the tab, **Save draft**, and **Submit for review**.
- **Rolling back.** If a published version is broken, the fastest fix is a
  new patch release of the previous good code (`git revert`, then
  `npm run release -- patch`). If the **Package** tab offers a rollback to
  the previous version, that also works and is quicker.

## If the upload is refused

These errors appear immediately when uploading, before any review.

| Message (roughly) | Cause | Fix |
| --- | --- | --- |
| Manifest file is missing or unreadable | `manifest.json` isn't at the top level of the zip, usually because the zip was made by hand | Upload the zip from `npm run package`, not one made with Finder's **Compress** |
| Version must be greater than the existing version | This version was already uploaded | Cut a new release (`npm run release -- patch`) and upload that zip |
| Invalid manifest / a key isn't allowed | A manifest change the store doesn't accept | Run `npm run check`; fix what it reports |
| Could not decode image / icon problem | An icon file is damaged or the wrong size | Run `npm run icons`, then release again |
| The file isn't a zip / is a `.crx` | Wrong file chosen | Choose `dist/print-github-doc-<version>.zip` |

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
