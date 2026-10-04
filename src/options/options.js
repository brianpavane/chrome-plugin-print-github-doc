const defaults = globalThis.GHP_DEFAULTS;
const status = document.getElementById("status");
document.getElementById("version").textContent = chrome.runtime.getManifest().version;
const PAGE_TYPES = {
  blob: "a file",
  tree: "a folder",
  home: "a repository home page",
  wiki: "a wiki page",
  other: "another GitHub page",
};
chrome.storage.local.get("ghpLastDiagnostic").then(({ ghpLastDiagnostic: d }) => {
  if (!d) return;
  const when = new Date(d.at).toLocaleString();
  document.getElementById("diagnostics").textContent =
    `Last used ${when} on ${PAGE_TYPES[d.pageType] || "a GitHub page"}: ` +
    `document ${d.documentFound ? "found" : "not found"}.`;
});

chrome.storage.sync.get(defaults).then((opts) => {
  for (const [key, value] of Object.entries(opts)) {
    const input = document.getElementById(key);
    if (input) input.checked = value;
  }
});

const shortcut = document.getElementById("shortcut");

async function showShortcut() {
  const commands = await chrome.commands.getAll();
  const action = commands.find((c) => c.name === "_execute_action");
  shortcut.textContent = action?.shortcut || "Not set";
}

showShortcut();
// Pick up changes made on the shortcuts page when the user comes back.
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) showShortcut();
});

document.getElementById("changeShortcut").addEventListener("click", () => {
  chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
});

document.addEventListener("change", async (e) => {
  if (!(e.target instanceof HTMLInputElement)) return;
  await chrome.storage.sync.set({ [e.target.id]: e.target.checked });
  status.textContent = "Saved.";
  setTimeout(() => (status.textContent = ""), 1200);
});
