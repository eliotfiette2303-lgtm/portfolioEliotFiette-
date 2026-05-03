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
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sel = [
    'main .expertise-header',
    'main .expertise-card',
    'main .proj-featured-card',
    'main #parcours .about-grid',
    'main #parcours .side-card',
    'main .single-section .proj-detail',
    'main .timeline-placeholder',
    'main .veille-intro',
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
    { threshold: 0.06, rootMargin: '0px 0px -10% 0px' },
  );

  nodes.forEach((el) => obs.observe(el));
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

  const OFFSET = 104;
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

  let lastSyncedId = '';

  function currentNavIdFromScroll() {
    const html = document.documentElement;
    const scrollY = window.scrollY || html.scrollTop;
    const maxScroll = Math.max(0, html.scrollHeight - html.clientHeight);
    if (maxScroll > 0 && scrollY >= maxScroll - 6) {
      for (let i = SECTION_ORDER.length - 1; i >= 0; i -= 1) {
        if (document.getElementById(SECTION_ORDER[i])) return SECTION_ORDER[i];
      }
    }

    let id = 'hero';
    for (const sid of SECTION_ORDER) {
      const el = document.getElementById(sid);
      if (!el) continue;
      if (el.getBoundingClientRect().top <= OFFSET) id = sid;
    }
    return id;
  }

  function syncNavActive() {
    const id = currentNavIdFromScroll();
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

  syncNavActive();
})();
