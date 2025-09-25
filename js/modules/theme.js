export function applyTheme(settings) {
    const html = document.documentElement;

    if (settings.theme === 'dark') {
        html.classList.add('dark');
    } else if (settings.theme === 'light') {
        html.classList.remove('dark');
    } else {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
    }

    applyAccentColor(settings.accentColor);
}

export function applyAccentColor(accentColor) {
    const root = document.documentElement;
    const [r, g, b] = accentColor.split(', ').map(Number);

    root.style.setProperty('--primary-color', `rgb(${r}, ${g}, ${b})`);
    root.style.setProperty('--primary-dark-color', `rgb(${Math.max(0, r - 20)}, ${Math.max(0, g - 20)}, ${Math.max(0, b - 20)})`);
    root.style.setProperty('--primary-light-color', `rgb(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)})`);
}