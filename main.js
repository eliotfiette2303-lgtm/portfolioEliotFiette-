/* ── MOBILE NAV ── */
const hamburger = document.getElementById('navToggle');
const navLinks  = document.querySelector('.nav-links');

hamburger?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  hamburger.classList.toggle('active', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

navLinks?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger?.classList.remove('active');
    document.body.style.overflow = '';
  });
});

/* ── SKILL BAR ANIMATION ── */
const skillBars = document.querySelectorAll('.skill-bar');

if (skillBars.length) {
  skillBars.forEach(bar => {
    const w = bar.style.width;
    if (w) {
      bar.dataset.targetW = w;
      bar.style.width = '0';
      bar.style.transition = 'width 0.9s cubic-bezier(0.4, 0, 0.2, 1)';
    }
  });

  const barObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        setTimeout(() => { bar.style.width = bar.dataset.targetW || '0'; }, 100);
        barObserver.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });

  skillBars.forEach(bar => barObserver.observe(bar));
}

/* ── SCROLL REVEAL FOR CARDS ── */
const revealTargets = document.querySelectorAll(
  '.skill-card, .project-card, .proj-detail, .source-card, .veille-card, .quick-card'
);

if (revealTargets.length) {
  revealTargets.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(14px)';
    el.style.transition = `opacity 0.45s ${i * 0.07}s ease, transform 0.45s ${i * 0.07}s ease`;
  });

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  revealTargets.forEach(el => revealObserver.observe(el));
}

/* ── CLOSE MOBILE MENU ON RESIZE ── */
window.addEventListener('resize', () => {
  if (window.innerWidth > 900) {
    navLinks?.classList.remove('open');
    hamburger?.classList.remove('active');
    document.body.style.overflow = '';
  }
});
