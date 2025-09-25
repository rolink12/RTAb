export function showDeleteConfirmation(app, tabId) {
    const tab = app.tabs.find(tab => tab.id === tabId);
    if (!tab || tab.isDefault) return;

    if (tab.pinned) {
        app.showToast('Please unpin the tab before deleting');
        return;
    }

    // If tab has links, show confirmation dialog
    if (tab.quickLinks && tab.quickLinks.length > 0) {
        const modal = document.getElementById('deleteTabModal');
        document.getElementById('tabToDeleteId').value = tabId;
        modal.classList.remove('hidden');
    } else {
        // If no links, delete directly
        app.confirmDeleteTab(tabId);
    }
}

export function showNewTabModal() {
    const modal = document.getElementById('newTabModal');
    modal.classList.remove('hidden');

    // Clear form and set default value
    const newTabNameInput = document.getElementById('newTabNameInput');
    newTabNameInput.value = 'New Tab';

    // Focus on input
    setTimeout(() => {
        newTabNameInput.focus();
        newTabNameInput.select();
    }, 100);
}

export function renameTabPrompt(app, tabId) {
    const tab = app.tabs.find(t => t.id === tabId);
    if (!tab) return;

    const modal = document.getElementById('renameTabModal');
    const tabNameInput = document.getElementById('tabNameInput');
    const currentTabIdInput = document.getElementById('currentTabId');

    currentTabIdInput.value = tabId;
    tabNameInput.value = tab.name;
    modal.classList.remove('hidden');

    // Focus and select the input text
    setTimeout(() => {
        tabNameInput.focus();
        tabNameInput.select();
    }, 100);
}

export function showAddLinkModal() {
    const modal = document.getElementById('addLinkModal');
    modal.classList.remove('hidden');

    // Clear form
    document.getElementById('linkTitle').value = '';
    document.getElementById('linkUrl').value = '';

    // Focus on title input
    setTimeout(() => {
        document.getElementById('linkTitle').focus();
    }, 100);
}

export function editQuickLink(app, linkId) {
    const activeTab = app.tabs.find(tab => tab.id === app.activeTabId);
    if (!activeTab) return;

    const link = activeTab.quickLinks.find(l => l.id === linkId);
    if (link) {
        const modal = document.getElementById('editLinkModal');
        document.getElementById('editLinkId').value = link.id;
        document.getElementById('editLinkTitle').value = link.title;
        document.getElementById('editLinkUrl').value = link.url;
        modal.classList.remove('hidden');

        setTimeout(() => {
            const titleInput = document.getElementById('editLinkTitle');
            titleInput.focus();
            titleInput.select();
        }, 100);
    }
}