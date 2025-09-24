import Modal from '../Modal';

export default class SettingsModal {
  constructor(app) {
    this.app = app;
    this.modal = null;
  }

  async show() {
    const settings = this.app.settings.get();
    
    // Create settings form HTML
    const content = `
      <div class="space-y-6">
        <!-- Theme Settings -->
        <div>
          <label class="block text-sm font-medium mb-2">Theme</label>
          <div class="grid grid-cols-3 gap-2">
            <button 
              id="lightThemeBtn" 
              class="p-2 border rounded-lg text-sm transition-colors ${settings.theme === 'light' ? 'border-primary bg-blue-100 dark:bg-blue-900/30 text-primary' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}"
            >
              Light
            </button>
            <button 
              id="darkThemeBtn" 
              class="p-2 border rounded-lg text-sm transition-colors ${settings.theme === 'dark' ? 'border-primary bg-blue-100 dark:bg-blue-900/30 text-primary' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}"
            >
              Dark
            </button>
            <button 
              id="autoThemeBtn" 
              class="p-2 border rounded-lg text-sm transition-colors ${settings.theme === 'auto' ? 'border-primary bg-blue-100 dark:bg-blue-900/30 text-primary' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}"
            >
              System
            </button>
          </div>
        </div>

        <!-- Accent Color -->
        <div>
          <label class="block text-sm font-medium mb-2">Accent Color</label>
          <div class="grid grid-cols-6 gap-2">
            ${this.getColorOptions(settings.accentColor)}
          </div>
        </div>

        <!-- Search Engine -->
        <div>
          <label for="searchEngineSelect" class="block text-sm font-medium mb-2">Search Engine</label>
          <select 
            id="searchEngineSelect" 
            class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="google" ${settings.searchEngine === 'google' ? 'selected' : ''}>Google</option>
            <option value="bing" ${settings.searchEngine === 'bing' ? 'selected' : ''}>Bing</option>
            <option value="duckduckgo" ${settings.searchEngine === 'duckduckgo' ? 'selected' : ''}>DuckDuckGo</option>
            <option value="yahoo" ${settings.searchEngine === 'yahoo' ? 'selected' : ''}>Yahoo</option>
          </select>
        </div>

        <!-- Layout -->
        <div>
          <label class="block text-sm font-medium mb-2">Layout</label>
          <div class="grid grid-cols-2 gap-2">
            <button 
              id="comfortableLayoutBtn" 
              class="p-2 border rounded-lg text-sm transition-colors ${settings.layout === 'comfortable' ? 'border-primary bg-blue-100 dark:bg-blue-900/30 text-primary' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}"
            >
              Comfortable
            </button>
            <button 
              id="compactLayoutBtn" 
              class="p-2 border rounded-lg text-sm transition-colors ${settings.layout === 'compact' ? 'border-primary bg-blue-100 dark:bg-blue-900/30 text-primary' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}"
            >
              Compact
            </button>
          </div>
        </div>

        <div class="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <button 
            id="exportDataBtn" 
            class="w-full p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Export Data
          </button>
          <button 
            id="importDataBtn" 
            class="w-full p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Import Data
          </button>
          <button 
            id="resetDataBtn" 
            class="w-full p-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            Reset All Data
          </button>
        </div>
      </div>
    `;

    // Create and show modal
    this.modal = new Modal({
      title: 'Settings',
      content,
      size: 'md',
      onClose: () => this.onClose()
    });

    this.modal.show();
    this.setupEventListeners();
  }

  getColorOptions(selectedColor) {
    const colors = [
      { name: 'blue', value: '59, 130, 246' },
      { name: 'purple', value: '147, 51, 234' },
      { name: 'pink', value: '236, 72, 153' },
      { name: 'red', value: '239, 68, 68' },
      { name: 'orange', value: '249, 115, 22' },
      { name: 'green', value: '34, 197, 94' },
      { name: 'teal', value: '20, 184, 166' },
      { name: 'cyan', value: '6, 182, 212' },
      { name: 'indigo', value: '99, 102, 241' },
      { name: 'fuchsia', value: '217, 70, 239' },
      { name: 'rose', value: '244, 63, 94' },
      { name: 'amber', value: '245, 158, 11' }
    ];

    return colors.map(color => `
      <button 
        class="color-option w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${selectedColor === color.value ? 'ring-2 ring-offset-2 ring-primary' : 'border-gray-300 dark:border-gray-600'}"
        data-color="${color.value}"
        style="background-color: rgb(${color.value})"
        title="${color.name.charAt(0).toUpperCase() + color.name.slice(1)}"
      ></button>
    `).join('');
  }

  setupEventListeners() {
    // Theme buttons
    document.getElementById('lightThemeBtn')?.addEventListener('click', () => this.setTheme('light'));
    document.getElementById('darkThemeBtn')?.addEventListener('click', () => this.setTheme('dark'));
    document.getElementById('autoThemeBtn')?.addEventListener('click', () => this.setTheme('auto'));
    
    // Color options
    document.querySelectorAll('.color-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const color = e.target.dataset.color;
        this.setAccentColor(color);
      });
    });
    
    // Search engine select
    const searchEngineSelect = document.getElementById('searchEngineSelect');
    if (searchEngineSelect) {
      searchEngineSelect.addEventListener('change', (e) => {
        this.app.settings.set('searchEngine', e.target.value);
      });
    }
    
    // Layout buttons
    document.getElementById('comfortableLayoutBtn')?.addEventListener('click', () => this.setLayout('comfortable'));
    document.getElementById('compactLayoutBtn')?.addEventListener('click', () => this.setLayout('compact'));
    
    // Data management buttons
    document.getElementById('exportDataBtn')?.addEventListener('click', () => this.exportData());
    document.getElementById('importDataBtn')?.addEventListener('click', () => this.importData());
    document.getElementById('resetDataBtn')?.addEventListener('click', () => this.confirmResetData());
  }

  async setTheme(theme) {
    await this.app.settings.set('theme', theme);
    this.app.applyTheme();
    this.show(); // Refresh the modal to update active states
  }
  
  async setAccentColor(color) {
    await this.app.settings.set('accentColor', color);
    this.app.applyTheme();
    this.show(); // Refresh the modal to update active states
  }
  
  async setLayout(layout) {
    await this.app.settings.set('layout', layout);
    document.documentElement.setAttribute('data-layout', layout);
    this.show(); // Refresh the modal to update active states
  }
  
  async exportData() {
    try {
      const data = await chrome.storage.local.get(null);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `rtab-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      await Modal.showAlert({
        title: 'Export Successful',
        message: 'Your data has been exported successfully.'
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      await Modal.showAlert({
        title: 'Export Failed',
        message: 'There was an error exporting your data. Please try again.'
      });
    }
  }
  
  async importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        const confirmed = await Modal.showConfirm({
          title: 'Confirm Import',
          message: 'This will overwrite your current data. Are you sure you want to continue?',
          confirmText: 'Import',
          cancelText: 'Cancel'
        });
        
        if (confirmed) {
          await chrome.storage.local.clear();
          await chrome.storage.local.set(data);
          
          // Reload the app
          window.location.reload();
        }
      } catch (error) {
        console.error('Error importing data:', error);
        await Modal.showAlert({
          title: 'Import Failed',
          message: 'There was an error importing your data. The file may be corrupted or in an invalid format.'
        });
      }
    };
    
    input.click();
  }
  
  async confirmResetData() {
    const confirmed = await Modal.showConfirm({
      title: 'Reset All Data',
      message: 'Are you sure you want to reset all data? This action cannot be undone.',
      confirmText: 'Reset All Data',
      cancelText: 'Cancel',
      confirmDanger: true
    });
    
    if (confirmed) {
      try {
        await chrome.storage.local.clear();
        await chrome.storage.sync.clear();
        window.location.reload();
      } catch (error) {
        console.error('Error resetting data:', error);
        await Modal.showAlert({
          title: 'Reset Failed',
          message: 'There was an error resetting your data. Please try again.'
        });
      }
    }
  }
  
  onClose() {
    this.modal = null;
  }
}
