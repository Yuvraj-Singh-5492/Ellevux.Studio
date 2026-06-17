# ELLEVUX — BUILD CONTRACT (read this fully before writing any file)

This is a **static, no-build** website. No Node, no bundler. Plain HTML/CSS/JS opened
directly in a browser and deployed by drag-drop to Netlify/Vercel. The working directory is
`D:/Ellevux WEB`. **Use absolute paths when writing files.** In-page references use **relative**
paths (e.g. `assets/css/tokens.css`, `demos/aurora/index.html`).

## Brand
- **Name:** Ellevux — a premium web design & motion studio.
- **Promise:** "We design and engineer immersive websites — 3D, motion, and interaction that win awards."
- **Voice:** confident, modern, precise. Short punchy lines. No corporate filler, no emoji in UI copy.
- **Tagline options (pick consistently):** "Design. Motion. Dimension." / "The web, in higher fidelity."

## Aesthetic (non-negotiable)
- Futuristic / 3D-forward. Dark deep-space base, neon-glass surfaces, violet→cyan→magenta glow.
- **Never hard-code colors/spacing/durations.** Use the CSS custom properties in `assets/css/tokens.css`.
- Read `tokens.css`, `base.css`, `components.css` BEFORE writing markup/CSS — reuse those classes
  (`.container`, `.section`, `.glass`, `.btn`, `.btn--primary`, `.eyebrow`, `.chip`, `.browser`,
  `.field`, `.toggle`, `.tabs`, `.modal`, `.text-gradient`, `.ring-grad`, `.marquee`, etc.).
- Premium polish: generous whitespace (use `--section-y`), balanced type (`text-wrap: balance`),
  soft glows, 1px gradient hairlines, subtle grain. Aim for awwwards quality. No template/Bootstrap vibes.

## Quality bar (apply everywhere)
- **Responsive, mobile-first.** Must look right at 375 / 768 / 1280 / 1440px. Use clamp() & Grid/Flex.
- **Accessible (WCAG 2.1 AA).** Semantic landmarks (`header/nav/main/section/footer`), one `<h1>`,
  logical heading order, alt text, labels tied to inputs, `aria-*` on custom widgets, visible focus
  (already in base.css), keyboard operable, `aria-live` where needed.
- **Performance.** Lazy-load offscreen images (`loading="lazy"`), `defer`/module scripts, no layout
  thrash. Three.js scenes must cap `devicePixelRatio` at 2, pause `requestAnimationFrame` when the
  canvas is offscreen (IntersectionObserver) and on `document.hidden`, and dispose on unload.
- **Reduced motion.** Every JS animation must check
  `window.matchMedia('(prefers-reduced-motion: reduce)').matches` and render a calm static fallback.
- **Robustness.** Every script guards for missing elements (`if (!el) return;`) and missing libs
  (`if (!window.gsap) ...`). Never throw on a page that doesn't have the hook.

## Shared `<head>` (the index.html owner sets this; JS owners must assume it)
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/tokens.css">
<link rel="stylesheet" href="assets/css/base.css">
<link rel="stylesheet" href="assets/css/components.css">
<link rel="stylesheet" href="assets/css/main.css">
```

## Script loading (index.html owner sets EXACTLY this, at end of <body>)
```html
<!-- GSAP (UMD globals: window.gsap, window.ScrollTrigger) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>

<!-- Three.js as ES module via import map -->
<script type="importmap">
{ "imports": {
  "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
  "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
} }
</script>
<script type="module" src="assets/js/three-hero.js"></script>
<script type="module" src="assets/js/showcase-3d.js"></script>

<!-- Interaction + animation (classic scripts, use window.gsap) -->
<script defer src="assets/js/ui-showcase.js"></script>
<script defer src="assets/js/animations.js"></script>
<script defer src="assets/js/main.js"></script>
```
Every JS file self-initializes after DOM is ready (wrap in `DOMContentLoaded` or place logic so the
DOM exists — modules and `defer` both run post-parse). Do not assume execution order between files;
each owns its own concern.

## index.html structure & DOM hooks (CONTRACT — these IDs/classes MUST match across files)

```
body.has-custom-cursor
├─ <a class="skip-link" href="#main">Skip to content</a>
├─ <div id="cursor" aria-hidden="true"><div class="cursor-ring"></div><div class="cursor-dot"></div></div>
├─ <div id="grain" aria-hidden="true"></div>            ← fixed noise overlay (CSS)
├─ <header id="nav">                                     ← nav owner: index.html; behavior: main.js
│    ├─ a.nav__logo  (text "Ellevux" + mark)
│    ├─ nav.nav__menu  > links to #work #showcase #studio #contact
│    ├─ a.btn.btn--primary (CTA "Start a project" → #contact)
│    └─ button#nav-toggle (hamburger, aria-expanded, aria-controls="nav-menu-mobile")  + #nav-menu-mobile panel
├─ <main id="main">
│    ├─ <section id="hero">
│    │     ├─ <canvas id="hero-canvas" aria-hidden="true"></canvas>   ← three-hero.js
│    │     ├─ h1.hero__title (use .text-gradient on key words)
│    │     ├─ p.hero__lead
│    │     ├─ .hero__actions (primary + ghost btn)
│    │     └─ .hero__scroll (scroll cue, [data-reveal] optional)
│    ├─ <section id="work" class="section">     ← SECTION 1: LIVE DEMOS
│    │     ├─ header: .eyebrow "01 — Live Demos" + h2 + lead
│    │     └─ .demo-grid
│    │          ├─ article.demo-card[data-demo="aurora"]
│    │          │     a.demo-card__link[href="demos/aurora/index.html"] wrapping a .browser frame
│    │          │     (browser__url shows "aurora.studio"), title, tags (.chip), "View live →"
│    │          └─ article.demo-card[data-demo="nebula"] → href="demos/nebula/index.html" ("nebula.ai")
│    ├─ <section id="showcase" class="section">  ← SECTION 2: 3D & INTERACTION LAB
│    │     ├─ header: .eyebrow "02 — 3D & Interaction Lab" + h2 + lead
│    │     ├─ .lab-3d  (3 morphing 3D objects)
│    │     │     ├─ figure > canvas#morph-canvas-1 + caption       ← showcase-3d.js
│    │     │     ├─ figure > canvas#morph-canvas-2 + caption
│    │     │     └─ figure > canvas#morph-canvas-3 + caption
│    │     └─ .ui-gallery  (interactive UI/UX components — see ui-showcase.js list)
│    ├─ <section id="studio" class="section">    ← short credibility block: stats + 3-step process + tech marquee
│    └─ <section id="contact" class="section">   ← form#contact-form (name/email/message via .field) + #form-status[aria-live="polite"]
└─ <footer id="footer">  logo, nav, "Built with Three.js + GSAP", year
```

### UI gallery components (live in #showcase, behavior in ui-showcase.js)
Build these as real, interactive demos inside `.ui-gallery` (each in a `.glass` card with a label):
1. **Magnetic button** — element with `[data-magnetic]` (main.js handles the magnet math).
2. **Tilt glass card** — `[data-tilt]` (main.js handles 3D tilt on pointer move).
3. **Toggle switch** — `button.toggle[role="switch"][aria-checked]` + label (ui-showcase.js).
4. **Segmented tabs** — `.tabs` with `.tabs__btn[role="tab"][aria-selected]` + `.tabs__pill` + panels (ui-showcase.js moves the pill).
5. **Floating-label input** — `.field` (CSS-only float; no JS needed).
6. **Modal** — trigger `button[data-modal-open="demo-modal"]` + `#demo-modal.modal-overlay` with `.modal` and `.modal__close` (ui-showcase.js: open/close, ESC, focus trap, scroll lock).
7. **Animated counter / progress** — `[data-counter]` (ui-showcase.js counts up when revealed) + `.progress`.
8. **Tooltip** — `.tip` with `.tip__bubble` (CSS-only).

## JS file responsibilities & exact hooks
- **assets/js/three-hero.js** (module): full-bleed morphing object behind hero on `#hero-canvas`.
  An icosahedron with a vertex-displacement shader (simplex/curl-ish noise) that slowly morphs;
  violet→cyan emissive look matching tokens. Subtle pointer parallax. Cap DPR ≤2, pause offscreen,
  handle resize, reduced-motion = static frame. Transparent background so page bg shows.
- **assets/js/showcase-3d.js** (module): three independent small scenes on `#morph-canvas-1/2/3`.
  Suggested: (1) morphing icosahedron/blob, (2) torus knot with wireframe/distortion, (3) particle
  field forming a shape. Each rotates/morphs gently, reacts subtly to hover. Same perf rules.
  If a canvas id is absent, skip it silently.
- **assets/js/ui-showcase.js** (classic): wires toggle, tabs (+ moving pill), modal (open/close/ESC/
  focus-trap/scroll-lock), counters, and any other gallery widget logic. Pure, dependency-light.
- **assets/js/animations.js** (classic, uses window.gsap + ScrollTrigger): reveal-on-scroll for
  `[data-reveal]` (fade+rise, with optional `data-reveal-delay`), parallax for `[data-parallax]`
  (`data-speed`), nav state on scroll, section heading reveals. Register ScrollTrigger. If gsap is
  missing, make `[data-reveal]` visible (no hidden content). Respect reduced-motion (just show).
- **assets/js/main.js** (classic): custom cursor (`#cursor` dot+ring, grows on interactive hover;
  disable on touch / coarse pointers and remove `has-custom-cursor`), mobile nav toggle (a11y:
  aria-expanded, ESC, click-out, lock scroll), magnetic buttons `[data-magnetic]`, tilt `[data-tilt]`,
  smooth in-page anchor scroll with header offset, contact form fake-submit (preventDefault →
  show success in `#form-status`, reset). Respect reduced-motion (skip cursor/magnet/tilt).

## CSS ownership
- `tokens.css`, `base.css`, `components.css` — **already written. Do NOT modify.** Reuse their classes.
- `assets/css/main.css` — owned by the index.html agent: page-specific layout (hero, demo-grid,
  lab-3d grid, ui-gallery grid, studio, contact, footer, grain overlay, cursor styles, nav layout,
  responsive breakpoints). Keep `[data-reveal]` initial state here (opacity:0; translateY) so JS reveals it,
  BUT guard: if JS/gsap fails, a `<noscript>`-friendly fallback or `.no-js` rule keeps content visible.
  Simplest robust approach: set the hidden state only under `html.js` (main.js adds `js` class ASAP) or
  via `[data-reveal]` default visible + animations.js sets the from-state. Prefer: animations.js sets
  initial hidden via gsap.set so non-JS users always see content.

## Demo sites (fully self-contained, one file each, own distinct palette to show range)
- **demos/aurora/index.html** — luxury skincare/beauty brand landing ("Aurora"). Elegant, warm,
  soft gradients, refined serif+sans, product hero, ingredients/benefits, testimonial, CTA, footer.
  Distinct from Ellevux (lighter, organic) but premium. All CSS in a `<style>` block, minimal vanilla
  JS for any interaction (mobile nav, reveal). Google Fonts allowed. Include a "← Back to Ellevux"
  link to `../../index.html`. Responsive + accessible.
- **demos/nebula/index.html** — AI SaaS startup landing ("Nebula"). Dark, techy, gradient mesh,
  feature grid, dashboard mockup (pure CSS/SVG), pricing tiers, logos strip, CTA, footer. Self-contained
  like above. Include "← Back to Ellevux" link to `../../index.html`. Responsive + accessible.

## Definition of done (per file)
Self-contained, no console errors, matches the contract's IDs/classes, responsive at the 4 breakpoints,
keyboard-accessible, reduced-motion safe, and visually on-brand. Return a short summary of what you wrote.
