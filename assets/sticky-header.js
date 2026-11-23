// Header scroll behaviour (Hendrik, 18 Nov): the header scrolls away when the page scrolls down and comes back
// as soon as it scrolls up. The section wrapper is sticky (schema class); this only sets two attributes on
// [data-header]:
//   data-hidden    scrolling down, past the header: the header slides up out of view.
//   data-scrolled  off the top of the page: the bar fades in its glass background and bottom line.
// On the home page the logo intro sets <html data-intro="waiting|played|done">: the background (and, in CSS, the dark
// text) only comes in once the intro is done. Hiding waits longer (Hendrik, 23 Nov): once the logo has shrunk, the
// scroll that played the intro is still running, and hiding on it made the header jump up right after the animation.
// So after "done" the header stays until the scroll has been still for SETTLE ms; only a new scroll down hides it.
// hero-intro:change asks for a fresh look. It never hides while a menu or drawer locks the scroll.
class StickyHeader extends BaseComponent {
    static TOLERANCE = 6;
    static SETTLE = 200;

    constructor() {
        super();
        this.frame = null;
        this.lastY = 0;
        this.settling = false;
        this.settleTimer = null;
        this.onScroll = this.onScroll.bind(this);
        this.onIntroChange = this.onIntroChange.bind(this);
    }

    init() {
        this.header = this.$('[data-header]');
        if (!this.header) return;
        this.lastY = window.scrollY;
        this.listen(window, 'scroll', this.onScroll, { passive: true });
        this.listen(window, 'hero-intro:change', this.onIntroChange);
        this.update();
    }

    disconnectedCallback() {
        if (this.frame) cancelAnimationFrame(this.frame);
        this.frame = null;
        clearTimeout(this.settleTimer);
        super.disconnectedCallback();
    }

    onIntroChange(event) {
        this.settling = event.detail?.state === 'done';
        if (this.settling) this.waitForStill();
        else clearTimeout(this.settleTimer);
        this.onScroll();
    }

    // Each scroll while settling restarts the wait; when the page has been still for SETTLE ms, hiding is allowed
    // again, measured from where the page stopped.
    waitForStill() {
        clearTimeout(this.settleTimer);
        this.settleTimer = setTimeout(() => {
            this.settling = false;
            this.lastY = Math.max(window.scrollY, 0);
        }, StickyHeader.SETTLE);
    }

    onScroll() {
        if (this.settling) this.waitForStill();
        if (this.frame) return;
        this.frame = requestAnimationFrame(() => {
            this.frame = null;
            this.update();
        });
    }

    update() {
        const y = Math.max(window.scrollY, 0);
        const delta = y - this.lastY;
        const intro = document.documentElement.dataset.intro;
        const introRunning = intro === 'waiting' || intro === 'played';
        const scrollLocked = document.querySelector('[data-scroll-lock="true"]');

        this.header.toggleAttribute('data-scrolled', y > 0 && !introRunning);

        if (y <= this.header.offsetHeight || introRunning || this.settling || scrollLocked) {
            this.header.removeAttribute('data-hidden');
        } else if (delta > StickyHeader.TOLERANCE) {
            this.header.setAttribute('data-hidden', '');
        } else if (delta < -StickyHeader.TOLERANCE) {
            this.header.removeAttribute('data-hidden');
        }

        if (this.settling) return;
        if (Math.abs(delta) > StickyHeader.TOLERANCE || y <= 0) this.lastY = y;
    }
}

if (!customElements.get('sticky-header')) {
    customElements.define('sticky-header', StickyHeader);
}
