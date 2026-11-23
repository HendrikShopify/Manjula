/* <before-after-slider>: snippets/before-after-slider.liquid (Figma Before after slider).
   [data-before-after-range]  native range input over the frame; its value (0-100) becomes --position on the host */
class BeforeAfterSlider extends BaseComponent {
  init() {
    this.range = this.$('[data-before-after-range]');
    if (!this.range) return;
    this.update();
    this.listen(this.range, 'input', () => this.update());
  }

  update() {
    this.style.setProperty('--position', `${this.range.value}%`);
  }
}

if (!customElements.get('before-after-slider')) customElements.define('before-after-slider', BeforeAfterSlider);
