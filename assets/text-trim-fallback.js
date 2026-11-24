/**
 * Text trim fallback for browsers without native text-box trimming (Safari before 18.2, Firefox).
 * See tailwind/text-trim.css. Native text-box trims every block container that holds text. The CSS fallback there
 * only reaches headings and paragraphs (::before / ::after), so short text in other boxes stayed untrimmed:
 * labels in flex rows (USP tags, buttons, header items, eyebrows) centred on their full line box, not on the
 * capitals, and sat about 2px off (Hendrik, Safari 17.5, 24 Nov).
 * This script marks those boxes with [data-text-trim]; the CSS gives them the margin method (as clamped text).
 * A box is marked when it holds text, directly or in inline elements only (li > a in the footer menu; Hendrik 24 Nov), lays out as a block (a block, or any item of a flex or grid row),
 * is not a flex or grid container itself (native trim skips those too), is not already covered by the CSS
 * fallback, and has no margin on the block axis. Without block padding it gets the margin method ([data-text-trim]);
 * with padding (menu links, chips) the padding shrinks by the trim instead ([data-text-trim="padding"], set inline so it
 * wins over the padding utilities), so the box keeps its place, as native trim inside padding (footer menu, 24 Nov).
 * Content added later (drawers, reviews, quick view) is marked when it arrives; the page is checked again on resize.
 * Does nothing where text-box is supported.
 */
(() => {
  if (!window.CSS || CSS.supports('text-box: trim-both cap alphabetic')) return;

  const COVERED = ':is(h1, h2, h3, h4, h5, h6, p, blockquote, figcaption, dt, dd):not([class*="flex"], [class*="grid"])';
  const SKIP = 'script, style, noscript, template, textarea, select, option, input, svg, [class*="truncate"], [class*="line-clamp-"], [class*="text-ellipsis"]';
  const BLOCKS = ['block', 'flow-root', 'list-item', 'inline-block'];
  const FLAT = ['marginTop', 'marginBottom'];

  // Text on the box's own lines: text nodes, or inline elements (a, span, strong) whose lines are the box's lines.
  // A box with any non-inline child is left alone; its children are checked on their own.
  const hasOwnText = (el) => {
    let text = false;
    for (const node of el.childNodes) {
      if (node.nodeType === 3) {
        if (node.nodeValue.trim()) text = true;
      } else if (node.nodeType === 1) {
        if (node.matches('br, wbr')) continue;
        if (getComputedStyle(node).display !== 'inline') return false;
        if (node.textContent.trim()) text = true;
      }
    }
    return text;
  };

  const check = (el) => {
    if (el.hasAttribute('data-text-trim') || !hasOwnText(el) || el.matches(SKIP) || el.matches(COVERED)) return;
    const style = getComputedStyle(el);
    if (!BLOCKS.includes(style.display)) return;
    if (FLAT.some((key) => parseFloat(style[key]) !== 0)) return;
    const top = parseFloat(style.paddingTop);
    const bottom = parseFloat(style.paddingBottom);
    if (!top && !bottom) {
      el.setAttribute('data-text-trim', '');
      return;
    }
    el.style.paddingTop = `max(0px, calc(${top}px + var(--trim-top) - 0.5lh))`;
    el.style.paddingBottom = `max(0px, calc(${bottom}px + var(--trim-bottom) - 0.5lh))`;
    el.setAttribute('data-text-trim', 'padding');
  };

  // Padding can change with the screen size (lg:py-…): read it again without the trim.
  const reset = (root) => {
    root.querySelectorAll('[data-text-trim="padding"]').forEach((el) => {
      el.removeAttribute('data-text-trim');
      el.style.removeProperty('padding-top');
      el.style.removeProperty('padding-bottom');
    });
  };

  const scan = (root) => {
    if (root.nodeType !== 1) return;
    check(root);
    root.querySelectorAll('*').forEach(check);
  };

  const pending = new Set();
  let frame = 0;
  const flush = () => {
    frame = 0;
    pending.forEach((node) => node.isConnected && scan(node));
    pending.clear();
  };
  const queue = (node) => {
    pending.add(node);
    if (!frame) frame = requestAnimationFrame(flush);
  };

  const start = () => {
    scan(document.body);
    new MutationObserver((records) => {
      records.forEach((record) => {
        if (record.type === 'characterData') queue(record.target.parentElement);
        else if (record.addedNodes.length) queue(record.target);
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
    let timer;
    window.addEventListener('resize', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        reset(document.body);
        queue(document.body);
      }, 200);
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
