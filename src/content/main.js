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
  try {
    const saved = await chrome.storage.sync
      .get(globalThis.GHP_DEFAULTS)
      .catch(() => ({ ...globalThis.GHP_DEFAULTS }));
    const info = G.github.pageInfo();
    const root = G.github.findContent();
    const html = document.documentElement;
    const dark =
      html.getAttribute("data-color-mode") === "dark" ||
      (html.getAttribute("data-color-mode") !== "light" &&
        matchMedia("(prefers-color-scheme: dark)").matches);

    let choice;
    let folderPromise = Promise.resolve(null);

    if (saved.showPanel) {
      folderPromise = G.github.listMarkdown(info).catch((err) => {
        console.warn("Print Doc for GitHub: couldn't list folder", err);
        return null;
      });
      panel = G.panel.open({ options: saved, hasDocument: !!root, folderPromise, info, dark });
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
      try {
        bundle = await G.bundle.build(info, listing, (done, total) =>
          panel?.status(`Loading documents… ${done} of ${total}`)
        );
      } catch (err) {
        console.error("Print Doc for GitHub:", err);
        panel?.status(`Couldn't load the folder: ${err.message}`, { error: true });
        return; // leave the panel open so the message can be read
      }
      if (panel?.closed) return; // cancelled while loading
    }

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
    console.error("Print Doc for GitHub:", err);
    alert(`Print Doc for GitHub: something went wrong.\n\n${err.message}`);
  } finally {
    G.active = null;
    // Close the panel unless it's showing an error for the user to read.
    if (panel && !panel.closed && !panel.hasError) panel.close();
  }
})();
