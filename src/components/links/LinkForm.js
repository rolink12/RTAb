export default class LinkForm {
  constructor({ link = null, onSubmit, onCancel }) {
    this.link = link || { url: '', title: '' };
    this.onSubmit = onSubmit;
    this.onCancel = onCancel;
    this.element = null;
  }

  render() {
    this.element = document.createElement('form');
    this.element.className = 'space-y-4';
    this.element.innerHTML = `
      <div>
        <label for="linkUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          URL <span class="text-red-500">*</span>
        </label>
        <input
          type="url"
          id="linkUrl"
          class="input w-full"
          placeholder="https://example.com"
          value="${this.link.url || ''}"
          required
        />
      </div>
      <div>
        <label for="linkTitle" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Title (optional)
        </label>
        <input
          type="text"
          id="linkTitle"
          class="input w-full"
          placeholder="My Awesome Link"
          value="${this.link.title || ''}"
        />
      </div>
      <div class="flex justify-end space-x-3 pt-2">
        <button type="button" class="btn btn-secondary" data-action="cancel">
          Cancel
        </button>
        <button type="submit" class="btn btn-primary">
          ${this.link.id ? 'Update' : 'Add'} Link
        </button>
      </div>
    `;

    this.setupEventListeners();
    return this.element;
  }

  setupEventListeners() {
    if (!this.element) return;

    this.element.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(this.element);
      const url = formData.get('linkUrl').trim();
      const title = formData.get('linkTitle').trim();
      
      if (!url) return;
      
      this.onSubmit({
        ...this.link,
        url,
        title: title || this.extractTitleFromUrl(url)
      });
    });

    const cancelBtn = this.element.querySelector('[data-action="cancel"]');
    if (cancelBtn && this.onCancel) {
      cancelBtn.addEventListener('click', () => this.onCancel());
    }
  }

  extractTitleFromUrl(url) {
    try {
      const urlObj = new URL(url);
      let title = urlObj.hostname.replace('www.', '').split('.')[0];
      return title.charAt(0).toUpperCase() + title.slice(1);
    } catch (e) {
      return 'Link';
    }
  }
}
