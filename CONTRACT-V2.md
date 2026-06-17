# ELLEVUX v2 — BUILD CONTRACT (read with REDESIGN-PLAN.md)

Read `REDESIGN-PLAN.md` for the *what & why* (verdict, bugs, enrichment, new sections, motion).
This file pins the *exact hooks, ownership, and rules* so parallel work fits together. Working dir
`D:/Ellevux WEB`; write with ABSOLUTE paths, reference with RELATIVE paths. Static, no build.

## North-star
An editorial, alive studio site: **type is the hero, real work carries proof, every section has its
own surface & rhythm, and a few signature motion moments make it feel reactive.** Add density, proof,
and choreography — keep 60fps discipline. Fix the things that are broken.

## Hard rules (every file)
- Use `assets/css/tokens.css` variables — never hard-code a color/space/radius/duration a token covers.
- **No external image files / no remote images.** Build all visuals from CSS gradients, inline SVG,
  duotone shapes, and the existing browser-mock technique (richer + animated). Avatars = SVG/gradient/initials.
- Responsive mobile-first at 375/768/1280/1440. **No horizontal overflow at 375** (current hero overflows — fix).
- WCAG 2.1 AA: landmarks, one `<h1>`, labels, ARIA on widgets, visible focus, keyboard, color contrast
  (do NOT use `--text-dim` for body text — it fails AA; use `--text-muted` or lighter).
- Everything motion-related checks `prefers-reduced-motion` and degrades to a calm, fully-visible state.
- Guard every hook (`if(!el)return`) and every lib (`if(!window.gsap)`, `if(!window.Lenis)`). No console errors.
- Content stays VISIBLE without JS / if a lib fails (reveals must fail OPEN, never leave content hidden).

## NEW design tokens (owner: design-system agent → tokens.css)
```css
--surface-base:   var(--bg-900);
--surface-raised: var(--bg-850);
--surface-panel:  var(--bg-800);
--hairline: rgba(255,255,255,0.06);
--grad-aurora-anim: linear-gradient(110deg,#7c5cff,#22d3ee,#e879f9,#7c5cff); /* use at 300% background-size, animate background-position */
--fs-quote: clamp(1.6rem, 1rem + 3.2vw, 3.4rem);  /* pull-quotes */
--dur-ambient: 2.2s;  /* slow looping ambient motion (outside the ≤1s interaction band) */
```
Also: raise default body emphasis — section leads should use `--fs-lead` + `--text-soft` (NOT `--fs-sm`/muted).

## NEW component classes (owner: design-system agent → components.css)
Define reusable, token-driven blocks: `.section--raised` (bg:var(--surface-raised)), `.eyebrow-index`
(big mono section number), `.bento`/`.bento__tile` (CSS-grid spans, hairline border + inner glow),
`.pull-quote` (`--fs-quote`, display font), `.faq`/`.faq__item`/`.faq__q`/`.faq__a`, `.cta-band`
(full-bleed), `.logo-wall`/`.logo-wall__item`, `.case`/`.case__media`/`.case__meta` (case-study card),
`.award-row`/`.award`, `.team-grid`/`.member`/`.member__avatar`, `.scroll-progress` (fixed 2px bar),
`.grad-anim` (applies `--grad-aurora-anim` + slow background-position keyframe), and a kinetic-line mask
utility `.split-line{overflow:hidden;display:block}` / `.split-line>*{display:block}`. Add `.divider`
glow usage between sections (already exists).

## PAGE STRUCTURE v2 (owner: index.html agent). Section order + ids — JS/CSS depend on these:
```
#loader (overlay, see Loader hooks)
#scroll-progress (fixed bar under nav)
#cursor (+ main.js injects .cursor__label)         #grain
#nav  (links: Work · Services · Studio · Contact ; + #nav availability dot ; magnetic .nav__cta)
<main id="main">
  #hero        — kinetic headline, tamed glow, REAL proof row (named awards/clients), data-parallax layers
  #clients     — NEW · .section--raised · "Trusted by" logo wall (.logo-wall, SVG/text marks, hover tint)
  #work        — "Selected Work": the 2 live demos (Aurora/Nebula, keep links) reframed as case cards
                  (.case) with index 01/02, mono meta (Sector/Services/Year/Role), an OUTCOME metric in
                  --text, animated mock micro-motion, data-cursor="View case →", tilt on an INNER wrapper
  #services    — NEW · capabilities .bento (Web Design, WebGL/3D, Brand & Motion, Design Systems,
                  Art Direction, Front-end Eng.) — icon + scope + deliverables per tile
  #showcase    — 3D & Interaction Lab, reframed: value-line title + technique subtitle; .section context line
  #testimonials— NEW · .section--raised · cycling .pull-quote (2-3 quotes, name/role/company)
  #studio      — manifesto (2-3 sentences, opinionated) + de-duplicated NAMED stats + process (Define/
                  Design/Engineer with deliverables) + #team (NEW: 3-4 .member cards) + tech & client marquees
  #awards      — NEW · named recognition row (Awwwards SOTD/FWA/CSSDA + dates + project)  [may fold under #studio]
  #faq         — NEW · .faq accessible disclosure (timeline, budget, engagement model, process, support, stack)
  #cta         — NEW · .cta-band full-bleed, --fs-display "Have a project? Let's talk.", magnetic primary btn
  #contact     — enriched form: project-type chips ([data-project-type]) + budget segmented control
                  (#budget-tabs reusing .tabs) + name/email/message; #form-status[aria-live]; SVG success
                  + studio contact details beside it (email/location/response time/availability)
</main>
#footer — rebuilt 4-col (brand+status / sitemap incl. new sections / contact / social+awards) + big
          kinetic gradient wordmark "ELLEVUX" bleeding off bottom (.footer__wordmark)
```
Keep existing demo links: `demos/aurora/index.html`, `demos/nebula/index.html`. Keep the UI gallery
widgets (toggle/tabs/modal/counters/tooltip/magnetic/tilt/floating-label) — relocate into #showcase as
"these ship on every project." Write REAL, opinionated copy and realistic (fictional) client names,
outcomes, awards, team — no lorem, no "Awwwards-tier" self-praise as the only proof.

## Interactive DOM hooks (index.html PROVIDES; JS CONSUMES)
- **Loader:** `#loader` overlay containing `#loader-count` (percent text) and `#loader-bar` (fill).
- **Scroll progress:** `#scroll-progress` (animations.js sets its width 0→100%).
- **Scrollspy:** nav links `#nav .nav__menu a[href^="#"]` (animations.js toggles `.is-active`).
- **Contextual cursor:** any element may carry `data-cursor="label"`; main.js shows it in `.cursor__label`
  (main.js creates that node; main.css styles `#cursor .cursor__label`). Put `data-cursor` on work cards
  ("View case"), lab canvases ("Explore"), modal trigger ("Open").
- **Parallax:** `[data-parallax][data-speed]` on hero layers & section bg accents (animations.js — wire the
  currently-dead initParallax; transform-only).
- **FAQ:** `.faq__item` = `<details>` with `.faq__q` (summary) + `.faq__a` (panel). ui-showcase.js animates height.
- **Form:** `#contact-form`, project chips `[data-project-type]` (role=button, aria-pressed), budget control
  `#budget-tabs.tabs` (ui-showcase tabs), `#form-status[aria-live="polite"]`, success SVG `.contact-form__check`.
- **Magnetic / tilt:** `[data-magnetic]` (+ inner `[data-magnetic-text]`), `[data-tilt]` (on an INNER wrapper,
  never the same node as a `[data-reveal]`). Add `data-magnetic` to nav CTA, hero primary, #cta button.

## Script loading (index.html agent sets, end of <body>, THIS order)
```html
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script defer src="https://unpkg.com/lenis@1.1.20/dist/lenis.min.js"></script>   <!-- global: Lenis (guard if absent) -->
<script type="importmap"> { "imports": {
  "three":"https://unpkg.com/three@0.160.0/build/three.module.js",
  "three/addons/":"https://unpkg.com/three@0.160.0/examples/jsm/" } }</script>
<script type="module" src="assets/js/three-hero.js"></script>
<script type="module" src="assets/js/showcase-3d.js"></script>
<script defer src="assets/js/ui-showcase.js"></script>
<script defer src="assets/js/loader.js"></script>
<script defer src="assets/js/animations.js"></script>
<script defer src="assets/js/main.js"></script>
```
Do NOT depend on GSAP SplitText (CDN availability is unreliable) — splitter is implemented in JS.

## Motion handoff & shared globals (prevents two agents animating the same thing)
- **`assets/js/loader.js` (NEW) owns:** the load ritual (real % counter via `document.fonts.ready` +
  `window 'load'` + a short min-display; tween the number), the curtain lift, AND the **hero intro
  timeline** (kinetic headline reveal — its own JS line/word splitter, masked `yPercent` rise, stagger).
  On completion it calls `document.dispatchEvent(new CustomEvent('ellevux:loaded'))`. Reduced-motion or
  no-gsap → hide `#loader` immediately and show hero statically. NEVER leave `#loader` covering the page.
- **`assets/js/animations.js` owns:** Lenis init (guarded; expose `window.Ellevux=window.Ellevux||{}; window.Ellevux.lenis=…`;
  drive `ScrollTrigger.update` from Lenis; disable under reduced-motion), all **below-the-fold scroll reveals
  with VARIETY** (clip-path wipe / scale / directional / stagger — not one fade), `[data-parallax]`, the
  `#scroll-progress` bar, scrollspy `.is-active`, marquee-velocity, any pinned/scrubbed moment. Reveals MUST
  be robust: prefer IntersectionObserver OR ScrollTrigger with `once:true`; set the hidden from-state at
  tween-creation in try/catch; add a `setTimeout(2500)` fail-safe that force-shows any `[data-reveal]` still
  at opacity:0; call `ScrollTrigger.refresh()` on load and `document.fonts.ready`. DO NOT reverse reveals.
  Do NOT animate the hero headline (loader.js owns it) — but DO reveal hero sub-elements via the
  `ellevux:loaded` event if needed.
- **`assets/js/main.js` owns:** custom cursor (single-`pointermove` hover model + `.cursor__label` from
  `data-cursor`), mobile nav, magnetic (now also moves `[data-magnetic-text]`), tilt (now writes `--mx`/`--my`
  for the shine; on inner wrapper), anchor smooth-scroll (use `window.Ellevux.lenis.scrollTo` if present,
  else native; offset for fixed nav — fix current bug), contact form (validation, project chips, SVG-check
  success), footer `#year`.
- **`assets/js/ui-showcase.js` owns:** existing toggle/tabs/modal(now pointer-events backdrop)/counters,
  PLUS the FAQ disclosure animation and the `#budget-tabs` segmented control.
- **`assets/js/three-hero.js`:** tame the hero — smaller/!overpowering blob, ensure headline contrast (the
  blob/glow must sit BEHIND and not wash out text; reduce scale/opacity, shift composition), add film-grain
  in the fragment shader, optional damped tie to scroll. Keep perf contract (DPR≤2, pause offscreen/hidden,
  dispose, reduced-motion static).
- **`assets/js/showcase-3d.js`:** keep 3 scenes; add subtle grain parity; keep perf contract.

## File ownership by phase (no two parallel agents write the same file)
- **Phase 1 (System):** design-system agent → `tokens.css`, `components.css` (+ `base.css` if needed).
- **Phase 2 (Page):** index agent → `index.html` ONLY (full new DOM + content + all hooks + script tags + loader/scroll-progress markup). Reads updated tokens/components.
- **Phase 3 (Style+Behavior, parallel — all READ the real index.html):** `main.css` agent · `animations.js`
  agent · `main.js` agent · `ui-showcase.js` agent · `loader.js` agent (new) · webgl agent (`three-hero.js`+`showcase-3d.js`).
- **Phase 4 (Verify→Fix):** read-only reviewers, then file-partitioned fixers.

## Definition of done
Served over http: loader runs once then reveals; NO section is ever stuck invisible; hero headline is
crisp & legible over a tamed background; no 375px overflow; all 8 bugs fixed; new sections present with
real copy; surfaces alternate; motion has variety; cursor shows contextual labels; reduced-motion calm;
keyboard + screen-reader OK; no console errors.
