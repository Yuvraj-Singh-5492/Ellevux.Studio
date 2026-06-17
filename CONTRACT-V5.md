# ELLEVUX v5 — PERSONAL PORTFOLIO in the HENRI HEYMANS style

Rebuild Ellevux as a **personal front-end developer PORTFOLIO**, closely matching the look & structure
of henriheymans.com (the user's chosen reference — they said "this is very much what I want").
Static, no-build HTML/CSS/JS + Three.js (ESM) + GSAP (CDN). Work dir `D:/Ellevux WEB`.

## The look (match Henri Heymans)
- **Pure black** canvas (`#000`), **white** type, **ONE acid-green accent** (chartreuse ~`#c8fa3c`) used
  sparingly: the "available" marquee pill, the strikethrough gag, the "Send me an e-mail" pill, link hovers.
- **Bold uppercase grotesque** for big headlines (Helvetica-like → use **Inter**, weights to 900, tight
  tracking) + **italic serif** accents (**Instrument Serif**, italic) on select words (e.g. *WORKS*,
  *my portfolio*, *Hey!*, *old*, *in*, *Send me an e-mail*). This sans+italic-serif contrast is signature.
- Editorial, **asymmetric, lots of black space**, oversized type, confident. Subtle grain ok.
- Playful microcopy (a strikethrough gag, "SCROLL TO BEGIN YOUR JOURNEY →", "THANKS FOR YOUR VISIT!").

## Identity (PLACEHOLDERS — user will give real name)
The user wants a PERSONAL portfolio with their real name but hasn't provided it yet. Use clear placeholders:
- Wordmark / name: **"ellevux"** (lowercase, top-left) and giant **"Ellevux"** footer wordmark — a stand-in
  for their name (Henri uses his own name as the wordmark). 
- Role: **"Independent Front-End Web Developer"**.
- About bio: `Hey! I'm <span class="ph">[Your Name]</span>, a front-end developer currently based in
  <span class="ph">[Your City]</span>` — wrap each placeholder in a `.ph` span (subtly underlined/dim) so
  they're obvious to swap. Optionally a Henri-style strikethrough gag (e.g. "based in ~~Nowhere~~ [Your City]").
- Photo: a `.portrait` slot — a tasteful B&W placeholder (CSS duotone/gradient + "[your photo]" label),
  with an `<img>` commented out ready at `assets/img/portrait.jpg`.

## PAGE STRUCTURE (match Henri, top→bottom) — owner: index.html
```
#nav   — left: "ellevux" wordmark · center: a pill MARQUEE "● AVAILABLE FOR FREELANCE WORK ● AVAILABLE…"
         (animated, loops) · right: PROJECTS · ABOUT · CONTACT (small, letter-spaced, uppercase).
#hero  — <canvas id="hero-canvas"> the liquid-CHROME blob behind, with the huge headline OVER it:
         "INDEPENDENT" / "FRONT-END" / "WEB DEVELOPER" (3 lines, massive, uppercase, tight). A small
         "WELCOME TO <i>my</i> 2026 <i>portfolio.</i>" line (italic-serif accents) tucked near the headline.
         Bottom row: left = social links (INSTAGRAM · TWITTER · LINKEDIN · GITHUB), right =
         "SCROLL TO BEGIN YOUR JOURNEY →" (the arrow in a circle).
#work  — "SELECTED <i>WORKS</i>" big centered, with project thumbnails SCATTERED/offset around it
         (asymmetric, varied sizes — like Henri). Each: a small uppercase label above + the thumbnail,
         links to the live demo. Projects: AURORA (Luxury Beauty) → demos/aurora/index.html ;
         NEBULA (AI SaaS) → demos/nebula/index.html ; + 1-2 placeholder slots ("PROJECT 03", etc.).
         Thumbnails = tasteful CSS duotone/gradient art (each distinct), with an <img> slot ready in
         assets/img/ for the user to drop real screenshots later. Hover = scale/reveal + cursor cue.
#about — a near-black card; a VERTICAL rotated "KNOW MORE ABOUT ME." strip down the left edge; the bio
         paragraph (big, mixed grotesque + italic-serif accents + the .ph placeholders + strikethrough gag);
         the .portrait photo slot (B&W) on the right; social links beneath the bio.
#contact (footer) — a GIANT "Ellevux" wordmark spanning the width (ultra-bold, can bleed). Above/beside it:
         "WANT TO DISCUSS A NEW PROJECT?" + a "Send me an e-mail" pill (acid-green outline, italic-serif
         label, mailto:hello@ellevux.studio) + a ↵ (enter/return) glyph. Then a bottom strip:
         "THANKS FOR YOUR VISIT! YOU CAN CHECK OUT MY NETWORKS TO FOLLOW MY NEW ADVENTURES!" + socials +
         "© 2026 ELLEVUX" (no third-party credit).
```
One `<h1>` (the hero "INDEPENDENT FRONT-END WEB DEVELOPER"). Semantic landmarks. [data-reveal] on blocks.

## The CHROME blob — owner: assets/js/three-hero.js (recreate, ES module)
A **liquid black-and-white chrome** object on `#hero-canvas` behind the headline: a high-detail
Icosahedron/Sphere with animated noise displacement (liquid morph) + a **chrome look** via a MatCap
(or an env/reflection) material so it reads metallic B&W like Henri's. Slow rotation + gentle pointer
parallax; it sits behind the white headline (headline stays legible — the blob is mostly mid-tone/dark
with bright highlights; add a subtle scrim if needed). PERF: setPixelRatio≤2, IntersectionObserver pause
offscreen, pause on document.hidden, dispose on pagehide, resize handling, prefers-reduced-motion =
ONE static frame, guard missing canvas/WebGL. No console errors. (Use a MatCap texture as a data-URI or
a generated gradient sphere env — keep it dependency-light; if a matcap can't load, fall back to a
metallic MeshStandardMaterial with an env color so it still reads chrome-ish.)

## JS behavior
- `animations.js` — GSAP/ScrollTrigger: the nav marquee (or CSS), [data-reveal] scroll reveals (fail OPEN:
  once, try/catch, ~2.5s failsafe, no reverse; no-gsap/reduced-motion → show all), the scattered #work
  items revealing/parallaxing in, the giant footer wordmark reveal. Calm, editorial timing.
- `main.js` — smooth in-page anchor scroll (PROJECTS/ABOUT/CONTACT + "scroll to begin"), nav state,
  work-thumbnail hover (scale + optional custom-cursor "VIEW" label — tasteful), magnetic on the email
  pill + scroll-cue, mailto handler, footer year. Respect reduced-motion + touch.
- DELETE `assets/js/showcase-3d.js` and `assets/js/ui-showcase.js` (no 3D lab / no widget gallery in this
  design) and `assets/js/console.js` if present (rm -f). Remove their script tags.

## Script loading (index.html, end of body)
```html
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script type="importmap">{ "imports": { "three":"https://unpkg.com/three@0.160.0/build/three.module.js","three/addons/":"https://unpkg.com/three@0.160.0/examples/jsm/" } }</script>
<script type="module" src="assets/js/three-hero.js"></script>
<script defer src="assets/js/animations.js"></script>
<script defer src="assets/js/main.js"></script>
```

## Fonts (index.html head)
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
```

## Design tokens — owner: tokens.css (rewrite for this look)
`--bg:#000; --bg-soft:#0a0a0a; --text:#fff; --text-soft:#b3b3b3; --text-mut:#7a7a7a; --accent:#c8fa3c;
--accent-ink:#0a0a0a; --line:rgba(255,255,255,0.16);` Fonts: `--font-sans:'Inter',Helvetica,Arial,sans-serif;
--font-serif:'Instrument Serif',Georgia,serif;`. Keep fluid type scale but allow HUGE display
(`--fs-hero: clamp(2.5rem, 7vw, 8rem)` and a `--fs-mega` for the footer wordmark up to ~22vw). Generous
spacing. Map any legacy token names to these so nothing breaks. `.accent-serif{font-family:var(--font-serif);font-style:italic}`.

## File ownership by phase
- P1 System: design-system agent → tokens.css, base.css, components.css (black/white editorial system:
  .marquee pill, .work-item/.work-label, .pill-btn (green outline), nav, .ph placeholder span,
  .vertical-text, big-wordmark utility, .accent-serif). 
- P2 Page: index agent → index.html ONLY (the Henri structure above + chrome canvas + script block).
- P3 Build (parallel): main.css (full editorial layout) · three-hero.js (chrome blob) · JS-behavior
  (animations.js + main.js; DELETE showcase-3d.js/ui-showcase.js/console.js).
- P4 Verify→Fix: integration · functionality · design-vs-Henri + a11y/responsive → fixers.

## Quality bar
Mobile-first 375/768/1280/1440 (no 375 overflow — the scattered works must reflow to a clean stack on
mobile; the giant wordmark must scale, not overflow), WCAG 2.1 AA (one h1, landmarks, link names, focus
visible on black, contrast — white/grey on black is fine, the acid-green on black passes for large text;
ensure any green text is large or paired), 60fps, prefers-reduced-motion calm (chrome blob static, no
marquee), reveals fail OPEN, no console errors, tokens only. Result must read like Henri Heymans:
black editorial, chrome-blob hero, scattered works, playful about, giant wordmark footer.
```
