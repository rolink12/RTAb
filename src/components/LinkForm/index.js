import Modal from '../Modal';

export default class LinkForm {
  constructor({ link = null, onSubmit, onCancel }) {
    this.link = link || { title: '', url: '', icon: '' };
    this.onSubmit = onSubmit;
    this.onCancel = onCancel;
    this.modal = null;
  }

  show() {
    const isEdit = !!this.link.id;
    
    const content = `
      <div class="space-y-4">
        <div>
          <label for="linkTitle" class="block text-sm font-medium mb-1">Title</label>
          <input 
            type="text" 
            id="linkTitle" 
            class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" 
            placeholder="Enter link title" 
            value="${this.escapeHtml(this.link.title)}"
            required
          >
        </div>
        
        <div>
          <label for="linkUrl" class="block text-sm font-medium mb-1">URL</label>
          <input 
            type="url" 
            id="linkUrl" 
            class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" 
            placeholder="https://example.com" 
            value="${this.escapeHtml(this.link.url)}"
            required
          >
        </div>
        
        <div>
          <label for="linkIcon" class="block text-sm font-medium mb-1">Icon URL (optional)</label>
          <input 
            type="url" 
            id="linkIcon" 
            class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" 
            placeholder="https://example.com/favicon.ico" 
            value="${this.escapeHtml(this.link.icon || '')}"
          >
        </div>
        
        ${this.link.icon ? `
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              <img src="${this.escapeHtml(this.link.icon)}" alt="" class="w-6 h-6" onerror="this.style.display='none'" />
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400">Current icon preview</p>
          </div>
        ` : ''}
      </div>
    `;

    this.modal = new Modal({
      title: isEdit ? 'Edit Link' : 'Add New Link',
      content,
      buttons: [
        {
          id: 'cancelBtn',
          label: 'Cancel',
          primary: false
        },
        {
          id: 'submitBtn',
          label: isEdit ? 'Save Changes' : 'Add Link',
          primary: true
        }
      ]
    });

    this.modal.show();
    this.setupEventListeners();
  }

  setupEventListeners() {
    const form = this.modal.modalElement.querySelector('form') || this.modal.modalElement;
    const cancelBtn = this.modal.modalElement.querySelector('#cancelBtn');
    const submitBtn = this.modal.modalElement.querySelector('#submitBtn');
    const urlInput = this.modal.modalElement.querySelector('#linkUrl');
    
    // Auto-fetch title when URL changes
    if (urlInput) {
      urlInput.addEventListener('blur', () => {
        if (!this.link.title && urlInput.value) {
          this.fetchPageTitle(urlInput.value);
        }
      });
    }
    
    // Handle form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
    
    // Handle cancel button
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        if (typeof this.onCancel === 'function') {
          this.onCancel();
        }
        this.modal.close();
      });
    }
    
    // Handle submit button
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        this.handleSubmit();
      });
    }
  }
  
  async fetchPageTitle(url) {
    if (!url) return;
    
    try {
      // Add https:// if missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      // Update URL input with https:// if needed
      const urlInput = this.modal.modalElement.querySelector('#linkUrl');
      if (urlInput) {
        urlInput.value = url;
      }
      
      // Try to get the favicon
      const faviconUrl = this.getFaviconUrl(url);
      
      // For security reasons, we can't directly fetch the page title in a browser extension
      // due to CORS restrictions. In a real implementation, you would use a proxy or a backend service.
      // For now, we'll just use the domain as the title.
      const domain = new URL(url).hostname.replace('www.', '');
      const title = domain.split('.')[0];
      
      // Update title input
      const titleInput = this.modal.modalElement.querySelector('#linkTitle');
      if (titleInput && !titleInput.value) {
        titleInput.value = title.charAt(0).toUpperCase() + title.slice(1);
      }
      
      // Update favicon input if empty
      const iconInput = this.modal.modalElement.querySelector('#linkIcon');
      if (iconInput && !iconInput.value && faviconUrl) {
        iconInput.value = faviconUrl;
      }
      
    } catch (error) {
      console.error('Error fetching page info:', error);
    }
  }
  
  getFaviconUrl(url) {
    try {
      const domain = new URL(url).origin;
      return `${domain}/favicon.ico`;
    } catch (e) {
      return '';
    }
  }
  
  handleSubmit() {
    const titleInput = this.modal.modalElement.querySelector('#linkTitle');
    const urlInput = this.modal.modalElement.querySelector('#linkUrl');
    const iconInput = this.modal.modalElement.querySelector('#linkIcon');
    
    if (!titleInput.value || !urlInput.value) {
      // Show error or highlight required fields
      if (!titleInput.value) titleInput.classList.add('border-red-500');
      if (!urlInput.value) urlInput.classList.add('border-red-500');
      return;
    }
    
    const updatedLink = {
      ...this.link,
      title: titleInput.value.trim(),
      url: this.normalizeUrl(urlInput.value.trim()),
      icon: iconInput?.value.trim() || ''
    };
    
    if (typeof this.onSubmit === 'function') {
      this.onSubmit(updatedLink);
    }
    
    this.modal.close();
  }
  
  normalizeUrl(url) {
    // Add https:// if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  }
  
  escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
