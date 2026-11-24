/* <results-timeline>: sections/results-timeline.liquid (Figma Results timeline).
   [data-results-timeline-track]  Swiper container below lg (.swiper > .swiper-wrapper > [data-results-timeline-step]);
                                  from lg the list is a plain 12-column grid and Swiper is destroyed
   [data-results-timeline-step]   one step; data-active="true" shows it at full strength (desktop)
   [data-results-timeline-caret]  desktop caret under the bracket; it sits on the left edge of a step
   [data-results-timeline-next]   mobile glass button: one card forward; the host gets data-past-first after the first
                                  card, which fades the button out (as the UGC slider)
   [data-results-timeline-edge]   the heading; its left padding is the page margin the mobile cards start and stop on
   Desktop: once the steps scroll into view (RESULTS_TIMELINE_START), the caret slides from step to step
   (RESULTS_TIMELINE_STEP seconds each) and every step turns Active when the caret reaches it. It plays once; the caret
   ends on the last step and stays there. Reduced motion: no slide, every step Active at once. */
const RESULTS_TIMELINE_START = 'top 75%';
const RESULTS_TIMELINE_STEP = 1;
const RESULTS_TIMELINE_CARD_GAP = 12;
const RESULTS_TIMELINE_THRESHOLD = 8;

class ResultsTimeline extends BaseComponent {
  init() {
    this.track = this.$('[data-results-timeline-track]');
    this.steps = Array.from(this.$$('[data-results-timeline-step]'));
    this.caret = this.$('[data-results-timeline-caret]');
    if (!this.track || !this.steps.length) return;
    this.desktop = window.matchMedia('(min-width: 1024px)');
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.card = 0;
    this.current = 0;

    const next = this.$('[data-results-timeline-next]');
    if (next) this.listen(next, 'click', () => this.goTo(this.card + 1));
    this.listen(this.desktop, 'change', () => this.build());
    this.listen(window, 'resize', () => {
      if (this.desktop.matches) return this.placeCaret();
      if (!this.swiper) return;
      this.setEdge();
      this.swiper.update();
    });
    this.build();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.trigger?.kill();
    this.timeline?.kill();
    this.swiper?.destroy(true, true);
    this.swiper = null;
  }

  build() {
    if (this.desktop.matches) {
      this.swiper?.destroy(true, true);
      this.swiper = null;
      this.track.style.paddingInline = '';
      this.placeCaret();
      if (!this.trigger && !this.played) this.watch();
      return;
    }
    // Mobile shows every step at full strength (Figma mobile frame); the dimming classes are lg only.
    if (!window.Swiper || this.swiper) return;
    this.setEdge();
    this.swiper = new Swiper(this.track, {
      slidesPerView: 'auto',
      spaceBetween: RESULTS_TIMELINE_CARD_GAP,
      speed: this.reduced.matches ? 0 : 400,
      threshold: RESULTS_TIMELINE_THRESHOLD,
      noSwipingSelector: 'button',
    });
    // Swiper's activeIndex sticks at the end (the last cards share one stop), so the component owns the index and a
    // swipe moves one card, as the UGC slider.
    this.swiper.on('touchEnd', (swiper) => {
      const diff = swiper.touches.diff;
      if (Math.abs(diff) >= 10) setTimeout(() => this.goTo(this.card + (diff < 0 ? 1 : -1)));
    });
    this.goTo(this.card);
  }

  // Play once when the step list scrolls into view.
  watch() {
    if (!window.gsap || !window.ScrollTrigger) return this.finish();
    gsap.registerPlugin(ScrollTrigger);
    this.trigger = ScrollTrigger.create({
      trigger: this.track,
      start: RESULTS_TIMELINE_START,
      once: true,
      onEnter: () => this.play(),
    });
  }

  play() {
    this.played = true;
    if (this.reduced.matches || !this.caret || this.steps.length < 2) return this.finish();
    const tl = gsap.timeline();
    for (let i = 1; i < this.steps.length; i++) {
      tl.to(this.caret, { x: () => this.stepX(i), duration: RESULTS_TIMELINE_STEP, ease: 'power4.inOut' });
      tl.call(() => {
        this.current = i;
        this.steps[i].dataset.active = 'true';
      });
    }
    this.timeline = tl;
  }

  finish() {
    this.played = true;
    this.steps.forEach((step) => (step.dataset.active = 'true'));
    this.current = this.steps.length - 1;
    this.placeCaret();
  }

  // the caret's x on step i: the step's left edge in the caret's container
  stepX(i) {
    return this.steps[i]?.offsetLeft || 0;
  }

  placeCaret() {
    if (!this.caret || this.timeline?.isActive()) return;
    if (window.gsap) gsap.set(this.caret, { x: this.stepX(this.current) });
    else this.caret.style.transform = `translateX(${this.stepX(this.current)}px)`;
  }

  goTo(index) {
    this.card = Math.max(0, Math.min(this.steps.length - 1, index));
    this.toggleAttribute('data-past-first', this.card > 0);
    this.swiper?.slideTo(this.card);
  }

  setEdge() {
    const edge = this.$('[data-results-timeline-edge]');
    const margin = edge ? parseFloat(getComputedStyle(edge).paddingLeft) || 0 : 0;
    this.track.style.paddingInline = `${margin}px`;
  }
}

if (!customElements.get('results-timeline')) customElements.define('results-timeline', ResultsTimeline);
