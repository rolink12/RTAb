export default class LinkItem {
  constructor(link, { onEdit, onDelete } = {}) {
    this.id = link.id;
    this.url = link.url;
    this.title = link.title;
    this.icon = link.icon;
    this.onEdit = onEdit;
    this.onDelete = onDelete;
    this.element = null;
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'group relative bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200';
    
    const faviconUrl = this.getFaviconUrl();
    const displayTitle = this.title || this.extractDomain(this.url);
    
    this.element.innerHTML = `
      <a 
        href="${this.url}" 
        target="_blank" 
        rel="noopener noreferrer"
        class="flex flex-col items-center text-center space-y-2 group-hover:text-primary transition-colors"
      >
        <div class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-2">
          ${faviconUrl ? 
            `<img src="${faviconUrl}" alt="" class="w-6 h-6" onerror="this.style.display='none'" />` : 
            `<span class="text-2xl">${displayTitle.charAt(0).toUpperCase()}</span>`
          }
        </div>
        <span class="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary dark:group-hover:text-primary-light truncate w-full">
          ${displayTitle}
        </span>
      </a>
      <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" data-action="edit">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button class="p-1 text-gray-400 hover:text-red-500" data-action="delete">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    `;

    this.setupEventListeners();
    return this.element;
  }

  getFaviconUrl() {
    try {
      const url = new URL(this.url);
      return `${url.protocol}//${url.hostname}/favicon.ico`;
    } catch (e) {
      return '';
    }
  }

  extractDomain(url) {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain.split('.')[0];
    } catch (e) {
      return 'Link';
    }
  }

  setupEventListeners() {
    if (!this.element) return;

    this.element.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      
      if (action === 'edit' && this.onEdit) {
        e.preventDefault();
        this.onEdit(this);
      } else if (action === 'delete' && this.onDelete) {
        e.preventDefault();
        this.onDelete(this);
      }
    });
  }

  update(updates) {
    Object.assign(this, updates);
    if (this.element) {
      this.render();
    }
  }

  remove() {
    if (this.element && this.element.parentNode) {
      this.element.remove();
    }
  }
}
