# CLAUDE.md

Project guidance for Claude Code (and any developer) working on this repo.

## What this is
**Ellevux** is a personal front-end developer **portfolio**, designed in the editorial style of
henriheymans.com: pure-black canvas, bold grotesque headlines with italic-serif accents, one acid-green
accent used sparingly, a **particle-text hero** (the headline is a GPU particle cluster that, on scroll,
flies down and morphs into the "Selected Works" heading), scattered "Selected Works", a playful About,
and a giant footer wordmark.

- **Brand / wordmark:** "Ellevux" (lowercase `ellevux` in the nav, `Ellevux` in the footer wordmark).
- **Person:** "Yuvi" (a 20-year-old web developer) appears in the About copy only.
- Do not confuse the two: the site is branded **Ellevux**; the human is **Yuvi**.

## Stack & hard constraints
- **Static, no build step.** Plain HTML/CSS/JS. There is **no Node/npm** on this machine (git + Python
  3.12 are available). Do not introduce a bundler/framework unless explicitly asked.
- **Libraries via CDN:** Three.js (ES module, via `<script type="importmap">`) for the hero particle-text
  system (a custom GPU `ShaderMaterial`), and GSAP + ScrollTrigger for scroll motion (incl. the hero morph).
- **Must be served over http** (the hero uses ES modules, which browsers block on `file://`).
  Run: `python -m http.server 5510` from the project root, or VS Code **Live Server**. See `README.md`.
- **Deploy:** Netlify Drop / Vercel / GitHub Pages, no build command, output = repo root.

## File map
```
index.html              the whole portfolio (nav · hero · #work · #about · footer/#contact)
assets/css/
  tokens.css            design tokens (single source of truth) — colors, type, spacing, motion
  base.css              reset, base elements, a11y (focus, skip link, reduced-motion)
  components.css        reusable UI (nav, .work-item/.work-art, .pill-btn, .marquee, labels, etc.)
  main.css              page layout for index.html (hero, the Selected Works scatter, about, footer)
assets/js/
  three-hero.js         (ES module) the HERO PARTICLE TEXT. #hero-canvas is now a PAGE-LEVEL fixed layer
                        (z-index:-1, behind all content, on the black bg) — NOT inside #hero. Samples the
                        real <h1> into a GPU ShaderMaterial particle cluster; on scroll the particles fly
                        DOWN and morph into the #work "Selected Works" heading (scroll-scrubbed, no pin) and
                        PERSIST as it. Boots straight to particles (no crisp flash). FAIL OPEN (see below).
  animations.js         GSAP/ScrollTrigger reveals (FAIL OPEN) + nav compact-on-scroll
  main.js               mobile nav, smooth anchor scroll, contextual custom cursor (data-cursor),
                        magnetic buttons, tilt, contact form, footer #year
assets/img/
  work-cafe.png         thumbnail for the Buzzy café work card (a 16:9 screenshot of the comic hero)
  work-lab.png          FORMER thumbnail for the Elements (slot 03) card; NO LONGER USED, slot 03 now
                        renders an SVG text wordmark ("Elements", .work-art__word, sized to fill the tile via
                        viewBox + textLength), not an image. Orphaned on disk (safe to delete).
  work-ellevux-site.png screenshot of the live ellevux.vercel.app hero (16:9), the Ellevux work-card
                        thumbnail (captured headless; replaced the old particle "ellevux" logo)
  portrait.jpg          the About-card B&W portrait (4:5): a moody hooded silhouette at a laptop by a
                        cliffside window. Fills the .portrait slot (object-fit:cover, grayscale). Replaced
                        the "[your photo]" placeholder.
demos/
  cafe/index.html       BUZZY (was Marigold), Selected Works 01, LIVE. A CUTE COMIC / illustrated coffee
                        house (cream paper, Baloo 2 + Caveat, brown ink, amber/terracotta pops, hand-drawn
                        doodles, chunky "comic" buttons) toggled by class="comic" on <body>. A dark
                        "Liquid Coffee Spectacle" (full-page WebGL fluid-coffee shader you stir with the
                        cursor) is preserved UNDERNEATH and disabled by the comic class (its #liquid canvas
                        is display:none + the module early-returns). Built on three (ESM importmap) + GSAP +
                        ScrollTrigger + Draggable + Lenis. NOTE: uses ONE external image
                        (cafe/assets/iced-coffee.png), so this demo is no longer fully self-contained.
  cafe/assets/iced-coffee.png  the owner's own watercolor iced-coffee illustration (bg removed); hero art.
  _cafe-backup-2026-06-16/     backup of the pre-comic café build (reversible; before any rebuilds).
  lab/index.html        ELEMENTS (Selected Works 03), a capabilities showcase (not a site demo). 11 numbered
                        sections: nav, a WebGL 3D render + particle morph, feature tabs, tilt cards,
                        micro-interactions, accordion, form, modal, loaders/progress, count-up stats, footers.
                        Ships LOCKED to the dark .editorial theme (mint #2ee6b6). The theme switcher, the
                        6-colour accent picker, and the #editorial/#lab + ?accent= deep-links were all REMOVED
                        (the .lab playful token set is kept below as dead/reference CSS only). Self-contained;
                        three (ESM importmap) + GSAP.
  aurora/index.html     old luxury-beauty demo, ARCHIVED, unlinked (not referenced anywhere)
  nebula/index.html     old AI-SaaS demo,        ARCHIVED, unlinked
Ellevux WEB/            an Obsidian vault (knowledge base). NOTE: its notes still describe an older
                        "AI-receptionist SaaS" direction and are STALE vs the current portfolio.
CAFE-RESEARCH.md        2026-06-16 research: a 60-café audit + colour/design briefs + a build spec (from a
                        multi-agent workflow). Its "warm-minimalist" spec was superseded (liquid, then
                        comic), but the audit + colour theory stay useful reference.
CAFE-SPEC.md            older research-driven café build spec (reference only now).
CONTRACT*.md, REDESIGN-PLAN.md   historical build specs from earlier iterations (reference only)
```

## Selected Works (in `#work`)
The `.work-art` tiles are **16:9** (uniform; was 4:3). Thumbnails are `object-fit: cover`, grayscale at rest,
full colour on hover.
1. **Buzzy — Coffee House** → `demos/cafe/index.html` (internal; a cute comic / illustrated coffee house, `body.comic` theme, starring the owner's watercolor cup. A dark WebGL "liquid coffee" theme is preserved underneath, toggled off).
2. **Ellevux — AI SaaS** → `https://ellevux.vercel.app/` (external, opens in the **same tab**; the owner's live project). Thumbnail = `work-ellevux-site.png` (live-site screenshot).
3. **Elements — UI, Motion & 3D** → `demos/lab/index.html` (internal; a capabilities showcase, NOT a site demo. 11 sections: nav, a WebGL 3D render + particle morph, feature tabs, tilt cards, micro-interactions, accordion, form, modal, loaders/progress, count-up stats, and footers. Ships LOCKED to Dark Editorial, mint `#2ee6b6` accent. The theme switcher and accent picker were removed (the `.lab` playful theme lives on only as dead/reference CSS). Self-contained; three (ESM) + GSAP. Slot-03 thumbnail is an SVG text wordmark ("Elements", in the same ultra-bold tight face as the footer "Ellevux" wordmark), no longer an image).

The #work `<h2>` "Selected Works" is the morph TARGET: the hero particles land on it and persist (the real
`<h2>` is hidden, see the FAIL-OPEN note in Conventions).

## Design system (use tokens, never hard-code)
- **Palette:** pure black `--bg:#000`, white text, ONE acid-green accent `--accent:#c8fa3c` used
  **sparingly** (the email pill, focus states). Keep green minimal, like the
  reference. The café demo (Buzzy) is its own world, do NOT apply the portfolio palette/fonts to it. It
  is a cute COMIC theme: cream paper, dark-brown ink, one amber/terracotta accent + muted sage, set in
  Baloo 2 (rounded) + Caveat (hand-script) + Inter Tight, with hand-drawn doodles and chunky outlined
  "comic" buttons/cards. (A dark WebGL "liquid coffee" theme lives underneath it, toggled off by body.comic.)
- **Type:** `--font-sans` = **Inter** (display + body), `--font-serif` = **Instrument Serif** (italic
  accent, via `.accent-serif` on a few words like *Works*, *Hey!*). Loaded from Google Fonts in `index.html`.
- Editorial, asymmetric, lots of negative space, oversized type.

## Conventions / rules (follow these)
- **No em-dashes in copy.** Use commas or periods. (Owner preference, applies to all visible text.)
- **Reveals must FAIL OPEN:** `[data-reveal]` hidden states are set in JS only, with try/catch + a ~2.5s
  failsafe, so content is always visible if a script/library never loads.
- **Particle headings FAIL OPEN (read before touching the hero):** the hero `<h1>` and the #work `<h2>`
  ARE hidden via CSS (`html.hero-particled` / `html.work-particled`) so the particle text shows with no
  crisp-text flash — but ONLY after a pre-paint inline `<head>` script confirms WebGL + motion. `three-hero.js`
  REMOVES those classes (revealing the crisp headings) on ANY failure (no WebGL/Three/GSAP, shader-link
  failure, sampling failure, context loss, dispose, morph-not-ready), and the inline script's 2.5s failsafe +
  the module-tag `onerror` are backstops. **Net: if anything WebGL/morph-related fails, the real headings
  always show.** Do NOT hide either heading in CSS without a JS reveal path. The DOM keeps one real `<h1>`/`<h2>`
  (opacity:0, still in the a11y tree).
- **Responsive, mobile-first:** must hold at 375 / 768 / 1280 / 1440 with no horizontal overflow.
- **WCAG 2.1 AA:** semantic landmarks, one `<h1>`, labelled form fields, visible focus on black,
  decorative canvas/SVG `aria-hidden`. Do not use `--text-dim`-level greys for body copy.
- **`prefers-reduced-motion`:** every animation has a calm static fallback. Under reduced-motion the hero
  particle system does NOT run at all (three-hero.js returns early; the inline script does not add the
  hide classes), so the crisp DOM headings show. Reveals and the café 3D + scroll also degrade gracefully.
- **Demos are single files** (CSS + JS inline; Google Fonts + CDN libs allowed). They were "no external
  images, use CSS/SVG/canvas" originally, but the **Buzzy café now uses ONE external image on purpose**
  (`demos/cafe/assets/iced-coffee.png`, the owner's watercolor cup). Real image files in the repo: the two
  thumbnails in `assets/img/` plus that café cup.
- **60fps:** animate transform/opacity only; cap canvas `devicePixelRatio <= 2`; pause rAF offscreen/hidden.

## Gotchas
- **Hero particle layering:** `#hero-canvas` is a page-level `position:fixed; z-index:-1` layer painting on
  the black body bg, BEHIND all section content. This only works because every `section { isolation:isolate }`
  lifts content into its own stacking context above it, and the design is pure-black with transparent
  sections. Don't move the canvas back into `#hero` or change the z-index without re-checking this.
- **Hero morph is scroll-driven, no pin.** Particle positions are placed from each heading's cached document
  position minus live scroll (so it's smooth and correct on a mid-page reload); the morph start ("the break")
  is `start: 'center top'` (~halfway down the hero). There is NO `.hero__scrim` anymore (it caused a hard
  brightness band at the hero/#work seam); hero-text legibility is via content-bound `text-shadow`.
- **Verify visually in a real browser.** The hero is `~100svh`; headless Chrome can't reliably scroll-to-anchor
  and WebGL/loaders may stall. The morph/positions especially need real eyes.
- **Browser caches the ES module + CSS hard.** A plain reload often serves stale `three-hero.js`/CSS. Hard-refresh
  (Ctrl+Shift+R) or serve with `Cache-Control: no-store` while iterating (a tiny `python -c` no-cache server works).
- **Headless screenshots of the live ellevux site:** give Chrome an isolated `--user-data-dir` (a throwaway
  temp profile) or it collides with any open Chrome over the default profile and silently fails to write.
- **Back/forward cache (bfcache).** Work links open in the SAME tab, so returning to the portfolio via the
  browser **Back** button restores it from bfcache WITHOUT re-running init, which used to leave the WebGL
  particle hero dead (white page / frozen). `three-hero.js` handles this: `pagehide` only PAUSES on
  `e.persisted` (keeps the GL context), and `pageshow` on `e.persisted` RELOADS for a clean hero. Do not
  remove that, and verify Back-button behaviour in a real browser after touching the hero lifecycle.
- **Portfolio hero meta caption.** Top-right of the hero there is a small editorial block
  (`.hero-meta-block`: a hairline rule + "Currently / Open for work / Available worldwide" with a slow
  pulsing sage dot), shown >=768px, decorative (`aria-hidden`). It mirrors the welcome line on the left.
- **The Buzzy café was rebuilt several times this session** (earthy Marigold -> warm-minimalist (rejected)
  -> dark "Liquid Coffee Spectacle" -> cute comic -> renamed Buzzy). The comic theme is toggled by
  `class="comic"` on `<body>`; remove it to get the dark liquid version. Headless can NOT scroll its
  100svh/pinned sections, so verify the café by scrolling in a real browser. Backup: `demos/_cafe-backup-2026-06-16/`.
- The Obsidian vault in `Ellevux WEB/` is **out of date** (describes a since-abandoned AI-SaaS concept).
  Realign or ignore it; it is not part of the shipped site.
