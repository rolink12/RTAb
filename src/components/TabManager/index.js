import Tab from './Tab';

export default class TabManager {
  constructor(app) {
    this.app = app;
    this.tabs = [];
    this.activeTabId = null;
    this.tabContainer = document.getElementById('tabContainer');
    this.tabContent = document.getElementById('tabContent');
  }

  async init() {
    await this.loadTabs();
    this.setupEventListeners();
    this.renderTabs();
    this.ensureDefaultTabs();
  }

  async loadTabs() {
    try {
      const data = await chrome.storage.local.get(['tabs', 'activeTabId']);
      this.tabs = data.tabs || [];
      this.activeTabId = data.activeTabId || null;
    } catch (error) {
      console.error('Error loading tabs:', error);
      this.tabs = [];
      this.activeTabId = null;
    }
  }

  async saveTabs() {
    try {
      await chrome.storage.local.set({
        tabs: this.tabs,
        activeTabId: this.activeTabId
      });
    } catch (error) {
      console.error('Error saving tabs:', error);
    }
  }

  async createTab(name, isActive = false, isDefault = false) {
    const tab = new Tab({
      id: crypto.randomUUID(),
      name,
      isDefault,
      links: [],
      layout: 'grid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    this.tabs.push(tab);
    
    if (isActive || this.tabs.length === 1) {
      this.activeTabId = tab.id;
    }

    await this.saveTabs();
    this.renderTabs();
    return tab;
  }

  async deleteTab(tabId) {
    const tabIndex = this.tabs.findIndex(tab => tab.id === tabId);
    if (tabIndex === -1) return false;

    // Don't allow deleting default tabs
    if (this.tabs[tabIndex].isDefault) return false;

    this.tabs.splice(tabIndex, 1);

    // If we deleted the active tab, activate the previous one or the first one
    if (this.activeTabId === tabId) {
      this.activeTabId = this.tabs[tabIndex - 1]?.id || this.tabs[0]?.id || null;
    }

    await this.saveTabs();
    this.renderTabs();
    return true;
  }

  async setActiveTab(tabId) {
    if (!this.tabs.some(tab => tab.id === tabId)) return false;
    
    this.activeTabId = tabId;
    await this.saveTabs();
    this.renderTabs();
    return true;
  }

  ensureDefaultTabs() {
    const defaultTabs = [
      { name: 'Home', exists: false },
      { name: 'Tools', exists: false }
    ];

    // Check existing tabs
    this.tabs.forEach(tab => {
      if (tab.isDefault) {
        const defaultTab = defaultTabs.find(t => t.name === tab.name);
        if (defaultTab) defaultTab.exists = true;
      }
    });

    // Create missing default tabs
    defaultTabs.forEach(async tab => {
      if (!tab.exists) {
        await this.createTab(tab.name, false, true);
      }
    });
  }

  renderTabs() {
    if (!this.tabContainer) return;

    this.tabContainer.innerHTML = '';
    
    this.tabs.forEach(tab => {
      const tabElement = document.createElement('button');
      tabElement.className = `flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        this.activeTabId === tab.id
          ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
      }`;
      
      tabElement.textContent = tab.name;
      tabElement.addEventListener('click', () => this.setActiveTab(tab.id));
      
      this.tabContainer.appendChild(tabElement);
    });

    this.renderActiveTabContent();
  }

  renderActiveTabContent() {
    if (!this.tabContent) return;
    
    const activeTab = this.tabs.find(tab => tab.id === this.activeTabId);
    if (!activeTab) {
      this.tabContent.innerHTML = '<div class="text-center py-10 text-gray-500">No active tab</div>';
      return;
    }

    // This is a simplified version - we'll enhance it later with the actual tab content
    this.tabContent.innerHTML = `
      <div class="p-6">
        <h2 class="text-2xl font-bold mb-4">${activeTab.name}</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" id="linksContainer">
          <!-- Links will be rendered here -->
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const addTabBtn = document.getElementById('addTabBtn');
    if (addTabBtn) {
      addTabBtn.addEventListener('click', () => this.showAddTabModal());
    }
  }

  async showAddTabModal() {
    // This will be implemented with a proper modal component later
    const tabName = prompt('Enter tab name:');
    if (tabName) {
      await this.createTab(tabName, true);
    }
  }
}
