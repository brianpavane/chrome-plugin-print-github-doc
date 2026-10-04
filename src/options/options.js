const defaults = { printLinkUrls: false };
const status = document.getElementById("status");

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
