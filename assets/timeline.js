/* <timeline-section>: sections/timeline.liquid (Figma Timeline).
   [data-timeline-row="n"]        desktop rows (aria-pressed); hover, focus or click makes one active
   [data-timeline-list]           desktop row list; while it is hovered or has keyboard focus the photo frame shows (CSS)
   [data-timeline-frame]          desktop photo frame, placed like the Sunset Row retailers section: its centre sits on
                                  the cursor's height and it drifts a little sideways with the cursor (GSAP quickTo), but
                                  it never covers text: it stays
                                  right of the widest row text, inside the list's right edge and inside the section, and
                                  below or right of the heading. On keyboard focus it goes to the focused row.
   [data-timeline-heading]        label and heading, kept clear of the frame
   [data-timeline-frame-inner]    the frame's mask; grows in and out (CSS)
   [data-timeline-strip]          the photos as one stacked column in list order. It moves so the active row's photo fills
                                  the frame; a jump over several rows runs past every photo in between. While it moves it
                                  blurs (TIMELINE_BLUR) and comes back into focus, after the Sunset Row retailers section.
   [data-timeline-image="n"]      photo per row in the strip
   [data-timeline-track]          mobile card track on Swiper (.swiper > .swiper-wrapper > [data-timeline-slide]), as the
                                  UGC slider: starts and stops on the page margin, a swipe moves one card
   [data-timeline-next]           mobile glass button over the track: one card forward; the host gets data-past-first
                                  after the first card, which fades the button out (as the UGC slider)
   Entering the list puts the hovered row's photo in place at once (the frame grows in). Reduced motion: no move, no blur. */
const TIMELINE_STRIP = { duration: 0.6, ease: 'power3.out' };
const TIMELINE_FOLLOW = { duration: 0.6, ease: 'power3' };
// 3px while the strip moves (Hendrik, 20 Nov)
const TIMELINE_BLUR = '3px';
// Mobile cards: gap-3 between cards (Figma Timeline cards), the same tap threshold as the UGC slider
const TIMELINE_CARD_GAP = 12;
const TIMELINE_THRESHOLD = 8;

class TimelineSection extends BaseComponent {
  init() {
    this.rows = Array.from(this.$$('[data-timeline-row]'));
    this.list = this.$('[data-timeline-list]');
    this.strip = this.$('[data-timeline-strip]');
    this.frame = this.$('[data-timeline-frame]');
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.entering = true;

    this.rows.forEach((row, index) => {
      this.listen(row, 'pointerenter', () => this.setActive(index));
      this.listen(row, 'focus', () => {
        if (row.matches(':focus-visible')) {
          const rect = row.getBoundingClientRect();
          this.moveFrame(rect.left + rect.width * 0.75, rect.top + rect.height / 2, true);
        }
        this.setActive(index);
      });
      this.listen(row, 'click', () => this.setActive(index));
    });
    if (this.list && this.frame && window.gsap) {
      gsap.set(this.frame, { xPercent: -50, yPercent: -50 });
      const follow = this.reduced.matches ? { duration: 0 } : TIMELINE_FOLLOW;
      this.xTo = gsap.quickTo(this.frame, 'x', follow);
      this.yTo = gsap.quickTo(this.frame, 'y', follow);
      // jump to the pointer on entry, so the frame does not glide in from its last spot
      this.listen(this.list, 'pointerenter', (evt) => this.moveFrame(evt.clientX, evt.clientY, true));
      this.listen(this.list, 'pointermove', (evt) => this.moveFrame(evt.clientX, evt.clientY));
    }
    if (this.list) {
      this.listen(this.list, 'pointerleave', () => (this.entering = true));
      this.listen(this.list, 'focusout', (evt) => {
        if (!this.list.contains(evt.relatedTarget)) this.entering = true;
      });
    }

    this.track = this.$('[data-timeline-track]');
    this.slides = this.$$('[data-timeline-slide]');
    if (this.track && this.slides.length && window.Swiper) {
      this.card = 0;
      this.setEdge();
      this.swiper = new Swiper(this.track, {
        slidesPerView: 'auto',
        spaceBetween: TIMELINE_CARD_GAP,
        speed: this.reduced.matches ? 0 : 400,
        threshold: TIMELINE_THRESHOLD,
        noSwipingSelector: 'button',
      });
      // Swiper's activeIndex sticks at the end (the last cards share one stop), so the component owns the index and
      // a swipe moves one card, as the UGC slider.
      this.swiper.on('touchEnd', (swiper) => {
        const diff = swiper.touches.diff;
        if (Math.abs(diff) >= 10) setTimeout(() => this.goTo(this.card + (diff < 0 ? 1 : -1)));
      });
      this.listen(window, 'resize', () => {
        this.setEdge();
        this.swiper?.update();
      });
      const next = this.$('[data-timeline-next]');
      if (next) this.listen(next, 'click', () => this.goTo(this.card + 1));
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.swiper?.destroy(true, true);
    this.swiper = null;
  }

  // Mobile: show card `index` (clamped); the Next button fades out once past the first card.
  goTo(index) {
    this.card = Math.max(0, Math.min(this.slides.length - 1, index));
    this.toggleAttribute('data-past-first', this.card > 0);
    this.swiper?.slideTo(this.card);
  }

  // The first card starts on the page margin (the heading's left padding) and the last stops on it: padding on the
  // Swiper track, as the UGC slider.
  setEdge() {
    const heading = this.$('[data-timeline-heading]');
    const edge = heading ? parseFloat(getComputedStyle(heading).paddingLeft) || 0 : 0;
    this.track.style.paddingInline = `${edge}px`;
  }

  // Free space for the frame, in viewport pixels. Sideways: right of the widest row text (year and event, measured as
  // glyphs) plus a gutter, and inside the list's right edge. Up and down: the centre follows the cursor between the
  // list's top and bottom, but the whole frame stays inside the section (so it never reaches the next section's text)
  // and below any label or heading line it would reach sideways. When there is no room under the heading, the frame
  // moves right of the heading instead. Measured on entry.
  measure() {
    const list = this.list.getBoundingClientRect();
    const host = this.getBoundingClientRect();
    const w = this.frame.offsetWidth;
    const h = this.frame.offsetHeight;
    const gap = parseFloat(getComputedStyle(this).getPropertyValue('--gutter')) || 12;
    const textRect = (el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return range.getBoundingClientRect();
    };
    const rowRight = Math.max(list.left, ...Array.from(this.$$('[data-timeline-row] > span'), (el) => textRect(el).right));
    const minLeft = rowRight + gap;
    const maxLeft = Math.max(minLeft, list.right - w);
    const heading = Array.from(this.$$('[data-timeline-heading] > *'), textRect);
    this.bounds = { list, host, w, h, gap, minLeft, maxLeft, heading };
  }

  // the lowest heading line the frame reaches sideways when its left edge is at `left`
  headingBottom(left) {
    const { heading, gap } = this.bounds;
    return Math.max(-Infinity, ...heading.filter((r) => r.right + gap > left).map((r) => r.bottom + gap));
  }

  // Centre the frame on a viewport point, held in the free space. Positions are relative to the section (its parent).
  moveFrame(clientX, clientY, jump = false) {
    if (!this.xTo) return;
    if (jump || !this.bounds) this.measure();
    const { list, host, w, h, minLeft, maxLeft, heading, gap } = this.bounds;
    // After Sunset Row: the frame rests in the middle of the free space and only drifts sideways with the cursor, up to
    // a quarter of its width at the viewport edges; up and down its centre sits on the cursor.
    const drift = (clientX / window.innerWidth - 0.5) * 0.5 * w;
    let left = Math.min(Math.max((minLeft + maxLeft) / 2 + drift, minLeft), maxLeft);
    // no room under the heading at this spot: go right of the heading lines that are in the way
    if (this.headingBottom(left) + h > host.bottom) {
      const clear = Math.max(...heading.filter((r) => r.bottom + gap + h > host.bottom).map((r) => r.right + gap));
      left = Math.min(Math.max(left, clear), maxLeft);
    }
    const minTop = Math.max(host.top, this.headingBottom(left));
    const maxTop = Math.max(minTop, host.bottom - h);
    const top = Math.min(Math.max(Math.min(Math.max(clientY, list.top), list.bottom) - h / 2, minTop), maxTop);
    const x = left + w / 2 - host.left;
    const y = top + h / 2 - host.top;
    // quickTo(value, start): a jump restarts from the new spot (gsap.set alone is undone by a running quickTo)
    this.xTo(x, jump ? x : undefined);
    this.yTo(y, jump ? y : undefined);
  }

  setActive(index) {
    this.rows.forEach((row, i) => row.setAttribute('aria-pressed', String(i === index)));
    if (!this.strip || !window.gsap) return;
    // each photo is one frame tall: photo n fills the frame at -n / count of the strip's height
    const yPercent = (-index * 100) / this.rows.length;
    if (this.entering || this.reduced.matches) {
      gsap.killTweensOf(this.strip);
      gsap.set(this.strip, { yPercent, filter: 'blur(0px)' });
      this.entering = false;
      return;
    }
    gsap.to(this.strip, { yPercent, ...TIMELINE_STRIP, overwrite: true });
    gsap
      .timeline()
      .to(this.strip, { filter: `blur(${TIMELINE_BLUR})`, duration: TIMELINE_STRIP.duration * 0.3, ease: 'power2.out' })
      .to(this.strip, { filter: 'blur(0px)', duration: TIMELINE_STRIP.duration * 0.7, ease: 'power2.out' });
  }
}

if (!customElements.get('timeline-section')) customElements.define('timeline-section', TimelineSection);
