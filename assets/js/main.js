/* ============================================================
   ELLEVUX · main.js   (classic script, vanilla JS — no deps)
   Personal front-end developer portfolio · Henri-Heymans style.
   ------------------------------------------------------------
   Core site interactions + restrained motion polish:

     1. <html class="js">   progressive-enhancement hook
     2. Smooth in-page anchor scroll  (a[href^="#"] — the nav
                    Projects/About/Contact links + the hero
                    "scroll to begin" cue) with a fixed-nav
                    offset + a11y focus move. Reduced motion =
                    instant jump.
     3. Work-thumbnail hover  — adds .is-hover on [data-cursor]
                    tiles and drives an optional, tasteful custom
                    cursor that follows the pointer showing the
                    tile's label (e.g. "VIEW"). Pointer-fine only;
                    the CSS hover (scale + green "View" cue) is the
                    baseline and works without any of this.
     4. Magnetic  [data-magnetic] (+ inner [data-magnetic-text]) —
                    a subtle pull toward the pointer on the email
                    pill + the scroll-cue. Fine-pointer only.
     5. Footer year  (#year)

   The mailto: lives in the markup (footer pill href) — no JS
   handler needed; it just works (and keeps working without JS).

   Principles enforced everywhere:
     · Guard for missing hooks — every feature no-ops if absent.
     · Respect prefers-reduced-motion (calm; magnetic + custom
       cursor OFF) and (hover:none)/coarse pointer (touch → no
       custom cursor, no magnet).
     · Idempotent: a single init, guarded against double-include.
     · Content stays visible + usable if any feature is absent.
     · No console errors.
   ============================================================ */

(function () {
  'use strict';

  /* ---- 0. Progressive enhancement: mark JS as available ASAP ---- */
  var root = document.documentElement;
  root.classList.add('js');

  /* ---- Environment ---- */
  var mqReduce =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
  function prefersReducedMotion() {
    return !!(mqReduce && mqReduce.matches);
  }
  // Pointer-precision gate so magnetic + custom cursor only run for a
  // real mouse (never on touch / coarse pointers).
  function hasFinePointer() {
    return (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches
    );
  }

  /* Idempotent guard — a double include only wires behaviour once. */
  var initialised = false;

  // Teardown hooks for motion-bearing features, so a runtime switch to
  // Reduce Motion (toggled at the OS level after load) can calm them.
  var motionTeardowns = [];
  function onMotionTeardown(fn) {
    if (typeof fn === 'function') motionTeardowns.push(fn);
  }

  function init() {
    if (initialised) return;
    initialised = true;

    initSmoothScroll();
    initWorkHover();
    initMagnetic();
    initFooterYear();
    watchReducedMotion();
  }

  /* ============================================================
     Re-gate on Reduce Motion change
     ------------------------------------------------------------
     prefers-reduced-motion is read once when features are wired.
     If the user enables Reduce Motion at the OS level AFTER load,
     calm the motion-bearing enhancements (custom "VIEW" cursor +
     magnetic pull): reset transforms and remove the cursor node.
     The smooth-scroll path re-checks prefersReducedMotion() live,
     so it needs no teardown. addEventListener with an addListener
     fallback for older Safari.
     ============================================================ */
  function watchReducedMotion() {
    if (!mqReduce) return;
    function onChange() {
      if (!mqReduce.matches) return; // only act when turning Reduce ON
      while (motionTeardowns.length) {
        var fn = motionTeardowns.pop();
        try { fn(); } catch (err) {}
      }
    }
    if (typeof mqReduce.addEventListener === 'function') {
      mqReduce.addEventListener('change', onChange);
    } else if (typeof mqReduce.addListener === 'function') {
      mqReduce.addListener(onChange); // legacy Safari
    }
  }

  /* ============================================================
     2. SMOOTH IN-PAGE ANCHOR SCROLL  (a[href^="#"])
     ------------------------------------------------------------
     Scrolls to in-page targets with an offset for the fixed
     header, then moves focus to the target for keyboard /
     screen-reader users. Honours prefers-reduced-motion (instant
     jump). Native window.scrollTo — no smooth-scroll library.
     ============================================================ */
  function initSmoothScroll() {
    var links = document.querySelectorAll('a[href^="#"]');
    if (!links.length) return;

    var header = document.getElementById('nav');

    function headerOffset() {
      // Live header height so the target isn't hidden beneath the fixed
      // bar; +14px breathing room; small fallback if no header.
      return header ? header.getBoundingClientRect().height + 14 : 14;
    }

    Array.prototype.forEach.call(links, function (link) {
      link.addEventListener('click', function (e) {
        var hash = link.getAttribute('href');
        if (!hash || hash === '#' || hash.charAt(0) !== '#') return;

        var target;
        try {
          target = document.querySelector(hash);
        } catch (err) {
          return; // invalid selector → let the browser handle it.
        }
        if (!target) return; // unknown target → default behaviour.

        e.preventDefault();
        nativeScroll(target, headerOffset());

        // Update the URL hash without a second jump.
        if (history.replaceState) {
          try { history.replaceState(null, '', hash); } catch (err) {}
        }

        setFocus(target);
      });
    });

    function nativeScroll(target, offset) {
      var top =
        window.pageYOffset + target.getBoundingClientRect().top - offset;
      top = Math.max(0, top);
      window.scrollTo({
        top: top,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
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
  }

  /* ============================================================
     3. WORK-THUMBNAIL HOVER  +  optional custom "VIEW" cursor
     ------------------------------------------------------------
     The CSS already scales the art + reveals a centred green
     "View" cue on :hover / :focus-visible — that is the baseline
     and needs no JS. As a tasteful enhancement on a real mouse,
     we float a small label that tracks the pointer over each
     [data-cursor] tile (text from data-cursor, default "View").

     · Fine pointer + no reduced-motion ONLY (touch / coarse → off).
     · The cursor node is created lazily and self-styled inline so
       it never depends on CSS we don't own. aria-hidden, pointer-
       events:none — purely decorative, never a focus/AT trap.
     · Per-tile guard; idempotent.
     ============================================================ */
  function initWorkHover() {
    // Only the real, interactive project tiles carry [data-cursor].
    var tiles = document.querySelectorAll('.work-item[data-cursor]');
    if (!tiles.length) return;

    var enableCursor = hasFinePointer() && !prefersReducedMotion();
    var cursorEl = null;
    var raf = 0;
    var px = 0, py = 0;

    function ensureCursor() {
      if (cursorEl || !enableCursor) return cursorEl;
      cursorEl = document.createElement('div');
      cursorEl.className = 'evx-cursor';
      cursorEl.setAttribute('aria-hidden', 'true');
      var s = cursorEl.style;
      s.position = 'fixed';
      s.top = '0';
      s.left = '0';
      s.zIndex = '9999';
      s.pointerEvents = 'none';
      s.padding = '0.5em 0.85em';
      s.borderRadius = '999px';
      s.font =
        '600 0.7rem/1 "Inter", Helvetica, Arial, sans-serif';
      s.letterSpacing = '0.12em';
      s.textTransform = 'uppercase';
      s.color = 'var(--accent-ink, #0a0a0a)';
      s.background = 'var(--accent, #c8fa3c)';
      s.whiteSpace = 'nowrap';
      s.opacity = '0';
      s.transform = 'translate(-50%, -50%) scale(0.7)';
      s.transition = 'opacity 180ms ease, transform 220ms cubic-bezier(0.16,1,0.3,1)';
      s.willChange = 'transform, opacity';
      document.body.appendChild(cursorEl);
      return cursorEl;
    }

    function applyPos() {
      raf = 0;
      if (!cursorEl) return;
      // Compose with the show/hide scale so movement never overrides it.
      var scale = cursorEl.getAttribute('data-show') === '1' ? 1 : 0.7;
      cursorEl.style.transform =
        'translate(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px) translate(-50%,-50%) scale(' + scale + ')';
    }
    function schedulePos() {
      if (!raf) raf = window.requestAnimationFrame(applyPos);
    }

    Array.prototype.forEach.call(tiles, function (tile) {
      if (tile.__evxWork) return;
      tile.__evxWork = true;

      var label = tile.getAttribute('data-cursor') || 'View';

      tile.addEventListener('pointerenter', function () {
        tile.classList.add('is-hover');
        if (!enableCursor) return;
        var c = ensureCursor();
        if (!c) return;
        c.textContent = label;
        c.setAttribute('data-show', '1');
        c.style.opacity = '1';
        schedulePos();
      });

      tile.addEventListener('pointermove', function (e) {
        if (!enableCursor || !cursorEl) return;
        px = e.clientX;
        py = e.clientY;
        schedulePos();
      });

      function leave() {
        tile.classList.remove('is-hover');
        if (cursorEl) {
          cursorEl.setAttribute('data-show', '0');
          cursorEl.style.opacity = '0';
          schedulePos();
        }
      }
      tile.addEventListener('pointerleave', leave);
      // Pointer cancellation / dragging off the window.
      tile.addEventListener('pointercancel', leave);
    });

    // If the pointer leaves the window entirely, hide the cursor.
    // 'pointerleave'/'mouseleave' do not reliably fire on `document`
    // across browsers, so listen on documentElement for 'mouseleave'
    // AND treat 'pointerout' with no relatedTarget (left the viewport)
    // as a leave. The per-tile pointerleave/cancel handlers above stay
    // the primary path; these just catch the "mouse exits the window
    // without crossing a tile boundary" case so the label never sticks.
    function hideCursor() {
      if (cursorEl) {
        cursorEl.setAttribute('data-show', '0');
        cursorEl.style.opacity = '0';
      }
    }
    if (enableCursor) {
      document.documentElement.addEventListener('mouseleave', hideCursor);
      document.addEventListener('pointerout', function (e) {
        if (!e.relatedTarget) hideCursor();
      });
    }

    // If Reduce Motion is enabled after load, stop feeding the custom
    // cursor (the existing CSS hover cue remains as the calm baseline)
    // and remove the floating node. The per-tile handlers already gate
    // on enableCursor, so flipping it is enough to silence them.
    onMotionTeardown(function () {
      enableCursor = false;
      if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
      if (cursorEl) {
        if (cursorEl.parentNode) cursorEl.parentNode.removeChild(cursorEl);
        cursorEl = null;
      }
    });
  }

  /* ============================================================
     4. MAGNETIC  [data-magnetic]  (+ inner [data-magnetic-text])
     ------------------------------------------------------------
     A subtle pull toward the pointer — small + restrained. The
     element drifts a few px toward the cursor; an optional inner
     [data-magnetic-text] drifts a touch further for depth. Springs
     back on leave. transform-only (GPU, 60fps). OFF under reduced
     motion or coarse / no pointer. Per-element guard; idempotent.
     ============================================================ */
  function initMagnetic() {
    var els = document.querySelectorAll('[data-magnetic]');
    if (!els.length || prefersReducedMotion() || !hasFinePointer()) return;

    var MAX = 8;       // px the wrapper may drift (restrained)
    var TEXT_MAX = 4;  // extra drift for the inner label
    var magnetActive = true; // flipped off if Reduce Motion turns on later

    Array.prototype.forEach.call(els, function (el) {
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

      el.addEventListener('pointermove', function (e) {
        if (!magnetActive) return;
        var r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        var relX = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        var relY = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        // clamp to [-1, 1] then scale to MAX
        relX = Math.max(-1, Math.min(1, relX));
        relY = Math.max(-1, Math.min(1, relY));
        tx = relX * MAX;
        ty = relY * MAX;
        schedule();
      });

      function reset() {
        tx = 0; ty = 0;
        if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
        el.style.transform = '';
        if (text) text.style.transform = '';
      }
      el.addEventListener('pointerleave', reset);
      el.addEventListener('blur', reset, true);

      // If Reduce Motion is enabled after load, disable the pull and
      // spring this element back to rest. The shared magnetActive flag
      // short-circuits any in-flight pointermove for every element.
      onMotionTeardown(function () {
        magnetActive = false;
        reset();
      });
    });
  }

  /* ============================================================
     5. FOOTER YEAR  (#year)
     ============================================================ */
  function initFooterYear() {
    var yearEl = document.getElementById('year');
    if (!yearEl) return;
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ---- Boot ---- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
