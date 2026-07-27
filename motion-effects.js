// Hetansh Shah — Portfolio · Motion (Framer Motion's vanilla-JS engine) micro-interactions
// Buildless ES module, loaded via CDN — mirrors the three.js importmap pattern already in use.
// Falls back cleanly: if the CDN import fails or the user prefers reduced motion,
// app.js's CSS-transition reveal system (already wired) handles everything.

import { animate, inView, stagger } from 'https://cdn.jsdelivr.net/npm/motion@11/+esm';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (!reduce) {
  const spring = { type: 'spring', stiffness: 140, damping: 18, mass: 0.9 };

  // ---- staggered grid/group entrances (cards, skill groups, chips) -----
  document.querySelectorAll('.grid, .skills-grid').forEach((group) => {
    const items = group.querySelectorAll(':scope > .reveal');
    if (!items.length) return;

    items.forEach((el) => {
      el.classList.remove('reveal');
      el.style.opacity = 0;
    });

    inView(group, () => {
      animate(items, { opacity: [0, 1], y: [26, 0], scale: [0.97, 1] },
        { ...spring, delay: stagger(0.08) });
    }, { amount: 0.15 });
  });

  // ---- hero entrance (index only) ---------------------------------------
  const heroEls = document.querySelectorAll('.hero-copy.reveal > *, .hero-visual.reveal');
  if (heroEls.length) {
    document.querySelectorAll('.hero-copy.reveal, .hero-visual.reveal').forEach((el) => el.classList.remove('reveal'));
    animate(heroEls, { opacity: [0, 1], y: [22, 0] },
      { type: 'spring', stiffness: 120, damping: 16, delay: stagger(0.09, { startDelay: 0.05 }) });
  }

  // ---- card hover: spring lift (pointer devices only) -------------------
  if (fine) {
    document.querySelectorAll('.card').forEach((card) => {
      card.addEventListener('pointerenter', () => {
        animate(card, { y: -8, scale: 1.012 }, { type: 'spring', stiffness: 300, damping: 20 });
      });
      card.addEventListener('pointerleave', () => {
        animate(card, { y: 0, scale: 1 }, { type: 'spring', stiffness: 300, damping: 22 });
      });
    });
  }

  // ---- button tap feedback (works for touch + pointer) ------------------
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('pointerdown', () => animate(btn, { scale: 0.96 }, { duration: 0.12 }));
    const release = () => animate(btn, { scale: 1 }, { type: 'spring', stiffness: 400, damping: 15 });
    btn.addEventListener('pointerup', release);
    btn.addEventListener('pointerleave', release);
  });
}
