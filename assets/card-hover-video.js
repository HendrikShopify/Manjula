/*
  Product card hover video (delegated, works on cards added later).
  [data-hover-video]  wrapper of a muted, looped <video> in a tile card (snippets/product-card.liquid).
  Hovering the card plays the video from where it left off; leaving pauses it. Only on devices that can hover,
  and not with reduced motion (the poster frame shows instead). The video loads on the first hover (preload none).
*/
(() => {
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const video = (card) => card.querySelector('[data-hover-video] video');

  document.addEventListener(
    'pointerenter',
    (evt) => {
      const card = evt.target;
      if (!(card instanceof Element) || card.localName !== 'product-card') return;
      if (!canHover.matches || reduced.matches) return;
      const el = video(card);
      if (!el) return;
      el.muted = true;
      el.play().catch(() => {});
    },
    true
  );

  document.addEventListener(
    'pointerleave',
    (evt) => {
      const card = evt.target;
      if (!(card instanceof Element) || card.localName !== 'product-card') return;
      video(card)?.pause();
    },
    true
  );
})();
