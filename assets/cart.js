/*
  Cart drawer and cart page.
  <cart-items>   quantity inputs (data-index = line), input[data-cart-plan] (custom-select; one-time '' or a selling plan id),
                 button[data-cart-subscribe][data-plan], button[data-cart-add] (variant id, the mini offer rows).
                 Every change re-renders the cart-drawer, cart-icon-bubble and main-cart sections.
  One cart request per change. Rules come from [data-cart-gift-rules] in the cart drawer (any mini in the cart is the gift).
  CartGift.addRequest(items) every add (product form, bundle builder, mini offer rows) asks it for its one request:
                             cart/add with the free mini when it becomes due, or one cart/update that adds the items
                             and removes a gift that is no longer due (a third oil).
  CartGift.updatesFor(l, q)  quantity and remove send one cart/update with the line change plus the gift add or removal.
  <cart-gift>    fallback, rendered by cart-drawer.liquid only when the free mini has to change: data-add (variant id)
                 and data-updates ("key:qty," pairs: 0 removes a gift that is no longer due).
                 Each action runs once per page view, so a failing add (sold out) can not loop.
*/
class CartItems extends BaseComponent {
  constructor() {
    super();
    this.debouncedUpdate = debounce((index, value) => {
      this.updateQuantity(index, value);
    }, 300);
  }

  init() {
    this.listen(this, 'change', (event) => {
      const plan = event.target.closest('[data-cart-plan]');
      if (plan) return this.updatePlan(plan.dataset.index, plan.value);
      if (!event.target.closest('quantity-input')) return;
      this.debouncedUpdate(event.target.dataset.index, event.target.value);
    });
    this.listen(this, 'click', (event) => {
      const subscribe = event.target.closest('[data-cart-subscribe]');
      if (subscribe) return this.updatePlan(subscribe.dataset.index, subscribe.dataset.plan, subscribe);
      const add = event.target.closest('[data-cart-add]');
      if (add) return this.addVariant(add.dataset.cartAdd, add);
    });
  }

  // One cart/update request with the line change and, when the oils change, the free mini added or removed.
  updateQuantity(line, quantity) {
    const updates = CartGift.updatesFor(parseInt(line), parseInt(quantity));
    if (updates) return this.request(routes.cart_update_url, { updates }, null, () => this.resetQuantity(line));
    this.request(routes.cart_change_url, { line: parseInt(line), quantity: parseInt(quantity) }, null, () => this.resetQuantity(line));
  }

  // Switch a line between one-time ('') and a selling plan. /cart/change keeps the quantity when it is sent along.
  updatePlan(line, plan, button) {
    const input = this.querySelector(`quantity-input input[data-index="${line}"]`);
    const body = { line: parseInt(line), quantity: parseInt(input?.value || 1), selling_plan: plan ? parseInt(plan) : null };
    this.request(routes.cart_change_url, body, button);
  }

  addVariant(id, button) {
    const { url, body } = CartGift.addRequest([{ id: parseInt(id), quantity: 1 }]);
    this.request(url, body, button);
  }

  request(url, body, button, onError) {
    // The re-render replaces the drawer markup; put keyboard focus back on the same control (by id) afterwards.
    const active = this.contains(document.activeElement) ? document.activeElement : null;
    const focusId = active?.closest('custom-select, quantity-input')?.querySelector('button[id], input[id]')?.id || active?.id || '';
    this.setAttribute('loading', '');
    button?.setAttribute('aria-busy', 'true');
    document.dispatchEvent(new Event('loading:start'));
    this.clearError();

    fetch(url, {
      ...fetchConfig(),
      body: JSON.stringify({ ...body, sections: CartItems.sections, sections_url: window.location.pathname })
    })
      .then(res => res.json())
      .then(state => {
        if (state.errors || state.status) {
          this.showError(state.description || state.errors || state.message);
          onError?.();
          return;
        }
        CartItems.renderSections(state.sections);
        if (focusId) document.getElementById(focusId)?.focus();
      })
      .catch((err) => {
        console.error(err);
        this.showError('Something went wrong. Please try again.');
      })
      .finally(() => {
        this.removeAttribute('loading');
        button?.removeAttribute('aria-busy');
        document.dispatchEvent(new Event('loading:end'));
      });
  }

  // After a rejected change the input keeps the rejected value; put the server-rendered one back.
  resetQuantity(line) {
    const input = this.querySelector(`quantity-input input[data-index="${line}"]`);
    if (input) input.value = input.getAttribute('value');
  }

  get errorElement() {
    const inDrawer = this.closest('side-drawer');
    return document.getElementById(inDrawer ? 'cart-drawer-error' : 'cart-page-error');
  }

  showError(message) {
    const error = this.errorElement;
    if (!error) return;
    (error.querySelector('[data-helper-text]') || error).textContent = message;
    error.hidden = false;
  }

  clearError() {
    const error = this.errorElement;
    if (!error) return;
    (error.querySelector('[data-helper-text]') || error).textContent = '';
    error.hidden = true;
  }

  static get sections() {
    return ['cart-drawer', 'cart-icon-bubble', 'main-cart'];
  }

  static renderSections(sections) {
    if (!sections) return;
    document.getElementById('cart-icon-bubble').innerHTML =
      CartItems.getSectionHTML(sections['cart-icon-bubble'], 'cart-icon-bubble');

    const drawer = document.getElementById('cart-drawer-inner');
    if (drawer) drawer.innerHTML = CartItems.getSectionHTML(sections['cart-drawer'], 'cart-drawer-inner');

    const cartPage = document.getElementById('main-cart');
    if (cartPage) {
      cartPage.innerHTML = CartItems.getSectionHTML(sections['main-cart'], 'main-cart');
    }

  }

  static getSectionHTML(html, sectionId) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .getElementById(sectionId).innerHTML;
  }
}

customElements.define('cart-items', CartItems);


class CartRemoveButton extends BaseComponent {
  init() {
    this.listen(this, 'click', () => {
      this.closest('cart-items').updateQuantity(this.dataset.index, 0);
    });
  }
}

customElements.define('cart-remove-button', CartRemoveButton);




class DiscountCode extends BaseComponent {
  init() {
    this.form = this.querySelector('[data-discount-form]');
    this.input = this.querySelector('input[name="discount"]');
    this.error = this.querySelector('[data-discount-error]');
    this.listen(this.form, 'submit', (evt) => { evt.preventDefault(); this.apply(); });
  }

  showError(message) {
    if (!this.error) return;
    this.error.querySelector('[data-helper-text]').textContent = message;
    this.error.hidden = !message;
  }

  apply() {
    const code = this.input.value.trim();
    if (!code) return;
    this.showError('');
    const button = this.form.querySelector('[type="submit"]');
    button?.setAttribute('aria-busy', 'true');
    const existing = Array.from(document.querySelectorAll('[data-discount-code]')).map((el) => el.dataset.discountCode);
    const codes = [...new Set([...existing, code])].join(',');

    fetch(routes.cart_update_url, {
      ...fetchConfig(),
      body: JSON.stringify({ discount: codes, sections: ['cart-drawer', 'cart-icon-bubble', 'main-cart'], sections_url: window.location.pathname }),
    })
      .then((res) => res.json())
      .then((state) => {
        const applied = (state.discount_codes || []).find((d) => d.code.toLowerCase() === code.toLowerCase());
        if (!applied || !applied.applicable) {
          this.showError(window.cartStrings?.discountError || 'This discount code is not valid');
          return;
        }
        CartItems.renderSections(state.sections);
      })
      .catch(() => this.showError(window.cartStrings?.error || 'An error occurred'))
      .finally(() => button?.removeAttribute('aria-busy'));
  }
}

customElements.define('discount-code', DiscountCode);


class CartGift extends HTMLElement {
  static done = new Set();

  static get rules() {
    try {
      return JSON.parse(document.querySelector('[data-cart-gift-rules]')?.textContent || 'null');
    } catch (error) {
      return null;
    }
  }

  // The mini variant that is due for these cart lines: exactly 2 different oils (one-time or subscription).
  static dueGift(rules, lines) {
    const live = lines.filter((line) => line.qty > 0 && !line.gift && line.oil);
    const oils = [...new Set(live.map((line) => String(line.oil)))];
    if (oils.length !== 2) return null;
    return rules.minis[oils.sort((a, b) => Number(a) - Number(b)).join(',')] || null;
  }

  // cart/add items plus the free mini when this add makes 2 different oils (one request, no second update).
  static withGift(items) {
    const rules = CartGift.rules;
    if (!rules) return items;
    const added = items.map((item) => ({ oil: rules.oils[item.id] || 0, qty: item.quantity || 1, plan: !!item.selling_plan, gift: false }));
    const mini = CartGift.dueGift(rules, [...rules.lines, ...added]);
    if (!mini || rules.lines.some((line) => line.gift && line.variant === mini)) return items;
    return [...items, { id: mini, quantity: 1 }];
  }

  // The one request for adding these items: cart/add with the free mini when it becomes due, or, when the add means a
  // gift has to go (a third oil), one cart/update that adds the items and removes the gift. Returns { url, body }.
  // Items with a selling plan or properties can only go through cart/add; <cart-gift> then removes the gift after.
  static addRequest(items) {
    const add = { url: routes.cart_add_url, body: { items: CartGift.withGift(items) } };
    const rules = CartGift.rules;
    if (!rules) return add;
    const added = items.map((item) => ({ oil: rules.oils[item.id] || 0, qty: Number(item.quantity) || 1, plan: !!item.selling_plan, gift: false }));
    const mini = CartGift.dueGift(rules, [...rules.lines, ...added]);
    const remove = rules.lines.filter((line) => line.gift && line.qty > 0 && line.variant !== mini);
    if (!remove.length) return add;
    if (items.some((item) => item.selling_plan || Object.keys(item.properties || {}).length)) return add;

    const updates = {};
    for (const item of items) {
      const matches = rules.lines.filter((line) => line.variant === Number(item.id) && !line.gift);
      if (matches.length > 1 || matches.some((line) => line.plan)) return add;
      const key = matches[0]?.key ?? String(item.id);
      updates[key] = (updates[key] ?? matches[0]?.qty ?? 0) + (Number(item.quantity) || 1);
    }
    remove.forEach((line) => { updates[line.key] = 0; });
    if (mini && !rules.lines.some((line) => line.gift && line.variant === mini)) updates[mini] = 1;
    return { url: routes.cart_update_url, body: { updates } };
  }

  // cart/update "updates" for setting cart line `line` (1-based) to `quantity`, with the gift added (by variant id) or
  // removed in the same request. Null when the rules are missing; the caller falls back to cart/change.
  static updatesFor(line, quantity) {
    const rules = CartGift.rules;
    const target = rules?.lines[line - 1];
    if (!target) return null;
    const lines = rules.lines.map((entry) => (entry === target ? { ...entry, qty: quantity } : entry));
    const mini = CartGift.dueGift(rules, lines);
    const updates = { [target.key]: quantity };
    let present = false;
    lines.forEach((entry) => {
      if (!entry.gift || entry.qty === 0) return;
      if (entry.variant === mini && !present) {
        present = true;
        if (entry.qty !== 1) updates[entry.key] = 1;
      } else {
        updates[entry.key] = 0;
      }
    });
    if (mini && !present) updates[mini] = 1;
    return updates;
  }

  connectedCallback() {
    const add = this.dataset.add;
    const updates = Object.fromEntries(
      (this.dataset.updates || '').split(',').filter(Boolean).map((pair) => {
        // Line keys contain a colon themselves (variant id:hash), so the quantity is after the last one.
        const split = pair.lastIndexOf(':');
        return [pair.slice(0, split), parseInt(pair.slice(split + 1))];
      })
    );
    const signature = `${add}|${this.dataset.updates}`;
    if (CartGift.done.has(signature)) return;
    CartGift.done.add(signature);

    const run = Object.keys(updates).length
      ? fetch(routes.cart_update_url, { ...fetchConfig(), body: JSON.stringify({ updates }) })
      : Promise.resolve();
    run
      .then(() => {
        if (!add) return null;
        return fetch(routes.cart_add_url, {
          ...fetchConfig(),
          body: JSON.stringify({ items: [{ id: parseInt(add), quantity: 1 }] })
        });
      })
      .then(() =>
        fetch(`${window.location.pathname}?sections=${CartItems.sections.join(',')}`)
          .then((res) => res.json())
          .then((sections) => CartItems.renderSections(sections))
      )
      .catch((error) => console.error(error));
  }
}

if (!customElements.get('cart-gift')) customElements.define('cart-gift', CartGift);
