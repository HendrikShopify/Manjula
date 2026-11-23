/* <horizontal-scroll>: sections/horizontal-scroll.liquid (Figma Horizontal scroll).
   [data-horizontal-scroll-pin]       desktop: gets the extra height the sideways travel needs
   [data-horizontal-scroll-viewport]  sticky 900px window (desktop; scrolls natively with reduced motion);
                                      the Swiper container on mobile (.swiper)
   [data-horizontal-scroll-track]     the step list; moved sideways while the page scrolls (desktop);
                                      the Swiper wrapper on mobile (.swiper-wrapper)
   [data-horizontal-scroll-slide]     mobile card (.swiper-slide)
   [data-horizontal-scroll-next]      mobile glass button: one card forward; the host gets data-past-first after the
                                      first card, which fades the button out (as the UGC slider)
   Mobile runs on Swiper (below 1024px only; destroyed from 1024px): a swipe moves one card, as the UGC slider.
   [data-horizontal-scroll-parallax]  photo frame; its media (116% wide) slides sideways inside it while pinned
   [data-horizontal-scroll-numeral]   numeral; drifts against the track so it moves slower (depth)
   [data-horizontal-scroll-text]      step text; gets data-revealed (fades up) once it comes into view
   While pinned the host has data-animate; without it (mobile, reduced motion) nothing moves or hides. */

// Photo slide inside its frame: the media is 116% wide, so 8 / 116 of its width each way.
const HS_PHOTO_SHIFT = 8 / 116;
// Numeral drift over one viewport width (px): it lags the track by this much, so it reads as further back.
const HS_NUMERAL_DRIFT = 120;
// Text reveals once its left edge is this far into the viewport (0 left edge, 1 right edge).
const HS_REVEAL_AT = 0.85;
// Mobile cards: the same tap threshold as the UGC slider
const HS_THRESHOLD = 8;
class HorizontalScroll extends BaseComponent {
  init() {
    this.pin = this.$('[data-horizontal-scroll-pin]');
    this.viewport = this.$('[data-horizontal-scroll-viewport]');
    this.track = this.$('[data-horizontal-scroll-track]');
    if (!this.pin || !this.viewport || !this.track) return;

    this.desktop = window.matchMedia('(min-width: 64rem)');
    this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.distance = 0;
    this.frame = 0;
    this.parallax = [...this.$$('[data-horizontal-scroll-parallax]')].map((frame) => ({ frame, media: frame.firstElementChild }));
    this.numerals = [...this.$$('[data-horizontal-scroll-numeral]')].map((el) => ({ el }));
    this.texts = [...this.$$('[data-horizontal-scroll-text]')].map((el) => ({ el }));

    const measure = () => this.measure();
    this.listen(window, 'resize', measure, { passive: true });
    this.listen(this.desktop, 'change', measure);
    this.listen(this.reduce, 'change', measure);
    this.listen(window, 'scroll', () => {
      if (!this.distance || this.frame) return;
      this.frame = requestAnimationFrame(() => {
        this.frame = 0;
        this.move();
      });
    }, { passive: true });
    this.slides = [...this.$$('[data-horizontal-scroll-slide]')];
    this.card = 0;
    measure();

    const next = this.$('[data-horizontal-scroll-next]');
    if (next) this.listen(next, 'click', () => this.goTo(this.card + 1));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.swiper?.destroy(true, true);
    this.swiper = null;
  }

  // Mobile: Swiper below 1024px, none from 1024px (the desktop track moves itself).
  slider() {
    if (this.desktop.matches || !window.Swiper || this.slides.length < 2) {
      this.swiper?.destroy(true, true);
      this.swiper = null;
      this.card = 0;
      this.removeAttribute('data-past-first');
      return;
    }
    if (this.swiper) return this.swiper.update();
    this.swiper = new Swiper(this.viewport, {
      slidesPerView: 'auto',
      spaceBetween: parseFloat(getComputedStyle(this).getPropertyValue('--gutter')) || 0,
      speed: this.reduce.matches ? 0 : 400,
      threshold: HS_THRESHOLD,
      noSwipingSelector: 'button',
    });
    // Swiper's activeIndex sticks at the end (the last cards share one stop), so the component owns the index and
    // a swipe moves one card, as the UGC slider.
    this.swiper.on('touchEnd', (swiper) => {
      const diff = swiper.touches.diff;
      if (Math.abs(diff) >= 10) setTimeout(() => this.goTo(this.card + (diff < 0 ? 1 : -1)));
    });
  }

  goTo(index) {
    this.card = Math.max(0, Math.min(this.slides.length - 1, index));
    this.toggleAttribute('data-past-first', this.card > 0);
    this.swiper?.slideTo(this.card);
  }

  measure() {
    this.slider();
    const pinned = this.desktop.matches && !this.reduce.matches;
    this.viewport.style.overflowX = pinned ? 'hidden' : '';
    this.distance = pinned ? Math.max(0, this.track.offsetWidth - this.viewport.clientWidth) : 0;
    this.pin.style.height = this.distance ? `${this.viewport.offsetHeight + this.distance}px` : '';
    this.toggleAttribute('data-animate', Boolean(this.distance));
    // Positions inside the track (all absolute in the ol from lg), read once per layout.
    const place = (item, el) => {
      item.left = el.offsetLeft;
      item.width = el.offsetWidth;
    };
    this.parallax.forEach((item) => place(item, item.frame.parentElement));
    this.numerals.forEach((item) => place(item, item.el));
    this.texts.forEach((item) => place(item, item.el));
    if (!this.distance) {
      this.track.style.transform = '';
      this.parallax.forEach(({ media }) => media && (media.style.transform = ''));
      this.numerals.forEach(({ el }) => (el.style.transform = ''));
      this.texts.forEach(({ el }) => el.removeAttribute('data-revealed'));
    } else this.move();
  }

  move() {
    const progress = Math.min(1, Math.max(0, -this.pin.getBoundingClientRect().top / this.distance));
    const offset = progress * this.distance;
    this.track.style.transform = `translate3d(${-offset}px, 0, 0)`;

    // Where an element's centre is in the viewport: 0 at the left edge, 1 at the right edge (clamped).
    const width = this.viewport.clientWidth;
    const at = ({ left, width: w }) => Math.min(1, Math.max(0, (left - offset + w / 2) / width));
    this.parallax.forEach((item) => {
      if (item.media) item.media.style.transform = `translate3d(${(0.5 - at(item)) * 2 * HS_PHOTO_SHIFT * 100}%, 0, 0)`;
    });
    this.numerals.forEach((item) => {
      item.el.style.transform = `translate3d(${(0.5 - at(item)) * HS_NUMERAL_DRIFT}px, 0, 0)`;
    });
    this.texts.forEach((item) => {
      if ((item.left - offset) / width < HS_REVEAL_AT) item.el.setAttribute('data-revealed', '');
    });
  }
}

if (!customElements.get('horizontal-scroll')) customElements.define('horizontal-scroll', HorizontalScroll);
