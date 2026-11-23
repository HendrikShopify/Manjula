/* <use-guide>: sections/use-guide.liquid (Figma Use guide).
   [data-use-guide-track]     photo row; from lg a grid whose columns this script sets: the active photo 4fr, the others 1fr
                              (like the Blanc product page reference). Below lg the row is a Swiper track (like the UGC slider): the
                              container is [data-use-guide-swiper], the row the wrapper, the photos the slides. Swiper runs
                              only below lg with its own class names, so its global .swiper-wrapper CSS never touches the
                              desktop grid; it is destroyed from lg. The component owns the index: a swipe moves one step.
   [data-use-guide-thumb]     step photos; the active one carries aria-current="true" (full opacity)
   [data-use-guide-panel]     step text; all panels share one grid cell (no layout shift), only the active one is visible
                              and carries [data-active] (no text animation); the others are aria-hidden
   [data-use-guide-prev|next] pager arrows (desktop) and the glass Next button (mobile, data-use-guide-next="wrap"), on the
                              right page margin; the host gets data-past-first after the first step and the button fades out
   [data-use-guide-progress]  progress bar. While the guide plays it shows how long the current step is still shown: its
                              [data-progress-fill] runs from 0 to 100% over the step (5 seconds, or the step's video). When
                              it does not play (reduced motion, one step) it shows the step position. aria-valuenow is always
                              the step position.
   [data-use-guide-video]     optional muted video over a step photo; only the active step's video plays (from the start),
                              while the guide is on screen, and it gets [data-playing] once it runs (fades in over the photo)
   Moves on to the next step every 5 seconds while the guide is on screen (not with reduced motion); a step with a video
   moves on when its video ends instead. Any click on a photo or an arrow restarts the timer. When the browser blocks
   playback (Low Power Mode), the photos stay and the 5 second timer takes over. */
const USE_GUIDE_INTERVAL = 5000;
const USE_GUIDE_DESKTOP = '(min-width: 1024px)';

class UseGuide extends BaseComponent {
  init() {
    this.track = this.$('[data-use-guide-track]');
    this.thumbs = Array.from(this.$$('[data-use-guide-thumb]'));
    this.panels = Array.from(this.$$('[data-use-guide-panel]'));
    this.progress = this.$('[data-use-guide-progress]');
    this.fill = this.progress?.querySelector('[data-progress-fill]');
    this.count = this.thumbs.length;
    this.index = 0;
    this.visible = false;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.videos = this.thumbs.map((thumb) => thumb.querySelector('[data-use-guide-video]'));
    this.videos.forEach((video, i) => {
      if (!video) return;
      this.listen(video, 'playing', () => video.toggleAttribute('data-playing', true));
      this.listen(video, 'ended', () => {
        if (i === this.index) this.advance();
      });
    });

    this.listen(this, 'click', (evt) => {
      const thumb = evt.target.closest('[data-use-guide-thumb]');
      const prev = evt.target.closest('[data-use-guide-prev]');
      const next = evt.target.closest('[data-use-guide-next]');
      if (thumb) this.go(Number(thumb.dataset.useGuideThumb));
      else if (prev) this.go(this.index - 1);
      else if (next) this.go(this.index + 1 >= this.count && next.dataset.useGuideNext === 'wrap' ? 0 : this.index + 1);
      else return;
      this.restart();
    });

    this.paint();

    this.swiperHost = this.$('[data-use-guide-swiper]');
    this.desktop = window.matchMedia(USE_GUIDE_DESKTOP);
    this.listen(this.desktop, 'change', () => this.buildSwiper());
    this.buildSwiper();

    this.observer = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      this.syncVideos();
      this.restart();
    });
    this.observer.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.observer?.disconnect();
    clearInterval(this.timer);
    cancelAnimationFrame(this.frame);
    this.swiper?.destroy(true, true);
    this.swiper = null;
  }

  // Applies the current step without the column transition: the first paint (as in the reference) and after Swiper is
  // removed.
  paint() {
    if (this.track) this.track.style.transition = 'none';
    this.update();
    if (this.track) {
      this.track.offsetHeight;
      this.track.style.transition = '';
    }
  }

  // Mobile only. Own class names (not .swiper / .swiper-wrapper / .swiper-slide), so Swiper's CSS stays off the
  // desktop grid; destroy(true, true) removes its inline styles when the screen grows to lg. That also wipes the
  // track's grid columns, so they are painted again right after.
  buildSwiper() {
    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiper = null;
      this.paint();
    }
    if (this.desktop.matches || !window.Swiper || !this.swiperHost || !this.track || this.count < 2) return;
    this.swiper = new Swiper(this.swiperHost, {
      wrapperClass: 'use-guide__track',
      slideClass: 'use-guide__slide',
      slidesPerView: 'auto',
      spaceBetween: 4,
      speed: 500,
      initialSlide: this.index,
      threshold: 5,
      watchSlidesProgress: true,
      // the track needs no extra CSS from Swiper: it is already a flex row with shrink-0 photos
    });
    // Swiper's activeIndex sticks at the end stops, so the component owns the index: a swipe moves one step.
    this.swiper.on('touchEnd', (swiper) => {
      const diff = swiper.touches.diff;
      if (Math.abs(diff) < 10) return;
      setTimeout(() => {
        this.go(this.index + (diff < 0 ? 1 : -1));
        this.restart();
      });
    });
  }

  // True while the guide moves on by itself
  get playing() {
    return this.visible && !this.reduced.matches && this.count > 1;
  }

  // A playing step video moves the guide on when it ends; otherwise a 5 second timer does. The progress bar runs
  // from the start of the step.
  restart() {
    clearInterval(this.timer);
    cancelAnimationFrame(this.frame);
    if (!this.playing) {
      this.setFill(this.stepValue(), true);
      return;
    }
    this.stepStart = performance.now();
    if (!this.videos[this.index] || this.videoBlocked) this.timer = setInterval(() => this.advance(), USE_GUIDE_INTERVAL);
    this.tick();
  }

  // Step time to the progress bar, every frame: the video's position, else the time since the step started.
  tick() {
    if (!this.playing) return;
    const video = this.videos[this.index];
    const ratio = video && !this.videoBlocked
      ? (video.duration ? video.currentTime / video.duration : 0)
      : (performance.now() - this.stepStart) / USE_GUIDE_INTERVAL;
    this.setFill(Math.min(1, ratio) * 100, false);
    this.frame = requestAnimationFrame(() => this.tick());
  }

  stepValue() {
    return Math.round(((this.index + 1) / this.count) * 100);
  }

  // The fill eases between step positions, but follows the step time without a transition.
  setFill(value, ease) {
    if (!this.fill) return;
    this.fill.style.transition = ease ? '' : 'none';
    this.fill.style.width = `${value}%`;
  }

  advance() {
    this.index = (this.index + 1) % this.count;
    this.update();
    this.restart();
  }

  // Plays the active step's video from the start while the guide is on screen; stops and rewinds the others, so
  // their photo shows again.
  syncVideos() {
    this.videos.forEach((video, i) => {
      if (!video) return;
      const active = i === this.index;
      if (active && this.visible && !this.reduced.matches && !this.videoBlocked) {
        if (!video.paused) return;
        video.preload = 'auto';
        video.play()?.catch((error) => {
          // Low Power Mode or autoplay off: keep the photos and fall back to the timer
          if (error.name !== 'NotAllowedError') return;
          this.videoBlocked = true;
          this.restart();
        });
        return;
      }
      if (!video.paused) video.pause();
      if (!active) {
        video.removeAttribute('data-playing');
        if (video.currentTime) video.currentTime = 0;
      }
    });
  }

  go(index) {
    this.index = Math.max(0, Math.min(this.count - 1, index));
    this.update();
  }

  update() {
    const { index, count } = this;
    this.toggleAttribute('data-past-first', index > 0);
    this.swiper?.slideTo(index);
    this.syncVideos();
    if (this.track) this.track.style.gridTemplateColumns = this.thumbs.map((_, i) => (i === index ? '4fr' : '1fr')).join(' ');
    this.thumbs.forEach((thumb, i) => thumb.setAttribute('aria-current', String(i === index)));
    this.panels.forEach((panel, i) => {
      panel.toggleAttribute('data-active', i === index);
      panel.setAttribute('aria-hidden', String(i !== index));
    });
    this.progress?.setAttribute('aria-valuenow', this.stepValue());
    if (!this.playing) this.setFill(this.stepValue(), true);
    this.$$('[data-use-guide-prev]').forEach((btn) => (btn.disabled = index === 0));
    this.$$('[data-use-guide-next]:not([data-use-guide-next="wrap"])').forEach((btn) => (btn.disabled = index === count - 1));
  }
}

if (!customElements.get('use-guide')) customElements.define('use-guide', UseGuide);
