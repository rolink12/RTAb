export default class Modal {
  constructor(options = {}) {
    this.id = options.id || `modal-${Math.random().toString(36).substr(2, 9)}`;
    this.title = options.title || '';
    this.content = options.content || '';
    this.onClose = options.onClose || (() => {});
    this.onConfirm = options.onConfirm || (() => {});
    this.confirmText = options.confirmText || 'Confirm';
    this.cancelText = options.cancelText || 'Cancel';
    this.showCancel = options.showCancel !== false;
    this.modalElement = null;
  }

  open() {
    if (document.getElementById(this.id)) {
      this.modalElement.classList.remove('hidden');
      return;
    }

    this.modalElement = document.createElement('div');
    this.modalElement.id = this.id;
    this.modalElement.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    this.modalElement.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">${this.title}</h2>
            <button class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300" data-action="close">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="mb-6">
            ${typeof this.content === 'string' ? this.content : ''}
          </div>
          <div class="flex justify-end space-x-3">
            ${this.showCancel ? `
              <button class="btn btn-secondary" data-action="cancel">
                ${this.cancelText}
              </button>
            ` : ''}
            <button class="btn btn-primary" data-action="confirm">
              ${this.confirmText}
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modalElement);
    this.setupEventListeners();
  }

  close() {
    if (this.modalElement) {
      this.modalElement.remove();
      this.onClose();
    }
  }

  setupEventListeners() {
    if (!this.modalElement) return;

    this.modalElement.addEventListener('click', (e) => {
      if (e.target === this.modalElement || e.target.closest('[data-action="close"], [data-action="cancel"]')) {
        this.close();
      } else if (e.target.closest('[data-action="confirm"]')) {
        this.onConfirm();
        this.close();
      }
    });
  }

  setContent(content) {
    this.content = content;
    const contentEl = this.modalElement?.querySelector('.mb-6');
    if (contentEl) {
      contentEl.innerHTML = typeof content === 'string' ? content : '';
    }
  }

  static show(options) {
    const modal = new Modal(options);
    modal.open();
    return modal;
  }
}
