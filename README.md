# Modern Homepage Extension

A fast, customizable, and modern browser homepage extension with a tabbed interface. Built with HTML, CSS, JavaScript, and Tailwind CSS, working completely offline without external dependencies.

## Features

### 🗂️ Tab Management
- Create, rename, delete, and move tabs
- Pin important tabs to prevent accidental closure
- Duplicate existing tabs with all their content
- Drag and drop tab reordering

### 🔗 Quick Links
- Add unlimited quick links to each tab
- Drag and drop to reorder links
- Automatic favicon fetching
- Right-click context menu for link management

### 🔍 Integrated Search
- Universal search bar in the header
- Support for multiple search engines (Google, Bing, DuckDuckGo, Yahoo)
- Quick search without leaving the homepage

### 🎨 Theme Personalization
- Light, dark, and auto (system) theme modes
- 6 customizable accent colors
- Smooth theme transitions
- System preference detection

### 💾 Data Management
- All data stored locally in browser storage
- Export/import functionality for backup
- Reset option for fresh start
- No external dependencies or data collection

### ⌨️ Keyboard Shortcuts
- `Ctrl/Cmd + T`: Create new tab
- `Ctrl/Cmd + W`: Close current tab
- `Ctrl/Cmd + L`: Add new quick link
- `Ctrl/Cmd + ,`: Open settings

## Installation

### Chrome/Edge Extension
1. Extract the downloaded ZIP file
2. Open Chrome/Edge and navigate to `chrome://extensions/` or `edge://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extracted folder
5. The extension will be installed and set as your new tab page

### Local Usage (Any Browser)
1. Extract the ZIP file to a folder on your computer
2. Open `index.html` in your browser
3. Bookmark the page for easy access

## Project Structure

```
modern-homepage-extension/
├── manifest.json          # Extension manifest
├── index.html            # Main HTML file
├── css/
│   └── styles.css        # Custom styles and animations
├── js/
│   └── app.js           # Main application logic
└── icons/               # Extension icons (placeholder)
```

## Usage

### Creating Tabs
- Click the "+" button next to existing tabs
- Use `Ctrl/Cmd + T` keyboard shortcut
- Right-click on a tab to access additional options

### Managing Quick Links
- Click "Add Link" button on any tab
- Fill in the title and URL in the modal
- Use drag and drop to reorder links
- Right-click on links for edit/delete options

### Customizing Appearance
- Click the settings gear icon in the header
- Choose between light, dark, or auto themes
- Select from 6 accent colors
- Change search engine preference

### Data Management
- Export your data as JSON for backup
- Import previously exported data
- Reset all data to start fresh

## Technical Details

### Technologies Used
- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **JavaScript ES6+**: Object-oriented application architecture
- **Tailwind CSS**: Utility-first CSS framework (CDN)

### Browser Compatibility
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

### Data Storage
All data is stored locally using the browser's `localStorage` API:
- Tabs and quick links
- User preferences and settings
- Theme and layout choices

### Performance
- Lightweight and fast loading
- No external API calls (except favicon fetching)
- Minimal resource usage
- Offline functionality

## Customization

### Adding New Themes
Edit the CSS variables in `styles.css`:
```css
:root {
  --primary-color: rgb(59, 130, 246);
  --primary-dark-color: rgb(37, 99, 235);
  --primary-light-color: rgb(96, 165, 250);
}
```

### Adding Search Engines
Modify the `searchEngines` object in `app.js`:
```javascript
this.searchEngines = {
  google: 'https://www.google.com/search?q=',
  bing: 'https://www.bing.com/search?q=',
  // Add your search engine here
};
```

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or feature requests, please check the project documentation or create an issue in the project repository.

---

**Made with ❤️ for a better browsing experience**
