/* ============================================================
   ELLEVUX · animations.js   (classic script — consumes the
   GSAP + ScrollTrigger UMD globals; BOTH are optional)
   Personal front-end developer portfolio · Henri-Heymans style.
   ------------------------------------------------------------
   Calm, editorial scroll motion. Owns exactly these things:

     • [data-reveal]   subtle fade + rise as blocks enter view.
                       FAIL OPEN, always:
                         - once:true (permanent — never reverse)
                         - per-element from-state in try/catch
                         - ~2.5s failsafe force-shows anything
                           still hidden (mis-measure / throw /
                           lost trigger)
                         - no gsap, no ScrollTrigger, or reduced
                           motion → show EVERYTHING and return.

     • #work items     the scattered project tiles drift/parallax
                       in subtly as the works section scrolls
                       (transform-only, gated to fine layouts).

     • footer wordmark the giant "Ellevux" lockup reveals (rise +
                       fade) when the footer enters view.

     • #nav state      gains .nav--scrolled past ~40px (compact /
                       frosted). Works with OR without ScrollTrigger
                       via a tiny passive scroll listener.

   The nav "AVAILABLE FOR FREELANCE WORK" marquee is PURE CSS
   (components.css .marquee__track) — no JS needed; it already
   pauses under prefers-reduced-motion. We never touch it here.

   Initial hidden state is set imperatively (gsap.set) per element,
   never in CSS, so non-JS / no-gsap / reduced-motion visitors
   ALWAYS see fully-rendered content.
   ============================================================ */

(function () {
  'use strict';

  /* Shared namespace (kept for any downstream consumer). */
  window.Ellevux = window.Ellevux || {};

  var prefersReducedMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function toArray(list) {
    return Array.prototype.slice.call(list || []);
  }
  function getReveals() {
    return toArray(document.querySelectorAll('[data-reveal]'));
  }

  // Force an element into its natural, fully-visible state. Used by the
  // no-gsap / reduced-motion paths AND the failsafe net.
  function showElement(el) {
    if (!el) return;
    el.style.opacity = '';
    el.style.transform = '';
    el.style.visibility = '';
    el.style.willChange = '';
    el.setAttribute('data-revealed', '');
  }

  // Expose a manual reveal hook for any downstream consumer.
  window.Ellevux.reveal = showElement;

  /* --------------------------------------------------------
     NAV compact-on-scroll — toggle .nav--scrolled past ~40px.
     Plain passive scroll listener: works with or without GSAP.
     -------------------------------------------------------- */
  function initNavState() {
    var nav = document.getElementById('nav');
    if (!nav) return;

    var doc = document.documentElement;
    var ticking = false;

    function update() {
      ticking = false;
      var y = window.pageYOffset || doc.scrollTop || 0;
      nav.classList.toggle('nav--scrolled', y > 40);
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    update(); // correct initial state (e.g. restored scroll position).
  }

  /* --------------------------------------------------------
     Early-exit path — always leave content fully visible.
     -------------------------------------------------------- */
  function bootNoMotion() {
    getReveals().forEach(showElement);
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initNavState, { once: true });
    } else {
      initNavState();
    }
  }

  if (!window.gsap || prefersReducedMotion || !window.ScrollTrigger) {
    bootNoMotion();
    return;
  }

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  try {
    gsap.registerPlugin(ScrollTrigger);
  } catch (err) {
    // If registration somehow throws, fall back to fully-visible content.
    bootNoMotion();
    return;
  }

  /* --------------------------------------------------------
     REVEALS — subtle fade + rise. One tween per element, or a
     stagger group of immediate siblings sharing a parent.
     -------------------------------------------------------- */
  var FROM = { opacity: 0, y: 28, willChange: 'transform, opacity' };

  function finalize(el) {
    el.style.willChange = '';
    el.style.transform = '';
    el.style.opacity = '';
    el.setAttribute('data-revealed', '');
  }

  // Build one reveal tween for a single element or a stagger group.
  // Returns true on success; on throw, force-shows the target(s).
  function buildReveal(target, opts) {
    opts = opts || {};
    var lead = Array.isArray(target) ? target[0] : target;
    try {
      gsap.set(target, FROM);
      var toVars = {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        delay: opts.delay || 0,
        scrollTrigger: {
          trigger: opts.trigger || lead,
          start: 'top 90%',
          once: true, // permanent — NEVER reverse.
        },
        onComplete: function () {
          (Array.isArray(target) ? target : [target]).forEach(finalize);
        },
      };
      if (Array.isArray(target) && target.length > 1) {
        toVars.stagger = 0.08;
      }
      gsap.to(target, toVars);
      return true;
    } catch (err) {
      (Array.isArray(target) ? target : [target]).forEach(showElement);
      return false;
    }
  }

  function initReveals() {
    var reveals = getReveals();
    if (!reveals.length) return;

    var groups = new Map(); // parent → [els] for sibling stagger

    reveals.forEach(function (el) {
      var parent = el.parentNode || document.body;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(el);
    });

    groups.forEach(function (els) {
      if (els.length === 1) buildReveal(els[0], {});
      else buildReveal(els, { trigger: els[0] });
    });

    // FAILSAFE: after 2.5s, force-show any [data-reveal] still hidden.
    // Guarantees content is never permanently invisible if a trigger
    // never fires (mis-measure, throw, lost trigger, etc.).
    window.setTimeout(function () {
      getReveals().forEach(function (el) {
        var op = parseFloat(window.getComputedStyle(el).opacity);
        if (isNaN(op) || op < 0.05) showElement(el);
      });
    }, 2500);
  }

  /* --------------------------------------------------------
     SCATTERED WORK — the project tiles drift in + gently
     parallax as the #work section scrolls. Subtle + editorial.
     Each tile is independent (try/catch) so one failure never
     hides the others. Skipped on narrow/stacked layouts where
     the scatter collapses to a clean column.
     -------------------------------------------------------- */
  function initWorkScatter() {
    var section = document.getElementById('work');
    if (!section) return;

    // Only the real, interactive project links — leave the decorative
    // aria-hidden "coming soon" placeholders statically visible so a
    // missed trigger can never blank them out.
    var items = toArray(
      section.querySelectorAll('.work-item:not([aria-hidden="true"])')
    );
    if (!items.length) return;

    // On the mobile stack the items are a tidy column — keep them calm
    // (the section-level [data-reveal] still brings them in).
    var wide =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(min-width: 768px)').matches;
    if (!wide) return;

    items.forEach(function (el, i) {
      try {
        // Gentle entrance: rise + settle as each tile enters view.
        gsap.set(el, { opacity: 0, y: 40, willChange: 'transform, opacity' });
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          delay: (i % 2) * 0.06,
          scrollTrigger: {
            trigger: el,
            start: 'top 92%',
            once: true,
          },
          onComplete: function () {
            el.style.willChange = '';
            // Don't strip transform — the parallax tween below owns it.
            el.style.opacity = '';
            el.setAttribute('data-revealed', '');
          },
        });

        // Subtle scroll-linked parallax (alternating directions, small
        // amplitude so the editorial scatter feels alive, not busy).
        var depth = ((i % 3) - 1) * 14; // -14, 0, +14 px-ish drift
        if (depth !== 0) {
          gsap.fromTo(
            el,
            { yPercent: 0 },
            {
              yPercent: depth >= 0 ? 6 : -6,
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
              },
            }
          );
        }
      } catch (err) {
        showElement(el);
      }
    });

    // FAILSAFE: the scatter tiles are forced to opacity:0 inline and rely
    // on their OWN per-tile ScrollTrigger (the parent #work [data-reveal]
    // can't save them — the inline opacity wins). They carry no
    // [data-reveal], so the global net in initReveals() never sees them.
    // After ~2.5s, force-show any tile still hidden (mis-measure of an
    // absolutely-positioned tile, a very short viewport where 'top 92%'
    // is never crossed, a lost trigger after refresh, etc.). Mirrors the
    // [data-reveal] and footer-wordmark failsafes — reveals FAIL OPEN.
    window.setTimeout(function () {
      items.forEach(function (el) {
        var op = parseFloat(window.getComputedStyle(el).opacity);
        if (isNaN(op) || op < 0.05) showElement(el);
      });
    }, 2500);
  }

  /* --------------------------------------------------------
     FOOTER WORDMARK — the giant "Ellevux" lockup reveals
     (rise + fade) as the footer enters view. Single element,
     fail-open via try/catch + the global failsafe.
     -------------------------------------------------------- */
  function initFooterWordmark() {
    var word = document.querySelector('.footer__wordmark, .big-wordmark');
    if (!word) return;
    try {
      gsap.set(word, { opacity: 0, y: 48, willChange: 'transform, opacity' });
      gsap.to(word, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: word,
          start: 'top 95%',
          once: true,
        },
        onComplete: function () {
          word.style.willChange = '';
          word.style.transform = '';
          word.style.opacity = '';
          word.setAttribute('data-revealed', '');
        },
      });
      // Local failsafe in case the trigger never resolves.
      window.setTimeout(function () {
        var op = parseFloat(window.getComputedStyle(word).opacity);
        if (isNaN(op) || op < 0.05) showElement(word);
      }, 2500);
    } catch (err) {
      showElement(word);
    }
  }

  /* --------------------------------------------------------
     Boot
     -------------------------------------------------------- */
  function init() {
    initReveals();
    initWorkScatter();
    initFooterWordmark();
    initNavState();
    try { ScrollTrigger.refresh(); } catch (err) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-measure after full load and after fonts settle — both can shift
  // trigger start/end lines.
  window.addEventListener('load', function () {
    try { ScrollTrigger.refresh(); } catch (err) {}
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready
      .then(function () {
        try { ScrollTrigger.refresh(); } catch (err) {}
      })
      .catch(function () {});
  }
})();
