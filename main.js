/* ── MOBILE NAV (pages avec .nav-links + #navToggle) ── */
const hamburger = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');

hamburger?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  hamburger.classList.toggle('active', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

navLinks?.querySelectorAll('a')?.forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger?.classList.remove('active');
    document.body.style.overflow = '';
  });
});

/* ── SKILL BAR ANIMATION ── */
const skillBars = document.querySelectorAll('.skill-bar');

if (skillBars.length) {
  skillBars.forEach((bar) => {
    const w = bar.style.width;
    if (w) {
      bar.dataset.targetW = w;
      bar.style.width = '0';
      bar.style.transition = 'width 0.9s cubic-bezier(0.4, 0, 0.2, 1)';
    }
  });

  const barObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          setTimeout(() => {
            bar.style.width = bar.dataset.targetW || '0';
          }, 100);
          barObserver.unobserve(bar);
        }
      });
    },
    { threshold: 0.3 },
  );

  skillBars.forEach((bar) => barObserver.observe(bar));
}

/* ── WOW : révélations au scroll (sections, cartes, blocs) ── */
(() => {
  const animForce = document.documentElement.classList.contains('portfolio-anim-force');
  const reduce = !animForce || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sel = [
    'main .expertise-header',
    'main .expertise-card',
    'main .proj-featured-card',
    'main #parcours .about-grid',
    'main #parcours .side-card',
    'main .single-section .proj-detail',
    'main #entreprise .exp-pair',
    'main .veille-intro',
    'main #veille.veille-dashboard .veille-dash__head',
    'main #veille.veille-dashboard .veille-dash__kpis',
    'main #veille.veille-dashboard .veille-dash__toolbar',
    'main #veille.veille-dashboard .veille-dash__filter-block',
    'main #veille.veille-dashboard .veille-dash__grid',
    'main .theme-banner',
    'main .veille-card',
    'main .sources-section',
    'main .source-card',
    'main .contact-layout',
    'main .skill-card',
    'main .quick-card',
  ].join(', ');

  const nodes = document.querySelectorAll(sel);
  if (!nodes.length) return;

  if (reduce) {
    nodes.forEach((el) => {
      el.classList.add('wow-el', 'wow-in');
    });
    return;
  }

  nodes.forEach((el, idx) => {
    el.classList.add('wow-el');
    el.style.setProperty('--wow-d', `${Math.min(idx * 48, 420)}ms`);
  });

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('wow-in');
        obs.unobserve(en.target);
      });
    },
    /* rootMargin négatif : zones proches du bord bas du viewport ne déclenchaient pas (ex. #competences au chargement) */
    { threshold: 0.02, rootMargin: '0px 0px 8% 0px' },
  );

  nodes.forEach((el) => obs.observe(el));

  function revealWowsAlreadyOnScreen() {
    const vh = window.innerHeight || 0;
    nodes.forEach((el) => {
      if (el.classList.contains('wow-in')) return;
      const r = el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh * 0.995) {
        el.classList.add('wow-in');
        obs.unobserve(el);
      }
    });
  }

  requestAnimationFrame(revealWowsAlreadyOnScreen);
  setTimeout(revealWowsAlreadyOnScreen, 350);
  setTimeout(revealWowsAlreadyOnScreen, 1200);
  window.addEventListener('hashchange', () => setTimeout(revealWowsAlreadyOnScreen, 80), { passive: true });
})();

/* ── CLOSE MOBILE MENU ON RESIZE ── */
window.addEventListener('resize', () => {
  if (window.innerWidth > 900) {
    navLinks?.classList.remove('open');
    hamburger?.classList.remove('active');
    document.body.style.overflow = '';
  }
});

/* ── NAV SCROLL SPY (ancres #hero … #contact) ── */
(() => {
  const navTabs = document.querySelector('.nav-tabs');
  if (!navTabs) return;

  const SECTION_ORDER = [
    'hero',
    'parcours',
    'competences',
    'projets',
    'ecole',
    'entreprise',
    'veille',
    'contact',
  ];

  const NAV_SCROLL_MS = 340;

  let lastSyncedId = '';
  let navScrollRaf = 0;

  function scrollPaddingTopPx() {
    const raw = getComputedStyle(document.documentElement).scrollPaddingTop;
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : 124;
  }

  function prefersReducedScroll() {
    try {
      return (
        !document.documentElement.classList.contains('portfolio-anim-force') ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      );
    } catch (_) {
      return false;
    }
  }

  function scrollToSectionFast(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const pad = scrollPaddingTopPx();
    const targetY = Math.max(0, el.getBoundingClientRect().top + window.pageYOffset - pad);
    const startY = window.pageYOffset;
    const delta = targetY - startY;
    if (Math.abs(delta) < 2) return;

    if (navScrollRaf) {
      cancelAnimationFrame(navScrollRaf);
      navScrollRaf = 0;
    }

    if (prefersReducedScroll()) {
      window.scrollTo(0, targetY);
      return;
    }

    const t0 = performance.now();
    const dur = NAV_SCROLL_MS;
    function easeOutCubic(t) {
      return 1 - (1 - t) ** 3;
    }
    function step(now) {
      const p = Math.min(1, (now - t0) / dur);
      window.scrollTo(0, startY + delta * easeOutCubic(p));
      if (p < 1) navScrollRaf = requestAnimationFrame(step);
      else navScrollRaf = 0;
    }
    navScrollRaf = requestAnimationFrame(step);
  }

  function navBottomPx() {
    const nav = document.querySelector('.site-nav');
    if (!nav) return 112;
    return Math.min(Math.ceil(nav.getBoundingClientRect().bottom) + 8, 220);
  }

  function applyScrollOffsetCss(zTop) {
    document.documentElement.style.setProperty('--nav-scroll-offset', `${zTop}px`);
  }

  function currentNavIdFromScroll(zTop) {
    const html = document.documentElement;
    const scrollY = window.scrollY || html.scrollTop;
    const maxScroll = Math.max(0, html.scrollHeight - html.clientHeight);
    const innerH = window.innerHeight;
    const innerW = window.innerWidth;

    if (maxScroll > 0 && scrollY >= maxScroll - 16) {
      for (let i = SECTION_ORDER.length - 1; i >= 0; i -= 1) {
        const sid = SECTION_ORDER[i];
        if (document.getElementById(sid)) return sid;
      }
    }
    const zBot = Math.min(innerH * 0.66, innerH - 16);

    let bestId = 'hero';
    let bestVis = -1;

    for (let idx = 0; idx < SECTION_ORDER.length; idx += 1) {
      const sid = SECTION_ORDER[idx];
      const el = document.getElementById(sid);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const vis = Math.max(0, Math.min(r.bottom, zBot) - Math.max(r.top, zTop));

      if (vis > bestVis + 1.5) {
        bestVis = vis;
        bestId = sid;
      } else if (vis > 0 && Math.abs(vis - bestVis) <= 1.5) {
        const oldIdx = SECTION_ORDER.indexOf(bestId);
        if (idx > oldIdx) {
          bestVis = vis;
          bestId = sid;
        }
      }
    }

    if (bestVis > 4) return bestId;

    const probeY = Math.min(zTop + (zBot - zTop) * 0.38, innerH - 8);
    const probeX = innerW * 0.5;
    try {
      const hit = document.elementFromPoint(probeX, probeY);
      const sec = hit && hit.closest && hit.closest('section[id]');
      if (sec && sec.id && SECTION_ORDER.includes(sec.id)) return sec.id;
    } catch (_) {
      /* file:// or blocked */
    }

    return bestId;
  }

  function syncNavActive() {
    const zTop = navBottomPx();
    applyScrollOffsetCss(zTop);
    const id = currentNavIdFromScroll(zTop);
    if (id === lastSyncedId) return;
    lastSyncedId = id;
    navTabs.querySelectorAll('a[href^="#"]').forEach((a) => {
      const href = a.getAttribute('href') || '';
      a.classList.toggle('active', href === `#${id}`);
    });
  }

  let scrollScheduled = false;
  window.addEventListener(
    'scroll',
    () => {
      if (scrollScheduled) return;
      scrollScheduled = true;
      requestAnimationFrame(() => {
        syncNavActive();
        scrollScheduled = false;
      });
    },
    { passive: true },
  );

  window.addEventListener('hashchange', () => {
    lastSyncedId = '';
    syncNavActive();
  });

  window.addEventListener('popstate', () => {
    const hid = (window.location.hash || '').slice(1);
    if (hid && SECTION_ORDER.includes(hid)) {
      scrollToSectionFast(hid);
    }
    lastSyncedId = '';
    requestAnimationFrame(() => {
      syncNavActive();
    });
  });

  let resizeScheduled = false;
  window.addEventListener('resize', () => {
    if (resizeScheduled) return;
    resizeScheduled = true;
    requestAnimationFrame(() => {
      lastSyncedId = '';
      syncNavActive();
      resizeScheduled = false;
    });
  });

  window.addEventListener('pageshow', () => {
    lastSyncedId = '';
    syncNavActive();
  });

  navTabs.addEventListener(
    'click',
    (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      const id = href.slice(1);
      if (!SECTION_ORDER.includes(id)) return;
      e.preventDefault();
      try {
        history.pushState(null, '', href);
      } catch (_) {
        /* file:// */
      }
      scrollToSectionFast(id);
      lastSyncedId = '';
      requestAnimationFrame(() => {
        lastSyncedId = '';
        syncNavActive();
      });
      setTimeout(() => {
        lastSyncedId = '';
        syncNavActive();
      }, NAV_SCROLL_MS + 40);
      setTimeout(() => {
        lastSyncedId = '';
        syncNavActive();
      }, NAV_SCROLL_MS + 200);
    },
    true,
  );

  syncNavActive();
})();

/* ── École : double volet (projets ⟷ IPSSI) — canaux + hash #ecole-ipssi ── */
(() => {
  const hub = document.querySelector('.school-hub');
  if (!hub) return;
  const tabs = [...hub.querySelectorAll('.school-dock__tab')];
  const panels = [...hub.querySelectorAll('.school-panel')];
  const tablist = hub.querySelector('.school-dock');
  if (tabs.length < 2 || panels.length !== 2) return;

  function setPanel(which, opts) {
    const isIpssi = which === 'ipssi';
    hub.dataset.active = isIpssi ? 'ipssi' : 'projets';

    tabs.forEach((tab) => {
      const on =
        (isIpssi && tab.dataset.panel === 'ipssi') || (!isIpssi && tab.dataset.panel === 'projets');
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
    });

    panels.forEach((panel) => {
      const isProjets = panel.id === 'school-panel-projets';
      const active = (isProjets && !isIpssi) || (!isProjets && isIpssi);
      panel.toggleAttribute('inert', !active);
      panel.setAttribute('aria-hidden', active ? 'false' : 'true');
    });

    const fromHash = opts && opts.fromHash;
    if (!fromHash) {
      try {
        const h = isIpssi ? '#ecole-ipssi' : '#ecole';
        history.replaceState(null, '', `${location.pathname}${location.search}${h}`);
      } catch (_) {
        /* file:// */
      }
    }
  }

  function applyHash() {
    const raw = (location.hash || '').toLowerCase();
    if (raw === '#ecole-ipssi') setPanel('ipssi', { fromHash: true });
    else setPanel('projets', { fromHash: true });
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      setPanel(tab.dataset.panel === 'ipssi' ? 'ipssi' : 'projets');
    });
  });

  if (tablist) {
    tablist.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const ipssi = hub.dataset.active === 'ipssi';
      if (e.key === 'ArrowLeft' && ipssi) {
        e.preventDefault();
        setPanel('projets');
        tabs.find((t) => t.dataset.panel === 'projets')?.focus();
      } else if (e.key === 'ArrowRight' && !ipssi) {
        e.preventDefault();
        setPanel('ipssi');
        tabs.find((t) => t.dataset.panel === 'ipssi')?.focus();
      }
    });
  }

  window.addEventListener('hashchange', applyHash);
  applyHash();
})();

/* GSAP — transition loader → site (indépendant du toggle « animations du site » ; une fois par onglet) */
(() => {
  /** Incrémenter après déploiement majeur pour que tout le monde recharge loader + timeline GSAP. */
  const SESSION_KEY = 'portfolioLoaderRevealV4';
  const loader = document.getElementById('loader');
  const app = document.getElementById('app');
  const dataCanvas = document.getElementById('dataCanvas');
  const loaderText = document.querySelector('#loader .loader-text');
  const loaderFlash = document.querySelector('#loader .loader-crescendo');
  const loaderUi = document.querySelector('#loader .loader-ui');

  /** Blocs qui « matérialisent » après le loader (nav + sections racine du main, sans scripts). */
  function getRevealTargets() {
    const header = document.querySelector('header.site-nav');
    const main = document.getElementById('app');
    if (!main) return header ? [header] : [];
    const kids = Array.from(main.children).filter((n) => n.nodeType === 1 && n.tagName !== 'SCRIPT');
    return header ? [header, ...kids] : kids;
  }

  const animOn = document.documentElement.classList.contains('portfolio-anim-force');
  let reduce = false;
  try {
    reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (_) {}

  function clearAppVisualState() {
    if (!app) return;
    const targets = getRevealTargets();
    if (typeof gsap !== 'undefined') {
      gsap.set(app, { clearProps: 'opacity,filter,scale' });
      if (targets.length) gsap.set(targets, { clearProps: 'opacity,filter,y' });
    } else {
      app.style.removeProperty('opacity');
      app.style.removeProperty('filter');
      app.style.removeProperty('transform');
      targets.forEach((el) => {
        el.style.removeProperty('opacity');
        el.style.removeProperty('filter');
        el.style.removeProperty('transform');
      });
    }
  }

  function removeLoaderNode() {
    loader?.remove();
  }

  /** Évite de rejouer la séquence à chaque navigation interne ; un F5 (reload) efface la clé pour tout rejouer. */
  function markSessionDone() {
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch (_) {}
  }

  function finishImmediate() {
    removeLoaderNode();
    clearAppVisualState();
    markSessionDone();
  }

  // Désactive complètement la transition loader → site (pas de fondu, pas de timeline GSAP).
  finishImmediate();
  return;

  function isPageReload() {
    try {
      const ne = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
      if (ne && ne.type === 'reload') return true;
      if (typeof performance.navigation !== 'undefined' && performance.navigation.type === 1) return true;
    } catch (_) {}
    return false;
  }

  /* Ne pas lier au pied de page « désactiver les animations » : sinon le loader disparaît sans timeline. */
  if (reduce) {
    finishImmediate();
    return;
  }

  try {
    if (isPageReload()) sessionStorage.removeItem(SESSION_KEY);
  } catch (_) {}

  let alreadyDone = false;
  try {
    alreadyDone = sessionStorage.getItem(SESSION_KEY) === '1';
  } catch (_) {}
  if (alreadyDone) {
    finishImmediate();
    return;
  }

  if (typeof gsap === 'undefined') {
    finishImmediate();
    return;
  }

  let materializationRan = false;

  function runMaterializationTimeline() {
    if (materializationRan) return;
    if (!document.getElementById('loader')) {
      clearAppVisualState();
      markSessionDone();
      return;
    }
    materializationRan = true;

    if (dataCanvas) {
      try {
        gsap.set(dataCanvas, { willChange: 'opacity, filter' });
      } catch (_) {}
    }

    const revealTargets = getRevealTargets();
    if (app) {
      gsap.set(app, { opacity: 1, scale: 1, transformOrigin: '50% 0%', clearProps: 'filter' });
      if (animOn && revealTargets.length) {
        gsap.set(revealTargets, {
          opacity: 0,
          filter: 'blur(16px)',
          y: 20,
          force3D: true,
          transformOrigin: '50% 0%',
        });
      } else if (!animOn && revealTargets.length) {
        gsap.set(revealTargets, { opacity: 0, y: 18, force3D: true, transformOrigin: '50% 0%' });
        gsap.set(app, { opacity: 0 });
      } else {
        gsap.set(app, { opacity: 0, transformOrigin: '50% 50%' });
      }
    }

    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onComplete: () => {
        try {
          if (dataCanvas) gsap.set(dataCanvas, { clearProps: 'filter,willChange' });
        } catch (_) {}
        removeLoaderNode();
        clearAppVisualState();
        markSessionDone();
      },
    });

    /**
     * Timeline plafonnée à 2,2 s (phaseHold) — phases canvas P1…P4 total 1,68 s, voir index #dataCanvas.
     */
    const phaseHold = { _: 0 };
    const ANT_START = 0;
    const CRESC_START = 1.24;
    const CRESC_MS = 440;
    const CRESC_END = CRESC_START + CRESC_MS * 0.001;
    const CANVAS_STOP = CRESC_END + 0.05;
    const REVEAL_T = 1.26;
    const LOADER_FADE_START = 1.25;
    const revealEase = 'expo.out';

    tl.to(phaseHold, { _: 1, duration: 2.2, ease: 'none' }, 0);

    if (dataCanvas) {
      tl.to(dataCanvas, { opacity: 0.5, duration: 0.1, ease: 'power3.out' }, ANT_START);
      tl.to(dataCanvas, { opacity: 0.36, duration: 0.09, ease: 'expo.in' }, ANT_START + 0.1);
    }
    if (loaderUi) {
      tl.fromTo(loaderUi, { scale: 1 }, { scale: 1.01, duration: 0.11, ease: 'power2.out' }, ANT_START + 0.02);
      tl.to(loaderUi, { scale: 1, duration: 0.12, ease: 'power3.in' }, ANT_START + 0.13);
    }

    tl.add(() => {
      try {
        window.dispatchEvent(
          new CustomEvent('portfolio:loaderCrescendo', {
            bubbles: true,
            detail: { durationMs: CRESC_MS },
          }),
        );
      } catch (_) {}
    }, CRESC_START);

    if (loaderFlash && typeof gsap !== 'undefined') {
      tl.fromTo(
        loaderFlash,
        { opacity: 0 },
        { opacity: 0.12, duration: 0.04, ease: 'power2.out' },
        CRESC_START + 0.04,
      );
      tl.to(loaderFlash, { opacity: 0, duration: 0.24, ease: 'expo.out' }, CRESC_START + 0.09);
    }

    if (loader) {
      tl.set(loader, { filter: 'blur(0px)' }, CRESC_START);
      tl.to(loader, { filter: 'blur(0.45px)', duration: 0.032, ease: 'sine.in' }, CRESC_START + 0.05);
      tl.to(loader, { filter: 'blur(0px)', duration: 0.08, ease: 'power2.out' }, CRESC_START + 0.08);
    }

    if (dataCanvas) {
      tl.to(dataCanvas, { opacity: 0.58, duration: 0.07, ease: 'power3.out' }, CRESC_START - 0.02);
      tl.to(dataCanvas, { opacity: 0.95, duration: 0.05, ease: 'expo.in' }, CRESC_START + 0.03);
      tl.to(dataCanvas, { filter: 'brightness(1.12)', duration: 0.035, ease: 'sine.out' }, CRESC_START + 0.03);
      tl.to(dataCanvas, { filter: 'brightness(1)', duration: 0.09, ease: 'power2.out' }, CRESC_START + 0.06);
      tl.to(dataCanvas, { opacity: 0, duration: 0.18, ease: 'power2.in' }, CRESC_START + 0.09);
    }

    tl.add(() => {
      try {
        window.__portfolioLoaderStopCanvas = true;
      } catch (_) {}
    }, CANVAS_STOP);

    if (loaderText) {
      tl.to(loaderText, { opacity: 0, duration: 0.16, ease: 'power2.in' }, CRESC_START + 0.02);
    }

    if (app && revealTargets.length) {
      if (animOn) {
        tl.to(
          revealTargets,
          {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            duration: 0.38,
            stagger: { amount: 0.1, from: 'start', ease: 'power2.inOut' },
            ease: revealEase,
          },
          REVEAL_T,
        );
      } else {
        tl.set(app, { opacity: 1 }, REVEAL_T);
        tl.to(
          revealTargets,
          {
            opacity: 1,
            y: 0,
            duration: 0.34,
            stagger: { amount: 0.08, from: 'start', ease: 'power2.inOut' },
            ease: 'expo.out',
          },
          REVEAL_T,
        );
      }
    } else if (app) {
      tl.to(
        app,
        {
          opacity: 1,
          filter: animOn ? 'blur(0px)' : 'none',
          scale: 1,
          duration: animOn ? 0.38 : 0.34,
          ease: revealEase,
        },
        REVEAL_T,
      );
    }

    if (loader) {
      tl.set(loader, { pointerEvents: 'none' }, LOADER_FADE_START - 0.05);
      tl.to(loader, { opacity: 0, duration: 0.26, ease: 'power3.inOut' }, LOADER_FADE_START);
    }
  }

  const POST_LOAD_DELAY_MS = 50;
  let loadPhaseScheduled = false;

  function beginDataMaterializationAndTimeline() {
    window.__portfolioDataLoaderGateOpen = true;
    try {
      window.dispatchEvent(new CustomEvent('portfolio:dataLoaderStart', { bubbles: true }));
    } catch (_) {}
    runMaterializationTimeline();
  }

  /** Après intro : attendre window « load » (assets prêts), puis court délai, puis particules + GSAP. */
  function scheduleAfterWindowLoadAndDelay() {
    if (loadPhaseScheduled) return;
    loadPhaseScheduled = true;

    const runAfterLoad = () => {
      setTimeout(beginDataMaterializationAndTimeline, POST_LOAD_DELAY_MS);
    };

    if (document.readyState === 'complete') {
      runAfterLoad();
    } else {
      window.addEventListener('load', runAfterLoad, { once: true, passive: true });
    }
  }

  function armIntroThenLoadThenAnimate() {
    if (window.__portfolioIntroLoaderQueued) {
      scheduleAfterWindowLoadAndDelay();
      return;
    }
    window.addEventListener('portfolio:introComplete', scheduleAfterWindowLoadAndDelay, { once: true, passive: true });
  }

  armIntroThenLoadThenAnimate();
})();

/* Three.js (CDN) — scène minimale + sphère (désactivé si pas d’anim ou reduced-motion) */
(() => {
  // Désactivation complète de la sphère 3D en bas à droite.
  return;

  if (typeof THREE === 'undefined') return;
  const animOn = document.documentElement.classList.contains('portfolio-anim-force');
  let reduce = false;
  try {
    reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (_) {}
  if (!animOn || reduce) return;

  const W = 280;
  const H = 200;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'fixed',
    right: '10px',
    bottom: '10px',
    zIndex: '4',
    opacity: '0.45',
    pointerEvents: 'none',
    borderRadius: '10px',
    maxWidth: 'min(280px, 28vw)',
  });

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (_) {
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(W, H, false);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
  camera.position.z = 2.6;

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.65, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.25, roughness: 0.45 }),
  );
  scene.add(mesh);
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const dl = new THREE.DirectionalLight(0xffffff, 0.9);
  dl.position.set(2, 2.5, 3);
  scene.add(dl);

  document.body.appendChild(canvas);

  let raf = 0;
  function tick() {
    mesh.rotation.y += 0.018;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }
  tick();

  window.addEventListener(
    'pagehide',
    () => {
      if (raf) cancelAnimationFrame(raf);
      renderer.dispose();
      mesh.geometry.dispose();
      mesh.material.dispose();
      canvas.remove();
    },
    { once: true },
  );
})();
