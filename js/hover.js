/* Applies the inline hover styles declared via data-hover attributes.
   Elements keep their resting styles in style=""; data-hover holds the
   CSS to layer on top while hovered or keyboard-focused. Uses delegated
   listeners so it also covers elements cloned after load (carousels). */
(function () {
  'use strict';

  function apply(el) {
    if (el.dataset.hoverOn === '1') return;
    el.dataset.hoverOn = '1';
    el.dataset.hoverResting = el.getAttribute('style') || '';
    el.setAttribute('style', el.dataset.hoverResting + ';' + el.getAttribute('data-hover'));
  }
  function revert(el) {
    if (el.dataset.hoverOn !== '1') return;
    el.dataset.hoverOn = '0';
    el.setAttribute('style', el.dataset.hoverResting);
  }
  function handler(enter) {
    return function (e) {
      var el = e.target.closest && e.target.closest('[data-hover]');
      if (!el) return;
      var related = e.relatedTarget;
      if (related && el.contains(related)) return; // moving within the element
      (enter ? apply : revert)(el);
    };
  }
  document.addEventListener('mouseover', handler(true));
  document.addEventListener('mouseout', handler(false));
  document.addEventListener('focusin', handler(true));
  document.addEventListener('focusout', handler(false));
})();
