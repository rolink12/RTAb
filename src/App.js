import TabManager from './components/TabManager';
import SearchBar from './components/SearchBar';
import SettingsManager from './services/SettingsManager';

export default class App {
  constructor() {
    this.settings = new SettingsManager();
    this.tabManager = new TabManager(this);
    this.searchBar = new SearchBar(this);
    
    this.init();
  }

  async init() {
    // Initialize settings
    await this.settings.load();
    
    // Initialize components
    this.tabManager.init();
    this.searchBar.init();
    
    // Apply theme
    this.applyTheme();
  }

  applyTheme() {
    const theme = this.settings.get('theme', 'auto');
    
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
