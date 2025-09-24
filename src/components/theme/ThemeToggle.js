export default class ThemeToggle {
  constructor(app) {
    this.app = app;
    this.themeToggleBtn = null;
    this.currentTheme = 'system';
  }

  init() {
    this.themeToggleBtn = document.getElementById('themeToggleBtn');
    this.setupEventListeners();
    this.updateThemeUI();
  }

  setupEventListeners() {
    if (!this.themeToggleBtn) return;

    this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this.currentTheme === 'system') {
        this.applyTheme('system');
      }
    });
  }

  async toggleTheme() {
    const themes = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    
    await this.app.settings.set('theme', nextTheme);
    this.currentTheme = nextTheme;
    this.applyTheme(nextTheme);
    this.updateThemeUI();
  }

  applyTheme(theme) {
    const root = document.documentElement;
    
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', isDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  }

  updateThemeUI() {
    if (!this.themeToggleBtn) return;
    
    // Update button icon based on current theme
    const icons = {
      light: (
        '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
        '  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />' +
        '</svg>'
      ),
      dark: (
        '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
        '  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />' +
        '</svg>'
      ),
      system: (
        '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
        '  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />' +
        '</svg>'
      )
    };

    const tooltips = {
      light: 'Switch to dark mode',
      dark: 'Switch to system theme',
      system: 'Switch to light mode'
    };

    this.themeToggleBtn.innerHTML = icons[this.currentTheme];
    this.themeToggleBtn.title = tooltips[this.currentTheme];
    this.themeToggleBtn.setAttribute('aria-label', tooltips[this.currentTheme]);
  }
}
