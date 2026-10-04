// Entry point, injected on each click / shortcut / menu use. Shows the panel
// (unless turned off), builds a folder bundle if asked, prepares the page,
// opens Chrome's print dialog, then restores the page.

(async () => {
  const G = globalThis.GHP;

  // Triggered again while the panel is open: treat it as "Print".
  if (G.active) {
    G.active.submit?.();
    return;
  }
  G.active = {};

  let panel = null;
  const controller = new AbortController();
  try {
    const saved = await chrome.storage.sync
      .get(globalThis.GHP_DEFAULTS)
      .catch(() => ({ ...globalThis.GHP_DEFAULTS }));
    let info = G.github.pageInfo();
    const root = G.github.findContent();
    // Shown on the Options page to tell "GitHub changed its markup" from
    // "this page has no document". Deliberately no URL or page content.
    chrome.storage.local
      .set({
        ghpLastDiagnostic: {
          at: new Date().toISOString(),
          pageType: info.kind,
          documentFound: !!root,
        },
      })
      .catch(() => {});
    const html = document.documentElement;
    const dark =
      html.getAttribute("data-color-mode") === "dark" ||
      (html.getAttribute("data-color-mode") !== "light" &&
        matchMedia("(prefers-color-scheme: dark)").matches);

    let choice;
    let folderPromise = Promise.resolve(null);
    let knownListing = null; // the folder listing, once it has arrived

    if (saved.showPanel) {
      folderPromise = G.github.listMarkdown(info, { signal: controller.signal }).catch((err) => {
        if (controller.signal.aborted) return null;
        console.warn("Print Doc for GitHub: couldn't list folder", err);
        return { files: [], error: err };
      });
      folderPromise.then((listing) => (knownListing = listing));
      panel = G.panel.open({
        options: saved,
        hasDocument: !!root,
        folderPromise,
        info,
        dark,
        onCancel: () => controller.abort(new DOMException("Cancelled", "AbortError")),
      });
      G.active.submit = panel.submit;
      choice = await panel.choice;
    } else if (root) {
      choice = { action: "print", options: saved, folder: false };
    } else {
      const ok = confirm(
        "Print Doc for GitHub: no rendered document was found on this page.\n\n" +
          "Print the whole page in light colors instead?"
      );
      choice = { action: ok ? "whole" : "cancel", options: saved, folder: false };
    }

    if (choice.action === "cancel") return;
    G.active.submit = null;
    if (choice.remember) await chrome.storage.sync.set(choice.options).catch(() => {});

    let bundle = null;
    let listing = null;
    if (choice.folder) {
      listing = await folderPromise;
      const cache = new Map(); // documents already loaded, kept across retries
      for (;;) {
        try {
          bundle = await G.bundle.build(
            info,
            listing,
            (done, total) => panel.status(`Loading documents… ${done} of ${total}`),
            { signal: controller.signal, cache }
          );
        } catch (err) {
          if (controller.signal.aborted) return;
          console.error("Print Doc for GitHub:", err);
          const answer = await panel.recoverFolder({ error: err.message, retryable: !!err.retryable });
          if (answer === "retry") continue;
          return;
        }
        const failures = bundle.ghpFailures;
        if (!failures.length) break;
        const answer = await panel.recoverFolder({ failures, loaded: listing.files.length - failures.length });
        if (answer === "retry") continue;
        if (answer !== "partial") return;
        break;
      }
      if (panel.closed) return; // cancelled while loading
    }

    info = G.github.resolveFile(info, { listing: listing || knownListing });

    panel?.status("Preparing…");
    const session = await G.prepare({
      root,
      bundle,
      listing,
      info,
      options: choice.options,
      wholePage: choice.action === "whole",
    });
    panel?.close();
    try {
      window.print(); // blocks until the dialog closes in Chrome
    } finally {
      session.restore();
    }
  } catch (err) {
    if (controller.signal.aborted) return;
    console.error("Print Doc for GitHub:", err);
    alert(`Print Doc for GitHub: something went wrong.\n\n${err.message}`);
  } finally {
    G.active = null;
    controller.abort(); // stop a folder listing still in flight
    // Close the panel unless it's showing an error for the user to read.
    if (panel && !panel.closed && !panel.hasError) panel.close();
  }
})();
