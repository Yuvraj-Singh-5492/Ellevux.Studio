/* ============================================================
   ELLEVUX · site.js   (classic script, vanilla, ZERO dependencies)
   ------------------------------------------------------------
   Owns:
     1. <html class="js">        progressive-enhancement hook
     2. [data-reveal]           fade + rise on enter, FAIL OPEN
     3. #nav                    compact-on-scroll
     4. mobile drawer           focus trap, Esc, inert, scroll lock
     5. smooth anchor scroll    with an a11y focus move
     6. [data-magnetic]         restrained pointer pull
     7. #year                   footer year
     8. ?p= plan prefill        passes the pricing choice into the form
     9. contact form            progressive fetch, native POST fallback
    10. device stage           CSS-3D drag with spring return
    11. pricing tool           keeps the sticky bar price honest
    12. sticky action bar      iOS-style bottom bar on phones
    13. reduced-motion watch    tears motion down if the OS flips late

   The reveal engine replaces the previous GSAP + ScrollTrigger
   implementation with IntersectionObserver. The CONTRACT is
   preserved exactly, which is what mattered:
     · the from-state is set in JS ONLY, never in CSS, so a visitor
       with no JS always sees fully rendered content
     · immediate siblings sharing a parent stagger
     · reveal is permanent, never reversed
     · per-element try/catch
     · a 2.5s failsafe force-shows anything still hidden
     · reduced motion shows EVERYTHING and returns
   Dropping GSAP removes ~70KB of CDN JavaScript from a site whose
   Lighthouse score is itself the sales argument.

   Principles: guard for every missing hook, respect reduced motion
   and coarse pointers, stay idempotent, never throw.
   ============================================================ */

(function () {
  'use strict';

  /* ---- 0. Progressive enhancement ---- */
  var root = document.documentElement;
  root.classList.add('js');

  window.Ellevux = window.Ellevux || {};

  /* ---- Environment ---- */
  var mqReduce =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;

  function prefersReducedMotion() {
    return !!(mqReduce && mqReduce.matches);
  }
  function hasFinePointer() {
    return (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches
    );
  }
  function qsa(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  var initialised = false;
  var motionTeardowns = [];
  function onMotionTeardown(fn) {
    if (typeof fn === 'function') motionTeardowns.push(fn);
  }

  /* ============================================================
     1. REVEALS
     ============================================================ */
  // Force an element into its natural, fully visible state. Used by
  // the reduced-motion path, the no-IO path, and the failsafe net.
  function showElement(el) {
    if (!el) return;
    el.style.opacity = '';
    el.style.transform = '';
    el.style.transition = '';
    el.style.willChange = '';
    el.setAttribute('data-revealed', '');
  }
  window.Ellevux.reveal = showElement;

  function initReveals() {
    var els = qsa('[data-reveal]');
    if (!els.length) return;

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      els.forEach(showElement);
      return;
    }

    // Stagger index among immediate siblings sharing a parent.
    var groups = new Map();
    els.forEach(function (el) {
      var parent = el.parentNode || document.body;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(el);
    });
    groups.forEach(function (list) {
      list.forEach(function (el, i) {
        el.__evxDelay = Math.min(i, 6) * 80;
      });
    });

    var fold = window.innerHeight || 800;
    var pending = [];

    els.forEach(function (el) {
      try {
        // Anything already in the first viewport is shown immediately:
        // it avoids a visible flash when a deferred script sets the
        // from-state after first paint, and nobody wants to wait for
        // above-the-fold content to animate in.
        if (el.getBoundingClientRect().top < fold * 0.92) {
          showElement(el);
          return;
        }
        var d = el.__evxDelay || 0;
        el.style.opacity = '0';
        el.style.transform = 'translateY(22px)';
        el.style.transition =
          'opacity 0.7s cubic-bezier(0.25,1,0.5,1) ' + d + 'ms, ' +
          'transform 0.7s cubic-bezier(0.25,1,0.5,1) ' + d + 'ms';
        el.style.willChange = 'opacity, transform';
        pending.push(el);
      } catch (err) {
        showElement(el);
      }
    });

    if (!pending.length) return;

    function land(el) {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      el.setAttribute('data-revealed', '');
      // Clear the inline styles once the transition finishes so the
      // element returns to its natural, stylesheet-driven state.
      el.addEventListener(
        'transitionend',
        function handler(e) {
          if (e.propertyName !== 'opacity') return;
          el.style.willChange = '';
          el.style.transition = '';
          el.style.transform = '';
          el.style.opacity = '';
          el.removeEventListener('transitionend', handler);
        },
        false
      );
    }

    var io;
    try {
      io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            try {
              land(entry.target);
            } catch (err) {
              showElement(entry.target);
            }
            io.unobserve(entry.target);
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.01 }
      );
    } catch (err) {
      pending.forEach(showElement);
      return;
    }

    pending.forEach(function (el) {
      try {
        io.observe(el);
      } catch (err) {
        showElement(el);
      }
    });

    // FAILSAFE: nothing may stay invisible. Covers a mis-measure, a
    // throw, an observer that never fires, or a lost trigger.
    window.setTimeout(function () {
      qsa('[data-reveal]').forEach(function (el) {
        var op = parseFloat(window.getComputedStyle(el).opacity);
        if (isNaN(op) || op < 0.05) showElement(el);
      });
    }, 2500);
  }

  /* ============================================================
     2. NAV compact-on-scroll  (ported unchanged)
     ============================================================ */
  function initNavState() {
    var nav = document.getElementById('nav');
    if (!nav) return;
    var ticking = false;

    // The dock carries its own dark surface on every page, so it no
    // longer needs to know whether it is over the hero. All that is
    // left is a shadow that deepens once the page moves under it.
    function update() {
      ticking = false;
      var y = window.pageYOffset || root.scrollTop || 0;
      nav.classList.toggle('nav--scrolled', y > 40);
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    update(); // correct initial state for a restored scroll position

  }

  /* ============================================================
     3. MOBILE DRAWER
     ------------------------------------------------------------
     No-JS shape: the toggle ships hidden and there is no drawer to
     open, so the nav links in the footer sitemap remain the path.
     With JS: a real button, aria-expanded kept in sync, focus moved
     in and restored on close, Esc closes, background inert so
     assistive tech cannot wander behind it, and the body locked.
     ============================================================ */
  function initDrawer() {
    var toggle = document.getElementById('nav-toggle');
    var drawer = document.getElementById('nav-drawer');
    if (!toggle || !drawer) return;

    var backdropTargets = [document.getElementById('main'), document.getElementById('footer')]
      .filter(Boolean);
    var lastFocus = null;
    var open = false;

    function focusables() {
      return qsa('a[href], button:not([disabled])', drawer).filter(function (el) {
        return el.offsetParent !== null;
      });
    }

    function setOpen(next) {
      open = next;
      drawer.setAttribute('data-open', next ? 'true' : 'false');
      toggle.setAttribute('aria-expanded', next ? 'true' : 'false');
      document.body.setAttribute('data-scroll-locked', next ? 'true' : 'false');
      backdropTargets.forEach(function (el) {
        try {
          if (next) el.setAttribute('inert', '');
          else el.removeAttribute('inert');
        } catch (err) {}
      });

      if (next) {
        lastFocus = document.activeElement;
        var f = focusables();
        if (f.length) {
          // Wait out the transform transition before taking focus, or
          // the browser scrolls the still-offscreen panel into view.
          window.setTimeout(function () {
            try { f[0].focus(); } catch (err) {}
          }, 60);
        }
      } else if (lastFocus) {
        try { lastFocus.focus(); } catch (err) {}
        lastFocus = null;
      }
    }

    toggle.addEventListener('click', function () {
      setOpen(!open);
    });

    // Close on any navigation click inside the drawer.
    drawer.addEventListener('click', function (e) {
      var link = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (link) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (!open) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      // Cycle focus within the panel.
      var f = focusables();
      if (!f.length) return;
      var first = f[0];
      var last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    // A resize up to the desktop breakpoint must not leave the page
    // locked behind an invisible drawer.
    window.addEventListener('resize', function () {
      if (open && window.innerWidth >= 900) setOpen(false);
    });

    setOpen(false);
  }

  /* ============================================================
     4. SMOOTH IN-PAGE ANCHOR SCROLL  (ported)
     ============================================================ */
  function initSmoothScroll() {
    var links = qsa('a[href^="#"]');
    if (!links.length) return;

    var header = document.getElementById('nav');
    function headerOffset() {
      return header ? header.getBoundingClientRect().height + 14 : 14;
    }

    function nativeScroll(target, offset) {
      var top = window.pageYOffset + target.getBoundingClientRect().top - offset;
      window.scrollTo({
        top: Math.max(0, top),
        behavior: prefersReducedMotion() ? 'instant' : 'smooth',
      });
    }

    function setFocus(target) {
      var hadTabindex = target.hasAttribute('tabindex');
      if (!hadTabindex) target.setAttribute('tabindex', '-1');
      try {
        target.focus({ preventScroll: true });
      } catch (err) {
        target.focus();
      }
      if (!hadTabindex) {
        target.addEventListener(
          'blur',
          function handler() {
            target.removeAttribute('tabindex');
            target.removeEventListener('blur', handler);
          },
          { once: true }
        );
      }
    }

    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var hash = link.getAttribute('href');
        if (!hash || hash === '#' || hash.charAt(0) !== '#') return;

        var target;
        try {
          target = document.querySelector(hash);
        } catch (err) {
          return; // invalid selector, let the browser handle it
        }
        if (!target) return;

        e.preventDefault();
        nativeScroll(target, headerOffset());
        if (history.replaceState) {
          try { history.replaceState(null, '', hash); } catch (err) {}
        }
        setFocus(target);
      });
    });
  }

  /* ============================================================
     5. MAGNETIC  [data-magnetic]  (ported)
     ============================================================ */
  function initMagnetic() {
    var els = qsa('[data-magnetic]');
    if (!els.length || prefersReducedMotion() || !hasFinePointer()) return;

    var MAX = 8;
    var TEXT_MAX = 4;
    var magnetActive = true;

    els.forEach(function (el) {
      if (el.__evxMagnetic) return;
      el.__evxMagnetic = true;

      var text = el.querySelector('[data-magnetic-text]');
      var raf = 0;
      var tx = 0, ty = 0;

      function apply() {
        raf = 0;
        el.style.transform = 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px)';
        if (text) {
          text.style.transform =
            'translate(' + (tx * (TEXT_MAX / MAX)).toFixed(2) + 'px,' +
            (ty * (TEXT_MAX / MAX)).toFixed(2) + 'px)';
        }
      }
      function schedule() {
        if (!raf) raf = window.requestAnimationFrame(apply);
      }
      function reset() {
        tx = 0; ty = 0;
        if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
        el.style.transform = '';
        if (text) text.style.transform = '';
      }

      el.addEventListener('pointermove', function (e) {
        if (!magnetActive) return;
        var r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        var relX = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        var relY = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        tx = Math.max(-1, Math.min(1, relX)) * MAX;
        ty = Math.max(-1, Math.min(1, relY)) * MAX;
        schedule();
      });
      el.addEventListener('pointerleave', reset);
      el.addEventListener('blur', reset, true);

      onMotionTeardown(function () {
        magnetActive = false;
        reset();
      });
    });
  }

  /* ============================================================
     6. FOOTER YEAR
     ============================================================ */
  function initFooterYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ============================================================
     7. PLAN PREFILL  (/contact/?p=launch|flagship|search)
     ------------------------------------------------------------
     Carries the pricing choice into the form so the highest-intent
     click on the site skips a step. The markup ships with a real
     default selected, so this is pure enhancement.
     ============================================================ */
  function initPlanPrefill() {
    var form = document.getElementById('contact-form');
    if (!form || !window.location.search) return;
    var want;
    try {
      want = new URLSearchParams(window.location.search).get('p');
    } catch (err) {
      return;
    }
    if (!want) return;
    var input = form.querySelector('input[name="need"][value="' + String(want).replace(/"/g, '') + '"]');
    if (input) input.checked = true;
  }

  /* ============================================================
     8. CONTACT FORM
     ------------------------------------------------------------
     The form has a real action + method in the markup, so it works
     with JavaScript off. This only upgrades the experience: it
     validates inline, POSTs in the background, and moves to the
     thanks page without a full reload. On ANY failure it falls back
     to a native submit rather than trapping the visitor.
     ============================================================ */
  function initForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var status = document.getElementById('form-status');
    var submit = form.querySelector('button[type="submit"]');
    var endpoint = form.getAttribute('action') || '';
    var sending = false;

    function say(msg) {
      if (status) status.textContent = msg || '';
    }

    function firstInvalid() {
      var controls = qsa('input, textarea, select', form);
      for (var i = 0; i < controls.length; i++) {
        var c = controls[i];
        if (c.name === 'botcheck') continue;
        if (c.willValidate && !c.checkValidity()) return c;
      }
      return null;
    }

    function clearErrors() {
      qsa('[aria-invalid="true"]', form).forEach(function (c) {
        c.setAttribute('aria-invalid', 'false');
      });
      qsa('.field__error', form).forEach(function (n) { n.textContent = ''; });
    }

    form.addEventListener('submit', function (e) {
      if (sending) {
        e.preventDefault();
        return;
      }
      clearErrors();

      var bad = firstInvalid();
      if (bad) {
        e.preventDefault();
        bad.setAttribute('aria-invalid', 'true');
        var slot = bad.getAttribute('aria-describedby');
        var node = slot ? document.getElementById(slot.split(' ').pop()) : null;
        if (node && node.classList.contains('field__error')) {
          node.textContent = bad.validationMessage;
        }
        say('Please check the highlighted field.');
        try { bad.focus(); } catch (err) {}
        return;
      }

      // Kept for any form that still points at a mailto: address.
      // The contact form posts to Web3Forms, so this branch does not
      // run there; it falls through to the fetch below. If an endpoint
      // is ever removed, this is what stops the form being dead.
      if (endpoint.indexOf('mailto:') === 0) {
        e.preventDefault();
        var data = new FormData(form);
        var label = {
          need: 'What they need',
          budget: 'Budget',
          timing: 'Timing',
          business: 'Business and current site',
          message: 'Notes',
        };
        var lines = [];
        ['business', 'need', 'budget', 'timing', 'message'].forEach(function (k) {
          var v = data.get(k);
          if (v) lines.push(label[k] + ': ' + v);
        });
        lines.push('', 'From: ' + (data.get('name') || '') + ' <' + (data.get('email') || '') + '>');
        var href =
          endpoint +
          '?subject=' + encodeURIComponent('Project enquiry from ' + (data.get('name') || 'the website')) +
          '&body=' + encodeURIComponent(lines.join('\n'));
        say('Opening your email app with the details filled in.');
        window.location.href = href;
        return;
      }

      if (!window.fetch || !window.FormData) return;

      e.preventDefault();
      sending = true;
      if (submit) submit.disabled = true;
      say('Sending.');

      window
        .fetch(endpoint, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        })
        .then(function (res) {
          if (!res.ok) throw new Error('bad status ' + res.status);
          window.location.assign('/thanks/');
        })
        .catch(function () {
          // Hand it back to the browser rather than losing the message.
          sending = false;
          if (submit) submit.disabled = false;
          say('That did not go through. Submitting the normal way.');
          try { form.submit(); } catch (err) {
            say('Something went wrong. Please email me instead.');
          }
        });
    });
  }

  /* ============================================================
     9. REDUCED-MOTION WATCH  (ported)
     ============================================================ */
  function watchReducedMotion() {
    if (!mqReduce) return;
    function onChange() {
      if (!mqReduce.matches) return; // only act when turning Reduce ON
      while (motionTeardowns.length) {
        var fn = motionTeardowns.pop();
        try { fn(); } catch (err) {}
      }
      qsa('[data-reveal]').forEach(showElement);
    }
    if (typeof mqReduce.addEventListener === 'function') {
      mqReduce.addEventListener('change', onChange);
    } else if (typeof mqReduce.addListener === 'function') {
      mqReduce.addListener(onChange); // legacy Safari
    }
  }

  /* ============================================================
     10. THE DEVICE STAGE  (CSS 3D, no libraries)
     ------------------------------------------------------------
     Drag the browser window and phone to spin them; let go and
     they spring back to a composed three-quarter rest pose. With
     a mouse, hovering also parallaxes them slightly, which is
     most of what makes the object feel alive rather than placed.

     Rotation is CLAMPED. CSS 3D has no backface geometry, so a
     free spin would show the flat reverse of the window. Apple's
     own product viewers are constrained the same way.

     Everything degrades: the rest pose is the CSS default, the
     first screenshot ships visible in the markup, and under
     reduced motion the pointer handlers are never wired at all.
     ============================================================ */
  function initStage() {
    var scene = document.getElementById('stage-scene');
    var group = document.getElementById('stage-group');
    if (!scene || !group) return;

    // Project switching is independent of the motion, so it is
    // wired first and works even under reduced motion.
    var shots = qsa('.shot', scene);
    qsa('input[name="stage-project"]').forEach(function (input) {
      input.addEventListener('change', function () {
        if (!input.checked) return;
        shots.forEach(function (s) {
          s.classList.toggle('is-active', s.getAttribute('data-project') === input.value);
        });
      });
    });

    if (prefersReducedMotion()) return;

    var BASE_RY = -21, BASE_RX = 7;
    var MIN_RY = -48, MAX_RY = 6, MIN_RX = -4, MAX_RX = 18;
    var ry = BASE_RY, rx = BASE_RX;      // current angles
    var vy = 0, vx = 0;                  // angular velocity
    var restRy = BASE_RY, restRx = BASE_RX;
    var dragging = false, raf = 0;
    var startX = 0, startY = 0, startRy = 0, startRx = 0, lastX = 0, lastY = 0;

    function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

    function apply() {
      group.style.setProperty('--ry', ry.toFixed(2) + 'deg');
      group.style.setProperty('--rx', rx.toFixed(2) + 'deg');
    }

    function tick() {
      raf = 0;
      if (!dragging) {
        // A light spring toward the rest pose. Slightly
        // under-damped so it overshoots a touch and settles,
        // which reads as weight rather than as a snap.
        var k = 0.085, damp = 0.78;
        vy = (vy + (restRy - ry) * k) * damp;
        vx = (vx + (restRx - rx) * k) * damp;
        ry += vy;
        rx += vx;
        if (
          Math.abs(vy) < 0.015 && Math.abs(vx) < 0.015 &&
          Math.abs(ry - restRy) < 0.06 && Math.abs(rx - restRx) < 0.06
        ) {
          ry = restRy; rx = restRx;
          apply();
          return; // settled: stop the loop entirely, no idle rAF
        }
      }
      apply();
      raf = window.requestAnimationFrame(tick);
    }
    function run() { if (!raf) raf = window.requestAnimationFrame(tick); }

    // Move and release are tracked on WINDOW, not on the element.
    // setPointerCapture looks like the tidier answer, but it
    // retargets events in a way that drops moves, and a drag must
    // also survive the pointer leaving the stage entirely.
    function onDragMove(e) {
      if (!dragging) return;
      if (e.cancelable) e.preventDefault();
      ry = clamp(startRy + (e.clientX - startX) * 0.26, MIN_RY, MAX_RY);
      rx = clamp(startRx - (e.clientY - startY) * 0.16, MIN_RX, MAX_RX);
      // Carry the last frame's movement into the release, so a
      // flick keeps going instead of stopping dead.
      vy = (e.clientX - lastX) * 0.18;
      vx = -(e.clientY - lastY) * 0.12;
      lastX = e.clientX;
      lastY = e.clientY;
      run();
    }

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      scene.setAttribute('data-dragging', 'false');
      window.removeEventListener('pointermove', onDragMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
      run();
    }

    // Belt and braces against the browser's native image drag, which
    // cancels the pointer sequence mid-gesture.
    scene.addEventListener('dragstart', function (e) { e.preventDefault(); });

    scene.addEventListener('pointerdown', function (e) {
      // Let the segmented control and links inside the stage work.
      if (e.target.closest('a, button, label, input')) return;
      if (e.cancelable) e.preventDefault();
      dragging = true;
      scene.setAttribute('data-dragging', 'true');
      startX = lastX = e.clientX;
      startY = lastY = e.clientY;
      startRy = ry;
      startRx = rx;
      vy = vx = 0;
      window.addEventListener('pointermove', onDragMove, { passive: false });
      window.addEventListener('pointerup', endDrag);
      window.addEventListener('pointercancel', endDrag);
      run();
    });

    // Hover parallax, mouse only. It moves the REST pose, so the
    // same spring that handles release handles this too.
    if (hasFinePointer()) {
      scene.addEventListener('pointermove', function (e) {
        if (dragging) return;
        var r = scene.getBoundingClientRect();
        if (!r.width || !r.height) return;
        var px = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        var py = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        restRy = BASE_RY + clamp(px, -1, 1) * 7;
        restRx = BASE_RX - clamp(py, -1, 1) * 5;
        run();
      });
      scene.addEventListener('pointerleave', function () {
        restRy = BASE_RY;
        restRx = BASE_RX;
        run();
      });
    }

    // Stop the loop while the stage is off screen or the tab is
    // hidden. A spring that never settles would otherwise hold a
    // rAF open for the life of the page.
    function pause() {
      if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) pause(); else run();
    });
    if ('IntersectionObserver' in window) {
      try {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (en) { if (!en.isIntersecting) pause(); });
        }, { threshold: 0 }).observe(scene);
      } catch (err) {}
    }

    onMotionTeardown(function () {
      endDrag();
      pause();
      ry = BASE_RY; rx = BASE_RX;
      apply();
    });
  }

  /* ============================================================
     11. PRICING TOOL
     ------------------------------------------------------------
     The three prices are swapped by CSS :has(), so this does NOT
     compute or display any money. It only keeps the sticky bar
     honest: the bar says "from X", so X must follow the lowest
     price currently on screen when the audit toggle flips.
     ============================================================ */
  function initPricing() {
    var tool = document.getElementById('pricing-tool');
    var barAmount = document.getElementById('actionbar-amount');
    if (!tool || !barAmount) return;

    function sync() {
      // Read what the CSS is actually showing rather than keeping a
      // second copy of the numbers in JavaScript.
      var shown = qsa('.price', tool)
        .filter(function (el) { return el.offsetParent !== null; })
        .map(function (el) { return el.textContent.trim(); })
        .filter(Boolean);
      if (!shown.length) return;
      var lowest = shown.reduce(function (a, b) {
        var na = Number(a.replace(/[^0-9]/g, ''));
        var nb = Number(b.replace(/[^0-9]/g, ''));
        return nb < na ? b : a;
      });
      barAmount.textContent = lowest;
    }

    tool.addEventListener('change', sync);
    sync();
  }

  /* ============================================================
     12. STICKY MOBILE ACTION BAR
     ------------------------------------------------------------
     Appears once the hero is gone. Its button is ink, not acid:
     a fixed acid element would share a viewport with the pricing
     CTA and break the one-acid-per-viewport rule.
     ============================================================ */
  function initActionBar() {
    var bar = document.getElementById('actionbar');
    var hero = document.getElementById('hero');
    if (!bar || !hero) return;

    function show(on) { bar.setAttribute('data-show', on ? 'true' : 'false'); }

    if (!('IntersectionObserver' in window)) { show(true); return; }
    try {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { show(!en.isIntersecting); });
      }, { threshold: 0 }).observe(hero);
    } catch (err) {
      show(true);
    }
  }

  /* ---- Boot ---- */
  function init() {
    if (initialised) return;
    initialised = true;

    // Each feature is independent: one throwing must never stop the
    // rest, and reveals must never be left half-applied.
    var features = [
      initReveals, initNavState, initDrawer, initSmoothScroll,
      initMagnetic, initFooterYear, initPlanPrefill, initForm,
      initStage, initPricing, initActionBar,
      watchReducedMotion,
    ];
    features.forEach(function (fn) {
      try { fn(); } catch (err) {}
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
