// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if the tab is fully loaded and is on cloudflare.com
  if (changeInfo.status === 'complete' && tab.url.includes('cloudflare.com')) {
    // Wait a bit for the page to fully render
    setTimeout(() => {
      // Send a message to the content script to force add buttons
      chrome.tabs.sendMessage(tabId, { action: 'forceAddButtons' });
    }, 2000);
  }
});

// Listen for extension installation or update
chrome.runtime.onInstalled.addListener(() => {
  console.log('Cloudflare Workflow Hider installed or updated');
});