/**
 * <landing-tabs>: the topic list of Tabs section (sections/tabs.liquid).
 * [data-landing-tab="<block id>"] rows (List row buttons, aria-pressed) switch [data-landing-tab-panel="<block id>"]
 * panels (Landing topics): the pressed row's panel shows, the others are hidden. The first is pressed in the markup.
 * In the theme editor, selecting a topic block shows it.
 */
if (!customElements.get('landing-tabs')) {
  customElements.define(
    'landing-tabs',
    class LandingTabs extends BaseComponent {
      init() {
        this.listen(this, 'click', (event) => {
          const tab = event.target.closest('[data-landing-tab]');
          if (tab && this.contains(tab)) this.show(tab.dataset.landingTab);
        });
        this.listen(document, 'shopify:block:select', (event) => {
          if (this.querySelector(`[data-landing-tab-panel="${event.detail.blockId}"]`)) this.show(event.detail.blockId);
        });
      }

      show(id) {
        this.querySelectorAll('[data-landing-tab]').forEach((tab) => {
          tab.setAttribute('aria-pressed', String(tab.dataset.landingTab === id));
        });
        this.querySelectorAll('[data-landing-tab-panel]').forEach((panel) => {
          panel.hidden = panel.dataset.landingTabPanel !== id;
        });
      }
    }
  );
}
