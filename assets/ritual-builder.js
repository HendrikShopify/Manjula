/* <ritual-builder>: the Manjula buy part (snippets/ritual-builder.liquid, Figma Ritual builder).
   Runtime states of the Figma variants:
     Dropdown=Open  [data-ritual-toggle] aria-expanded=true, [data-ritual-picker] visible
     Oils=2         a picked oil fills [data-ritual-picked]; its [data-ritual-oil] checkbox is checked, so product-form.js
                    adds both oils in one request and shows the total
     Plan=Subscribe the subscription row is checked: the offer hides, the picked oil is dropped, the button reads Subscribe
   The button price follows the plan through product-form.setUnitPrice (prices in [data-ritual-prices]). */
class RitualBuilder extends BaseComponent {
  init() {
    this.toggle = this.$('[data-ritual-toggle]');
    this.picker = this.$('[data-ritual-picker]');
    this.picked = this.$('[data-ritual-picked]');
    this.offer = this.$('[data-ritual-offer]');
    this.form = this.$('product-form');
    try {
      this.prices = JSON.parse(this.$('[data-ritual-prices]')?.textContent || '{}');
    } catch (e) {
      this.prices = {};
    }

    this.listen(this, 'click', (evt) => {
      const target = evt.target;
      if (target.closest('[data-ritual-toggle]')) return this.setOpen(this.toggle.getAttribute('aria-expanded') !== 'true');
      if (target.closest('[data-ritual-close]')) return this.setOpen(false, true);
      const add = target.closest('[data-ritual-add]');
      if (add && !add.disabled) return this.pick(add);
      if (target.closest('[data-ritual-remove]')) return this.clear(true);
    });
    this.listen(this, 'keydown', (evt) => {
      if (evt.key === 'Escape' && this.picker && !this.picker.hidden) this.setOpen(false, true);
    });
    this.listen(this, 'change', (evt) => {
      if (evt.target.matches?.('[data-purchase-type], [data-frequency-pill]')) this.syncPlan();
    });
    // product-form.js may connect after this element; wait a frame before the first sync.
    requestAnimationFrame(() => this.syncPlan());
  }

  get subscribed() {
    return this.$('[data-purchase-type]:checked')?.value === 'subscription';
  }

  setOpen(open, returnFocus = false) {
    if (!this.toggle || !this.picker) return;
    this.toggle.setAttribute('aria-expanded', String(open));
    this.picker.hidden = !open;
    if (open) this.picker.querySelector('[data-ritual-add]:not([disabled])')?.focus();
    else if (returnFocus && !this.toggle.hidden) this.toggle.focus();
  }

  pick(button) {
    const id = button.dataset.ritualAdd;
    this.$$('[data-ritual-oil]').forEach((input) => {
      input.checked = input.dataset.ritualOil === id;
    });

    const image = this.picked.querySelector('[data-ritual-slot-image]');
    if (image && button.dataset.image) {
      image.srcset = '';
      image.src = button.dataset.image;
    }
    this.picked.querySelector('[data-ritual-slot-name]').textContent = button.dataset.name;
    this.picked.querySelector('[data-ritual-slot-size]').textContent = button.dataset.oilSize;
    this.picked.querySelector('[data-ritual-remove]')?.setAttribute('aria-label', button.dataset.removeLabel);

    this.setOpen(false);
    this.toggle.hidden = true;
    this.picked.hidden = false;
    this.$('[data-ritual-link]').hidden = false;
    this.showBadge(Boolean(button.dataset.unlocked));
    this.$('[data-ritual-tier]').textContent = button.dataset.unlocked || this.dataset.tier;
    this.refresh();
    this.picked.querySelector('[data-ritual-remove]')?.focus();
  }

  clear(returnFocus = false) {
    this.$$('[data-ritual-oil]').forEach((input) => {
      input.checked = false;
    });
    if (this.picked) this.picked.hidden = true;
    if (this.toggle) this.toggle.hidden = false;
    const link = this.$('[data-ritual-link]');
    if (link) link.hidden = true;
    this.showBadge(false);
    const tier = this.$('[data-ritual-tier]');
    if (tier) tier.textContent = this.dataset.tier;
    this.refresh();
    if (returnFocus) this.toggle?.focus();
  }

  /** The badge keeps its space while hidden (visibility), so the row does not jump when it shows. */
  showBadge(show) {
    const badge = this.$('[data-ritual-badge]');
    if (!badge) return;
    badge.toggleAttribute('data-shown', show);
    badge.setAttribute('aria-hidden', String(!show));
  }

  syncPlan() {
    const subscribed = this.subscribed;
    if (this.offer) this.offer.hidden = subscribed;
    if (subscribed) {
      this.setOpen(false);
      this.clear();
    }
    const plan = this.$('[data-purchase-plan]')?.value || 'one-time';
    const cents = this.prices[plan] ?? this.prices['one-time'];
    if (this.form?.setUnitPrice && Number.isFinite(cents)) this.form.setUnitPrice(cents);
    this.refresh();
  }

  refresh() {
    const button = this.$('[name=add]');
    const label = button?.querySelector('[data-button-label]');
    if (label && !button.disabled) {
      const two = [...this.$$('[data-ritual-oil]')].some((input) => input.checked);
      label.textContent = this.subscribed ? this.dataset.labelSubscribe : two ? this.dataset.labelTwo : this.dataset.labelOne;
    }
    this.form?.updateTotal?.();
  }
}

if (!customElements.get('ritual-builder')) customElements.define('ritual-builder', RitualBuilder);
