/*
  <quick-view>
    <side-drawer data-modal="quick-view"> ... [data-quick-view-body] ... </side-drawer>
  </quick-view>
  Opens from any [data-quick-view-trigger] with data-product-url: fetches the quick-view-details section, puts its
  [data-quick-view-content] in [data-quick-view-body] and opens the side drawer.
  Inside the content: [data-quick-view-track] is a scroll-snap row of product media, moved one image at a time by
  [data-quick-view-prev] / [data-quick-view-next] (Previous is disabled on the first image, Next on the last).
  Close controls carry data-drawer-close (side-drawer.js handles them).
*/
class QuickView extends BaseComponent {
  init() {
    this.drawer = this.$('side-drawer');
    this.body = this.$('[data-quick-view-body]');
    this.controller = null;

    this.listen(document, 'click', (evt) => {
      const trigger = evt.target.closest('[data-quick-view-trigger]');
      if (!trigger) return;
      evt.preventDefault();
      this.load(trigger);
    });
    this.listen(this, 'click', (evt) => {
      const step = evt.target.closest('[data-quick-view-prev]') ? -1 : evt.target.closest('[data-quick-view-next]') ? 1 : 0;
      if (step) this.step(step);
    });
  }

  load(trigger) {
    const productUrl = trigger.dataset.productUrl;
    if (!productUrl || !this.drawer || !this.body) return;

    this.controller?.abort();
    this.controller = new AbortController();
    this.emit('loading:start');

    fetch(`${productUrl}?section_id=quick-view-details`, { signal: this.controller.signal })
      .then((response) => response.text())
      .then((html) => {
        const content = new DOMParser().parseFromString(html, 'text/html').querySelector('[data-quick-view-content]');
        if (!content) return;
        HTMLUpdateUtility.setInnerHTML(this.body, content.outerHTML);
        this.bindTrack();
        this.drawer.open(trigger);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') console.error(error);
      })
      .finally(() => this.emit('loading:end'));
  }

  bindTrack() {
    this.track = this.$('[data-quick-view-track]');
    if (!this.track) return;
    let frame;
    this.track.addEventListener(
      'scroll',
      () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => this.syncArrows());
      },
      { passive: true }
    );
    this.syncArrows();
  }

  index() {
    return Math.round(this.track.scrollLeft / (this.track.clientWidth || 1));
  }

  step(direction) {
    if (!this.track) return;
    const count = this.track.children.length;
    const target = Math.max(0, Math.min(count - 1, this.index() + direction));
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.track.scrollTo({ left: target * this.track.clientWidth, behavior: smooth ? 'smooth' : 'auto' });
  }

  syncArrows() {
    const count = this.track.children.length;
    const index = this.index();
    const prev = this.$('[data-quick-view-prev]');
    const next = this.$('[data-quick-view-next]');
    if (prev) prev.disabled = index <= 0;
    if (next) next.disabled = index >= count - 1;
  }
}

customElements.define('quick-view', QuickView);
