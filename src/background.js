// Service worker: enables the toolbar button on github.com, adds the
// right-click menu item, and injects the print scripts when either (or the
// keyboard shortcut) is used.

const CSS_FILE = "src/content/print.css";
const SCRIPT_FILES = [
  "src/shared/defaults.js",
  "src/selectors.js",
  "src/content/github.js",
  "src/content/prepare.js",
  "src/content/bundle.js",
  "src/content/panel.js",
  "src/content/main.js",
];
const MENU_ID = "print-github-doc";

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

  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: "Print this GitHub document",
      contexts: ["page", "selection", "link", "image"],
      documentUrlPatterns: ["https://github.com/*"],
    });
  });
});

chrome.action.onClicked.addListener((tab) => run(tab));

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === MENU_ID) run(tab);
});

async function run(tab) {
  if (!tab?.id || !isGitHub(tab.url)) return;
  const target = { tabId: tab.id };
  try {
    // Remove any copy left from a previous click so styles don't stack.
    await chrome.scripting.removeCSS({ target, files: [CSS_FILE] }).catch(() => {});
    await chrome.scripting.insertCSS({ target, files: [CSS_FILE] });
    await chrome.scripting.executeScript({ target, files: SCRIPT_FILES });
  } catch (err) {
    console.error("Print GitHub Doc: injection failed", err);
  }
}

function isGitHub(url) {
  try {
    return new URL(url).hostname === "github.com";
  } catch {
    return false;
  }
}
