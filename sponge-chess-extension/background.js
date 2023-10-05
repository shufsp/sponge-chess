// background.js
let activeTabId = null;

chrome.action.onClicked.addListener((tab) => {
  if (activeTabId !== null) {
    chrome.scripting.executeScript({
      target: { tabId: activeTabId },
      function: () => {
        // Inject your JavaScript expression here
        // Listen for a signal or element appearance
        // When the signal is received or element appears, trigger the next step
      },
    });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url.includes("https://www.chess.com/play/online")) {
    activeTabId = tabId;
    chrome.scripting.executeScript({
      target: { tabId: activeTabId },
      function: () => {
        // Search for a game and start it
        // Once the game starts, inject your JavaScript expression
      },
    });
  }
});

