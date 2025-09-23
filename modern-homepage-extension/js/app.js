// Modern Homepage Extension - Main Application
class ModernHomepage {
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
        this.setupEventListeners();
        this.applyTheme();
        
        // Initialize default tabs if they don't exist
        const defaultTabs = [
            { name: 'Home', exists: false },
            { name: 'Tools', exists: false }
        ];
        
        // Check which default tabs already exist
        this.tabs.forEach(tab => {
            if (tab.isDefault) {
                const defaultTab = defaultTabs.find(t => t.name === tab.name);
                if (defaultTab) {
                    defaultTab.exists = true;
                    // Ensure the tab is marked as default
                    tab.isDefault = true;
                }
            }
        });
        
        // Create any missing default tabs
        defaultTabs.forEach(tab => {
            if (!tab.exists) {
                this.createTab(tab.name, false, true);
            }
        });
        
        // Ensure we have at least one tab and an active tab
        if (this.tabs.length === 0) {
            this.createTab('Home', true, true);
        } else if (!this.activeTabId || !this.tabs.some(tab => tab.id === this.activeTabId)) {
            this.activeTabId = this.tabs[0].id;
        }
        
        // Save the updated tabs and render
        this.saveData();
        this.renderTabs();
        this.renderActiveTabContent();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        searchBtn.addEventListener('click', () => {
            this.performSearch();
        });

        // Settings modal
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settingsModal');
        const closeSettingsBtn = document.getElementById('closeSettingsBtn');

        settingsBtn.addEventListener('click', () => {
            settingsModal.classList.remove('hidden');
            this.updateSettingsUI();
        });

        closeSettingsBtn.addEventListener('click', () => {
            settingsModal.classList.add('hidden');
        });

        // Delete confirmation modal
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
                this.confirmDeleteTab(tabId);
                closeDeleteModal();
            }
        });

        // Close modal on outside click
        deleteTabModal.addEventListener('click', (e) => {
            if (e.target === deleteTabModal) {
                closeDeleteModal();
            }
        });
        
        // Rename tab modal
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
                this.renameTab(tabId, newName);
                closeRenameModal();
            }
        });

        // Close modal on outside click
        renameTabModal.addEventListener('click', (e) => {
            if (e.target === renameTabModal) {
                closeRenameModal();
            }
        });

        // Theme controls
        document.getElementById('lightThemeBtn').addEventListener('click', () => {
            this.settings.theme = 'light';
            this.applyTheme();
            this.saveData();
            this.updateSettingsUI();
        });

        document.getElementById('darkThemeBtn').addEventListener('click', () => {
            this.settings.theme = 'dark';
            this.applyTheme();
            this.saveData();
            this.updateSettingsUI();
        });

        document.getElementById('autoThemeBtn').addEventListener('click', () => {
            this.settings.theme = 'auto';
            this.applyTheme();
            this.saveData();
            this.updateSettingsUI();
        });

        // Accent color controls
        document.querySelectorAll('.accent-color').forEach(btn => {
            btn.addEventListener('click', () => {
                this.settings.accentColor = btn.dataset.color;
                this.applyAccentColor();
                this.saveData();
                this.updateSettingsUI();
            });
        });

        // Search engine selection
        document.getElementById('searchEngineSelect').addEventListener('change', (e) => {
            this.settings.searchEngine = e.target.value;
            this.saveData();
        });

        // Data management
        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('importDataBtn').addEventListener('click', () => {
            document.getElementById('importFileInput').click();
        });

        document.getElementById('importFileInput').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        document.getElementById('resetDataBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
                this.resetData();
            }
        });

        // Add tab button
        document.getElementById('addTabBtn').addEventListener('click', () => {
            this.createTab();
        });
        
        // Setup drag and drop for tabs
        this.setupTabDragAndDrop();

        // Add link modal
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
            this.addQuickLink();
        });

        // Edit link modal
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

            const activeTab = this.tabs.find(tab => tab.id === this.activeTabId);
            if (activeTab) {
                const link = activeTab.quickLinks.find(l => l.id === linkId);
                if (link) {
                    link.title = title;
                    let formattedUrl = url;
                    if (!url.startsWith('http://') && !url.startsWith('https://')) {
                        formattedUrl = 'https://' + url;
                    }
                    link.url = formattedUrl;
                    this.saveData();
                    this.renderActiveTabContent();
                    closeEditModal();
                }
            }
        });

        // Close modals on outside click
        [settingsModal, addLinkModal, editLinkModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 't':
                        e.preventDefault();
                        this.createTab();
                        break;
                    case 'w':
                        e.preventDefault();
                        if (this.tabs.length > 1) {
                            this.deleteTab(this.activeTabId);
                        }
                        break;
                    case ',':
                        e.preventDefault();
                        document.getElementById('settingsBtn').click();
                        break;
                    case 'l':
                        e.preventDefault();
                        this.showAddLinkModal();
                        break;
                }
            }
        });
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
        const html = document.documentElement;

        if (this.settings.theme === 'dark') {
            html.classList.add('dark');
        } else if (this.settings.theme === 'light') {
            html.classList.remove('dark');
        } else {
            // Auto theme based on system preference
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                html.classList.add('dark');
            } else {
                html.classList.remove('dark');
            }
        }

        this.applyAccentColor();
    }

    applyAccentColor() {
        const root = document.documentElement;
        const [r, g, b] = this.settings.accentColor.split(', ').map(Number);

        root.style.setProperty('--primary-color', `rgb(${r}, ${g}, ${b})`);
        root.style.setProperty('--primary-dark-color', `rgb(${Math.max(0, r-20)}, ${Math.max(0, g-20)}, ${Math.max(0, b-20)})`);
        root.style.setProperty('--primary-light-color', `rgb(${Math.min(255, r+40)}, ${Math.min(255, g+40)}, ${Math.min(255, b+40)})`);
    }

    updateSettingsUI() {
        // Update theme buttons
        document.querySelectorAll('[id$="ThemeBtn"]').forEach(btn => {
            btn.classList.remove('theme-active');
        });
        document.getElementById(this.settings.theme + 'ThemeBtn').classList.add('theme-active');

        // Update accent color buttons
        document.querySelectorAll('.accent-color').forEach(btn => {
            btn.classList.remove('accent-active');
            if (btn.dataset.color === this.settings.accentColor) {
                btn.classList.add('accent-active');
            }
        });

        // Update search engine
        document.getElementById('searchEngineSelect').value = this.settings.searchEngine;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    createTab(name = null, setActive = true, isDefault = false) {
        const tabName = name || 'New Tab';
        const tab = {
            id: this.generateId(),
            name: tabName,
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
        const tab = this.tabs.find(tab => tab.id === tabId);
        if (!tab || tab.isDefault) return;
        
        if (tab.pinned) {
            this.showToast('Please unpin the tab before deleting');
            return;
        }
        
        // If tab has links, show confirmation dialog
        if (tab.quickLinks && tab.quickLinks.length > 0) {
            const modal = document.getElementById('deleteTabModal');
            document.getElementById('tabToDeleteId').value = tabId;
            modal.classList.remove('hidden');
        } else {
            // If no links, delete directly
            this.confirmDeleteTab(tabId);
        }
    }

    confirmDeleteTab(tabId) {
        if (this.tabs.length <= 1) return;

        const tab = this.tabs.find(tab => tab.id === tabId);
        if (!tab || tab.isDefault) return;
        
        const tabIndex = this.tabs.findIndex(t => t.id === tabId);
        this.tabs.splice(tabIndex, 1);

        // If deleted tab was active, switch to nearest tab
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
        
        // Show toast notification
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
        // Don't allow moving default tabs
        if (this.tabs[fromIndex].isDefault) return;
        
        // Adjust toIndex if trying to move past default tabs
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
        let dropIndex = -1;

        // Make tabs draggable
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
                // Remove all drag indicators
                document.querySelectorAll('.drag-indicator').forEach(el => el.remove());
            }
        });

        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            // Remove all drag indicators
            document.querySelectorAll('.drag-indicator').forEach(el => el.remove());
            
            // Find the tab we're hovering over
            const afterElement = this.getDragAfterElement(container, e.clientX, e.clientY);
            
            if (afterElement) {
                // Insert drag indicator before the element we're hovering over
                const indicator = document.createElement('div');
                indicator.className = 'drag-indicator h-8 w-1 bg-blue-500 mx-0.5';
                container.insertBefore(indicator, afterElement);
            } else {
                // Insert at the end if we're at the end of the container
                const indicator = document.createElement('div');
                indicator.className = 'drag-indicator h-8 w-1 bg-blue-500 mx-0.5';
                container.appendChild(indicator);
            }
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();
            
            // Only proceed if we have a dragged tab
            if (!draggedTab) return;
            
            // Get the tab ID from the dragged element
            const tabId = draggedTab.getAttribute('data-tab-id');
            if (!tabId) return;
            
            // Find the tab in our tabs array
            const tabIndex = this.tabs.findIndex(tab => tab.id === tabId);
            if (tabIndex === -1) return;
            
            // Find the tab we're dropping after
            const afterElement = this.getDragAfterElement(container, e.clientX, e.clientY);
            let newIndex = -1;
            
            if (afterElement) {
                const nextTabId = afterElement.getAttribute('data-tab-id');
                newIndex = this.tabs.findIndex(tab => tab.id === nextTabId);
            } else {
                // If dropping at the end
                newIndex = this.tabs.length - 1;
            }
            
            // Don't do anything if the position hasn't changed
            if (newIndex !== -1 && newIndex !== tabIndex) {
                // Move the tab in the tabs array
                const [movedTab] = this.tabs.splice(tabIndex, 1);
                this.tabs.splice(newIndex, 0, movedTab);
                
                // Save and re-render
                this.saveData();
                this.renderTabs();
            }
            
            // Reset dragged tab
            draggedTab = null;
        });
    }
    
    getDragAfterElement(container, x, y) {
        const tabs = [...container.querySelectorAll('.tab:not(.dragging)')];
        
        return tabs.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const isVertical = window.innerWidth >= 1024; // lg breakpoint from Tailwind
            
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
        const container = document.getElementById('tabContainer');
        container.innerHTML = '';

        // Sort tabs: default tabs first, then pinned tabs, then regular tabs
        const sortedTabs = [...this.tabs].sort((a, b) => {
            // Default tabs first
            if (a.isDefault && !b.isDefault) return -1;
            if (!a.isDefault && b.isDefault) return 1;
            
            // Then pinned tabs
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            
            // Then by position in the array (maintain manual order)
            return this.tabs.indexOf(a) - this.tabs.indexOf(b);
        });

        sortedTabs.forEach((tab, index) => {
            const tabElement = document.createElement('div');
            tabElement.className = `tab flex items-center px-3 py-2 lg:px-4 lg:py-3 rounded-t-lg lg:rounded-t-none lg:rounded-l-lg cursor-pointer transition-colors ${
                tab.id === this.activeTabId 
                    ? 'active' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
            } ${tab.pinned ? 'pinned' : ''}`;
            
            // Add drag and drop attributes
            tabElement.setAttribute('draggable', 'true');
            tabElement.setAttribute('data-tab-id', tab.id);

            // Determine which icon to show based on tab name for default tabs
            let tabIcon = '';
            if (tab.isDefault) {
                if (tab.name === 'Home') {
                    tabIcon = '<svg class="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>';
                } else if (tab.name === 'Tools') {
                    tabIcon = '<svg class="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.5 6h6.75M21 12c0 1.1-.9 2-2 2h-1.5M3 12c0-1.1.9-2 2-2h1.5m13.5 0h-15c-.83 0-1.5.67-1.5 1.5v6c0 .83.67 1.5 1.5 1.5h15c.83 0 1.5-.67 1.5-1.5v-6c0-.83-.67-1.5-1.5-1.5z"></path></svg>';
                }
            }

            // Build the tab content
            // Add pin icon if tab is pinned
            const pinIcon = tab.pinned ? 
                '<svg class="w-3 h-3 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>' : 
                '';
                
            let tabContent = `
                <span class="tab-name flex items-center flex-1 text-left justify-start" title="${tab.name}">
                    ${tab.pinned ? pinIcon : ''}
                    ${tab.isDefault ? tabIcon : ''}
                    <span class="text-left">${tab.name}</span>
                </span>`;
            
            // Add close button for non-default, non-pinned tabs
            if (!tab.pinned && !tab.isDefault) {
                tabContent += `
                    <button class="tab-close p-1 hover:bg-black hover:bg-opacity-20 rounded transition-colors" onclick="event.stopPropagation(); app.showDeleteConfirmation('${tab.id}')">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>`;
            }
            
            tabElement.innerHTML = tabContent;

            // Tab click handler
            tabElement.addEventListener('click', () => {
                this.switchTab(tab.id);
            });

            // Double click to rename (only for non-default tabs)
            const tabName = tabElement.querySelector('.tab-name');
            if (!tab.isDefault) {
                tabName.addEventListener('dblclick', (e) => {
                    e.stopPropagation();
                    this.editTabName(tab.id, tabName);
                });
            }

            // Context menu
            tabElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showTabContextMenu(e, tab.id);
            });

            // Drag and drop (only for non-default tabs)
            if (!tab.isDefault) {
                tabElement.draggable = true;
                tabElement.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', index.toString());
                    tabElement.classList.add('opacity-50');
                });
            } else {
                tabElement.draggable = false;
            }

            tabElement.addEventListener('dragend', () => {
                tabElement.classList.remove('opacity-50');
            });

            tabElement.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            tabElement.addEventListener('drop', (e) => {
                e.preventDefault();
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                const toIndex = index;
                this.moveTab(fromIndex, toIndex);
            });

            container.appendChild(tabElement);
        });
    }

    editTabName(tabId, element) {
        const tab = this.tabs.find(t => t.id === tabId);
        const input = document.createElement('input');
        input.type = 'text';
        input.value = tab.name;
        input.className = 'bg-transparent border-none outline-none text-inherit w-full';

        element.textContent = '';
        element.appendChild(input);
        input.focus();
        input.select();

        const save = () => {
            const newName = input.value.trim() || tab.name;
            this.renameTab(tabId, newName);
        };

        input.addEventListener('blur', save);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                save();
            } else if (e.key === 'Escape') {
                this.renderTabs();
            }
        });
    }

    removeMenu() {
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
    }

    positionContextMenu(menu, event) {
        const { clientX, clientY } = event;
        const { innerWidth, innerHeight } = window;

        menu.style.opacity = '0';
        document.body.appendChild(menu);

        const menuWidth = menu.offsetWidth;
        const menuHeight = menu.offsetHeight;

        let top = clientY;
        let left = clientX;

        // If menu overflows vertically, position it above the cursor
        if (clientY + menuHeight > innerHeight) {
            top = clientY - menuHeight;
        }

        // If menu overflows horizontally, position it to the left of the cursor
        if (clientX + menuWidth > innerWidth) {
            left = clientX - menuWidth;
        }

        // Prevent menu from going off-screen at the top or left
        if (top < 0) {
            top = 0;
        }
        if (left < 0) {
            left = 0;
        }

        menu.style.top = `${top}px`;
        menu.style.left = `${left}px`;
        menu.style.opacity = '1';
    }

    showTabContextMenu(event, tabId) {
        event.preventDefault();

        // Remove any existing context menu
        this.removeMenu();

        const tab = this.tabs.find(tab => tab.id === tabId);
        if (!tab) return;

        const menu = document.createElement('div');
        menu.className = 'context-menu';

        let menuItems = [];

        if (tab.isDefault) {
            menuItems.push(`<div class="context-menu-item opacity-50 cursor-default">Default tab (cannot be modified)</div>`);
        } else {
            // Add Rename option (disabled if pinned)
            if (tab.pinned) {
                menuItems.push(`<div class="context-menu-item opacity-50 cursor-default">Rename (unpin first)</div>`);
            } else {
                menuItems.push(`<div class="context-menu-item" onclick="app.renameTabPrompt('${tabId}')">Rename</div>`);
            }

            // Add Pin/Unpin option
            menuItems.push(`<div class="context-menu-item" onclick="app.togglePinTab('${tabId}')">${tab.pinned ? 'Unpin' : 'Pin'} Tab</div>`);

            // Add Duplicate option
            menuItems.push(`<div class="context-menu-item" onclick="app.duplicateTab('${tabId}')">Duplicate</div>`);

            // Add Close option (disabled if pinned)
            if (this.tabs.length > 1) {
                if (tab.pinned) {
                    menuItems.push(`<div class="context-menu-item text-red-600 dark:text-red-400 opacity-50">Close Tab (unpin first)</div>`);
                } else {
                    menuItems.push(`<div class="context-menu-item text-red-600 dark:text-red-400" onclick="app.showDeleteConfirmation('${tabId}')">Close Tab</div>`);
                }
            }
        }

        menu.innerHTML = menuItems.join('');

        this.positionContextMenu(menu, event);

        const removeMenu = () => {
            menu.remove();
            document.removeEventListener('click', removeMenu);
        };

        setTimeout(() => {
            document.addEventListener('click', removeMenu);
        }, 0);
    }

    renameTabPrompt(tabId) {
        const tab = this.tabs.find(t => t.id === tabId);
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
        const container = document.getElementById('tabContent');
        const activeTab = this.tabs.find(tab => tab.id === this.activeTabId);

        if (!activeTab) return;

        container.innerHTML = `
            <div class="mb-6">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">${activeTab.name}</h2>
                    <button id="addLinkBtn" class="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        <span>Add Link</span>
                    </button>
                </div>

                ${activeTab.quickLinks.length === 0 
                    ? `<div class="text-center py-12 text-gray-500 dark:text-gray-400">
                        <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                        </svg>
                        <h3 class="text-lg font-medium mb-2">No Quick Links Yet</h3>
                        <p class="text-sm">Add your favorite websites to get started</p>
                      </div>`
                    : `<div id="quickLinksGrid" class="grid ${this.settings.layout === 'compact' ? 'grid-compact' : this.settings.layout === 'spacious' ? 'grid-spacious' : 'grid-comfortable'}">
                        ${activeTab.quickLinks.map(link => this.renderQuickLink(link)).join('')}
                      </div>`
                }
            </div>
        `;

        // Add event listeners
        const addLinkBtn = document.getElementById('addLinkBtn');
        if (addLinkBtn) {
            addLinkBtn.addEventListener('click', () => {
                this.showAddLinkModal();
            });
        }

        // Setup drag and drop for existing links
        this.setupQuickLinkDragDrop();
    }    
    renderQuickLink(link) {
        const favicon = this.getFaviconUrl(link.url);
        return `
            <div class="quick-link group" data-link-id="${link.id}" draggable="true">
                <div class="flex flex-col items-center space-y-3">
                    <div class="quick-link-favicon flex-shrink-0">
                        <img src="${favicon}" alt="${link.title}" loading="lazy"
                             onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%23666%22><rect width=%2224%22 height=%2224%22 rx=%224%22/><path d=%22M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z%22 fill=%22white%22/></svg>'">
                    </div>

                    <div class="quick-link-content flex-1 min-w-0 w-full text-center">
                        <h3 class="quick-link-title text-gray-900 dark:text-white" title="${link.title}">
                            ${link.title}
                        </h3>
                    </div>
                </div>
            </div>
        `;
    }

    getFaviconUrl(url) {
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
        } catch {
            // Return a default favicon
            return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"><rect width="24" height="24" rx="4"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="white"/></svg>';
        }
    }

    setupQuickLinkDragDrop() {
        const quickLinks = document.querySelectorAll('.quick-link');
        let lastRightClickTime = 0;
        const RIGHT_CLICK_THROTTLE = 100; // Minimum time between right-clicks (ms)

        quickLinks.forEach((link, index) => {
            // Add click handler to open link
            link.addEventListener('click', (e) => {
                // Prevent double-click
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

            // Add keyboard navigation
            link.setAttribute('tabindex', '0');
            link.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    link.click();
                }
            });

            // Drag and drop functionality
            link.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', index.toString());
                link.classList.add('dragging');

                // Add visual feedback
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

            // Right-click context menu with throttling
            link.addEventListener('contextmenu', (e) => {
                e.preventDefault();

                const now = Date.now();
                if (now - lastRightClickTime < RIGHT_CLICK_THROTTLE) {
                    return; // Ignore rapid successive right-clicks
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

    showAddLinkModal() {
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

    addQuickLink() {
        const title = document.getElementById('linkTitle').value.trim();
        const url = document.getElementById('linkUrl').value.trim();

        if (!title || !url) return;

        // Ensure URL has protocol
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

        // Close modal
        document.getElementById('addLinkModal').classList.add('hidden');
    }

    showLinkContextMenu(event, linkId) {
        event.stopPropagation();

        // Remove any existing context menu
        this.removeMenu();

        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.innerHTML = `
            <div class="context-menu-item" onclick="app.editQuickLink('${linkId}')">Edit</div>
            <div class="context-menu-item" onclick="app.copyLinkUrl('${linkId}')">Copy URL</div>
            <div class="context-menu-item" onclick="app.duplicateQuickLink('${linkId}')">Duplicate</div>
            <div class="context-menu-item text-red-600 dark:text-red-400" onclick="app.deleteQuickLink('${linkId}')">Delete</div>
        `;

        this.positionContextMenu(menu, event);

        const removeMenu = () => {
            menu.remove();
            document.removeEventListener('click', removeMenu);
        };

        setTimeout(() => {
            document.addEventListener('click', removeMenu);
        }, 0);
    }

    editQuickLink(linkId) {
        const activeTab = this.tabs.find(tab => tab.id === this.activeTabId);
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

            // Show success message
            this.showToast('Quick link duplicated successfully');
        }
    }

    copyLinkUrl(linkId) {
        const activeTab = this.tabs.find(tab => tab.id === this.activeTabId);
        const link = activeTab.quickLinks.find(l => l.id === linkId);

        if (link) {
            // Try modern clipboard API first
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(link.url).then(() => {
                    this.showToast('URL copied to clipboard');
                }).catch(() => {
                    // Fallback to older method
                    this.fallbackCopyToClipboard(link.url);
                });
            } else {
                // Fallback for older browsers
                this.fallbackCopyToClipboard(link.url);
            }
        }
    }

    fallbackCopyToClipboard(text) {
        // Create a temporary textarea element
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
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-y-full opacity-0';
        toast.textContent = message;

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-y-full', 'opacity-0');
        }, 100);

        // Animate out and remove
        setTimeout(() => {
            toast.classList.add('translate-y-full', 'opacity-0');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);
    }

    saveData() {
        const data = {
            tabs: this.tabs,
            activeTabId: this.activeTabId,
            settings: this.settings,
            version: '1.0.0',
            lastModified: new Date().toISOString()
        };

        localStorage.setItem('modernHomepage', JSON.stringify(data));
    }

    loadData() {
        try {
            const data = JSON.parse(localStorage.getItem('modernHomepage') || '{}');

            if (data.tabs) {
                // Ensure all tabs have the isDefault property
                this.tabs = data.tabs.map(tab => ({
                    ...tab,
                    isDefault: tab.isDefault || false
                }));
                
                this.activeTabId = data.activeTabId;
                this.settings = { ...this.settings, ...data.settings };
            }
        } catch (error) {
            console.error('Error loading data:', error);
            // If there's an error, reset to default state
            this.tabs = [];
            this.activeTabId = null;
        }
    }

    exportData() {
        const data = {
            tabs: this.tabs,
            activeTabId: this.activeTabId,
            settings: this.settings,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `modern-homepage-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
        this.showToast('Data exported successfully');
    }

    importData(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (data.tabs && Array.isArray(data.tabs)) {
                    if (confirm('This will replace all current data. Are you sure you want to continue?')) {
                        this.tabs = data.tabs;
                        this.settings = { ...this.settings, ...data.settings };
                        
                        // Set active tab ID from import, with fallback
                        if (data.activeTabId && data.tabs.some(t => t.id === data.activeTabId)) {
                            this.activeTabId = data.activeTabId;
                        } else {
                            this.activeTabId = data.tabs.length > 0 ? data.tabs[0].id : null;
                        }

                        this.saveData();
                        this.applyTheme();
                        this.renderTabs();
                        this.renderActiveTabContent();

                        this.showToast('Data imported successfully');
                    }
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                alert('Error importing data: ' + error.message);
            }
        };

        reader.readAsText(file);
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

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ModernHomepage();
});

// Apply theme on system preference change
window.matchMedia('(prefers-color-scheme: dark)').addListener(() => {
    if (window.app && window.app.settings.theme === 'auto') {
        window.app.applyTheme();
    }
});