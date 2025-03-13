// Check if a URL is a Cloudflare Workflows page
function isWorkflowsPage(url) {
  return url.includes('cloudflare.com') && url.includes('workers/workflows');
}

// When the popup is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get references to DOM elements
  const hiddenList = document.getElementById('hidden-list');
  const emptyMessage = document.getElementById('empty-message');
  const clearAllBtn = document.getElementById('clear-all');
  const forceAddBtn = document.getElementById('force-add');
  const statusEl = document.getElementById('status-message');

  // Get the active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const activeTab = tabs[0];

    // Only proceed if we're on a cloudflare workflows page
    if (isWorkflowsPage(activeTab.url)) {
      // Get the list of hidden workflows from the content script
      chrome.tabs.sendMessage(activeTab.id, {action: 'getHiddenWorkflows'}, function(response) {
        if (response && response.hiddenWorkflows) {
          updateHiddenList(response.hiddenWorkflows);
        }
      });

      // Enable the buttons
      clearAllBtn.disabled = false;
      forceAddBtn.disabled = false;
    } else {
      // Not on Cloudflare Workflows page
      hiddenList.innerHTML = '';
      emptyMessage.textContent = 'This extension only works on the Cloudflare Workflows dashboard page.';
      emptyMessage.style.display = 'block';

      // Disable the buttons
      clearAllBtn.disabled = true;
      forceAddBtn.disabled = true;

      // Show a helpful message
      statusEl.textContent = 'Please navigate to the Cloudflare Workflows page to use this extension.';
      statusEl.style.display = 'block';
      statusEl.style.color = '#f44336'; // Red color for warning
    }
  });

  // Clear all hidden workflows button
  clearAllBtn.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const activeTab = tabs[0];

      if (isWorkflowsPage(activeTab.url)) {
        chrome.tabs.sendMessage(activeTab.id, {action: 'clearAllHidden'}, function(response) {
          if (response && response.success) {
            updateHiddenList([]);

            // Show success message
            statusEl.textContent = 'All workflows are now visible!';
            statusEl.style.display = 'block';
            statusEl.style.color = '#4CAF50'; // Green color for success

            setTimeout(() => {
              statusEl.style.display = 'none';
            }, 3000);
          }
        });
      }
    });
  });

  // Force add hide buttons
  forceAddBtn.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const activeTab = tabs[0];

      if (isWorkflowsPage(activeTab.url)) {
        chrome.tabs.sendMessage(activeTab.id, {action: 'forceAddButtons'}, function(response) {
          if (response && response.success) {
            statusEl.textContent = 'Hide buttons added!';
            statusEl.style.display = 'block';
            statusEl.style.color = '#4CAF50'; // Green color for success

            setTimeout(() => {
              statusEl.style.display = 'none';
            }, 3000);
          }
        });
      }
    });
  });

  // Function to update the list of hidden workflows in the popup
  function updateHiddenList(hiddenWorkflows) {
    if (hiddenWorkflows.length === 0) {
      hiddenList.innerHTML = '';
      emptyMessage.textContent = 'No workflows are currently hidden.';
      emptyMessage.style.display = 'block';
    } else {
      emptyMessage.style.display = 'none';

      // Create list items for each hidden workflow
      hiddenList.innerHTML = '';
      hiddenWorkflows.forEach(function(workflow) {
        const li = document.createElement('li');
        li.textContent = workflow;
        hiddenList.appendChild(li);
      });
    }
  }
});