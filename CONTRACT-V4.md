# ELLEVUX v4 — RESTORE THE STUDIO (clean look) — build contract

**Undo the AI-receptionist pivot. Ellevux is again a premium WEB-DESIGN & MOTION STUDIO** — the
user's original concept, copy, and elements. The ellevux.vercel.app reference is used ONLY for its
clean/restrained VISUAL STYLE, not its content. Keep the 3D. Static, no-build. Work dir `D:/Ellevux WEB`.

> Read `CONTRACT-V2.md` (the authoritative studio structure/hooks/copy direction) ALONGSIDE this file.
> v4 = restore that studio (post-trim section set) + apply the current clean v3 aesthetic + bring the 3D back.

## What to RESTORE (the studio concept — their elements)
Section order (the trimmed studio the user last had — do NOT re-add testimonials/about-studio/FAQ/CTA-band):
```
#nav    — wordmark "Ellevux"; links Work · Services · Contact; primary CTA "Start a project" → #contact
#hero   — <canvas id="hero-canvas"> 3D morph behind; eyebrow "Web design & motion studio · est. 2018";
          h1 "We build the web in higher fidelity" (accent on "higher fidelity"); lead:
          "We design and engineer the kind of websites people screenshot — real-time 3D, choreographed
           motion, and interaction built to ship fast and stay fast. Strategy to launch, under one roof.";
          CTAs "View selected work" → #work + "Explore the lab" → #showcase; proof row
          "Awwwards SOTD ×3 · FWA & CSSDA · 120+ launches".
#clients— "Trusted by" logo wall (Halcyon, Northwind, Veridian, Sable, Quanta, Driftwell, Meridian).
#work   — "01 — Selected Work": two .case/demo cards in browser frames →
          Aurora (Luxury Beauty) → demos/aurora/index.html ; Nebula (AI SaaS) → demos/nebula/index.html.
          Each: index, mono meta (Sector/Services/Year/Role), a bold outcome metric, "View case".
#services— "02 — Capabilities" bento: Web Design, WebGL/3D, Brand & Motion, Design Systems,
          Art Direction, Front-end Engineering (icon + scope + deliverables).
#showcase— "03 — The Lab" · 3D & Interaction Lab: THREE morph canvases #morph-canvas-1/2/3
          (captions e.g. "A hero that breathes / Structure with soul / Data you can feel") + the UI
          gallery widgets (magnetic button, tilt card, toggle, segmented tabs, floating-label input,
          modal trigger #demo-modal, animated counters + progress, tooltip).
#contact— "04 — Contact": form (name/email/message) + studio details; #form-status.
#footer — Work/Services/The Lab/Contact, contact (hello@ellevux.studio), socials, award badges,
          big "ELLEVUX" wordmark.
```
The two demo files (`demos/aurora/index.html`, `demos/nebula/index.html`) are INTACT — keep & link them.

## What to REMOVE (the AI-SaaS pivot content — currently live in index.html)
Delete entirely: the #console (live AI-call terminal + metrics), #pricing, #metrics(AI stat band),
#features(AI capability cards), #voice (Custom AI Voice & Tone), #how(AI steps), #faq(AI), #cta(AI),
and ALL AI-receptionist copy ("Stop missing calls", "AI receptionist", "books jobs", etc.).
`assets/js/console.js` → delete. Pricing toggle logic → remove.

## STYLING — the clean look (this is what the reference was for)
**Reuse the current clean v3 design system** (it already IS the calm/restrained dark aesthetic):
- Keep the deep-navy palette, refined single **--accent (indigo #8b93ff)**, soft shadows, fine borders,
  rounded radii, generous whitespace, calm motion. NO return to heavy neon violet/cyan/magenta.
- **Type:** Manrope (sans) + **Instrument Serif italic** accent (use `.accent-serif` on the hero
  highlight "higher fidelity") + JetBrains Mono for small labels/code-ish bits.
- The 3D may use the accent + ONE restrained secondary hue (e.g. a soft cyan/green) — keep it tasteful
  and calm, not a neon blob. The hero 3D must sit BEHIND text and never wash out the headline (scrim).
- Clean, editorial, premium — matching the reference's restraint, applied to the studio content.

## 3D — RESTORE (was deleted in the pivot; recreate, calm & clean)
- `assets/js/three-hero.js` (NEW/recreate, ES module): a calm morphing icosahedron on #hero-canvas,
  subtle, behind the hero, accent-tinted, tamed (no headline wash-out), pointer parallax.
- `assets/js/showcase-3d.js` (NEW/recreate, ES module): three small morph scenes on #morph-canvas-1/2/3
  (blob · torus knot · particle field), calm/clean.
- BOTH keep the perf contract: DPR≤2, IntersectionObserver pause offscreen, pause on document.hidden,
  dispose on pagehide, resize handling, prefers-reduced-motion = ONE static well-framed frame, guard
  missing canvas/WebGL context. Re-add the import map + the two `type=module` script tags in index.html.

## JS behavior
- `animations.js` — subtle GSAP reveals (fail OPEN: once, try/catch, ~2.5s failsafe) + nav scroll state.
- `main.js` — mobile nav, smooth anchor scroll (nav offset), contact form, footer #year, magnetic/tilt
  ON the UI-gallery demo widgets + buttons (it's a motion studio — tasteful, subtle), optional subtle
  custom cursor (keep it light or skip to stay clean). NO AI pricing toggle.
- `ui-showcase.js` — toggle, segmented tabs (+ pill; .tabs MUST stay position:relative), modal
  (focus-trap), counters, tooltip, floating label. (FAQ logic now unused — fine.)

## Script loading (index.html, end of body — 3D modules are BACK)
```html
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script type="importmap">{ "imports": { "three":"https://unpkg.com/three@0.160.0/build/three.module.js","three/addons/":"https://unpkg.com/three@0.160.0/examples/jsm/" } }</script>
<script type="module" src="assets/js/three-hero.js"></script>
<script type="module" src="assets/js/showcase-3d.js"></script>
<script defer src="assets/js/ui-showcase.js"></script>
<script defer src="assets/js/animations.js"></script>
<script defer src="assets/js/main.js"></script>
```

## File ownership by phase
- P1 System: design-system agent → tokens.css (keep clean palette; ensure studio components exist),
  components.css (restore studio components: .browser, .demo-card/.case, .bento, .lab-3d, .ui-gallery
  widgets, .toggle/.tabs/.tip/.modal/.field/.progress; keep clean styling), base.css.
- P2 Page: index agent → index.html ONLY (restore studio structure+copy above, remove ALL AI-SaaS
  content, re-add 3D canvases + importmap + module tags).
- P3 Build (parallel): main.css (studio layout, clean look) · three-hero.js · showcase-3d.js ·
  JS-behavior agent (animations.js + main.js + ui-showcase.js; delete console.js).
- P4 Verify→Fix: integration · functionality · design(clean+studio-faithful)/a11y/responsive → fixers.

## Quality bar
Mobile-first 375/768/1280/1440 (no 375 overflow), WCAG 2.1 AA (one h1, landmarks, labels, ARIA, focus,
contrast — no --text-dim body), 60fps, prefers-reduced-motion calm, reveals fail OPEN, no console errors,
tokens only. Result = the user's STUDIO concept & copy, restored, wearing the clean restrained look.
