/*
  <ugc-slider> runs the UGC Slider layout (snippets/ugc.liquid, layout 'slider') on Swiper (swiper-bundle.min.js, loaded in theme.liquid).
    [data-ugc-track]      Swiper container: .swiper > .swiper-wrapper > [data-ugc-slide].swiper-slide
    [data-ugc-edge]       the heading row; its padded left edge is where the first video starts on mobile
    [data-ugc-prev|next]  pager arrows (desktop) and the one 48px Next button over the track (mobile)
    [data-ugc-sound]      mute toggle on the active video; aria-pressed="true" means sound on
    [data-ugc-progress]   progress line fill (width) of the active video
  Each slide gets data-active (true on the active one) and data-next (true on the one after it); CSS shows the
  mute button, progress line and product card from those. The host gets data-past-first after the first video,
  which hides the single mobile Next button over the track.
  Mobile: the active video sits on the page margin. From 1024px: the active video is centred and starts on the third one.
  Loop: with LOOP_MIN (8) or more videos the track loops endlessly. With fewer it does not loop: the first video stops on
  the container's left edge and the last one on its right edge (page margin), so there is never empty track at the ends.
  Only the active video plays (muted, looped). It pauses when the section leaves the screen, when another video player
  starts (video-player:play), and never autoplays with prefers-reduced-motion. Clicking another video makes it active;
  clicking the active video pauses or plays it (data-paused on the slide). Dragging only below 1024px (touch swipe);
  from 1024px the arrows and clicks move the track. A tap that moves a few pixels is still a tap: Swiper only drags
  after THRESHOLD px, never from a button, and a click is only ignored when the track really moved (sliderMove).
*/
const LOOP_MIN = 8;
const THRESHOLD = 8;

if (!customElements.get('ugc-slider')) {
  customElements.define(
    'ugc-slider',
    class UgcSlider extends BaseComponent {
      init() {
        this.track = this.$('[data-ugc-track]');
        this.slides = this.$$('[data-ugc-slide]');
        if (!this.track || !this.slides.length) return;
        this.desktop = window.matchMedia('(min-width: 1024px)');
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.inView = false;
        this.muted = true;
        this.loop = this.slides.length >= LOOP_MIN;

        this.build();
        this.listen(this.desktop, 'change', () => this.build());
        this.listen(window, 'resize', () => this.updateEdge());
        this.listen(this, 'click', (evt) => this.onClick(evt));
        this.listen(document, 'video-player:play', (evt) => {
          if (evt.detail?.player !== this) this.pauseAll();
        });
        this.userPaused = false;
        this.slides.forEach((slide) => {
          const video = slide.querySelector('video');
          if (!video) return;
          this.listen(video, 'timeupdate', () => this.updateProgress(slide, video));
          this.listen(video, 'playing', () => this.tick(slide, video));
        });

        if ('IntersectionObserver' in window) {
          this.observer = new IntersectionObserver(
            (entries) => {
              this.inView = entries[0].isIntersecting;
              this.inView ? this.playActive() : this.pauseAll();
            },
            { threshold: 0.4 }
          );
          this.observer.observe(this.track);
        } else {
          this.inView = true;
        }
      }

      disconnectedCallback() {
        super.disconnectedCallback();
        this.observer?.disconnect();
        cancelAnimationFrame(this.frame);
        this.swiper?.destroy(true, true);
        this.swiper = null;
      }

      build() {
        if (!window.Swiper) {
          this.sync(0);
          return;
        }
        const desktop = this.desktop.matches;
        const start = this.active ?? (desktop ? Math.min(2, this.slides.length - 1) : 0);
        this.swiper?.destroy(true, true);
        // Looping: no edges. Not looping: the track stops on the container edges on every screen size. The edge is
        // padding on the track (Swiper measures inside it; overflow still shows videos up to the screen edge), not
        // slidesOffsetBefore/After, which breaks centeredSlidesBounds.
        this.setEdge();
        this.swiper = new Swiper(this.track, {
          slidesPerView: 'auto',
          spaceBetween: 4,
          speed: 400,
          loop: this.loop,
          centeredSlides: desktop,
          centeredSlidesBounds: desktop && !this.loop,
          initialSlide: start,
          slideToClickedSlide: this.loop,
          watchSlidesProgress: true,
          allowTouchMove: !desktop,
          threshold: THRESHOLD,
          noSwipingSelector: 'button',
          // Swiper stops the click event after a drag while it animates; this component decides that itself.
          preventClicksPropagation: false,
        });
        this.swiper.on('touchStart', () => (this.dragged = false));
        this.swiper.on('sliderMove', () => (this.dragged = true));
        if (this.loop) {
          this.swiper.on('slideChange', () => this.sync(this.swiper.realIndex));
          this.sync(this.swiper.realIndex);
        } else {
          // With bounds, Swiper's activeIndex sticks (several videos share one stop at each end), so the component
          // owns the active index here: arrows, clicks and swipes move it one video at a time (goTo).
          this.swiper.on('touchEnd', (swiper) => this.onSwipe(swiper.touches.diff));
          this.goTo(start, 0);
        }
      }

      goTo(index, speed) {
        const target = Math.max(0, Math.min(this.slides.length - 1, index));
        if (target !== this.active) this.sync(target);
        this.swiper?.slideTo(target, speed);
      }

      onSwipe(diff) {
        if (Math.abs(diff) < 10) return;
        // Runs after Swiper's own snap so this move wins.
        setTimeout(() => this.goTo(this.active + (diff < 0 ? 1 : -1)));
      }

      updateEdge() {
        if (!this.swiper || this.loop) return;
        this.setEdge();
        this.swiper.update();
      }

      setEdge() {
        this.track.style.paddingInline = this.loop ? '' : `${this.edge()}px`;
      }

      edge() {
        const row = this.$('[data-ugc-edge]');
        if (!row) return 0;
        return row.getBoundingClientRect().left + (parseFloat(getComputedStyle(row).paddingLeft) || 0);
      }

      onClick(evt) {
        const step = evt.target.closest('[data-ugc-prev]') ? -1 : evt.target.closest('[data-ugc-next]') ? 1 : 0;
        if (step) {
          if (this.loop) return step < 0 ? this.swiper?.slidePrev() : this.swiper?.slideNext();
          return this.goTo(this.active + step);
        }
        const sound = evt.target.closest('[data-ugc-sound]');
        if (sound) return this.toggleSound();
        const slide = evt.target.closest('[data-ugc-slide]');
        if (!slide || evt.target.closest('a, button')) return;
        // The end of a drag is not a click.
        if (this.dragged) return;
        const index = Array.from(this.slides).indexOf(slide);
        if (index === this.active) return this.togglePlay();
        if (!this.loop) this.goTo(index);
      }

      togglePlay() {
        const video = this.activeVideo();
        if (!video) return;
        this.userPaused = !video.paused;
        if (this.userPaused) this.pauseAll();
        else this.playActive();
      }

      sync(index) {
        this.active = index;
        this.userPaused = false;
        const count = this.slides.length;
        const next = this.loop ? (index + 1) % count : index + 1;
        this.slides.forEach((slide, i) => {
          slide.dataset.active = String(i === index);
          delete slide.dataset.paused;
          slide.dataset.next = String(i === next);
        });
        // The mobile Next button over the track only shows on the first video.
        this.toggleAttribute('data-past-first', index > 0);
        const prev = this.$('[data-ugc-prev]');
        if (prev) prev.disabled = !this.loop && index === 0;
        this.$$('.pager-arrows [data-ugc-next]').forEach((btn) => (btn.disabled = !this.loop && index >= count - 1));
        this.pauseAll();
        this.playActive();
      }

      activeVideo() {
        return this.slides[this.active]?.querySelector('video') ?? null;
      }

      playActive() {
        const video = this.activeVideo();
        if (!video || !this.inView || this.reducedMotion || this.userPaused) return;
        delete this.slides[this.active].dataset.paused;
        video.muted = this.muted;
        this.emit('video-player:play', { player: this });
        const started = video.play();
        if (started) started.catch(() => {});
      }

      pauseAll() {
        this.slides.forEach((slide) => {
          const video = slide.querySelector('video');
          if (video && !video.paused) video.pause();
        });
        if (this.userPaused && this.slides[this.active]) this.slides[this.active].dataset.paused = '';
      }

      toggleSound() {
        this.muted = !this.muted;
        const video = this.activeVideo();
        if (video) video.muted = this.muted;
        this.$$('[data-ugc-sound]').forEach((btn) => {
          btn.setAttribute('aria-pressed', String(!this.muted));
          btn.setAttribute('aria-label', this.muted ? btn.dataset.labelUnmute : btn.dataset.labelMute);
        });
        if (!this.muted && video?.paused) {
          this.userPaused = false;
          this.playActive();
        }
      }

      // timeupdate fires about 4 times a second, which makes the line jump; follow currentTime every frame while playing.
      tick(slide, video) {
        cancelAnimationFrame(this.frame);
        this.updateProgress(slide, video);
        if (!video.paused) this.frame = requestAnimationFrame(() => this.tick(slide, video));
      }

      updateProgress(slide, video) {
        const fill = slide.querySelector('[data-ugc-progress]');
        if (!fill || !video.duration) return;
        const value = Math.min(1, video.currentTime / video.duration);
        fill.style.width = `${value * 100}%`;
        fill.parentElement.setAttribute('aria-valuenow', String(Math.round(value * 100)));
      }
    }
  );
}
