class HTMLUpdateUtility {
  /**
   * Used to swap an HTML node with a new node.
   * The new node is inserted as a previous sibling to the old node, the old node is hidden, and then the old node is removed.
   *
   * The function currently uses a double buffer approach, but this should be replaced by a view transition once it is more widely supported https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
   */
  static viewTransition(oldNode, newContent, preProcessCallbacks = [], postProcessCallbacks = []) {
    preProcessCallbacks?.forEach((callback) => callback(newContent));

    const newNodeWrapper = document.createElement('div');
    HTMLUpdateUtility.setInnerHTML(newNodeWrapper, newContent.outerHTML);
    const newNode = newNodeWrapper.firstChild;

    // dedupe IDs
    const uniqueKey = Date.now();
    oldNode.querySelectorAll('[id], [form]').forEach((element) => {
      element.id && (element.id = `${element.id}-${uniqueKey}`);
      element.form && element.setAttribute('form', `${element.form.getAttribute('id')}-${uniqueKey}`);
    });

    oldNode.parentNode.insertBefore(newNode, oldNode);
    oldNode.style.display = 'none';

    postProcessCallbacks?.forEach((callback) => callback(newNode));

    setTimeout(() => oldNode.remove(), 500);
  }

  // Sets inner HTML and reinjects the script tags to allow execution. By default, scripts are disabled when using element.innerHTML.
  static setInnerHTML(element, html) {
    element.innerHTML = html;
    element.querySelectorAll('script').forEach((oldScriptTag) => {
      const newScriptTag = document.createElement('script');
      Array.from(oldScriptTag.attributes).forEach((attribute) => {
        newScriptTag.setAttribute(attribute.name, attribute.value);
      });
      newScriptTag.appendChild(document.createTextNode(oldScriptTag.innerHTML));
      oldScriptTag.parentNode.replaceChild(newScriptTag, oldScriptTag);
    });
  }
}

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (event.target !== container && event.target !== last && event.target !== first) return;

    document.addEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function () {
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function (event) {
    if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if ((event.target === container || event.target === first) && event.shiftKey) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('focusout', trapFocusHandlers.focusout);
  document.addEventListener('focusin', trapFocusHandlers.focusin);

  elementToFocus.focus();

  if (
    elementToFocus.tagName === 'INPUT' &&
    ['search', 'text', 'email', 'url'].includes(elementToFocus.type) &&
    elementToFocus.value
  ) {
    elementToFocus.setSelectionRange(0, elementToFocus.value.length);
  }
}

// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
try {
  document.querySelector(':focus-visible');
} catch (e) {
  focusVisiblePolyfill();
}

function focusVisiblePolyfill() {
  const navKeys = [
    'ARROWUP',
    'ARROWDOWN',
    'ARROWLEFT',
    'ARROWRIGHT',
    'TAB',
    'ENTER',
    'SPACE',
    'ESCAPE',
    'HOME',
    'END',
    'PAGEUP',
    'PAGEDOWN',
  ];
  let currentFocusedElement = null;
  let mouseClick = null;

  window.addEventListener('keydown', (event) => {
    if (navKeys.includes(event.code.toUpperCase())) {
      mouseClick = false;
    }
  });

  window.addEventListener('mousedown', (event) => {
    mouseClick = true;
  });

  window.addEventListener(
    'focus',
    () => {
      if (currentFocusedElement) currentFocusedElement.classList.remove('focused');

      if (mouseClick) return;

      currentFocusedElement = document.activeElement;
      currentFocusedElement.classList.add('focused');
    },
    true
  );
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus({ preventScroll: true });
}

function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== 'ESCAPE') return;

  const openDetailsElement = event.target.closest('details[open]');
  if (!openDetailsElement) return;

  const summaryElement = openDetailsElement.querySelector('summary');
  openDetailsElement.removeAttribute('open');
  summaryElement.setAttribute('aria-expanded', false);
  summaryElement.focus();
}

class QuantityInput extends BaseComponent {
  constructor() {
    super();
    this.changeEvent = new Event('change', { bubbles: true });
  }

  quantityUpdateUnsubscriber = undefined;

  init() {
    this.input = this.querySelector('input');
    this.listen(this.input, 'change', this.onInputChange.bind(this));
    this.querySelectorAll('button').forEach((button) =>
      this.listen(button, 'click', this.onButtonClick.bind(this))
    );
    this.validateQtyRules();
  }

  disconnectedCallback() {
    if (this.quantityUpdateUnsubscriber) {
      this.quantityUpdateUnsubscriber();
    }
    super.disconnectedCallback();
  }

  onInputChange(event) {
    this.validateQtyRules();
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;
    const button = event.currentTarget;

    if (button.name === 'plus') {
      if (parseInt(this.input.dataset.min) > parseInt(this.input.step) && this.input.value == 0) {
        this.input.value = this.input.dataset.min;
      } else {
        this.input.stepUp();
      }
    } else {
      this.input.stepDown();
    }

    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);

    if (this.input.dataset.min === previousValue && button.name === 'minus') {
      this.input.value = parseInt(this.input.min);
    }
  }

  validateQtyRules() {
    const value = parseInt(this.input.value);

    if (this.input.min) {
      const buttonMinus = this.querySelector("[name='minus']");
      if (parseInt(value) <= parseInt(this.input.min)) {
        buttonMinus.setAttribute('disabled', 'true');
      } else {
        buttonMinus.removeAttribute('disabled');
      }
    }

    if (this.input.max) {
      const max = parseInt(this.input.max);
      const buttonPlus = this.querySelector("[name='plus']");
      if (value >= max) {
        buttonPlus.setAttribute('disabled', 'true');
      } else {
        buttonPlus.removeAttribute('disabled');
      }
    }
  }
}

customElements.define('quantity-input', QuantityInput);

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function throttle(fn, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return fn(...args);
  };
}

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: `application/${type}` },
  };
}

// /*
//  * Shopify Common JS
//  *
//  */
if (typeof window.Shopify == 'undefined') {
  window.Shopify = {};
}

Shopify.bind = function (fn, scope) {
  return function () {
    return fn.apply(scope, arguments);
  };
};

Shopify.setSelectorByValue = function (selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

// class ProductRecommendations extends HTMLElement {
//   observer = undefined;

//   constructor() {
//     super();
//   }

//   connectedCallback() {
//     this.initializeRecommendations(this.dataset.productId);
//   }

//   initializeRecommendations(productId) {
//     this.observer?.unobserve(this);
//     this.observer = new IntersectionObserver(
//       (entries, observer) => {
//         if (!entries[0].isIntersecting) return;
//         observer.unobserve(this);
//         this.loadRecommendations(productId);
//       },
//       { rootMargin: '0px 0px 400px 0px' }
//     );
//     this.observer.observe(this);
//   }

//   loadRecommendations(productId) {
//     fetch(`${this.dataset.url}&product_id=${productId}&section_id=${this.dataset.sectionId}`)
//       .then((response) => response.text())
//       .then((text) => {
//         const html = document.createElement('div');
//         html.innerHTML = text;
//         const recommendations = html.querySelector('product-recommendations');

//         if (recommendations?.innerHTML.trim().length) {
//           this.innerHTML = recommendations.innerHTML;
//         }

//         if (!this.querySelector('slideshow-component') && this.classList.contains('complementary-products')) {
//           this.remove();
//         }

//         if (html.querySelector('.grid__item')) {
//           this.classList.add('product-recommendations--loaded');
//         }
//       })
//       .catch((e) => {
//         console.error(e);
//       });
//   }
// }

// customElements.define('product-recommendations', ProductRecommendations);


class LoadingBar extends BaseComponent {
  constructor() {
    super();
    this.startLoading = this.startLoading.bind(this);
    this.endLoading = this.endLoading.bind(this);
  }

  init() {
    this.listen(document, 'loading:start', this.startLoading);
    this.listen(document, 'loading:end', this.endLoading);
  }

  // start and end can arrive within milliseconds (a cached fetch). Each call kills the running tween first,
  // otherwise the 0.25s start tween outlives the 0.2s end tween and the bar settles at 80%.
  startLoading() {
    gsap.killTweensOf(this);
    gsap.to(this, { width: '80%', duration: 0.25, ease: 'power2.out' });
  }

  endLoading() {
    gsap.killTweensOf(this);
    gsap.to(this, {
      width: '100%',
      duration: 0.2,
      ease: 'power2.out',
      onComplete: () => {
        gsap.set(this, { width: '0%' });
      },
    });
  }
}

customElements.define('loading-bar', LoadingBar);


/* GSAP EASES */

gsap.registerPlugin(CustomEase, ScrollTrigger);

CustomEase.create("smooth", "0.77,0,0.175,1");


/**
 * Footer reveal (Hendrik, 18 Nov; lg and up, the sticky classes are lg: only): the wordmark and menu columns are sticky to the bottom of the screen under the image
 * band, so the band scrolls up off them while they stay put (CSS only, nothing moves by script).
 * This only sets --reveal-bottom: 0px, or minus the overflow when the part is taller than the screen, so its top is
 * pinned instead and nothing stays hidden. Without this script the bottom is invalid and the part simply scrolls.
 */
class FooterReveal extends BaseComponent {
  init() {
    this.update = this.update.bind(this);
    this.observer = new ResizeObserver(this.update);
    this.observer.observe(this);
    this.listen(window, 'resize', this.update);
    this.update();
    this.parallax();
  }

  // Small parallax and fade: while the band scrolls off, the content moves up from 30% lower to its place and the
  // overlay fades from 15% Ink to nothing, both ending when the page ends. The trigger is the band above (not sticky,
  // so its measured position is reliable). lg and up only.
  parallax() {
    const inner = this.querySelector('[data-footer-reveal-inner]');
    const overlay = this.querySelector('[data-footer-reveal-overlay]');
    const band = this.previousElementSibling;
    if (!inner || !band || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.media = gsap.matchMedia();
    this.media.add('(min-width: 1024px)', () => {
      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: band, start: 'bottom bottom', end: 'max', scrub: true },
      });
      timeline.fromTo(inner, { yPercent: 30 }, { yPercent: 0 }, 0);
      if (overlay) timeline.fromTo(overlay, { opacity: 0.15 }, { opacity: 0 }, 0);
    });
  }

  update() {
    const overflow = this.offsetHeight - window.innerHeight;
    this.style.setProperty('--reveal-bottom', overflow > 0 ? `${-overflow}px` : '0px');
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.observer?.disconnect();
    this.media?.revert();
  }
}

customElements.define('footer-reveal', FooterReveal);

// Accordion close animation (snippets/accordion-item.liquid, hook data-accordion). Safari hides a <details> panel the
// moment [open] is removed, so its close never animated. closeAccordion keeps [open], sets data-closing (the CSS animates
// the grid row and fade back to 0) and removes [open] once that is done. It runs on a click on the summary of an open
// item, and in a group (same name) on the open sibling when another item opens: its name comes off for the close, so
// the browser does not shut it at once, and goes back on after. Opening stays native. Reduced motion: native toggle.
const ACCORDION_CLOSE_MS = 300; // duration-300 on [data-accordion-panel]

function closeAccordion(details) {
  const name = details.getAttribute('name');
  if (name) details.removeAttribute('name');
  details.setAttribute('data-closing', '');
  const finish = () => {
    clearTimeout(timer);
    details.removeEventListener('transitionend', onEnd);
    details.open = false;
    details.removeAttribute('data-closing');
    if (name) details.setAttribute('name', name);
  };
  const onEnd = (event) => {
    if (event.target.matches('[data-accordion-panel]') && event.target.parentElement === details && event.propertyName === 'grid-template-rows') finish();
  };
  const timer = setTimeout(finish, ACCORDION_CLOSE_MS + 50);
  details.addEventListener('transitionend', onEnd);
}

document.addEventListener('click', (event) => {
  const summary = event.target.closest('[data-accordion] > summary');
  if (!summary) return;
  const details = summary.parentElement;
  if (details.hasAttribute('data-closing')) {
    event.preventDefault();
    return;
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (details.open) {
    event.preventDefault();
    closeAccordion(details);
    return;
  }
  // Opening an item in a group: close the open sibling with the animation (before the browser closes it at once).
  const name = details.getAttribute('name');
  if (!name) return;
  document.querySelectorAll('details[data-accordion][open]').forEach((other) => {
    if (other !== details && other.getAttribute('name') === name) closeAccordion(other);
  });
});

// Anchor links on page load (/pages/contact?contact_posted=true#ContactForm): Chrome jumps to the target before fonts,
// images and scripts have sized the content above it, so it lands too high. Scroll again once the page has loaded.
// Drawers that open from the hash (#cart-drawer) are left to side-drawer.js. The target's scroll-mt-* keeps it clear
// of the sticky header.
window.addEventListener('load', () => {
  const id = decodeURIComponent(window.location.hash.slice(1));
  if (!id) return;
  const target = document.getElementById(id);
  if (!target || target.closest('side-drawer, dialog, [role="dialog"]')) return;
  requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
});
