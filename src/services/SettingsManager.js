const DEFAULT_SETTINGS = {
  theme: 'auto',
  accentColor: '59, 130, 246',
  searchEngine: 'google',
  layout: 'comfortable'
};

export default class SettingsManager {
  constructor() {
    this.settings = { ...DEFAULT_SETTINGS };
  }

  async load() {
    try {
      const data = await chrome.storage.sync.get('settings');
      if (data.settings) {
        this.settings = { ...DEFAULT_SETTINGS, ...data.settings };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    return this.settings;
  }

  async save() {
    try {
      await chrome.storage.sync.set({ settings: this.settings });
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  }

  get(key, defaultValue = null) {
    return key ? this.settings[key] ?? defaultValue : { ...this.settings };
  }

  async set(key, value) {
    if (key in this.settings) {
      this.settings[key] = value;
      await this.save();
      return true;
    }
    return false;
  }

  async reset() {
    this.settings = { ...DEFAULT_SETTINGS };
    await this.save();
    return this.settings;
  }
}
