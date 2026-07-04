/* Portfolio interactions: theme toggle, nav scroll-spy, reveal-on-scroll,
   corner glows, and the draggable project/coursework carousels. */
(function () {
  'use strict';

  var root = document.getElementById('nm-root');
  if (!root) return;

  /* ---------- theme ---------- */

  var darkVars = { '--glow': 'rgba(224,160,61,.5)', '--orange': '#E0A03D', '--orange-hover': '#F0B255', '--orange-deep': '#C8862A', '--on-orange': '#1A1408', '--bg': '#16130F', '--surface': '#1E1A14', '--surface-2': '#262019', '--fg': '#F5EEE2', '--fg-body': '#C9BFB0', '--fg-muted': '#94897A', '--border': 'rgba(255,243,224,.08)', '--border-strong': 'rgba(255,243,224,.14)', '--chip-bg': 'rgba(224,160,61,.13)', '--chip-bd': 'rgba(224,160,61,.42)', '--badge-bg': 'rgba(224,160,61,.15)', '--ring': 'rgba(224,160,61,.30)' };
  var lightVars = { '--glow': 'rgba(185,122,24,.32)', '--orange': '#B97A18', '--orange-hover': '#CE8A23', '--orange-deep': '#9C6411', '--on-orange': '#FFF8EC', '--bg': '#FAF6EF', '--surface': '#FFFDF9', '--surface-2': '#F2EADC', '--fg': '#2A2014', '--fg-body': '#5A5042', '--fg-muted': '#8A7F6E', '--border': 'rgba(42,32,20,.10)', '--border-strong': 'rgba(42,32,20,.16)', '--chip-bg': 'rgba(185,122,24,.10)', '--chip-bd': 'rgba(185,122,24,.40)', '--badge-bg': 'rgba(185,122,24,.10)', '--ring': 'rgba(185,122,24,.26)' };
  var sun = '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M5 5l1.5 1.5M17.5 17.5 19 19M2 12h2M20 12h2M5 19l1.5-1.5M17.5 6.5 19 5"></path>';
  var moon = '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"></path>';

  function applyVars(vars) {
    Object.keys(vars).forEach(function (k) { root.style.setProperty(k, vars[k]); });
  }
  function applyAccent(accent, onAccent) {
    root.style.setProperty('--orange', accent);
    root.style.setProperty('--on-orange', onAccent);
    root.style.setProperty('--orange-hover', 'color-mix(in srgb,' + accent + ', white 12%)');
    root.style.setProperty('--orange-deep', 'color-mix(in srgb,' + accent + ', black 12%)');
    root.style.setProperty('--chip-bg', 'color-mix(in srgb,' + accent + ' 14%, transparent)');
    root.style.setProperty('--chip-bd', 'color-mix(in srgb,' + accent + ' 45%, transparent)');
    root.style.setProperty('--badge-bg', 'color-mix(in srgb,' + accent + ' 16%, transparent)');
    root.style.setProperty('--ring', 'color-mix(in srgb,' + accent + ' 30%, transparent)');
  }
  function setIcon(which) {
    var icon = document.getElementById('nm-themeicon');
    if (icon) icon.innerHTML = which === 'moon' ? moon : sun;
  }
  function setTheme(theme) {
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
      applyVars(lightVars);
      applyAccent('#B97A18', '#FFF8EC');
      setIcon('moon');
    } else {
      root.removeAttribute('data-theme');
      applyVars(darkVars);
      applyAccent('#E0A03D', '#1A1408');
      setIcon('sun');
    }
    try { localStorage.setItem('nm-theme', theme); } catch (e) { /* private mode */ }
  }

  var savedTheme;
  try { savedTheme = localStorage.getItem('nm-theme'); } catch (e) { savedTheme = null; }
  if (savedTheme === 'light') setTheme('light');

  /* ---------- corner glows (drift with scroll) ---------- */

  var glowCfg = [
    { id: 'nm-g-tl', p: 0.0, f: 0.83, f2: 0.37, min: 0.02, max: 0.50, drift: 26 },
    { id: 'nm-g-tr', p: 1.7, f: 1.27, f2: 0.51, min: 0.02, max: 0.42, drift: -32 },
    { id: 'nm-g-bl', p: 3.4, f: 0.61, f2: 0.43, min: 0.02, max: 0.38, drift: 30 },
    { id: 'nm-g-br', p: 5.0, f: 1.09, f2: 0.29, min: 0.02, max: 0.46, drift: -24 }
  ];
  var glows = glowCfg.map(function (g) {
    var el = document.getElementById(g.id);
    return el ? Object.assign({ el: el }, g) : null;
  }).filter(Boolean);

  function updateGlow(y) {
    var s = (y || 0) / 520;
    glows.forEach(function (g) {
      var v = 0.5 + 0.5 * Math.sin(s * g.f + g.p);
      v = v * 0.7 + (0.5 + 0.5 * Math.sin(s * g.f2 + g.p * 1.7)) * 0.3;
      var lit = Math.pow(v, 2.6); // contrast curve: mostly dim, blooms occasionally
      g.el.style.opacity = (g.min + lit * (g.max - g.min)).toFixed(3);
      g.el.style.transform = 'translate(' + ((lit - 0.4) * g.drift).toFixed(1) + 'px,' +
        ((lit - 0.4) * g.drift * 0.5).toFixed(1) + 'px) scale(' + (0.85 + lit * 0.3).toFixed(3) + ')';
    });
  }

  /* ---------- reveal on scroll ---------- */

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealItems = root.querySelectorAll('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var sibs = Array.prototype.slice.call(el.parentElement.querySelectorAll('[data-reveal]'));
        el.style.transitionDelay = ((Math.max(0, sibs.indexOf(el)) % 6) * 0.08) + 's';
        el.style.opacity = '1';
        el.style.transform = 'none';
        io.unobserve(el);
      });
    }, { threshold: 0.15 });
    revealItems.forEach(function (el) { io.observe(el); });
  }

  /* ---------- scroll: header border, back-to-top, nav pill, timeline ---------- */

  var header = document.getElementById('nm-header');
  var toTop = document.getElementById('nm-totop');
  var navpill = document.getElementById('nm-navpill');
  var links = Array.prototype.slice.call(root.querySelectorAll('[data-nav]'));
  var secs = links.map(function (l) { return document.getElementById(l.getAttribute('data-nav')); });
  var tlWrap = document.getElementById('nm-timeline-wrap');
  var tlFill = document.getElementById('nm-tl-fill');
  var tlNodes = Array.prototype.slice.call(root.querySelectorAll('.nm-tl-node'));
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    if (header) header.style.borderBottomColor = y > 10 ? 'var(--border)' : 'transparent';
    if (toTop) {
      var show = y > 600;
      toTop.style.opacity = show ? '1' : '0';
      toTop.style.pointerEvents = show ? 'auto' : 'none';
      toTop.style.transform = show ? 'translateY(0)' : 'translateY(12px)';
    }
    var cur = 0;
    secs.forEach(function (s, i) { if (s && s.offsetTop - 120 <= y) cur = i; });
    links.forEach(function (l, i) {
      var active = i === cur;
      l.style.color = active ? 'var(--on-orange)' : 'var(--fg-body)';
      if (active && navpill && l.offsetWidth) {
        navpill.style.opacity = '1';
        navpill.style.transform = 'translateX(' + l.offsetLeft + 'px)';
        navpill.style.width = l.offsetWidth + 'px';
      }
    });
    var vh = window.innerHeight;
    if (tlWrap && tlFill) {
      var rc = tlWrap.getBoundingClientRect();
      var total = rc.height || 1;
      var passed = Math.max(0, Math.min(total, vh * 0.55 - rc.top));
      tlFill.style.height = (passed / total * 100) + '%';
    }
    tlNodes.forEach(function (n) {
      var on = n.getBoundingClientRect().top < vh * 0.6;
      n.style.borderColor = on ? 'var(--orange)' : 'var(--border-strong)';
      n.style.boxShadow = on ? '0 0 0 5px color-mix(in srgb,var(--orange) 18%,transparent)' : 'none';
    });
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(function () { updateGlow(y); ticking = false; });
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
  setTimeout(onScroll, 60);

  /* ---------- carousels (auto-scroll, hover pause, drag with momentum) ---------- */

  function setupCarousel(trackId, viewportId, speed) {
    var track = document.getElementById(trackId);
    var viewport = document.getElementById(viewportId);
    if (!track || !viewport) return;

    // triple the cards for a seamless loop
    var originals = Array.prototype.slice.call(track.children);
    originals.forEach(function (n) { track.appendChild(n.cloneNode(true)); });
    originals.forEach(function (n) { track.appendChild(n.cloneNode(true)); });

    var setWidth = 0;
    function measure() { setWidth = track.scrollWidth / 3; }
    measure();
    window.addEventListener('resize', measure);

    var BASE = speed, FRICTION = 0.06;
    var offset = setWidth, velocity = BASE;
    var hovering = false, dragging = false;
    var lastX = 0, lastT = 0, dragVel = 0, movedDist = 0;

    function tick() {
      if (!dragging && !hovering) {
        offset += velocity;
        velocity += (BASE - velocity) * FRICTION;
      }
      if (offset >= setWidth * 2) offset -= setWidth;
      if (offset < 0) offset += setWidth;
      track.style.transform = 'translateX(' + (-offset) + 'px)';
      requestAnimationFrame(tick);
    }
    if (!reduceMotion) requestAnimationFrame(tick);

    viewport.addEventListener('pointerenter', function () { hovering = true; });
    viewport.addEventListener('pointerleave', function () { hovering = false; });
    viewport.addEventListener('pointerdown', function (e) {
      dragging = true;
      viewport.style.cursor = 'grabbing';
      viewport.setPointerCapture(e.pointerId);
      lastX = e.clientX; lastT = performance.now(); dragVel = 0; movedDist = 0;
    });
    viewport.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX;
      var now = performance.now();
      var dt = Math.max(now - lastT, 1);
      offset -= dx;
      movedDist += Math.abs(dx);
      dragVel = -dx / dt * 16;
      lastX = e.clientX; lastT = now;
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      viewport.style.cursor = 'grab';
      velocity = Math.abs(dragVel) > BASE ? dragVel : BASE;
    }
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);
    // suppress accidental link clicks after a real drag
    track.addEventListener('click', function (e) {
      if (movedDist > 6) { e.preventDefault(); e.stopPropagation(); }
    }, true);
  }

  setupCarousel('nm-proj-track', 'nm-proj-viewport', 0.45);
  setupCarousel('nm-course-track', 'nm-course-viewport', 0.35);

  /* ---------- small bits: year, actions ---------- */

  var yr = document.getElementById('nm-yr');
  if (yr) yr.textContent = new Date().getFullYear();

  var actions = {
    themeToggle: function () {
      setTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
      updateGlow(window.scrollY || 0);
    },
    menuToggle: function () {
      var m = document.getElementById('nm-navmenu');
      if (m) m.dataset.open = m.dataset.open === '1' ? '0' : '1';
    },
    closeMenu: function () {
      var m = document.getElementById('nm-navmenu');
      if (m) m.dataset.open = '0';
    },
    toTopClick: function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var fn = actions[el.getAttribute('data-action')];
    if (fn) fn();
  });

  /* ---------- copy email to clipboard (styles for #nm-copy-toast live in the page CSS) ---------- */

  var toast = document.createElement('div');
  toast.id = 'nm-copy-toast';
  toast.setAttribute('role', 'status');
  toast.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="width:1.15rem;height:1.15rem"><path d="M20 6 9 17l-5-5"></path></svg>Email copied to clipboard';
  document.body.appendChild(toast);
  var toastTimer;

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-copy-email]');
    if (!el || !navigator.clipboard) return; // without clipboard API the mailto: href still works
    navigator.clipboard.writeText(el.getAttribute('data-copy-email')).then(function () {
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
    }).catch(function () { /* clipboard blocked: the mailto: link has already opened */ });
  });
})();
