// Hetansh Shah — Portfolio · Motion (Framer Motion's vanilla-JS engine) micro-interactions
// Buildless ES module, loaded via CDN — mirrors the three.js importmap pattern already in use.
// Falls back cleanly: if the CDN import fails or the user prefers reduced motion,
// app.js's CSS-transition reveal system (already wired) handles everything.

import { animate, inView, stagger, scroll } from 'https://cdn.jsdelivr.net/npm/motion@11/+esm';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// ---- split a heading's text into per-word <span>s, preserving any nested
// elements (e.g. the gradient <span class="grad">) as single animatable units.
function splitWords(el) {
  if (el.dataset.split) return Array.from(el.querySelectorAll(':scope > .word, :scope > span.grad'));
  el.dataset.split = 'true';
  const original = Array.from(el.childNodes);
  const frag = document.createDocumentFragment();
  const words = [];
  original.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (part === '') return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        const span = document.createElement('span');
        span.className = 'word';
        span.style.display = 'inline-block';
        span.textContent = part;
        frag.appendChild(span);
        words.push(span);
      });
    } else {
      node.style.display = 'inline-block';
      frag.appendChild(node);
      words.push(node);
    }
  });
  el.innerHTML = '';
  el.appendChild(frag);
  return words;
}

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
  const heroH1 = document.querySelector('.hero-copy.reveal h1');
  const heroEls = document.querySelectorAll('.hero-copy.reveal > *:not(h1), .hero-visual.reveal');
  if (heroEls.length || heroH1) {
    document.querySelectorAll('.hero-copy.reveal, .hero-visual.reveal').forEach((el) => el.classList.remove('reveal'));
    if (heroH1) {
      const words = splitWords(heroH1);
      heroH1.style.opacity = 1;
      animate(words, { opacity: [0, 1], y: [20, 0] },
        { type: 'spring', stiffness: 160, damping: 18, delay: stagger(0.035) });
    }
    if (heroEls.length) {
      animate(heroEls, { opacity: [0, 1], y: [22, 0] },
        { type: 'spring', stiffness: 120, damping: 16, delay: stagger(0.09, { startDelay: 0.3 }) });
    }
  }

  // ---- scroll-linked parallax on the hero visual (motion.dev pattern) ---
  const heroSection = document.querySelector('.hero');
  const heroVisual = document.querySelector('.hero-visual');
  if (heroSection && heroVisual) {
    scroll(animate(heroVisual, { y: [0, 70] }, { ease: 'linear' }), {
      target: heroSection,
      offset: ['start start', 'end start'],
    });
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
