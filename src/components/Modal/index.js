export default class Modal {
  constructor({ title, content, onClose, buttons = [], size = 'md' }) {
    this.title = title;
    this.content = content;
    this.onClose = onClose;
    this.buttons = buttons;
    this.size = size;
    this.modalElement = null;
  }

  render() {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    
    // Set modal size classes
    const sizeClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      full: 'max-w-full w-full mx-4'
    };

    // Create modal content
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full ${sizeClasses[this.size]} max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">${this.title}</h2>
            <button class="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" id="closeModal">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="mb-6">
            ${this.content}
          </div>
          
          ${this.buttons.length > 0 ? `
            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              ${this.buttons.map(btn => `
                <button 
                  class="px-4 py-2 rounded-lg font-medium transition-colors ${btn.primary ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
                  id="${btn.id}"
                >
                  ${btn.label}
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // Add event listeners
    const closeBtn = modal.querySelector('#closeModal');
    closeBtn.addEventListener('click', () => this.close());

    // Add click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.close();
      }
    });

    // Add keyboard event for ESC key
    this.handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    };
    document.addEventListener('keydown', this.handleKeyDown);

    this.modalElement = modal;
    return modal;
  }

  show() {
    const modalsContainer = document.getElementById('modals') || document.body;
    this.modalElement = this.render();
    modalsContainer.appendChild(this.modalElement);
    
    // Focus the first focusable element
    const focusable = this.modalElement.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();
  }

  close() {
    if (this.modalElement) {
      if (typeof this.onClose === 'function') {
        this.onClose();
      }
      document.removeEventListener('keydown', this.handleKeyDown);
      this.modalElement.remove();
      this.modalElement = null;
    }
  }

  static showAlert({ title, message, confirmText = 'OK' }) {
    return new Promise((resolve) => {
      const modal = new Modal({
        title,
        content: `<p class="text-gray-700 dark:text-gray-300">${message}</p>`,
        buttons: [
          {
            id: 'confirmBtn',
            label: confirmText,
            primary: true,
            onClick: () => resolve(true)
          }
        ]
      });
      
      modal.show();
      
      // Add click handler for the confirm button
      const confirmBtn = modal.modalElement.querySelector('#confirmBtn');
      if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
          modal.close();
          resolve(true);
        });
      }
    });
  }

  static showConfirm({ title, message, confirmText = 'Confirm', cancelText = 'Cancel' }) {
    return new Promise((resolve) => {
      const modal = new Modal({
        title,
        content: `<p class="text-gray-700 dark:text-gray-300">${message}</p>`,
        buttons: [
          {
            id: 'cancelBtn',
            label: cancelText,
            primary: false,
            onClick: () => resolve(false)
          },
          {
            id: 'confirmBtn',
            label: confirmText,
            primary: true,
            onClick: () => resolve(true)
          }
        ]
      });
      
      modal.show();
      
      // Add click handlers for the buttons
      const confirmBtn = modal.modalElement.querySelector('#confirmBtn');
      const cancelBtn = modal.modalElement.querySelector('#cancelBtn');
      
      if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
          modal.close();
          resolve(true);
        });
      }
      
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          modal.close();
          resolve(false);
        });
      }
    });
  }
}
