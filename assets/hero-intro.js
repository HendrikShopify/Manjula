/**
 * Home intro (Figma: Home / Desktop / Page load), triggered by scroll (Hendrik, 18 Nov).
 * Start: the big wordmark sits at the top of the hero and the header bar waits under it with its logo hidden
 * (both set by the `intro` class on <html>, added in theme.liquid before first paint).
 * Once the page scrolls past TRIGGER px the intro plays in full (0.7s; faster on Hendrik's feedback, 21 Nov): the wordmark shrinks into the header logo
 * while the bar slides up to the top. Back above TRIGGER it plays in reverse. The wordmark lives in the sticky header
 * (sections/header.liquid), so it stays in view and sits above the bar without any fixed positioning.
 * The bar's start offset is the wordmark's real bottom edge, measured, and everything is measured again when the
 * window resizes, so the bar always waits right under the wordmark. Below lg the intro steps aside (normal header).
 * <html data-intro="waiting|played|done"> tells sticky-header.js what the header may do: the text turns dark as
 * soon as the intro plays, the solid background and hiding on scroll down wait until it is done. A
 * `hero-intro:change` event on window asks it to look again.
 * No `intro` class (other pages, mobile, reduced motion, theme editor) means this does nothing.
 * Hooks: [data-header-bar], [data-header-logo] in sections/header.liquid.
 */
class HeroIntro extends BaseComponent {
    static TRIGGER = 80;

    constructor() {
        super();
        this.frame = null;
        this.onResize = this.onResize.bind(this);
    }

    init() {
        const root = document.documentElement;
        if (!root.classList.contains('intro')) return;
        clearTimeout(window.__introTimer);

        this.bar = document.querySelector('[data-header-bar]');
        this.logo = document.querySelector('[data-header-logo]');
        this.target = this.logo?.querySelector('svg') || this.logo;
        this.mark = this.querySelector('svg') || this;

        if (!this.bar || !this.target || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            root.classList.remove('intro');
            return;
        }
        gsap.registerPlugin(ScrollTrigger);
        this.desktop = window.matchMedia('(min-width: 1024px)');

        // Hand the start state from CSS to GSAP: build() measures the natural layout and sets the bar offset itself.
        // Same frame, so removing the class does not make anything jump.
        gsap.set(this.logo, { opacity: 0 });
        gsap.set(this, { display: 'block' });
        root.classList.remove('intro');
        this.build();

        this.trigger = ScrollTrigger.create({
            start: HeroIntro.TRIGGER,
            onEnter: () => {
                if (!this.timeline) return;
                this.setState('played');
                this.timeline.play();
            },
            onLeaveBack: () => {
                if (!this.timeline) return;
                this.setState('waiting');
                this.swapLogo(false);
                this.timeline.reverse();
            },
        });

        this.listen(window, 'resize', this.onResize);
    }

    onResize() {
        if (this.frame) return;
        this.frame = requestAnimationFrame(() => {
            this.frame = null;
            this.build();
        });
    }

    // Measure the natural positions (no transforms) and build the timeline for the current width.
    build() {
        this.timeline?.kill();
        this.timeline = null;
        gsap.set([this.mark, this.bar], { clearProps: 'transform' });

        if (!this.desktop.matches) {
            gsap.set(this, { display: 'none' });
            this.swapLogo(true);
            this.setState('done');
            return;
        }

        gsap.set(this, { display: 'block' });
        const from = this.mark.getBoundingClientRect();
        const to = this.target.getBoundingClientRect();
        const offset = from.bottom - this.bar.getBoundingClientRect().top;

        this.timeline = gsap.timeline({
            paused: true,
            defaults: { duration: 0.7, ease: 'smooth' },
            onComplete: () => {
                this.swapLogo(true);
                this.setState('done');
            },
        });
        // The svg moves, not the element: the element carries the container padding, the svg is the wordmark itself.
        this.timeline
            .fromTo(this.mark, { x: 0, y: 0, scale: 1 }, {
                x: to.left - from.left,
                y: to.top - from.top,
                scale: to.width / from.width,
                transformOrigin: '0 0',
            }, 0)
            .fromTo(this.bar, { y: offset }, { y: 0 }, 0);

        if (window.scrollY > HeroIntro.TRIGGER) {
            this.timeline.progress(1);
            this.swapLogo(true);
            this.setState('done');
        } else {
            this.timeline.progress(0);
            this.swapLogo(false);
            this.setState('waiting');
        }
    }

    // At the end the header logo takes over from the wordmark; going back hands it to the wordmark again.
    swapLogo(done) {
        gsap.set(this.logo, { opacity: done ? 1 : 0 });
        gsap.set(this, { visibility: done ? 'hidden' : 'visible' });
    }

    setState(state) {
        if (document.documentElement.dataset.intro === state) return;
        document.documentElement.dataset.intro = state;
        window.dispatchEvent(new CustomEvent('hero-intro:change', { detail: { state } }));
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.frame) cancelAnimationFrame(this.frame);
        this.trigger?.kill();
        this.timeline?.kill();
        delete document.documentElement.dataset.intro;
    }
}

customElements.define('hero-intro', HeroIntro);
