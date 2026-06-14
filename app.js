// Hetansh Shah — Portfolio · shared behavior
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', function () {
  // mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); });
    });
  }

  // scroll reveal
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i % 3, 2) * 80) + 'ms';
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // current year
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // dividers draw left-to-right when scrolled into view
  var dividers = document.querySelectorAll('.divider');
  if ('IntersectionObserver' in window && dividers.length) {
    var dio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('drawn'); dio.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    dividers.forEach(function (el) { dio.observe(el); });
  } else {
    dividers.forEach(function (el) { el.classList.add('drawn'); });
  }

  // scroll-drawn lines: top progress bar + vertical spine
  if (!reduce) {
    var bar = document.createElement('div');
    bar.className = 'scroll-bar';
    document.body.appendChild(bar);

    var spine = document.createElement('div');
    spine.className = 'scroll-spine';
    var fill = document.createElement('i');
    spine.appendChild(fill);
    document.body.appendChild(spine);

    var ticking = false;
    function drawScroll() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.transform = 'scaleX(' + p + ')';
      fill.style.height = (p * 100) + '%';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(drawScroll); }
    }, { passive: true });
    window.addEventListener('resize', drawScroll, { passive: true });
    drawScroll();
  }

  // cursor spotlight on cards
  if (fine) {
    document.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  // 3D tilt on app frames
  if (fine && !reduce) {
    document.querySelectorAll('.tilt').forEach(function (el) {
      var max = 6;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(1100px) rotateY(' + (px * max) + 'deg) rotateX(' + (-py * max) + 'deg)';
      });
      el.addEventListener('pointerleave', function () {
        el.style.transform = 'perspective(1100px) rotateY(0) rotateX(0)';
      });
    });
  }

  // ---- Lenis smooth scrolling (loaded only where the CDN script is) ----
  var lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1.0 });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }

  // smooth anchor scrolling for on-page links
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (links) links.classList.remove('open');
      if (lenis) { lenis.scrollTo(target, { offset: -76 }); }
      else {
        var top = target.getBoundingClientRect().top + window.scrollY - 76;
        window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
      }
    });
  });

  // ---- animated number counters ----------------------------------------
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    var animateCount = function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      var dur = 1400, start = null;
      if (reduce) { el.textContent = target + suffix; return; }
      var step = function (ts) {
        if (!start) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cio.observe(el); });
    } else {
      counters.forEach(animateCount);
    }
  }

  // ---- magnetic buttons -------------------------------------------------
  if (fine && !reduce) {
    document.querySelectorAll('.magnetic').forEach(function (el) {
      var strength = 0.32;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var mx = e.clientX - (r.left + r.width / 2);
        var my = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + (mx * strength) + 'px,' + (my * strength) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  // ---- lightweight scroll parallax (data-parallax="speed") -------------
  var pxEls = document.querySelectorAll('[data-parallax]');
  if (pxEls.length && !reduce) {
    var pxTicking = false;
    var applyParallax = function () {
      var vh = window.innerHeight;
      pxEls.forEach(function (el) {
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
        var r = el.getBoundingClientRect();
        var offset = (r.top + r.height / 2 - vh / 2) * speed;
        el.style.transform = 'translateY(' + (-offset) + 'px)';
      });
      pxTicking = false;
    };
    window.addEventListener('scroll', function () {
      if (!pxTicking) { pxTicking = true; requestAnimationFrame(applyParallax); }
    }, { passive: true });
    applyParallax();
  }
});
