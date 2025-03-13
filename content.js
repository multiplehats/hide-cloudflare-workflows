// Store hidden workflows in Chrome storage
let hiddenWorkflows = [];

// Load hidden workflows from storage
function loadHiddenWorkflows() {
  chrome.storage.sync.get(['hiddenWorkflows'], function(result) {
    if (result.hiddenWorkflows) {
      hiddenWorkflows = result.hiddenWorkflows;
      applyHiddenWorkflows();
    }
  });
}

// Save hidden workflows to storage
function saveHiddenWorkflows() {
  chrome.storage.sync.set({hiddenWorkflows: hiddenWorkflows});
}

// Apply hiding to workflows in the table
function applyHiddenWorkflows() {
  // Find all workflow rows in the table
  const rows = document.querySelectorAll('table[role="table"] tbody tr');

  rows.forEach(row => {
    // Get the workflow name from the first cell
    const nameCell = row.querySelector('td:first-child');
    if (!nameCell) return;

    const nameLink = nameCell.querySelector('a');
    if (!nameLink) return;

    const workflowName = nameLink.textContent.trim();

    // If this workflow is in our hidden list, hide the row
    if (hiddenWorkflows.includes(workflowName)) {
      row.style.display = 'none';
    } else {
      row.style.display = '';
    }
  });
}

// Add hide buttons to each workflow row
function addHideButtons() {
  const rows = document.querySelectorAll('table[role="table"] tbody tr');

  rows.forEach(row => {
    // Get the workflow name from the first cell
    const nameCell = row.querySelector('td:first-child');
    if (!nameCell) return;

    const nameLink = nameCell.querySelector('a');
    if (!nameLink) return;

    const workflowName = nameLink.textContent.trim();

    // Check if we already added a hide button to this row
    if (row.querySelector('.workflow-hide-btn')) return;

    // Get the last cell (actions cell)
    const lastCell = row.querySelector('td:last-child');
    if (!lastCell) return;

    // Find the actions container div
    const actionsDiv = lastCell.querySelector('div.c_d.c_t.c_qe.c_ls');
    if (!actionsDiv) return;

    // Create hide button
    const hideBtn = document.createElement('button');
    hideBtn.className = 'workflow-hide-btn c_ps c_mj c_pt c_ae c_pu c_t c_gr c_gs c_gt c_gu c_ux c_pv c_d';
    hideBtn.textContent = hiddenWorkflows.includes(workflowName) ? 'Show' : 'Hide';

    // Add click event to toggle hiding
    hideBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();

      if (hiddenWorkflows.includes(workflowName)) {
        // Remove from hidden list
        hiddenWorkflows = hiddenWorkflows.filter(name => name !== workflowName);
        hideBtn.textContent = 'Hide';
      } else {
        // Add to hidden list
        hiddenWorkflows.push(workflowName);
        hideBtn.textContent = 'Show';
      }

      // Save and apply changes
      saveHiddenWorkflows();
      applyHiddenWorkflows();
    });

    // Add button to the actions div
    actionsDiv.appendChild(hideBtn);
  });
}

// Main function to initialize the extension
function initExtension() {
  console.log('Cloudflare Workflow Hider: Extension initialized');

  // Load hidden workflows first
  loadHiddenWorkflows();

  // Add hide buttons to the table
  setTimeout(() => {
    addHideButtons();
    console.log('Cloudflare Workflow Hider: Added hide buttons');
  }, 1000); // Wait a bit for the page to fully load

  // Set up a mutation observer to handle dynamically loaded content
  const observer = new MutationObserver(function(mutations) {
    addHideButtons();
  });

  // Start observing the document body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Run the extension when the page is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExtension);
} else {
  initExtension();
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'getHiddenWorkflows') {
    sendResponse({hiddenWorkflows: hiddenWorkflows});
  } else if (request.action === 'clearAllHidden') {
    hiddenWorkflows = [];
    saveHiddenWorkflows();
    applyHiddenWorkflows();
    addHideButtons(); // Refresh buttons
    sendResponse({success: true});
  } else if (request.action === 'forceAddButtons') {
    addHideButtons();
    sendResponse({success: true});
  }
});