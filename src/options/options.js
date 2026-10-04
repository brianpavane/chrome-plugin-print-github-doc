const defaults = { printLinkUrls: true };
const status = document.getElementById("status");

chrome.storage.sync.get(defaults).then((opts) => {
  for (const [key, value] of Object.entries(opts)) {
    const input = document.getElementById(key);
    if (input) input.checked = value;
  }
});

document.addEventListener("change", async (e) => {
  if (!(e.target instanceof HTMLInputElement)) return;
  await chrome.storage.sync.set({ [e.target.id]: e.target.checked });
  status.textContent = "Saved.";
  setTimeout(() => (status.textContent = ""), 1200);
});
