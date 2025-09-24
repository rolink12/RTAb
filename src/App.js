import TabManager from './components/TabManager';
import SearchBar from './components/SearchBar';
import SettingsManager from './services/SettingsManager';
import SettingsModal from './components/Settings';
import LinkForm from './components/LinkForm';
import { debounce } from './utils/helpers';

export default class App {
  constructor() {
    this.settings = new SettingsManager();
    this.settingsModal = new SettingsModal(this);
    this.tabManager = null;
    this.searchBar = null;
    this.currentTabId = null;
    this.links = new Map();
    this.isInitialized = false;
    
    // Bind methods
    this.init = this.init.bind(this);
    this.applyTheme = this.applyTheme.bind(this);
    this.showSettings = this.showSettings.bind(this);
    this.showAddLinkForm = this.showAddLinkForm.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
    this.saveLinks = debounce(this.saveLinks.bind(this), 500);
    
    // Initialize the app
    this.init();
  }

  async init() {
    try {
      // Initialize settings
      await this.settings.load();
      
      // Apply theme
      this.applyTheme();
      
      // Initialize components
      this.searchBar = new SearchBar(this);
      this.tabManager = new TabManager(this);
      
      // Load tabs and links
      await this.loadTabsAndLinks();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Set flag
      this.isInitialized = true;
      
      console.log('App initialized successfully');
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }
  
  async loadTabsAndLinks() {
    try {
      // Load tabs
      await this.tabManager.loadTabs();
      
      // Set the first tab as active if none is set
      if (this.tabManager.tabs.length > 0 && !this.currentTabId) {
        this.currentTabId = this.tabManager.tabs[0].id;
      }
      
      // Load links for the current tab
      if (this.currentTabId) {
        await this.loadLinks(this.currentTabId);
      }
      
      // Render the active tab
      this.tabManager.renderTabs();
      this.renderActiveTab();
      
    } catch (error) {
      console.error('Error loading tabs and links:', error);
    }
  }
  
  async loadLinks(tabId) {
    try {
      const data = await chrome.storage.local.get([`tab_${tabId}_links`]);
      const links = data[`tab_${tabId}_links`] || [];
      
      // Store links in memory
      this.links.set(tabId, links);
      
      return links;
    } catch (error) {
      console.error('Error loading links:', error);
      this.links.set(tabId, []);
      return [];
    }
  }
  
  async saveLinks() {
    if (!this.currentTabId) return;
    
    try {
      const links = this.links.get(this.currentTabId) || [];
      await chrome.storage.local.set({
        [`tab_${this.currentTabId}_links`]: links
      });
    } catch (error) {
      console.error('Error saving links:', error);
    }
  }
  
  setupEventListeners() {
    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', this.showSettings);
    }
    
    // Add tab button
    const addTabBtn = document.getElementById('addTabBtn');
    if (addTabBtn) {
      addTabBtn.addEventListener('click', () => this.tabManager.showAddTabModal());
    }
    
    // System theme change listener
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (this.settings.get('theme') === 'auto') {
        this.applyTheme();
      }
    });
  }
  
  async handleTabChange(tabId) {
    if (tabId === this.currentTabId) return;
    
    // Save current tab's state
    await this.saveLinks();
    
    // Update current tab
    this.currentTabId = tabId;
    
    // Load new tab's links
    if (!this.links.has(tabId)) {
      await this.loadLinks(tabId);
    }
    
    // Render the new tab
    this.renderActiveTab();
  }
  
  renderActiveTab() {
    const tabContent = document.getElementById('tabContent');
    if (!tabContent || !this.currentTabId) return;
    
    const currentTab = this.tabManager.tabs.find(tab => tab.id === this.currentTabId);
    if (!currentTab) return;
    
    // Render tab content
    tabContent.innerHTML = '';
    
    // Add tab title
    const title = document.createElement('h2');
    title.className = 'text-2xl font-bold mb-6 text-gray-900 dark:text-white';
    title.textContent = currentTab.name;
    tabContent.appendChild(title);
    
    // Add links container
    const linksContainer = document.createElement('div');
    linksContainer.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4';
    linksContainer.id = 'linksContainer';
    tabContent.appendChild(linksContainer);
    
    // Add "Add Link" button
    const addLinkBtn = document.createElement('button');
    addLinkBtn.className = 'flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group';
    addLinkBtn.innerHTML = `
      <svg class="w-8 h-8 text-gray-400 group-hover:text-primary mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
      </svg>
      <span class="text-sm text-gray-600 dark:text-gray-400 group-hover:text-primary">Add Link</span>
    `;
    addLinkBtn.addEventListener('click', this.showAddLinkForm);
    linksContainer.appendChild(addLinkBtn);
    
    // Render links
    const links = this.links.get(this.currentTabId) || [];
    this.renderLinks(links, linksContainer);
  }
  
  renderLinks(links, container) {
    if (!container) return;
    
    // Clear existing links (except the add button)
    const addButton = container.querySelector('button:last-child');
    container.innerHTML = '';
    if (addButton) container.appendChild(addButton);
    
    // Add links
    links.forEach(link => {
      const linkItem = new LinkItem(link, 
        () => this.showEditLinkForm(link),
        () => this.deleteLink(link.id)
      );
      
      // Insert before the add button
      container.insertBefore(linkItem.render(), addButton);
    });
  }
  
  showSettings() {
    this.settingsModal.show();
  }
  
  showAddLinkForm() {
    const form = new LinkForm({
      onSubmit: async (newLink) => {
        const links = this.links.get(this.currentTabId) || [];
        links.push({
          ...newLink,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        this.links.set(this.currentTabId, links);
        await this.saveLinks();
        this.renderActiveTab();
      }
    });
    
    form.show();
  }
  
  showEditLinkForm(link) {
    const form = new LinkForm({
      link,
      onSubmit: async (updatedLink) => {
        const links = this.links.get(this.currentTabId) || [];
        const index = links.findIndex(l => l.id === link.id);
        
        if (index !== -1) {
          links[index] = {
            ...links[index],
            ...updatedLink,
            updatedAt: new Date().toISOString()
          };
          
          this.links.set(this.currentTabId, links);
          await this.saveLinks();
          this.renderActiveTab();
        }
      }
    });
    
    form.show();
  }
  
  async deleteLink(linkId) {
    const links = this.links.get(this.currentTabId) || [];
    const updatedLinks = links.filter(link => link.id !== linkId);
    
    this.links.set(this.currentTabId, updatedLinks);
    await this.saveLinks();
    this.renderActiveTab();
  }

  applyTheme() {
    const theme = this.settings.get('theme', 'auto');
    
    // Apply theme class
    if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Apply accent color
    const accentColor = this.settings.get('accentColor', '59, 130, 246');
    document.documentElement.style.setProperty('--primary-color', `rgb(${accentColor})`);
    document.documentElement.style.setProperty('--primary-dark-color', `rgb(${this.adjustBrightness(accentColor, -20)})`);
    document.documentElement.style.setProperty('--primary-light-color', `rgb(${this.adjustBrightness(accentColor, 20)})`);
    
    // Apply layout
    const layout = this.settings.get('layout', 'comfortable');
    document.documentElement.setAttribute('data-layout', layout);
  }
  
  adjustBrightness(rgbString, amount) {
    const [r, g, b] = rgbString.split(',').map(Number);
    return [
      Math.max(0, Math.min(255, r + amount)),
      Math.max(0, Math.min(255, g + amount)),
      Math.max(0, Math.min(255, b + amount))
    ].join(', ');
  }
}
