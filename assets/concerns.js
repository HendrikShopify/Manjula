/* <concerns-section>: sections/concerns.liquid (Figma Concerns).
   [data-concern-tab="n"]    list row button (snippets/list-row.liquid); aria-pressed marks the active concern
   [data-concern-panel="n"]  the photo and explanation for concern n; only the active one is shown (hidden)
   Pressing a row makes its concern active. In the theme editor, selecting a concern block does the same. */
class ConcernsSection extends BaseComponent {
  init() {
    this.tabs = [...this.$$('[data-concern-tab]')];
    this.panels = [...this.$$('[data-concern-panel]')];
    this.tabs.forEach((tab) => this.listen(tab, 'click', () => this.select(tab.dataset.concernTab)));
    this.listen(document, 'shopify:block:select', (evt) => {
      const tab = this.tabs.find((el) => el.contains(evt.target) || evt.target.contains(el));
      if (tab) this.select(tab.dataset.concernTab);
    });
  }

  select(index) {
    this.tabs.forEach((tab) => tab.setAttribute('aria-pressed', String(tab.dataset.concernTab === index)));
    this.panels.forEach((panel) => (panel.hidden = panel.dataset.concernPanel !== index));
  }
}

if (!customElements.get('concerns-section')) customElements.define('concerns-section', ConcernsSection);
