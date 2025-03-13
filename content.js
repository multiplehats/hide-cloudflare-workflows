// Store hidden workflows in Chrome storage
let hiddenWorkflows = [];

// Check if we're on the Cloudflare Workflows page
function isWorkflowsPage() {
  return window.location.href.includes('cloudflare.com') &&
         window.location.href.includes('workers/workflows');
}

// Load hidden workflows from storage
function loadHiddenWorkflows() {
  return new Promise((resolve) => {
    console.log('Loading hidden workflows from storage');
    chrome.storage.sync.get(['hiddenWorkflows'], function(result) {
      if (result.hiddenWorkflows) {
        hiddenWorkflows = result.hiddenWorkflows;
        console.log('Loaded hidden workflows:', hiddenWorkflows);
        applyHiddenWorkflows();
      } else {
        console.log('No hidden workflows found in storage');
        hiddenWorkflows = [];
      }
      resolve(hiddenWorkflows);
    });
  });
}

// Save hidden workflows to storage
function saveHiddenWorkflows() {
  chrome.storage.sync.set({hiddenWorkflows: hiddenWorkflows});
}

// Apply hiding to workflows in the table
function applyHiddenWorkflows() {
  console.log('Applying hidden workflows:', hiddenWorkflows);

  // Find all workflow rows in the table
  const rows = document.querySelectorAll('table[role="table"] tbody tr');
  console.log(`Found ${rows.length} rows to process for hiding`);

  rows.forEach((row, index) => {
    try {
      // Get the workflow name from the first cell
      const nameCell = row.querySelector('td:first-child');
      if (!nameCell) {
        console.log(`Row ${index}: No name cell found`);
        return;
      }

      const nameLink = nameCell.querySelector('a');
      if (!nameLink) {
        console.log(`Row ${index}: No name link found`);
        return;
      }

      const workflowName = nameLink.textContent.trim();

      // If this workflow is in our hidden list, hide the row
      if (hiddenWorkflows.includes(workflowName)) {
        console.log(`Hiding row for workflow: ${workflowName}`);
        row.style.cssText = 'display: none !important';
        row.classList.add('workflow-hidden');

        // Also update any hide buttons to show "Show" text
        const hideBtn = row.querySelector('.workflow-hide-btn');
        if (hideBtn) {
          hideBtn.textContent = 'Show';
        }
      } else {
        console.log(`Showing row for workflow: ${workflowName}`);
        row.style.cssText = '';
        row.classList.remove('workflow-hidden');

        // Also update any hide buttons to show "Hide" text
        const hideBtn = row.querySelector('.workflow-hide-btn');
        if (hideBtn) {
          hideBtn.textContent = 'Hide';
        }
      }
    } catch (error) {
      console.error(`Error processing row ${index} for hiding:`, error);
    }
  });

  // Add a style tag to ensure hidden rows stay hidden
  ensureHiddenStyle();
}

// Ensure we have a style tag for hidden rows
function ensureHiddenStyle() {
  let styleTag = document.getElementById('workflow-hider-styles');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'workflow-hider-styles';
    styleTag.textContent = `
      .workflow-hidden {
        display: none !important;
        visibility: hidden !important;
      }
    `;
    document.head.appendChild(styleTag);
    console.log('Added style tag for hidden workflows');
  }
}

// Add hide buttons to each workflow row
function addHideButtons() {
  console.log('Adding hide buttons to workflow rows');

  // Find the table - try different selectors
  const table = document.querySelector('table[role="table"]');

  if (!table) {
    console.log('No table found on the page');
    return;
  }

  console.log('Found table:', table);

  // Find all rows in the table body
  const tbody = table.querySelector('tbody');
  if (!tbody) {
    console.log('No table body found');
    return;
  }

  const rows = tbody.querySelectorAll('tr');
  console.log(`Found ${rows.length} rows`);

  if (rows.length === 0) {
    console.log('No rows found in the table');
    return;
  }

  rows.forEach((row, index) => {
    try {
      // Get the workflow name from the first cell
      const nameCell = row.querySelector('td:first-child');
      if (!nameCell) {
        console.log(`Row ${index}: No name cell found`);
        return;
      }

      const nameLink = nameCell.querySelector('a');
      if (!nameLink) {
        console.log(`Row ${index}: No name link found`);
        return;
      }

      const workflowName = nameLink.textContent.trim();
      console.log(`Processing workflow: ${workflowName}`);

      // Check if we already added a hide button to this row
      if (row.querySelector('.workflow-hide-btn')) {
        console.log(`Row ${index}: Hide button already exists for ${workflowName}`);
        return;
      }

      // Get the last cell (actions cell)
      const lastCell = row.querySelector('td:last-child');
      if (!lastCell) {
        console.log(`Row ${index}: No last cell found for ${workflowName}`);
        return;
      }

      // Find the existing button in the actions cell
      const existingButton = lastCell.querySelector('button');
      if (!existingButton) {
        console.log(`Row ${index}: No existing button found for ${workflowName}`);

        // Try to find the actions container div
        const actionsDiv = findActionsDiv(lastCell);
        if (actionsDiv) {
          addButtonToActionsDiv(actionsDiv, workflowName);
        } else {
          // If we can't find an actions div, create one
          createActionsDiv(lastCell, workflowName);
        }
      } else {
        console.log(`Row ${index}: Found existing button for ${workflowName}`);

        // Get the parent div of the existing button
        const parentDiv = existingButton.closest('div[class*="c_d"][class*="c_t"]');
        if (parentDiv) {
          // Add our button next to the existing button
          addButtonNextToExisting(parentDiv, workflowName);
        } else {
          // If we can't find the parent div, add directly to the cell
          addButtonToCell(lastCell, workflowName);
        }
      }
    } catch (error) {
      console.error(`Error processing row ${index}:`, error);
    }
  });
}

// Find the actions div in a cell
function findActionsDiv(cell) {
  // Try specific selector first
  let actionsDiv = cell.querySelector('div.c_d.c_t.c_nf.c_lb');

  // If that doesn't work, try more generic selectors
  if (!actionsDiv) {
    const possibleSelectors = [
      'div[class*="c_d"][class*="c_t"][class*="c_nf"]',
      'div[class*="c_d"][class*="c_t"]',
      'div[class*="c_nf"][class*="c_lb"]'
    ];

    for (const selector of possibleSelectors) {
      const divs = cell.querySelectorAll(selector);
      if (divs.length > 0) {
        // Use the first div that looks like an actions container
        for (const div of divs) {
          // Check if it has buttons or looks like an actions container
          if (div.querySelector('button') ||
              div.classList.contains('c_lb') ||
              div.classList.contains('c_nf')) {
            actionsDiv = div;
            break;
          }
        }

        if (actionsDiv) break;
      }
    }
  }

  return actionsDiv;
}

// Create an actions div in a cell
function createActionsDiv(cell, workflowName) {
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'c_d c_t c_nf c_lb';
  cell.appendChild(actionsDiv);

  addButtonToActionsDiv(actionsDiv, workflowName);
}

// Add a button to an actions div
function addButtonToActionsDiv(actionsDiv, workflowName) {
  // Create hide button
  const hideBtn = document.createElement('button');
  // Use classes similar to the existing buttons for consistent styling
  hideBtn.className = 'workflow-hide-btn c_ng c_nh c_ni c_ae c_nj c_t c_gr c_gs c_gt c_gu c_nk c_nl c_d';
  hideBtn.textContent = hiddenWorkflows.includes(workflowName) ? 'Show' : 'Hide';
  hideBtn.style.marginLeft = '10px'; // Add some spacing

  // Add click event to toggle hiding
  hideBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();

    // Find the row containing this button
    const row = actionsDiv.closest('tr');

    if (hiddenWorkflows.includes(workflowName)) {
      // Remove from hidden list
      hiddenWorkflows = hiddenWorkflows.filter(name => name !== workflowName);
      hideBtn.textContent = 'Hide';

      // Show the row immediately
      if (row) row.style.display = '';
    } else {
      // Add to hidden list
      hiddenWorkflows.push(workflowName);
      hideBtn.textContent = 'Show';

      // Hide the row immediately
      if (row) row.style.display = 'none';
    }

    // Save and apply changes
    saveHiddenWorkflows();
    applyHiddenWorkflows();
  });

  // Add button to the actions div
  actionsDiv.appendChild(hideBtn);
  console.log(`Added hide button for ${workflowName}`);
}

// Add a button next to an existing button
function addButtonNextToExisting(parentDiv, workflowName) {
  // Create hide button
  const hideBtn = document.createElement('button');
  // Use classes similar to the existing buttons for consistent styling
  hideBtn.className = 'workflow-hide-btn c_ng c_nh c_ni c_ae c_nj c_t c_gr c_gs c_gt c_gu c_nk c_nl c_d';
  hideBtn.textContent = hiddenWorkflows.includes(workflowName) ? 'Show' : 'Hide';
  hideBtn.style.marginLeft = '10px'; // Add some spacing

  // Add click event to toggle hiding
  hideBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();

    // Find the row containing this button
    const row = parentDiv.closest('tr');

    if (hiddenWorkflows.includes(workflowName)) {
      // Remove from hidden list
      hiddenWorkflows = hiddenWorkflows.filter(name => name !== workflowName);
      hideBtn.textContent = 'Hide';

      // Show the row immediately
      if (row) row.style.display = '';
    } else {
      // Add to hidden list
      hiddenWorkflows.push(workflowName);
      hideBtn.textContent = 'Show';

      // Hide the row immediately
      if (row) row.style.display = 'none';
    }

    // Save and apply changes
    saveHiddenWorkflows();
    applyHiddenWorkflows();
  });

  // Add button to the parent div
  parentDiv.appendChild(hideBtn);
  console.log(`Added hide button next to existing button for ${workflowName}`);
}

// Add a button directly to a cell
function addButtonToCell(cell, workflowName) {
  // Create a container div for the button
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'c_d c_t c_nf c_lb';
  buttonContainer.style.display = 'inline-block';
  buttonContainer.style.marginLeft = '10px';

  // Create hide button
  const hideBtn = document.createElement('button');
  // Use classes similar to the existing buttons for consistent styling
  hideBtn.className = 'workflow-hide-btn c_ng c_nh c_ni c_ae c_nj c_t c_gr c_gs c_gt c_gu c_nk c_nl c_d';
  hideBtn.textContent = hiddenWorkflows.includes(workflowName) ? 'Show' : 'Hide';

  // Add click event to toggle hiding
  hideBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();

    // Find the row containing this button
    const row = cell.closest('tr');

    if (hiddenWorkflows.includes(workflowName)) {
      // Remove from hidden list
      hiddenWorkflows = hiddenWorkflows.filter(name => name !== workflowName);
      hideBtn.textContent = 'Hide';

      // Show the row immediately
      if (row) row.style.display = '';
    } else {
      // Add to hidden list
      hiddenWorkflows.push(workflowName);
      hideBtn.textContent = 'Show';

      // Hide the row immediately
      if (row) row.style.display = 'none';
    }

    // Save and apply changes
    saveHiddenWorkflows();
    applyHiddenWorkflows();
  });

  // Add button to the container div
  buttonContainer.appendChild(hideBtn);

  // Add container to the cell
  cell.appendChild(buttonContainer);
  console.log(`Added hide button directly to cell for ${workflowName}`);
}

// Main function to initialize the extension
function initExtension() {
  console.log('Cloudflare Workflow Hider: Extension initialized');

  // Only run on the Workflows page
  if (!isWorkflowsPage()) {
    console.log('Not on Workflows page, extension not running');
    return;
  }

  console.log('On Workflows page, running extension');

  // Load hidden workflows first, then add buttons and apply hiding
  loadHiddenWorkflows().then(() => {
    // Add hide buttons to the table and apply hiding
    setTimeout(() => {
      addHideButtons();
      applyHiddenWorkflows(); // Apply hiding after adding buttons
      console.log('Cloudflare Workflow Hider: Added hide buttons and applied hiding');
    }, 1000); // Wait a bit for the page to fully load

    // Try again after a longer delay to catch any late-loading content
    setTimeout(() => {
      addHideButtons();
      applyHiddenWorkflows(); // Apply hiding again after a longer delay
      console.log('Cloudflare Workflow Hider: Second attempt to add buttons and apply hiding');
    }, 3000);

    // Set up a mutation observer to handle dynamically loaded content
    setupTableObserver();
  });
}

// Set up a mutation observer specifically for the table
function setupTableObserver() {
  console.log('Setting up table observer');

  // Function to find the table and set up an observer for it
  function findTableAndObserve() {
    const table = document.querySelector('table[role="table"]');
    if (table) {
      console.log('Found table, setting up observer');

      // Create an observer instance
      const tableObserver = new MutationObserver((mutations) => {
        console.log('Table mutation detected:', mutations.length, 'changes');
        // When table changes, reapply hiding and add buttons
        addHideButtons();
        applyHiddenWorkflows();
      });

      // Start observing the table with all its child nodes
      tableObserver.observe(table, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false
      });

      console.log('Table observer set up successfully');
      return true;
    }
    return false;
  }

  // Try to find the table immediately
  if (!findTableAndObserve()) {
    console.log('Table not found initially, setting up body observer');

    // If table is not found, observe the body for changes
    const bodyObserver = new MutationObserver((mutations) => {
      console.log('Body mutation detected, checking for table');
      if (findTableAndObserve()) {
        // Once we've found the table and set up its observer, disconnect the body observer
        bodyObserver.disconnect();
        console.log('Body observer disconnected after finding table');
      }
    });

    // Start observing the body
    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false
    });

    console.log('Body observer set up to find table');
  }
}

// Run the extension when the page is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExtension);
} else {
  initExtension();
}

// Also listen for page changes via the History API
window.addEventListener('popstate', () => {
  console.log('Navigation detected via popstate');
  if (isWorkflowsPage()) {
    setTimeout(() => {
      console.log('Reapplying extension after navigation');
      addHideButtons();
      applyHiddenWorkflows();
      setupTableObserver();
    }, 1000);
  }
});

// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('Message received:', request);

  if (request.action === 'getHiddenWorkflows') {
    // Return the list of hidden workflows
    sendResponse({hiddenWorkflows: hiddenWorkflows});
  } else if (request.action === 'clearAllHidden') {
    // Clear all hidden workflows
    hiddenWorkflows = [];
    saveHiddenWorkflows();
    applyHiddenWorkflows();
    sendResponse({success: true});
  } else if (request.action === 'forceAddButtons') {
    // Force add hide buttons
    addHideButtons();
    applyHiddenWorkflows(); // Apply hiding after adding buttons
    setupTableObserver(); // Re-setup the table observer
    sendResponse({success: true});
  }

  return true; // Keep the message channel open for async response
});