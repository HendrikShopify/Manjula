/* <ingredient-explorer>: sections/ingredient-explorer.liquid (Figma Ingredient explorer).
   data-type / data-function on the host   current filters ('all' or a handle)
   [data-ingredient-filter="type|function"][data-value]   desktop list rows (aria-pressed)
   [data-ingredient-chip]       mobile product type radios (value = handle)
   [data-ingredient-item]       ingredient li with data-types / data-functions (space separated handles)
   [data-ingredient-row]        the row button inside; opens its Ingredient modal via data-drawer-trigger
   [data-ingredient-list]       the ingredient list; while it is hovered or has keyboard focus the frame shows (CSS)
   [data-ingredient-frame]      desktop Ingredient preview (180px, Learn more tag), as the About page Timeline frame:
                                its middle always sits on the middle of the hovered row (Hendrik, 22 Nov) and it
                                drifts a little sideways with the cursor (GSAP quickTo), but it stays right of the
                                widest visible name plus a gutter and inside the list's right edge. On keyboard focus
                                it goes to the focused row.
   [data-ingredient-strip]      the photos as one column in list order ([data-ingredient-image], one per item; a hidden
                                item hides its photo). It moves so the hovered row's photo fills the frame, blurred
                                while it moves. Entering the list puts the photo in place at once. Reduced motion: no
                                move, no blur.
                                The frame follows the hovered row when the page scrolls under a still pointer.
   [data-ingredient-more]       mobile "Show more", reveals rows beyond the first 8
   [data-ingredient-empty]      shown when no ingredient matches
   Top down: the Product type list always shows every product; the Function list shows only the functions the
   selected product has (never an empty result). When the selected function gets hidden, Function falls back to All. */
const MOBILE_LIMIT = 8;
// Same motion as the Timeline (timeline.js)
const INGREDIENT_STRIP = { duration: 0.6, ease: 'power3.out' };
const INGREDIENT_FOLLOW = { duration: 0.6, ease: 'power3' };
const INGREDIENT_BLUR = '3px';

class IngredientExplorer extends BaseComponent {
  init() {
    this.items = Array.from(this.$$('[data-ingredient-item]'));
    this.images = Array.from(this.$$('[data-ingredient-image]'));
    this.list = this.$('[data-ingredient-list]');
    this.frame = this.$('[data-ingredient-frame]');
    this.strip = this.$('[data-ingredient-strip]');
    this.more = this.$('[data-ingredient-more]');
    this.empty = this.$('[data-ingredient-empty]');
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.expanded = false;
    this.entering = true;

    this.listen(this, 'click', (evt) => {
      const filter = evt.target.closest('[data-ingredient-filter]');
      if (filter) return this.setFilter(filter.dataset.ingredientFilter, filter.dataset.value);
      if (evt.target.closest('[data-ingredient-more]')) {
        this.expanded = true;
        this.apply();
      }
    });
    this.listen(this, 'change', (evt) => {
      if (evt.target.matches('[data-ingredient-chip]')) this.setFilter('type', evt.target.value);
    });

    if (this.list && this.frame && window.gsap) {
      gsap.set(this.frame, { xPercent: -50, yPercent: -50 });
      const follow = this.reduced.matches ? { duration: 0 } : INGREDIENT_FOLLOW;
      this.xTo = gsap.quickTo(this.frame, 'x', follow);
      this.yTo = gsap.quickTo(this.frame, 'y', follow);
      // jump to the pointer on entry, so the frame does not glide in from its last spot
      // the frame's middle sits on the middle of the hovered row; sideways it drifts with the cursor
      const rowMiddle = (item) => {
        const rect = item.getBoundingClientRect();
        return rect.top + rect.height / 2;
      };
      this.pointer = null;
      this.listen(this.list, 'pointerenter', (evt) => {
        this.pointer = { x: evt.clientX, y: evt.clientY };
        const item = evt.target.closest?.('[data-ingredient-item]') || document.elementFromPoint(evt.clientX, evt.clientY)?.closest('[data-ingredient-item]');
        this.moveFrame(evt.clientX, item ? rowMiddle(item) : evt.clientY, true);
      });
      this.listen(this.list, 'pointermove', (evt) => {
        this.pointer = { x: evt.clientX, y: evt.clientY };
        const item = evt.target.closest('[data-ingredient-item]');
        if (item) this.moveFrame(evt.clientX, rowMiddle(item));
      });
      this.listen(this.list, 'pointerover', (evt) => {
        const item = evt.target.closest('[data-ingredient-item]');
        this.setActive(item);
        if (item && this.pointer) this.moveFrame(this.pointer.x, rowMiddle(item));
      });
      // Scrolling with the wheel moves the rows under a still pointer: follow the row that is now under it
      this.listen(window, 'scroll', () => {
        if (!this.pointer || !this.list.matches(':hover')) return;
        const item = document.elementFromPoint(this.pointer.x, this.pointer.y)?.closest('[data-ingredient-item]');
        if (!item || !this.list.contains(item)) return;
        this.setActive(item);
        this.moveFrame(this.pointer.x, rowMiddle(item));
      }, { passive: true });
      this.listen(this.list, 'focusin', (evt) => {
        const row = evt.target.closest('[data-ingredient-row]');
        if (row?.matches(':focus-visible')) {
          const rect = row.getBoundingClientRect();
          this.moveFrame(rect.left + rect.width * 0.75, rect.top + rect.height / 2, true);
        }
        this.setActive(evt.target.closest('[data-ingredient-item]'));
      });
      this.listen(this.list, 'pointerleave', () => {
        this.entering = true;
        this.pointer = null;
      });
      this.listen(this.list, 'focusout', (evt) => {
        if (!this.list.contains(evt.relatedTarget)) this.entering = true;
      });
    }

    this.apply();
  }

  setFilter(kind, value) {
    this.dataset[kind] = value;
    this.$$(`[data-ingredient-filter="${kind}"]`).forEach((row) => row.setAttribute('aria-pressed', String(row.dataset.value === value)));
    if (kind === 'type') this.$$('[data-ingredient-chip]').forEach((chip) => (chip.checked = chip.value === value));
    this.expanded = false;
    this.apply();
  }

  matches(item, type, fn) {
    const okType = type === 'all' || item.dataset.types.split(' ').includes(type);
    const okFn = fn === 'all' || item.dataset.functions.split(' ').includes(fn);
    return okType && okFn;
  }

  // Hides the functions the selected product type has no ingredient for. Returns false when the selected function
  // had to be hidden.
  pruneFunctions() {
    const { type } = this.dataset;
    let selectedVisible = true;
    this.querySelectorAll('[data-ingredient-filter="function"]').forEach((row) => {
      const value = row.dataset.value;
      const empty = value !== 'all' && !this.items.some((item) => this.matches(item, type, value));
      row.hidden = empty;
      if (empty && value === this.dataset.function) selectedVisible = false;
    });
    return selectedVisible;
  }

  apply() {
    if (!this.pruneFunctions()) return this.setFilter('function', 'all');
    const { type, function: fn } = this.dataset;
    const mobile = !window.matchMedia('(min-width: 1024px)').matches;
    let shown = 0;
    let matches = 0;
    this.items.forEach((item, i) => {
      const match = this.matches(item, type, fn);
      if (match) matches += 1;
      const visible = match && (!mobile || this.expanded || shown < MOBILE_LIMIT);
      if (visible) shown += 1;
      item.hidden = !visible;
      if (this.images[i]) this.images[i].hidden = !visible;
    });
    if (this.more) this.more.hidden = !mobile || this.expanded || matches <= MOBILE_LIMIT;
    if (this.empty) this.empty.hidden = matches > 0;
    this.bounds = null;
  }

  // Free space for the frame, in viewport pixels: right of the widest visible name (measured as glyphs) plus a gutter,
  // inside the list's right edge; up and down within the list. Measured on entry and after a filter change.
  measure() {
    const list = this.list.getBoundingClientRect();
    const host = this.getBoundingClientRect();
    const w = this.frame.offsetWidth;
    const h = this.frame.offsetHeight;
    const gap = parseFloat(getComputedStyle(this).getPropertyValue('--gutter')) || 12;
    const textRight = (el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return range.getBoundingClientRect().right;
    };
    const names = this.items
      .filter((item) => !item.hidden)
      .map((item) => item.querySelector('[data-ingredient-row] > span:nth-child(2)'))
      .filter(Boolean);
    const minLeft = Math.max(list.left, ...names.map(textRight)) + gap;
    const maxLeft = Math.max(minLeft, list.right - w);
    this.bounds = { list, host, w, h, minLeft, maxLeft };
  }

  // Centre the frame on a viewport point, held in the free space. Positions are relative to the host.
  moveFrame(clientX, clientY, jump = false) {
    if (!this.xTo) return;
    if (jump || !this.bounds) this.measure();
    const { w, minLeft, maxLeft } = this.bounds;
    // read the host's position now: the page may have scrolled since the bounds were measured
    const host = this.getBoundingClientRect();
    // As the Timeline: rest in the middle of the free space, drift up to a quarter of the width with the cursor
    const drift = (clientX / window.innerWidth - 0.5) * 0.5 * w;
    const left = Math.min(Math.max((minLeft + maxLeft) / 2 + drift, minLeft), maxLeft);
    const x = left + w / 2 - host.left;
    const y = clientY - host.top;
    // quickTo(value, start): a jump restarts from the new spot (gsap.set alone is undone by a running quickTo)
    this.xTo(x, jump ? x : undefined);
    this.yTo(y, jump ? y : undefined);
  }

  // Slide the strip so the photo of `item` fills the frame (photos of hidden items are hidden too).
  setActive(item) {
    if (!item || !this.strip || !window.gsap) return;
    const visible = this.items.filter((i) => !i.hidden);
    const index = visible.indexOf(item);
    if (index < 0) return;
    const yPercent = (-index * 100) / visible.length;
    if (this.entering || this.reduced.matches) {
      gsap.killTweensOf(this.strip);
      gsap.set(this.strip, { yPercent, filter: 'blur(0px)' });
      this.entering = false;
      return;
    }
    gsap.to(this.strip, { yPercent, ...INGREDIENT_STRIP, overwrite: true });
    gsap
      .timeline()
      .to(this.strip, { filter: `blur(${INGREDIENT_BLUR})`, duration: INGREDIENT_STRIP.duration * 0.3, ease: 'power2.out' })
      .to(this.strip, { filter: 'blur(0px)', duration: INGREDIENT_STRIP.duration * 0.7, ease: 'power2.out' });
  }
}

if (!customElements.get('ingredient-explorer')) customElements.define('ingredient-explorer', IngredientExplorer);
