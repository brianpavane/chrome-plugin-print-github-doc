// The small panel shown before printing: per-print settings, folder
// printing, and the fallback when no document is found. Rendered in a shadow
// root so GitHub's styles don't affect it (and it doesn't affect GitHub).

globalThis.GHP = globalThis.GHP || {};

GHP.panel = (() => {
  const TOGGLES = [
    ["includeHeader", "Include header (title, repository, URL)"],
    ["printLinkUrls", "Print link URLs after link text"],
    ["expandDetails", "Expand collapsed sections"],
    ["sectionPageBreaks", "Start each section on a new page"],
  ];

  const STYLE = `
    :host { all: initial; }
    .panel {
      --bg: #ffffff; --fg: #1f2328; --muted: #59636e; --border: #d0d7de;
      --accent: #1f883d; --accent-fg: #ffffff; --hover: #f6f8fa;
      position: fixed; top: 16px; right: 16px; z-index: 2147483647;
      width: 340px; max-width: calc(100vw - 32px); box-sizing: border-box;
      padding: 16px; border: 1px solid var(--border); border-radius: 12px;
      background: var(--bg); color: var(--fg);
      box-shadow: 0 8px 24px rgba(0,0,0,.2);
      font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
    }
    :host([data-theme="dark"]) .panel {
      --bg: #151b23; --fg: #f0f6fc; --muted: #9198a1; --border: #3d444d;
      --accent: #238636; --hover: #262c36;
    }
    .head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    h2 { margin: 0; font-size: 15px; font-weight: 600; }
    .close { border: 0; background: none; color: var(--muted); font-size: 20px; line-height: 1; cursor: pointer; padding: 2px 6px; border-radius: 6px; }
    .close:hover { background: var(--hover); }
    .notice { margin: 0 0 10px; padding: 8px 10px; border-radius: 8px; background: var(--hover); color: var(--fg); font-size: 13px; }
    label { display: flex; gap: 8px; align-items: flex-start; padding: 3px 0; cursor: pointer; }
    input { margin: 3px 0 0; accent-color: var(--accent); }
    .folder { margin-bottom: 6px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
    .muted { color: var(--muted); font-size: 12px; }
    .remember { margin-top: 6px; padding-top: 8px; border-top: 1px solid var(--border); }
    .status { min-height: 1.5em; margin-top: 8px; color: var(--muted); font-size: 12px; }
    .status.error { color: #d1242f; }
    .actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
    button.btn { font: inherit; font-weight: 500; padding: 5px 14px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg); color: var(--fg); cursor: pointer; }
    button.btn:hover { background: var(--hover); }
    button.primary { background: var(--accent); color: var(--accent-fg); border-color: transparent; }
    button.primary:hover { background: var(--accent); filter: brightness(1.08); }
    button:disabled { opacity: .6; cursor: default; }
    [hidden] { display: none !important; }
  `;

  function open({ options, hasDocument, folderPromise, info, dark }) {
    // Drop a panel left open from an earlier run (e.g. one showing an error).
    document.querySelectorAll(".ghp-panel-host").forEach((el) => el.remove());
    const host = document.createElement("div");
    host.className = "ghp-panel-host";
    if (dark) host.setAttribute("data-theme", "dark");
    const shadow = host.attachShadow({ mode: "open" });

    shadow.innerHTML = `
      <style>${STYLE}</style>
      <div class="panel" role="dialog" aria-label="Print Doc for GitHub">
        <div class="head">
          <h2>Print Doc for GitHub</h2>
          <button class="close" type="button" aria-label="Close">×</button>
        </div>
        <p class="notice" data-ref="notice" hidden>
          No rendered document was found on this page. You can print the whole
          page in light colors instead.
        </p>
        <div class="folder">
          <span class="muted" data-ref="folderLoading">Checking this folder for Markdown files…</span>
          <label data-ref="folderRow" hidden>
            <input type="checkbox" data-ref="folder" />
            <span data-ref="folderLabel"></span>
          </label>
        </div>
        <div data-ref="toggles"></div>
        <label class="remember">
          <input type="checkbox" data-ref="remember" />
          <span>Remember these settings</span>
        </label>
        <div class="status" data-ref="status" aria-live="polite"></div>
        <div class="actions">
          <button class="btn" type="button" data-ref="cancel">Cancel</button>
          <button class="btn primary" type="button" data-ref="print">Print</button>
        </div>
      </div>`;

    const $ = (name) => shadow.querySelector(`[data-ref="${name}"]`);
    const inputs = {};
    for (const [key, text] of TOGGLES) {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = !!options[key];
      const span = document.createElement("span");
      span.textContent = text;
      label.append(input, span);
      $("toggles").append(label);
      inputs[key] = input;
    }

    $("notice").hidden = hasDocument;
    let folderAvailable = false;

    const updatePrintLabel = () => {
      const folder = folderAvailable && $("folder").checked;
      $("print").textContent = folder ? "Print folder" : hasDocument ? "Print" : "Print whole page";
    };
    $("folder").addEventListener("change", updatePrintLabel);
    updatePrintLabel();

    folderPromise.then((listing) => {
      $("folderLoading").hidden = true;
      const n = listing?.files.length || 0;
      // On a file page, a folder holding only that file adds nothing.
      const max = GHP.github.MAX_FOLDER_FILES;
      if (n > max) {
        $("folderLoading").textContent = `This folder has ${n} Markdown files; folder printing is limited to ${max}.`;
        $("folderLoading").hidden = false;
        return;
      }
      folderAvailable = n > 1 || (n === 1 && info.kind !== "blob");
      if (!folderAvailable) {
        $("folderLoading").parentElement.hidden = true;
        return;
      }
      $("folderRow").hidden = false;
      const where = listing.dir ? `${listing.dir}/` : "the repository root";
      $("folderLabel").textContent = `Print all ${n} Markdown file${n === 1 ? "" : "s"} in ${where} as one document`;
      if (!hasDocument) $("folder").checked = true;
      updatePrintLabel();
    });

    let resolveChoice;
    const choice = new Promise((r) => (resolveChoice = r));
    let settled = false;

    function finish(action) {
      if (settled) return;
      settled = true;
      const chosen = { ...options };
      for (const [key, input] of Object.entries(inputs)) chosen[key] = input.checked;
      const folder = folderAvailable && $("folder").checked;
      if (action === "print" && !folder && !hasDocument) action = "whole";
      if (action !== "cancel") {
        for (const el of shadow.querySelectorAll("input, button.btn")) el.disabled = true;
        $("cancel").disabled = false; // still allow closing while loading
      }
      resolveChoice({ action, options: chosen, folder, remember: $("remember").checked });
    }

    $("print").addEventListener("click", () => finish("print"));
    $("cancel").addEventListener("click", () => (settled ? close() : finish("cancel")));
    shadow.querySelector(".close").addEventListener("click", () => (settled ? close() : finish("cancel")));
    shadow.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        settled ? close() : finish("cancel");
      } else if (e.key === "Enter" && !settled) {
        e.preventDefault();
        finish("print");
      }
    });

    document.body.append(host);
    $("print").focus();

    let closed = false;
    function close() {
      if (closed) return;
      closed = true;
      host.remove();
    }

    return {
      choice,
      submit: () => finish("print"),
      status(text, { error = false } = {}) {
        $("status").textContent = text;
        $("status").classList.toggle("error", error);
      },
      close,
      get closed() {
        return closed;
      },
      get hasError() {
        return $("status").classList.contains("error");
      },
    };
  }

  return { open };
})();
