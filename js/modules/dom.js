export function renderTabs(app) {
    const container = document.getElementById('tabContainer');
    container.innerHTML = '';

    // Sort tabs: default tabs first, then pinned tabs, then regular tabs
    const sortedTabs = [...app.tabs].sort((a, b) => {
        // Default tabs first
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;

        // Then pinned tabs
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;

        // Then by position in the array (maintain manual order)
        return app.tabs.indexOf(a) - app.tabs.indexOf(b);
    });

    sortedTabs.forEach((tab, index) => {
        const tabElement = document.createElement('div');
        tabElement.className = `tab flex items-center px-3 py-2 lg:px-4 lg:py-3 rounded-t-lg lg:rounded-t-none lg:rounded-l-lg cursor-pointer transition-colors ${
            tab.id === app.activeTabId
                ? 'active'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
        } ${tab.pinned ? 'pinned' : ''}`;

        // Add drag and drop attributes
        tabElement.setAttribute('draggable', 'true');
        tabElement.setAttribute('data-tab-id', tab.id);
        tabElement.setAttribute('role', 'tab');
        tabElement.setAttribute('aria-selected', tab.id === app.activeTabId);
        tabElement.setAttribute('tabindex', tab.id === app.activeTabId ? '0' : '-1');

        // Determine which icon to show based on tab name for default tabs
        let tabIcon = '';
        const genericIcon = '<svg class="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>'; // Generic document icon

        if (tab.isDefault) {
            if (tab.name === 'Home') {
                tabIcon = '<svg class="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>';
            } else if (tab.name === 'Tools') {
                tabIcon = '<svg class="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.5 6h6.75M21 12c0 1.1-.9 2-2 2h-1.5M3 12c0-1.1.9-2 2-2h1.5m13.5 0h-15c-.83 0-1.5.67-1.5 1.5v6c0 .83.67 1.5 1.5 1.5h15c.83 0 1.5-.67 1.5-1.5v-6c0-.83-.67-1.5-1.5-1.5z"></path></svg>';
            }
        } else {
            tabIcon = genericIcon; // Assign generic icon for non-default tabs
        }

        // Build the tab content
        // Add pin icon if tab is pinned
        const pinIcon = tab.pinned ?
            '<svg class="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>' :
            '';

        let tabContent = `
            <span class="tab-name flex items-center flex-1 text-left justify-start" title="${tab.name}">
                ${tab.pinned ? pinIcon : tabIcon} <!-- Show pinIcon if pinned, otherwise show tabIcon -->
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
            app.switchTab(tab.id);
        });

        // Double click to rename (only for non-default tabs)
        const tabName = tabElement.querySelector('.tab-name');
        if (!tab.isDefault) {
            tabName.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                editTabName(app, tab.id, tabName);
            });
        }

        // Context menu
        tabElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showTabContextMenu(app, e, tab.id);
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
            app.moveTab(fromIndex, toIndex);
        });

        container.appendChild(tabElement);
    });
}

export function renderActiveTabContent(app) {
    const container = document.getElementById('tabContent');
    const activeTab = app.tabs.find(tab => tab.id === app.activeTabId);

    console.log('Rendering tab content. Active tab:', activeTab ? activeTab.name : 'None');

    if (!activeTab) {
        console.log('No active tab found, returning.');
        return;
    }

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
                : `<div id="quickLinksGrid" class="grid ${app.settings.layout === 'compact' ? 'grid-compact' : app.settings.layout === 'spacious' ? 'grid-spacious' : 'grid-comfortable'}">
                    ${activeTab.quickLinks.map(link => renderQuickLink(link)).join('')}
                    </div>`
            }
        </div>
    `;

    // Add event listeners
    const addLinkBtn = document.getElementById('addLinkBtn');
    if (addLinkBtn) {
        addLinkBtn.addEventListener('click', () => {
            app.showAddLinkModal();
        });
    }

    // Setup drag and drop for existing links
    // This will be called from the main App class after rendering
}

export function renderQuickLink(link) {
    const favicon = getFaviconUrl(link.url);
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

export function getFaviconUrl(url) {
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
        // Return a default favicon
        return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"><rect width="24" height="24" rx="4"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="white"/></svg>';
    }
}

export function updateSettingsUI(app) {
    // Update theme buttons
    document.querySelectorAll('[id$="ThemeBtn"]').forEach(btn => {
        btn.classList.remove('theme-active');
    });
    document.getElementById(app.settings.theme + 'ThemeBtn').classList.add('theme-active');

    // Update accent color buttons
    document.querySelectorAll('.accent-color').forEach(btn => {
        btn.classList.remove('accent-active');
        if (btn.dataset.color === app.settings.accentColor) {
            btn.classList.add('accent-active');
        }
    });

    // Update search engine
    document.getElementById('searchEngineSelect').value = app.settings.searchEngine;
}

export function showToast(message, duration = 3000) {
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

export function removeMenu() {
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
}

export function positionContextMenu(menu, event) {
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

export function showTabContextMenu(app, event, tabId) {
    event.preventDefault();

    // Remove any existing context menu
    removeMenu();

    const tab = app.tabs.find(tab => tab.id === tabId);
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
        if (app.tabs.length > 1) {
            if (tab.pinned) {
                menuItems.push(`<div class="context-menu-item text-red-600 dark:text-red-400 opacity-50">Close Tab (unpin first)</div>`);
            } else {
                menuItems.push(`<div class="context-menu-item text-red-600 dark:text-red-400" onclick="app.showDeleteConfirmation('${tabId}')">Close Tab</div>`);
            }
        }
    }

    menu.innerHTML = menuItems.join('');

    positionContextMenu(menu, event);

    const removeMenuListener = () => {
        menu.remove();
        document.removeEventListener('click', removeMenuListener);
    };

    setTimeout(() => {
        document.addEventListener('click', removeMenuListener);
    }, 0);
}

export function showLinkContextMenu(app, event, linkId) {
    event.stopPropagation();

    // Remove any existing context menu
    removeMenu();

    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.innerHTML = `
        <div class="context-menu-item" onclick="app.editQuickLink('${linkId}')">Edit</div>
        <div class="context-menu-item" onclick="app.copyLinkUrl('${linkId}')">Copy URL</div>
        <div class="context-menu-item" onclick="app.duplicateQuickLink('${linkId}')">Duplicate</div>
        <div class="context-menu-item text-red-600 dark:text-red-400" onclick="app.deleteQuickLink('${linkId}')">Delete</div>
    `;

    positionContextMenu(menu, event);

    const removeMenuListener = () => {
        menu.remove();
        document.removeEventListener('click', removeMenuListener);
    };

    setTimeout(() => {
        document.addEventListener('click', removeMenuListener);
    }, 0);
}

export function editTabName(app, tabId, element) {
    const tab = app.tabs.find(t => t.id === tabId);
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
        app.renameTab(tabId, newName);
    };

    input.addEventListener('blur', save);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            save();
        } else if (e.key === 'Escape') {
            renderTabs(app);
        }
    });
}