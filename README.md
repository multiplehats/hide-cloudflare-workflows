# Cloudflare Workflow Hider

![Cloudflare Workflow Hider in action](example.png)

A simple Chrome extension that allows you to hide Cloudflare workflows in their dashboard.

## Why?

Cloudflare currently doesn't support deleting workflows, which can lead to a cluttered dashboard. This extension lets you visually hide workflows you no longer need to see.

## Features

- Hide/show individual workflows with a click
- Persistent storage of hidden workflows
- Popup interface to see all hidden workflows
- Option to clear all hidden workflows at once
- Works with the latest Cloudflare dashboard UI

## Installation

Since this is not distributed through the Chrome Web Store, you'll need to install it manually:

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked" and select the folder containing these files
5. The extension should now be installed and active

## Usage

1. Navigate to your Cloudflare Workers Workflows dashboard (`https://dash.cloudflare.com/*/workers/workflows`)
2. Each workflow row will now have a "Hide" button
3. Click "Hide" to hide a workflow (it will disappear from the table)
4. Click the extension icon in your browser toolbar to see a list of hidden workflows
5. Use the "Clear All Hidden Workflows" button to show all workflows again

## Troubleshooting

If you don't see the "Hide" buttons:

1. Make sure you're on the Cloudflare Workers Workflows dashboard page (URL should contain `/workers/workflows`)
2. Click the extension icon in your browser toolbar
3. Click the "Force Add Hide Buttons" button
4. Refresh the page if the buttons still don't appear
5. Check the browser console for any error messages (press F12 to open developer tools)
6. Try disabling and re-enabling the extension
7. If the Cloudflare dashboard UI has changed, the extension may need to be updated

### Common Issues

- **Buttons don't appear**: The Cloudflare dashboard UI may have changed. Try clicking "Force Add Hide Buttons" in the extension popup.
- **Extension doesn't work**: Make sure you're on the correct page. The extension only works on the Cloudflare Workers Workflows dashboard.
- **Buttons disappear after page navigation**: This is normal. The extension will add the buttons again when you return to the Workflows page.
- **Hidden workflows reappear**: Make sure you're using the same browser profile where you hid the workflows.

### Advanced Troubleshooting

If you're still having issues:

1. Open Chrome DevTools (F12 or right-click > Inspect)
2. Go to the Console tab
3. Look for any error messages related to the extension
4. If you see errors about "content script not loaded" or similar, try reloading the extension
5. Check if there are any Content Security Policy (CSP) errors that might be blocking the extension

## Notes

- This extension only affects the visual display of workflows in your browser
- It does not actually delete or modify any workflows on Cloudflare's servers
- Hidden workflows are stored in your browser's local storage
- This is for personal use only and not intended for distribution

## Updates

- **v1.3** (2023-03-15): Fixed issue where hidden workflows were not being removed from the table
- **v1.2** (2023-03-14): Improved button placement and added more robust error handling
- **v1.1** (2023-03-13): Updated to work with the latest Cloudflare dashboard UI
- **v1.0** (2023-03-10): Initial release
