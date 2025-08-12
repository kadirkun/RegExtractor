// Background script for the extension
browser.runtime.onInstalled.addListener(function() {
    console.log('RegExtractor extension installed');
    
    // Set default settings
    browser.storage.local.set({
        regexPattern: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',
        flags: 'gi',
        targetType: 'all'
    });
});

// Handle browser action click (if needed)
browser.browserAction.onClicked.addListener(function(tab) {
    // This will be handled by the popup
});

// Optional: Add context menu item for quick extraction
browser.contextMenus.create({
    id: 'extract-selection',
    title: 'Extract with RegEx',
    contexts: ['selection']
});

browser.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === 'extract-selection') {
        // Open the popup or send a message to extract selected text
        browser.browserAction.openPopup();
    }
});
