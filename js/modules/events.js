export function setupEventListeners(app) {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            app.performSearch();
        }
    });

    searchBtn.addEventListener('click', () => {
        app.performSearch();
    });

    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');

    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
        app.updateSettingsUI();
    });

    closeSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });

    const deleteTabModal = document.getElementById('deleteTabModal');
    const closeDeleteTabModalBtn = document.getElementById('closeDeleteTabModalBtn');
    const cancelDeleteTabBtn = document.getElementById('cancelDeleteTabBtn');
    const confirmDeleteTabBtn = document.getElementById('confirmDeleteTabBtn');

    const closeDeleteModal = () => {
        deleteTabModal.classList.add('hidden');
        document.getElementById('tabToDeleteId').value = '';
    };

    closeDeleteTabModalBtn.addEventListener('click', closeDeleteModal);
    cancelDeleteTabBtn.addEventListener('click', closeDeleteModal);

    confirmDeleteTabBtn.addEventListener('click', () => {
        const tabId = document.getElementById('tabToDeleteId').value;
        if (tabId) {
            app.confirmDeleteTab(tabId);
            closeDeleteModal();
        }
    });

    deleteTabModal.addEventListener('click', (e) => {
        if (e.target === deleteTabModal) {
            closeDeleteModal();
        }
    });

    const renameTabModal = document.getElementById('renameTabModal');
    const closeRenameTabModalBtn = document.getElementById('closeRenameTabModalBtn');
    const cancelRenameTabBtn = document.getElementById('cancelRenameTabBtn');
    const renameTabForm = document.getElementById('renameTabForm');

    const closeRenameModal = () => {
        renameTabModal.classList.add('hidden');
        document.getElementById('tabNameInput').value = '';
    };

    closeRenameTabModalBtn.addEventListener('click', closeRenameModal);
    cancelRenameTabBtn.addEventListener('click', closeRenameModal);

    renameTabForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const tabId = document.getElementById('currentTabId').value;
        const newName = document.getElementById('tabNameInput').value.trim();
        if (newName) {
            app.renameTab(tabId, newName);
            closeRenameModal();
        }
    });

    renameTabModal.addEventListener('click', (e) => {
        if (e.target === renameTabModal) {
            closeRenameModal();
        }
    });

    document.getElementById('lightThemeBtn').addEventListener('click', () => {
        app.settings.theme = 'light';
        app.applyTheme();
        app.saveData();
        app.updateSettingsUI();
    });

    document.getElementById('darkThemeBtn').addEventListener('click', () => {
        app.settings.theme = 'dark';
        app.applyTheme();
        app.saveData();
        app.updateSettingsUI();
    });

    document.getElementById('autoThemeBtn').addEventListener('click', () => {
        app.settings.theme = 'auto';
        app.applyTheme();
        app.saveData();
        app.updateSettingsUI();
    });

    document.querySelectorAll('.accent-color').forEach(btn => {
        btn.addEventListener('click', () => {
            app.settings.accentColor = btn.dataset.color;
            app.applyAccentColor();
            app.saveData();
            app.updateSettingsUI();
        });
    });

    document.getElementById('searchEngineSelect').addEventListener('change', (e) => {
        app.settings.searchEngine = e.target.value;
        app.saveData();
    });

    document.getElementById('exportDataBtn').addEventListener('click', () => {
        app.exportData();
    });

    document.getElementById('importDataBtn').addEventListener('click', () => {
        document.getElementById('importFileInput').click();
    });

    document.getElementById('importFileInput').addEventListener('change', (e) => {
        app.importData(e.target.files[0]);
    });

    document.getElementById('resetDataBtn').addEventListener('click', () => {
        app.resetData();
    });

    document.getElementById('addTabBtn').addEventListener('click', () => {
        app.showNewTabModal();
    });

    app.setupTabDragAndDrop();

    const addLinkModal = document.getElementById('addLinkModal');
    const closeLinkModalBtn = document.getElementById('closeLinkModalBtn');
    const cancelLinkBtn = document.getElementById('cancelLinkBtn');
    const addLinkForm = document.getElementById('addLinkForm');

    closeLinkModalBtn.addEventListener('click', () => {
        addLinkModal.classList.add('hidden');
    });

    cancelLinkBtn.addEventListener('click', () => {
        addLinkModal.classList.add('hidden');
    });

    addLinkForm.addEventListener('submit', (e) => {
        e.preventDefault();
        app.addQuickLink();
    });

    const editLinkModal = document.getElementById('editLinkModal');
    const closeEditLinkModalBtn = document.getElementById('closeEditLinkModalBtn');
    const cancelEditLinkBtn = document.getElementById('cancelEditLinkBtn');
    const editLinkForm = document.getElementById('editLinkForm');

    const closeEditModal = () => {
        editLinkModal.classList.add('hidden');
    };

    closeEditLinkModalBtn.addEventListener('click', closeEditModal);
    cancelEditLinkBtn.addEventListener('click', closeEditModal);

    editLinkForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const linkId = document.getElementById('editLinkId').value;
        const title = document.getElementById('editLinkTitle').value.trim();
        const url = document.getElementById('editLinkUrl').value.trim();

        if (!linkId || !title || !url) return;

        const activeTab = app.tabs.find(tab => tab.id === app.activeTabId);
        if (activeTab) {
            const link = activeTab.quickLinks.find(l => l.id === linkId);
            if (link) {
                link.title = title;
                let formattedUrl = url;
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    formattedUrl = 'https://' + url;
                }
                link.url = formattedUrl;
                app.saveData();
                app.renderActiveTabContent();
                closeEditModal();
            }
        }
    });

    const newTabModal = document.getElementById('newTabModal');
    const closeNewTabModalBtn = document.getElementById('closeNewTabModalBtn');
    const cancelNewTabBtn = document.getElementById('cancelNewTabBtn');
    const newTabForm = document.getElementById('newTabForm');
    const newTabNameInput = document.getElementById('newTabNameInput');

    const closeNewTabModal = () => {
        newTabModal.classList.add('hidden');
        newTabNameInput.value = '';
    };

    closeNewTabModalBtn.addEventListener('click', closeNewTabModal);
    cancelNewTabBtn.addEventListener('click', closeNewTabModal);

    newTabForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const tabName = newTabNameInput.value.trim();
        if (tabName) {
            app.createTab(tabName);
            closeNewTabModal();
        }
    });

    newTabModal.addEventListener('click', (e) => {
        if (e.target === newTabModal) {
            closeNewTabModal();
        }
    });

    [settingsModal, addLinkModal, editLinkModal, newTabModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 't':
                    e.preventDefault();
                    app.showNewTabModal();
                    break;
                case 'w':
                    e.preventDefault();
                    if (app.tabs.length > 1) {
                        app.deleteTab(app.activeTabId);
                    }
                    break;
                case ',':
                    e.preventDefault();
                    document.getElementById('settingsBtn').click();
                    break;
                case 'l':
                    e.preventDefault();
                    app.showAddLinkModal();
                    break;
            }
        }
    });

    const tabContainer = document.getElementById('tabContainer');
    tabContainer.addEventListener('keydown', (e) => {
        const targetTab = e.target.closest('[role="tab"]');
        if (!targetTab) return;

        const tabs = Array.from(tabContainer.querySelectorAll('[role="tab"]'));
        const focusedTabIndex = tabs.findIndex(tab => tab === targetTab);
        if (focusedTabIndex === -1) return;

        const isVerticalLayout = window.innerWidth >= 1024;
        const primaryNavKey = isVerticalLayout ? 'ArrowDown' : 'ArrowRight';
        const secondaryNavKey = isVerticalLayout ? 'ArrowUp' : 'ArrowLeft';
        const moveKeyModifier = e.ctrlKey || e.metaKey;

        if (moveKeyModifier && (e.key === primaryNavKey || e.key === secondaryNavKey)) {
            e.preventDefault();
            const fromTabId = targetTab.getAttribute('data-tab-id');
            const fromIndex = app.tabs.findIndex(t => t.id === fromTabId);

            if (fromIndex === -1 || app.tabs[fromIndex].isDefault) return;

            let toIndex;
            if (e.key === primaryNavKey) { // Move down/right
                toIndex = fromIndex + 1;
            } else { // Move up/left
                toIndex = fromIndex - 1;
            }

            const defaultTabsCount = app.tabs.filter(t => t.isDefault).length;
            if (toIndex < defaultTabsCount) {
                return; // Prevent moving into the default tab area
            }

            if (toIndex >= 0 && toIndex < app.tabs.length) {
                app.moveTab(fromIndex, toIndex);
                setTimeout(() => {
                    const newTabEl = tabContainer.querySelector(`[data-tab-id="${fromTabId}"]`);
                    newTabEl?.focus();
                }, 0);
            }
        } else if ([primaryNavKey, secondaryNavKey, 'Home', 'End'].includes(e.key)) {
            e.preventDefault();
            let nextTabIndex;
            switch (e.key) {
                case primaryNavKey:
                    nextTabIndex = focusedTabIndex < tabs.length - 1 ? focusedTabIndex + 1 : 0;
                    break;
                case secondaryNavKey:
                    nextTabIndex = focusedTabIndex > 0 ? focusedTabIndex - 1 : tabs.length - 1;
                    break;
                case 'Home':
                    nextTabIndex = 0;
                    break;
                case 'End':
                    nextTabIndex = tabs.length - 1;
                    break;
            }
            tabs[nextTabIndex]?.focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            targetTab.click();
        }
    });
}