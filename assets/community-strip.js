/* <community-strip>: PDP community videos (snippets/community-strip.liquid, Figma Community strip).
   [data-community-track]  Swiper container; slides are 140px on mobile (scroll to the screen edge), 4 per view from lg
   [data-community-prev|next]  Pager arrows (lg only)
   [data-carousel-to]      dots; extra dots beyond the snap positions are hidden
   [data-community-play]   UGC tile buttons; a tap plays or pauses their [data-ugc-video] in place, one video at a time */
class CommunityStrip extends BaseComponent {
  init() {
    this.track = this.$('[data-community-track]');
    this.dots = this.$$('[data-carousel-to]');
    this.prev = this.$('[data-community-prev]');
    this.next = this.$('[data-community-next]');

    if (this.track && window.Swiper && !this.swiper) {
      this.swiper = new Swiper(this.track, {
        slidesPerView: 'auto',
        spaceBetween: 4,
        speed: 400,
        watchOverflow: true,
        breakpoints: { 1024: { slidesPerGroup: 4 } },
        on: {
          init: () => this.update(),
          slideChange: () => this.update(),
          resize: () => this.update(),
        },
      });
    }

    this.listen(this, 'click', (evt) => {
      const tile = evt.target.closest('[data-community-play]');
      if (tile) return this.play(tile);
      const dot = evt.target.closest('[data-carousel-to]');
      if (dot && this.swiper) return this.swiper.slideTo(this.swiper.snapGrid.length > 1 ? this.snapIndexToSlide(Number(dot.dataset.carouselTo) - 1) : 0);
      if (evt.target.closest('[data-community-prev]')) return this.swiper?.slidePrev();
      if (evt.target.closest('[data-community-next]')) return this.swiper?.slideNext();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.swiper?.destroy(true, true);
    this.swiper = null;
  }

  snapIndexToSlide(snap) {
    const offset = this.swiper.snapGrid[snap] ?? 0;
    const index = this.swiper.slidesGrid.findIndex((value) => value >= offset - 1);
    return Math.max(0, index);
  }

  update() {
    const swiper = this.swiper;
    if (!swiper) return;
    const snaps = swiper.snapGrid.length;
    this.dots.forEach((dot, i) => {
      dot.hidden = i >= snaps || snaps < 2;
      dot.setAttribute('aria-selected', String(i === swiper.snapIndex));
    });
    if (this.prev) this.prev.disabled = swiper.isBeginning;
    if (this.next) this.next.disabled = swiper.isEnd;
  }

  play(tile) {
    const video = tile.querySelector('[data-ugc-video]');
    if (!video) return;
    const playing = tile.getAttribute('aria-pressed') === 'true';
    this.$$('[data-community-play][aria-pressed="true"]').forEach((other) => {
      other.setAttribute('aria-pressed', 'false');
      other.querySelector('[data-ugc-video]')?.pause();
    });
    if (playing) return;
    tile.setAttribute('aria-pressed', 'true');
    video.play().catch(() => tile.setAttribute('aria-pressed', 'false'));
  }
}

if (!customElements.get('community-strip')) customElements.define('community-strip', CommunityStrip);
