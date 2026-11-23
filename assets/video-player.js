/*
  <video-player> wraps the Video snippet (snippets/video.liquid).
    [data-video-play]     start playing (tap mode: Paused shows it in the centre)
    [data-video-pause]    tap mode: full-size button over the video while playing, a tap pauses
    [data-video-toggle]   bar mode: play/pause button (one button, the icon swaps; aria-label follows the state)
    [data-video-sound]    toggles muted; data-muted on the element drives which icon shows
    [data-video-progress] the progress bar inside follows currentTime
    [data-video-seek]     bar mode: range input over the progress bar, click or drag (or arrow keys) to jump
    [data-video-surface]  bar mode: area over the video. A click toggles play/pause; on touch the first tap
                          only shows the controls ([data-controls-visible], cleared after 3s)
  data-state is paused or playing, data-muted is true or false. data-autoplay plays muted when the player
  scrolls into view, until the visitor pauses it. Only one player plays at a time, and a player pauses when it
  leaves the viewport.
  Without a <video> (the placeholder) the buttons still switch the states, so the design can be judged.
*/
if (!customElements.get('video-player')) {
  customElements.define(
    'video-player',
    class VideoPlayer extends BaseComponent {
      init() {
        this.video = this.$('video');
        this.bar = this.$('[data-video-progress] [role="progressbar"]') || this.$('[data-video-progress] .progress-bar');
        this.fill = this.$('[data-video-progress] [data-progress-fill]');
        this.seek = this.$('[data-video-seek]');
        this.autoplay = this.hasAttribute('data-autoplay');
        this.userPaused = false;
        this.touch = window.matchMedia('(hover: none)');
        if (this.fill) this.fill.style.transition = 'none';
        // The control bar can seek before the first play, which needs the duration.
        if (this.video && this.seek) this.video.preload = 'metadata';

        this.listen(this, 'click', (evt) => {
          if (evt.target.closest('[data-video-play]')) return this.play(true);
          if (evt.target.closest('[data-video-pause]')) return this.pause(true);
          if (evt.target.closest('[data-video-toggle]')) {
            this.showControls();
            this.togglePlay();
            return this.keepFocus('[data-video-toggle]');
          }
          if (evt.target.closest('[data-video-sound]')) {
            this.showControls();
            this.toggleSound();
            return this.keepFocus('[data-video-sound]');
          }
          if (evt.target.closest('[data-video-surface]')) {
            if (this.touch.matches && !this.hasAttribute('data-controls-visible')) return this.showControls();
            this.showControls();
            return this.togglePlay();
          }
        });
        if (this.seek) {
          this.listen(this.seek, 'input', () => {
            this.showControls();
            if (!this.video || !this.video.duration) return;
            this.video.currentTime = (this.seek.value / 1000) * this.video.duration;
            this.updateProgress();
          });
        }
        this.listen(document, 'video-player:play', (evt) => {
          if (evt.detail.player !== this) this.pause();
        });
        if (this.video) {
          this.listen(this.video, 'timeupdate', () => this.updateProgress());
          this.listen(this.video, 'loadedmetadata', () => this.updateProgress());
          this.listen(this.video, 'playing', () => this.tick());
          this.listen(this.video, 'ended', () => this.pause());
        }
        if ('IntersectionObserver' in window) {
          this.observer?.disconnect();
          this.observer = new IntersectionObserver(
            (entries) => {
              const visible = entries[0].isIntersecting;
              if (!visible && this.dataset.state === 'playing') this.pause();
              if (visible && this.autoplay && !this.userPaused && this.dataset.state !== 'playing') this.play();
            },
            { threshold: 0.25 }
          );
          this.observer.observe(this);
        }
      }

      disconnectedCallback() {
        super.disconnectedCallback();
        this.observer?.disconnect();
        cancelAnimationFrame(this.frame);
        clearTimeout(this.hideTimer);
      }

      play(byUser = false) {
        if (byUser) this.userPaused = false;
        this.dataset.state = 'playing';
        this.syncLabels();
        this.emit('video-player:play', { player: this });
        if (this.video) {
          const started = this.video.play();
          if (started)
            started.catch(() => {
              this.dataset.state = 'paused';
              this.syncLabels();
            });
        }
      }

      pause(byUser = false) {
        if (byUser) this.userPaused = true;
        this.dataset.state = 'paused';
        this.syncLabels();
        if (this.video) this.video.pause();
      }

      // Bar mode has one play/pause and one sound button whose icon swaps; keep their names in step with the state.
      syncLabels() {
        const playing = this.dataset.state === 'playing';
        this.$$('[data-video-toggle]').forEach((btn) => {
          btn.setAttribute('aria-label', playing ? btn.dataset.labelPause : btn.dataset.labelPlay);
        });
        const soundOn = this.dataset.muted === 'false';
        this.$$('[data-video-sound][data-label-mute]').forEach((btn) => {
          btn.setAttribute('aria-pressed', String(soundOn));
          btn.setAttribute('aria-label', soundOn ? btn.dataset.labelMute : btn.dataset.labelUnmute);
        });
      }

      togglePlay() {
        if (this.dataset.state === 'playing') this.pause(true);
        else this.play(true);
      }

      toggleSound() {
        const muted = this.dataset.muted !== 'true';
        this.dataset.muted = String(muted);
        if (this.video) this.video.muted = muted;
        this.syncLabels();
      }

      // Touch has no hover: a tap shows the controls for 3 seconds (paused keeps them up through CSS).
      showControls() {
        if (!this.touch.matches) return;
        this.setAttribute('data-controls-visible', '');
        clearTimeout(this.hideTimer);
        this.hideTimer = setTimeout(() => this.removeAttribute('data-controls-visible'), 3000);
      }

      // Play/pause and mute/unmute are two buttons each, one hidden. Move focus to the visible one so keyboard
      // users stay on the control they used.
      keepFocus(selector) {
        if (!this.contains(document.activeElement)) return;
        requestAnimationFrame(() => {
          const visible = [...this.$$(selector)].find((button) => button.offsetParent !== null);
          visible?.focus();
        });
      }

      // timeupdate only fires about 4 times a second, which makes the bar jump; follow currentTime every frame while playing.
      tick() {
        cancelAnimationFrame(this.frame);
        this.updateProgress();
        if (this.dataset.state === 'playing' && !this.video.paused) this.frame = requestAnimationFrame(() => this.tick());
      }

      updateProgress() {
        if (!this.video || !this.video.duration) return;
        const ratio = Math.min(1, this.video.currentTime / this.video.duration);
        if (this.fill) this.fill.style.width = `${ratio * 100}%`;
        this.bar?.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
        if (this.seek) {
          this.seek.value = String(Math.round(ratio * 1000));
          this.seek.setAttribute('aria-valuetext', `${this.formatTime(this.video.currentTime)} / ${this.formatTime(this.video.duration)}`);
        }
      }

      formatTime(seconds) {
        const s = Math.floor(seconds);
        return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
      }
    }
  );
}
