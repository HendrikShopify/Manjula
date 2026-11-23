/**
 * Press tabs: custom-tabs with auto-rotation, stacked panels and a centred active logo.
 *
 * Same markup and events as <custom-tabs> ([data-tab-list], [data-tab], [data-tab-panel], tabs:change), plus:
 * - Panels stay in the layout (stacked in one grid cell, so the tallest quote sets the height and nothing shifts).
 *   The active panel gets [data-active]; the others get inert and aria-hidden.
 * - data-interval (ms, default 3000): time per item, always the full interval. Rotation runs while the section is in
 *   view; coming back into view gives the current quote a fresh interval. It pauses only for keyboard focus, not on
 *   hover: scrolling past with the mouse over the section paused it at random (Hendrik, 21 Nov).
 *   With prefers-reduced-motion it does not rotate.
 * - When the logo row scrolls sideways (mobile), the active logo is scrolled to the centre.
 * - The first quote animates in when the section first comes into view.
 */
class PressTabs extends CustomTabs {
    init() {
        super.init();

        this.list = this.$('[data-tab-list]');
        this.interval = Number(this.dataset.interval) || 3000;
        this.index = Math.max(0, this.tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true'));
        this.inView = false;
        this.paused = false;
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Hold the first quote back until the section is seen, so its words animate in.
        if (!this.reducedMotion) this.panels.forEach((panel) => panel.removeAttribute('data-active'));

        this.listen(this, 'focusin', (event) => {
            if (event.target.matches(':focus-visible')) this.pause();
        });
        this.listen(this, 'focusout', (event) => {
            if (!this.contains(event.relatedTarget)) this.resume();
        });
        this.listen(this.list, 'touchstart', () => this.restart(), { passive: true });

        this.observer?.disconnect();
        this.observer = new IntersectionObserver(
            ([entry]) => {
                const firstView = entry.isIntersecting && !this.seen;
                this.inView = entry.isIntersecting;
                if (firstView) {
                    this.seen = true;
                    this.activateTab(this.index);
                } else {
                    this.restart();
                }
            },
            { threshold: 0.4 }
        );
        this.observer.observe(this);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.observer?.disconnect();
        clearTimeout(this.timer);
    }

    activateTab(index) {
        super.activateTab(index);
        this.index = index;

        const activePanel = this.getPanelForTab(index, this.tabs[index]);
        this.panels.forEach((panel) => {
            const active = panel === activePanel;
            panel.hidden = false;
            panel.inert = !active;
            panel.setAttribute('aria-hidden', String(!active));
            if (!active) panel.removeAttribute('data-active');
        });

        // Replay the word animation every time, also when the active logo is clicked again:
        // [data-reset] drops the words to their start state without a transition, then [data-active] animates them in.
        if (activePanel) {
            activePanel.setAttribute('data-reset', '');
            activePanel.removeAttribute('data-active');
            void activePanel.offsetWidth;
            activePanel.removeAttribute('data-reset');
            activePanel.setAttribute('data-active', '');
        }

        this.centerTab(this.tabs[index]);
        this.restart();
    }

    centerTab(tab) {
        if (!tab || !this.list || this.list.scrollWidth <= this.list.clientWidth) return;
        const left = tab.offsetLeft - (this.list.clientWidth - tab.offsetWidth) / 2;
        this.list.scrollTo({ left, behavior: this.reducedMotion ? 'auto' : 'smooth' });
    }

    pause() {
        this.paused = true;
        clearTimeout(this.timer);
    }

    resume() {
        this.paused = false;
        this.restart();
    }

    restart() {
        clearTimeout(this.timer);
        if (this.reducedMotion || this.paused || !this.inView || this.tabs.length < 2) return;
        this.timer = setTimeout(() => {
            this.activateTab((this.index + 1) % this.tabs.length);
        }, this.interval);
    }
}

customElements.define('press-tabs', PressTabs);
