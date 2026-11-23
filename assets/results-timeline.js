/* <results-timeline>: sections/results-timeline.liquid (Figma Results timeline).
   [data-results-timeline-track]  the step list; scrolls sideways below lg
   [data-results-timeline-next]   mobile glass button: one step forward, back to the start at the end */
class ResultsTimeline extends BaseComponent {
  init() {
    this.track = this.$('[data-results-timeline-track]');
    const next = this.$('[data-results-timeline-next]');
    if (!this.track || !next) return;
    this.listen(next, 'click', () => {
      const step = this.track.firstElementChild?.getBoundingClientRect().width || 0;
      const end = this.track.scrollLeft + this.track.clientWidth >= this.track.scrollWidth - 1;
      this.track.scrollTo({ left: end ? 0 : this.track.scrollLeft + step, behavior: 'smooth' });
    });
  }
}

if (!customElements.get('results-timeline')) customElements.define('results-timeline', ResultsTimeline);
