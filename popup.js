// When the popup is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get references to DOM elements
  const hiddenList = document.getElementById('hidden-list');
  const emptyMessage = document.getElementById('empty-message');
  const clearAllBtn = document.getElementById('clear-all');
  const forceAddBtn = document.getElementById('force-add');

  // Get the active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const activeTab = tabs[0];

    // Only proceed if we're on a cloudflare.com domain
    if (activeTab.url.includes('cloudflare.com')) {
      // Get the list of hidden workflows from the content script
      chrome.tabs.sendMessage(activeTab.id, {action: 'getHiddenWorkflows'}, function(response) {
        if (response && response.hiddenWorkflows) {
          updateHiddenList(response.hiddenWorkflows);
        }
      });
    } else {
      // Not on Cloudflare
      hiddenList.innerHTML = '';
      emptyMessage.textContent = 'This extension only works on Cloudflare dashboard pages.';
    }
  });

  // Clear all hidden workflows button
  clearAllBtn.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const activeTab = tabs[0];

      if (activeTab.url.includes('cloudflare.com')) {
        chrome.tabs.sendMessage(activeTab.id, {action: 'clearAllHidden'}, function(response) {
          if (response && response.success) {
            updateHiddenList([]);
          }
        });
      }
    });
  });

  // Force add hide buttons
  forceAddBtn.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const activeTab = tabs[0];

      if (activeTab.url.includes('cloudflare.com')) {
        chrome.tabs.sendMessage(activeTab.id, {action: 'forceAddButtons'}, function(response) {
          if (response && response.success) {
            const statusEl = document.getElementById('status-message');
            statusEl.textContent = 'Hide buttons added!';
            statusEl.style.display = 'block';

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