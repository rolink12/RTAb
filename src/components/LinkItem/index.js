export default class LinkItem {
  constructor(link, onEdit, onDelete) {
    this.id = link.id;
    this.title = link.title;
    this.url = link.url;
    this.icon = link.icon;
    this.onEdit = onEdit;
    this.onDelete = onDelete;
    this.element = null;
  }

  render() {
    const element = document.createElement('div');
    element.className = 'group relative bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border border-gray-200 dark:border-gray-700';
    
    element.innerHTML = `
      <div class="flex flex-col items-center text-center">
        <div class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3 overflow-hidden">
          ${this.getFavicon()}
        </div>
        <h3 class="font-medium text-sm text-gray-900 dark:text-white line-clamp-1">${this.title}</h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">${this.getDomain()}</p>
      </div>
      
      <!-- Context menu button -->
      <button class="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
        </svg>
      </button>
      
      <!-- Context menu -->
      <div class="absolute right-2 top-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 hidden group-hover:block">
        <button class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors edit-link">
          Edit
        </button>
        <button class="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors delete-link">
          Delete
        </button>
      </div>
    `;

    // Add click event to open the link
    element.addEventListener('click', (e) => {
      // Don't navigate if clicking on context menu or buttons
      if (e.target.closest('button') || e.target.closest('.context-menu')) {
        return;
      }
      window.open(this.url, '_blank');
    });

    // Add event listeners for context menu
    const contextMenuBtn = element.querySelector('button');
    const contextMenu = element.querySelector('.absolute.right-2');
    const editBtn = element.querySelector('.edit-link');
    const deleteBtn = element.querySelector('.delete-link');

    contextMenuBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      contextMenu.classList.toggle('hidden');
    });

    editBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof this.onEdit === 'function') {
        this.onEdit();
      }
      contextMenu.classList.add('hidden');
    });

    deleteBtn?.addEventListener('click', async (e) => {
      e.stopPropagation();
      const confirmed = await this.confirmDelete();
      if (confirmed && typeof this.onDelete === 'function') {
        await this.onDelete();
      }
      contextMenu.classList.add('hidden');
    });

    // Close context menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!element.contains(e.target)) {
        contextMenu.classList.add('hidden');
      }
    }, { capture: true });

    this.element = element;
    return element;
  }

  getFavicon() {
    if (this.icon) {
      return `<img src="${this.icon}" alt="" class="w-6 h-6" />`;
    }
    
    // Fallback to first letter of title
    const firstLetter = this.title ? this.title.charAt(0).toUpperCase() : '?';
    return `
      <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-lg">
        ${firstLetter}
      </div>
    `;
  }

  getDomain() {
    try {
      const url = new URL(this.url);
      return url.hostname.replace('www.', '');
    } catch (e) {
      return this.url;
    }
  }

  async confirmDelete() {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Link</h3>
          <p class="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to delete "${this.title}"?</p>
          <div class="flex justify-end space-x-3">
            <button class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" id="cancelDelete">
              Cancel
            </button>
            <button class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors" id="confirmDelete">
              Delete
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      
      const cancelBtn = modal.querySelector('#cancelDelete');
      const confirmBtn = modal.querySelector('#confirmDelete');
      
      const closeModal = () => {
        document.body.removeChild(modal);
      };
      
      cancelBtn.addEventListener('click', () => {
        resolve(false);
        closeModal();
      });
      
      confirmBtn.addEventListener('click', () => {
        resolve(true);
        closeModal();
      });
      
      // Close on outside click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          resolve(false);
          closeModal();
        }
      });
      
      // Close on Escape key
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          resolve(false);
          closeModal();
        }
      };
      
      document.addEventListener('keydown', handleKeyDown, { once: true });
    });
  }
  
  update(updatedLink) {
    this.title = updatedLink.title || this.title;
    this.url = updatedLink.url || this.url;
    this.icon = updatedLink.icon || this.icon;
    
    if (this.element) {
      const titleElement = this.element.querySelector('h3');
      const domainElement = this.element.querySelector('p');
      const faviconElement = this.element.querySelector('.w-12.h-12');
      
      if (titleElement) titleElement.textContent = this.title;
      if (domainElement) domainElement.textContent = this.getDomain();
      if (faviconElement) {
        faviconElement.innerHTML = this.getFavicon();
      }
    }
  }
  
  remove() {
    if (this.element && this.element.parentNode) {
      this.element.remove();
    }
  }
}
