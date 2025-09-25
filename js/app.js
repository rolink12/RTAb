import { ModernHomepage } from './components/App.js';

document.addEventListener('DOMContentLoaded', () => {
    window.app = new ModernHomepage();
});

window.matchMedia('(prefers-color-scheme: dark)').addListener(() => {
    if (window.app && window.app.settings.theme === 'auto') {
        window.app.applyTheme();
    }
});