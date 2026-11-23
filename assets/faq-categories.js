/* <faq-categories>: sections/faq-categories.liquid (Figma FAQ, Layout=Categories).
   [data-faq-tab="n"]    category list row button (snippets/list-row.liquid); aria-pressed marks the active category
   [data-faq-panel="n"]  the accordion of category n; only the active one is shown (hidden)
   Pressing a row makes its category active. In the theme editor, selecting a category block does the same. */
class FaqCategories extends BaseComponent {
  init() {
    this.tabs = [...this.$$('[data-faq-tab]')];
    this.panels = [...this.$$('[data-faq-panel]')];
    this.tabs.forEach((tab) => this.listen(tab, 'click', () => this.select(tab.dataset.faqTab)));
    this.listen(document, 'shopify:block:select', (evt) => {
      const tab = this.tabs.find((el) => el.contains(evt.target) || evt.target.contains(el));
      if (tab) this.select(tab.dataset.faqTab);
    });
  }

  select(index) {
    this.tabs.forEach((tab) => tab.setAttribute('aria-pressed', String(tab.dataset.faqTab === index)));
    this.panels.forEach((panel) => (panel.hidden = panel.dataset.faqPanel !== index));
  }
}

if (!customElements.get('faq-categories')) customElements.define('faq-categories', FaqCategories);
