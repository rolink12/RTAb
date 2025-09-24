const SEARCH_ENGINES = {
  google: 'https://www.google.com/search?q=',
  bing: 'https://www.bing.com/search?q=',
  duckduckgo: 'https://duckduckgo.com/?q=',
  yahoo: 'https://search.yahoo.com/search?p='
};

export default class SearchBar {
  constructor(app) {
    this.app = app;
    this.searchInput = document.getElementById('searchInput');
    this.searchBtn = document.getElementById('searchBtn');
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    if (this.searchInput) {
      this.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.performSearch();
        }
      });
    }

    if (this.searchBtn) {
      this.searchBtn.addEventListener('click', () => this.performSearch());
    }
  }

  getSearchEngineUrl() {
    const searchEngine = this.app.settings.get('searchEngine', 'google');
    return SEARCH_ENGINES[searchEngine] || SEARCH_ENGINES.google;
  }

  performSearch() {
    if (!this.searchInput) return;
    
    const query = this.searchInput.value.trim();
    if (!query) return;

    const searchUrl = this.getSearchEngineUrl() + encodeURIComponent(query);
    window.open(searchUrl, '_blank');
    
    // Clear the search input after search
    this.searchInput.value = '';
  }
}
