// Service worker: enables the toolbar button on github.com and injects the
// print script when it (or the keyboard shortcut) is triggered.

const CSS_FILE = "src/content/print.css";
const SCRIPT_FILES = ["src/selectors.js", "src/content/print.js"];

chrome.runtime.onInstalled.addListener(() => {
  // Grey out the button everywhere except GitHub.
  chrome.action.disable();
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: "github.com", schemes: ["https"] },
          }),
        ],
        actions: [new chrome.declarativeContent.ShowAction()],
      },
    ]);
  });
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id || !isGitHub(tab.url)) return;
  const target = { tabId: tab.id };
  try {
    // Remove any copy left from a previous click so styles don't stack.
    await chrome.scripting.removeCSS({ target, files: [CSS_FILE] }).catch(() => {});
    await chrome.scripting.insertCSS({ target, files: [CSS_FILE] });
    await chrome.scripting.executeScript({ target, files: SCRIPT_FILES });
  } catch (err) {
    console.error("Print GitHub Doc: injection failed", err);
  }
});

function isGitHub(url) {
  try {
    return new URL(url).hostname === "github.com";
  } catch {
    return false;
  }
}
