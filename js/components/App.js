import { renderTabs, renderActiveTabContent, updateSettingsUI, showToast, removeMenu, showTabContextMenu, showLinkContextMenu, getFaviconUrl, editTabName } from '../modules/dom.js';
import { saveData, loadData, exportData, importData } from '../modules/state.js';
import { setupEventListeners } from '../modules/events.js';
import { applyTheme, applyAccentColor } from '../modules/theme.js';
import { showDeleteConfirmation, showNewTabModal, renameTabPrompt, showAddLinkModal, editQuickLink } from '../modules/modals.js';

export class ModernHomepage {
    constructor() {
        this.tabs = [];
        this.activeTabId = null;
        this.settings = {
            theme: 'auto',
            accentColor: '59, 130, 246',
            searchEngine: 'google',
            layout: 'comfortable'
        };

        this.searchEngines = {
            google: 'https://www.google.com/search?q=',
            bing: 'https://www.bing.com/search?q=',
            duckduckgo: 'https://duckduckgo.com/?q=',
            yahoo: 'https://search.yahoo.com/search?p='
        };

        this.init();
    }

    init() {
        this.loadData();
        this.applyTheme();

        const defaultTabs = [
            { name: 'Home', exists: false },
            { name: 'Tools', exists: false }
        ];

        this.tabs.forEach(tab => {
            if (tab.isDefault) {
                const defaultTab = defaultTabs.find(t => t.name === tab.name);
                if (defaultTab) {
                    defaultTab.exists = true;
                    tab.isDefault = true;
                }
            }
        });

        defaultTabs.forEach(tab => {
            if (!tab.exists) {
                this.createTab(tab.name, false, true);
            }
        });

        if (this.tabs.length === 0) {
            this.createTab('Home', true, true);
        } else if (!this.activeTabId || !this.tabs.some(tab => tab.id === this.activeTabId)) {
            this.activeTabId = this.tabs[0].id;
        }

        this.saveData();
        this.renderTabs();
        this.renderActiveTabContent();
        this.setupEventListeners();
    }

    setupEventListeners() {
        setupEventListeners(this);
    }

    performSearch() {
        const query = document.getElementById('searchInput').value.trim();
        if (query) {
            const searchUrl = this.searchEngines[this.settings.searchEngine] + encodeURIComponent(query);
            window.open(searchUrl, '_blank');
            document.getElementById('searchInput').value = '';
        }
    }

    applyTheme() {
        applyTheme(this.settings);
    }

    applyAccentColor() {
        applyAccentColor(this.settings.accentColor);
    }

    updateSettingsUI() {
        updateSettingsUI(this);
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    createTab(name = 'New Tab', setActive = true, isDefault = false) {
        const tab = {
            id: this.generateId(),
            name: name,
            pinned: false,
            isDefault: isDefault,
            quickLinks: [],
            createdAt: new Date().toISOString()
        };

        this.tabs.push(tab);

        if (setActive || this.tabs.length === 1) {
            this.activeTabId = tab.id;
        }

        this.saveData();
        this.renderTabs();
        this.renderActiveTabContent();

        return tab;
    }

    showDeleteConfirmation(tabId) {
        showDeleteConfirmation(this, tabId);
    }

    showNewTabModal() {
        showNewTabModal();
    }

    renameTabPrompt(tabId) {
        renameTabPrompt(this, tabId);
    }

    showAddLinkModal() {
        showAddLinkModal();
    }

    editQuickLink(linkId) {
        editQuickLink(this, linkId);
    }

    confirmDeleteTab(tabId) {
        if (this.tabs.length <= 1) return;

        const tab = this.tabs.find(tab => tab.id === tabId);
        if (!tab || tab.isDefault) return;

        const tabIndex = this.tabs.findIndex(t => t.id === tabId);
        this.tabs.splice(tabIndex, 1);

        if (this.activeTabId === tabId) {
            if (tabIndex < this.tabs.length) {
                this.activeTabId = this.tabs[tabIndex].id;
            } else if (this.tabs.length > 0) {
                this.activeTabId = this.tabs[this.tabs.length - 1].id;
            }
        }

        this.saveData();
        this.renderTabs();
        this.renderActiveTabContent();

        this.showToast('Tab deleted');
    }

    deleteTab(tabId) {
        const tab = this.tabs.find(tab => tab.id === tabId);
        if (tab && tab.pinned) {
            this.showToast('Please unpin the tab before deleting');
            return;
        }
        this.showDeleteConfirmation(tabId);
    }

    renameTab(tabId, newName) {
        const tab = this.tabs.find(tab => tab.id === tabId);
        if (tab && !tab.isDefault) {
            if (tab.pinned) {
                this.showToast('Please unpin the tab before renaming');
                return;
            }
            tab.name = newName;
            this.saveData();
            this.renderTabs();
        }
    }

    togglePinTab(tabId) {
        const tab = this.tabs.find(tab => tab.id === tabId);
        if (tab && !tab.isDefault) {
            tab.pinned = !tab.pinned;
            this.saveData();
            this.renderTabs();
        }
    }

    moveTab(fromIndex, toIndex) {
        if (this.tabs[fromIndex].isDefault) return;

        const defaultTabsCount = this.tabs.filter(t => t.isDefault).length;
        if (toIndex < defaultTabsCount) {
            toIndex = defaultTabsCount;
        }

        const tab = this.tabs.splice(fromIndex, 1)[0];
        this.tabs.splice(toIndex, 0, tab);
        this.saveData();
        this.renderTabs();
    }

    switchTab(tabId) {
        this.activeTabId = tabId;
        this.saveData();
        this.renderTabs();
        this.renderActiveTabContent();
    }

    setupTabDragAndDrop() {
        const container = document.getElementById('tabContainer');
        let draggedTab = null;

        container.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('tab')) {
                draggedTab = e.target;
                e.target.classList.add('opacity-50');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', e.target.innerHTML);
            }
        });

        container.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('tab')) {
                e.target.classList.remove('opacity-50');
                document.querySelectorAll('.drag-indicator').forEach(el => el.remove());
            }
        });

        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';

            document.querySelectorAll('.drag-indicator').forEach(el => el.remove());

            const afterElement = this.getDragAfterElement(container, e.clientX, e.clientY);

            if (afterElement) {
                const indicator = document.createElement('div');
                indicator.className = 'drag-indicator h-8 w-1 bg-blue-500 mx-0.5';
                container.insertBefore(indicator, afterElement);
            } else {
                const indicator = document.createElement('div');
                indicator.className = 'drag-indicator h-8 w-1 bg-blue-500 mx-0.5';
                container.appendChild(indicator);
            }
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();

            if (!draggedTab) return;

            const tabId = draggedTab.getAttribute('data-tab-id');
            if (!tabId) return;

            const tabIndex = this.tabs.findIndex(tab => tab.id === tabId);
            if (tabIndex === -1) return;

            const afterElement = this.getDragAfterElement(container, e.clientX, e.clientY);
            let newIndex = -1;

            if (afterElement) {
                const nextTabId = afterElement.getAttribute('data-tab-id');
                newIndex = this.tabs.findIndex(tab => tab.id === nextTabId);
            } else {
                newIndex = this.tabs.length - 1;
            }

            if (newIndex !== -1 && newIndex !== tabIndex) {
                const [movedTab] = this.tabs.splice(tabIndex, 1);
                this.tabs.splice(newIndex, 0, movedTab);

                this.saveData();
                this.renderTabs();
            }

            draggedTab = null;
        });
    }

    getDragAfterElement(container, x, y) {
        const tabs = [...container.querySelectorAll('.tab:not(.dragging)')];

        return tabs.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const isVertical = window.innerWidth >= 1024;

            const offset = isVertical
                ? y - box.top - (box.height / 2)
                : x - box.left - (box.width / 2);

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    renderTabs() {
        renderTabs(this);
    }

    editTabName(tabId, element) {
        editTabName(this, tabId, element);
    }

    removeMenu() {
        removeMenu();
    }

    showTabContextMenu(event, tabId) {
        showTabContextMenu(this, event, tabId);
    }

    duplicateTab(tabId) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (tab) {
            const newTab = {
                ...tab,
                id: this.generateId(),
                name: `${tab.name} (Copy)`,
                pinned: false,
                quickLinks: [...tab.quickLinks],
                createdAt: new Date().toISOString()
            };

            this.tabs.push(newTab);
            this.activeTabId = newTab.id;
            this.saveData();
            this.renderTabs();
            this.renderActiveTabContent();
        }
    }

    renderActiveTabContent() {
        renderActiveTabContent(this);
        this.setupQuickLinkDragDrop();
    }

    getFaviconUrl(url) {
        return getFaviconUrl(url);
    }

    setupQuickLinkDragDrop() {
        const quickLinks = document.querySelectorAll('.quick-link');
        let lastRightClickTime = 0;
        const RIGHT_CLICK_THROTTLE = 100;

        quickLinks.forEach((link, index) => {
            link.addEventListener('click', (e) => {
                if (e.detail > 1) {
                    e.preventDefault();
                    return;
                }

                const activeTab = this.tabs.find(tab => tab.id === this.activeTabId);
                const linkData = activeTab.quickLinks[index];
                if (linkData) {
                    window.open(linkData.url, '_blank');
                }
            });

            link.setAttribute('tabindex', '0');
            link.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    link.click();
                }
            });

            link.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', index.toString());
                link.classList.add('dragging');

                setTimeout(() => {
                    link.style.opacity = '0.5';
                    link.style.transform = 'rotate(5deg) scale(0.95)';
                }, 0);
            });

            link.addEventListener('dragend', () => {
                link.classList.remove('dragging');
                link.style.opacity = '';
                link.style.transform = '';
            });

            link.addEventListener('dragover', (e) => {
                e.preventDefault();
                link.classList.add('drop-zone');
            });

            link.addEventListener('dragleave', () => {
                link.classList.remove('drop-zone');
            });

            link.addEventListener('drop', (e) => {
                e.preventDefault();
                link.classList.remove('drop-zone');

                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                const toIndex = index;

                if (fromIndex !== toIndex) {
                    this.moveQuickLink(fromIndex, toIndex);
                }
            });

            link.addEventListener('contextmenu', (e) => {
                e.preventDefault();

                const now = Date.now();
                if (now - lastRightClickTime < RIGHT_CLICK_THROTTLE) {
                    return;
                }
                lastRightClickTime = now;

                const activeTab = this.tabs.find(tab => tab.id === this.activeTabId);
                const linkData = activeTab.quickLinks[index];
                if (linkData) {
                    this.showLinkContextMenu(e, linkData.id);
                }
            });
        });
    }

    addQuickLink() {
        const title = document.getElementById('linkTitle').value.trim();
        const url = document.getElementById('linkUrl').value.trim();

        if (!title || !url) return;

        let formattedUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            formattedUrl = 'https://' + url;
        }

        const activeTab = this.tabs.find(tab => tab.id === this.activeTabId);
        if (activeTab) {
            const link = {
                id: this.generateId(),
                title: title,
                url: formattedUrl,
                createdAt: new Date().toISOString()
            };

            activeTab.quickLinks.push(link);
            this.saveData();
            this.renderActiveTabContent();
        }

        document.getElementById('addLinkModal').classList.add('hidden');
    }

    showLinkContextMenu(event, linkId) {
        showLinkContextMenu(this, event, linkId);
    }

    deleteQuickLink(linkId) {
        const activeTab = this.tabs.find(tab => tab.id === this.activeTabId);
        if (activeTab) {
            const linkIndex = activeTab.quickLinks.findIndex(l => l.id === linkId);

            if (linkIndex > -1) {
                activeTab.quickLinks.splice(linkIndex, 1);
                this.saveData();
                this.renderActiveTabContent();
                this.showToast('Link deleted');
            }
        }
    }

    duplicateQuickLink(linkId) {
        const activeTab = this.tabs.find(tab => tab.id === this.activeTabId);
        const linkIndex = activeTab.quickLinks.findIndex(l => l.id === linkId);

        if (linkIndex !== -1) {
            const originalLink = activeTab.quickLinks[linkIndex];
            const duplicatedLink = {
                id: this.generateId(),
                title: originalLink.title,
                url: originalLink.url,
                createdAt: new Date().toISOString()
            };

            activeTab.quickLinks.push(duplicatedLink);
            this.saveData();
            this.renderActiveTabContent();

            this.showToast('Quick link duplicated successfully');
        }
    }

    copyLinkUrl(linkId) {
        const activeTab = this.tabs.find(tab => tab.id === this.activeTabId);
        const link = activeTab.quickLinks.find(l => l.id === linkId);

        if (link) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(link.url).then(() => {
                    this.showToast('URL copied to clipboard');
                }).catch(() => {
                    this.fallbackCopyToClipboard(link.url);
                });
            } else {
                this.fallbackCopyToClipboard(link.url);
            }
        }
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);

        try {
            textArea.focus();
            textArea.select();

            const successful = document.execCommand('copy');
            if (successful) {
                this.showToast('URL copied to clipboard');
            } else {
                this.showToast('Failed to copy URL', 3000);
            }
        } catch (err) {
            console.error('Failed to copy: ', err);
            this.showToast('Failed to copy URL', 3000);
        }

        document.body.removeChild(textArea);
    }

    moveQuickLink(fromIndex, toIndex) {
        const activeTab = this.tabs.find(tab => tab.id === this.activeTabId);
        const link = activeTab.quickLinks.splice(fromIndex, 1)[0];
        activeTab.quickLinks.splice(toIndex, 0, link);
        this.saveData();
        this.renderActiveTabContent();
    }

    showToast(message, duration = 3000) {
        showToast(message, duration);
    }

    saveData() {
        saveData(this);
    }

    loadData() {
        loadData(this);
    }

    exportData() {
        exportData(this);
    }

    importData(file) {
        importData(this, file);
    }

    resetToDefault() {
        // Clear all data
        this.tabs = [];
        this.activeTabId = null;

        // Reset settings to defaults
        this.settings = {
            theme: 'auto',
            accentColor: '59, 130, 246',
            searchEngine: 'google',
            layout: 'comfortable'
        };

        // Save the reset state
        this.saveData();

        // Reinitialize with default tabs
        this.init();

        // Show success message
        this.showToast('App has been reset to default settings');
    }

    resetData() {
        if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
            this.resetToDefault();
        }
    }
}