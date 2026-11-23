/* <purchase-options>: one-time purchase or subscription in the buy box (selling plans).
   The radios are not part of the product form. This element writes the chosen selling plan id into the hidden input
   name="selling_plan" (form attribute points at the product form), empty for a one-time purchase. It also swaps the
   subscription price when the frequency changes ([data-purchase-price] slots, templates in [data-purchase-prices]). */
class PurchaseOptions extends BaseComponent {
  init() {
    this.plan = this.querySelector('[data-purchase-plan]');
    if (!this.plan) return;

    this.listen(this, 'change', () => this.sync());
    this.sync();
  }

  get subscribed() {
    return this.querySelector('[data-purchase-type]:checked')?.value === 'subscription';
  }

  get frequency() {
    return this.querySelector('[data-frequency-pill]:checked')?.value || '';
  }

  sync() {
    this.plan.value = this.subscribed ? this.frequency : '';

    // keep every price in step with the selected frequency
    this.querySelectorAll('[data-purchase-price]').forEach((slot) => {
      const key = slot.dataset.purchasePrice === 'one-time' ? 'one-time' : this.frequency || slot.dataset.purchasePrice;
      const template = this.querySelector(`template[data-plan="${CSS.escape(key)}"]`);
      if (template) slot.innerHTML = template.innerHTML;
    });
  }
}

if (!customElements.get('purchase-options')) customElements.define('purchase-options', PurchaseOptions);
