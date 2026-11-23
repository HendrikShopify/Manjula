/* <video-statement>: sections/video-statement.liquid (Figma Video statement).
   [data-video-statement-open]        Play video link; opens the dialog and plays the video with sound
   [data-video-statement-dialog]      native <dialog> (lightbox); Escape and the close button close it. Its data-scroll-lock
                                 is true while open, so the body stops scrolling (layout/theme.liquid), as with the drawers
   [data-video-statement-player]      wrapper of the Video atom (<video-player>, control bar) inside the dialog;
                                 paused and rewound on close
   [data-video-statement-background]  wrapper of the muted background video; paused while the dialog is open
   [data-video-statement-backdrop]    area around the video; a click on it (outside the player) closes the dialog
   [data-video-statement-close]       close button, in the video's top right corner
   The fade and scale in and out are CSS (@starting-style and transition-discrete on the dialog). */
class VideoStatement extends BaseComponent {
  init() {
    this.dialog = this.$('[data-video-statement-dialog]');
    if (!this.dialog) return;
    this.player = this.$('[data-video-statement-player] video-player');
    this.background = this.$('[data-video-statement-background] video');
    this.listen(this.$('[data-video-statement-open]'), 'click', () => this.open());
    this.listen(this.$('[data-video-statement-close]'), 'click', () => this.dialog.close());
    this.listen(this.$('[data-video-statement-backdrop]'), 'click', (evt) => {
      if (!evt.target.closest('[data-video-statement-player]')) this.dialog.close();
    });
    this.listen(this.dialog, 'close', () => this.closed());
  }

  open() {
    this.dialog.showModal();
    this.dialog.setAttribute('data-scroll-lock', 'true');
    this.background?.pause();
    if (!this.player) return;
    if (this.player.dataset.muted !== 'false') this.player.toggleSound?.();
    this.player.play?.(true);
  }

  closed() {
    this.dialog.setAttribute('data-scroll-lock', 'false');
    if (this.player) {
      this.player.pause?.();
      const video = this.player.querySelector('video');
      if (video) video.currentTime = 0;
    }
    this.background?.play().catch(() => {});
  }
}

if (!customElements.get('video-statement')) customElements.define('video-statement', VideoStatement);
