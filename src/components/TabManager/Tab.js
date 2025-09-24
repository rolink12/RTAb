export default class Tab {
  constructor({ id, name, isDefault = false, links = [], layout = 'grid', createdAt, updatedAt }) {
    this.id = id;
    this.name = name;
    this.isDefault = isDefault;
    this.links = links;
    this.layout = layout;
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();
  }

  async addLink(link) {
    const newLink = {
      id: crypto.randomUUID(),
      url: link.url,
      title: link.title || this.extractTitleFromUrl(link.url),
      icon: link.icon || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.links.push(newLink);
    this.updatedAt = new Date().toISOString();
    return newLink;
  }

  async updateLink(linkId, updates) {
    const linkIndex = this.links.findIndex(l => l.id === linkId);
    if (linkIndex === -1) return null;

    this.links[linkIndex] = {
      ...this.links[linkIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.updatedAt = new Date().toISOString();
    return this.links[linkIndex];
  }

  async deleteLink(linkId) {
    const linkIndex = this.links.findIndex(l => l.id === linkId);
    if (linkIndex === -1) return false;

    this.links.splice(linkIndex, 1);
    this.updatedAt = new Date().toISOString();
    return true;
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

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      isDefault: this.isDefault,
      links: this.links,
      layout: this.layout,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
