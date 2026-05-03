/**
 * Shim de compatibilité : anciennes pages en cache chargeaient encore le vaisseau WebGL ici.
 * On supprime tout canvas résiduel et on déclenche la sortie cinématique CSS (classes déjà dans style.css).
 */
(function (window) {
  'use strict';
  function stripShipDom() {
    try {
      document.querySelectorAll('.intro-ship-root').forEach(function (n) {
        n.remove();
      });
    } catch (e) {}
  }
  stripShipDom();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', stripShipDom);
  }
  window.__portfolioSpaceship = {
    run: function (opts) {
      stripShipDom();
      var intro = opts && opts.introEl;
      var done = opts && typeof opts.onComplete === 'function' ? opts.onComplete : function () {};
      if (!intro || !intro.parentNode) {
        done();
        return;
      }
      intro.classList.remove(
        'site-intro--exit-ship',
        'site-intro--ship-smoke',
        'site-intro--ship-smoke-peak'
      );
      intro.classList.add('site-intro--exit-cinematic');
      window.setTimeout(done, 2850);
    },
  };
})(typeof window !== 'undefined' ? window : this);
