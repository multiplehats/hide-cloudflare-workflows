// Check if a URL is a Cloudflare Workflows page
function isWorkflowsPage(url) {
  return url && url.includes('cloudflare.com') && url.includes('workers/workflows');
}

// Send a message to the content script with retry logic
function sendMessageWithRetry(tabId, message, maxRetries = 3, delay = 1000) {
  let retries = 0;

  function attemptSend() {
    chrome.tabs.sendMessage(tabId, message, function(response) {
      if (chrome.runtime.lastError) {
        console.log(`Error sending message: ${chrome.runtime.lastError.message}`);

        if (retries < maxRetries) {
          retries++;
          console.log(`Retrying (${retries}/${maxRetries}) in ${delay}ms...`);
          setTimeout(attemptSend, delay);
        } else {
          console.log('Max retries reached. Giving up.');
        }
      } else {
        console.log('Message sent successfully:', response);
      }
    });
  }

  attemptSend();
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if the tab is fully loaded and is on the Cloudflare Workflows page
  if (changeInfo.status === 'complete' && isWorkflowsPage(tab.url)) {
    console.log('Detected Cloudflare Workflows page:', tab.url);

    // Wait for the page to fully render
    setTimeout(() => {
      // Send a message to the content script to force add buttons
      sendMessageWithRetry(tabId, { action: 'forceAddButtons' });
      console.log('Sent forceAddButtons message to tab', tabId);
    }, 3000); // Increased timeout to 3 seconds

    // Try again after a longer delay to catch any late-loading content
    setTimeout(() => {
      sendMessageWithRetry(tabId, { action: 'forceAddButtons' });
      console.log('Sent second forceAddButtons message to tab', tabId);
    }, 6000); // Try again after 6 seconds
  }
});

// Listen for extension installation or update
chrome.runtime.onInstalled.addListener(() => {
  console.log('Cloudflare Workflow Hider installed or updated');

  // Check all open tabs for Cloudflare Workflows pages
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (isWorkflowsPage(tab.url)) {
        console.log('Found existing Cloudflare Workflows page:', tab.url);

        // Wait a bit and then send the message
        setTimeout(() => {
          sendMessageWithRetry(tab.id, { action: 'forceAddButtons' });
        }, 3000);
      }
    });
  });
});