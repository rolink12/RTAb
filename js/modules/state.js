import { showToast } from './dom.js';

export function saveData(app) {
    const data = {
        tabs: app.tabs,
        activeTabId: app.activeTabId,
        settings: app.settings,
        version: '1.0.0',
        lastModified: new Date().toISOString()
    };

    localStorage.setItem('modernHomepage', JSON.stringify(data));
}

export function loadData(app) {
    try {
        const data = JSON.parse(localStorage.getItem('modernHomepage') || '{}');

        if (data.tabs) {
            app.tabs = data.tabs.map(tab => ({
                ...tab,
                isDefault: tab.isDefault || false
            }));

            app.activeTabId = data.activeTabId;
            app.settings = { ...app.settings, ...data.settings };
        }
    } catch (error) {
        console.error('Error loading data:', error);
        app.tabs = [];
        app.activeTabId = null;
    }
}

export function exportData(app) {
    const data = {
        tabs: app.tabs,
        activeTabId: app.activeTabId,
        settings: app.settings,
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
    showToast('Data exported successfully');
}

export function importData(app, file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);

            if (data.tabs && Array.isArray(data.tabs)) {
                if (confirm('This will replace all current data. Are you sure you want to continue?')) {
                    app.tabs = data.tabs;
                    app.settings = { ...app.settings, ...data.settings };

                    if (data.activeTabId && data.tabs.some(t => t.id === data.activeTabId)) {
                        app.activeTabId = data.activeTabId;
                    } else {
                        app.activeTabId = data.tabs.length > 0 ? data.tabs[0].id : null;
                    }

                    saveData(app);
                    app.applyTheme();
                    app.renderTabs();
                    app.renderActiveTabContent();

                    showToast('Data imported successfully');
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