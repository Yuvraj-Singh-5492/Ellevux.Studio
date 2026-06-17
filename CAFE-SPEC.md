# AURUM — Build Spec

Luxury coffee atelier. Awwwards-tier portfolio demo piece.
Target file: `D:/Ellevux WEB/demos/cafe/index.html` (single self-contained file, enhance in place).

This spec is an upgrade plan, not a rebuild. The current 1011-line file is a strong "very good template." Everything below layers cinematic signature moments on top of the existing engineering as progressive enhancement. Keep every existing strength (token system, grain + vignette, steam/dust canvases with offscreen pausing via `makeLoop`, custom cursor gated to fine pointers, ARIA, focus-visible, skip link, reserve form success state, reduced-motion block, "Back to portfolio" link). Do not regress any of it.

---

## 1. North Star — what makes THIS café site crazy

AURUM treats coffee as alchemy and the page as a single uninterrupted pour: the moment it loads, a gold curtain lifts on a cup that is genuinely three-dimensional and turning in real light, and as you scroll the whole site behaves like liquid being poured, scrubbed, and settled. The signature is not one trick but a through-line: a real-time 3D liquid-gold cup hero, a scroll-pinned "bean to cup" pour that fills that cup as you descend, kinetic gold serif type that shimmers on scroll, and a draggable single-origin filmstrip — all rendered with zero images from CSS, SVG, canvas, and WebGL only. The restraint is the luxury: espresso-black space, two or three gold accents, generous silence, and exactly one cinematic beat per section so nothing feels gimmicky. It is the difference between a menu that lists coffee and a room built to make you slow down and watch it being made.

---

## 2. Brand voice, palette, type

### Voice
Confident, hushed, sensory, a little reverent. Short declarative lines. Treat copy as art direction (oversized statement blocks, one emphasized word in italic gold). Specialty-coffee credibility via monospaced metadata (`ALT 1,850M · WASHED · 2026 LOT`). Existing voice is correct — keep "Coffee, refined to alchemy.", "Gold is not a color here. It is a standard.", "Sit a while." NO em-dashes anywhere (use "to", commas, or periods). The current file already obeys this; preserve it.

### Palette — KEEP the existing espresso + gold + cream system (research confirms it)
Research strongly endorses the warm espresso/gold/cream direction over alternatives. Do not change it. Reuse the existing CSS custom properties verbatim:

```
--espresso-900:#0b0806;  --espresso-850:#100b07;  --espresso-800:#15100a;  --espresso-700:#1d1610;
--oxblood:#3a0d0d;
--gold-deep:#9a7b1f;  --gold:#c9a227;  --gold-mid:#d4af37;  --gold-light:#e9c96a;  --gold-pale:#f0dca0;
--cream:#f4ead6;  --cream-dim:#cdbfa3;  --cream-faint:#9a8e76;
--hairline:rgba(212,175,55,.22);  --hairline-soft:rgba(212,175,55,.12);
--gold-grad:linear-gradient(135deg,#9a7b1f 0%,#e9c96a 28%,#fff4cf 48%,#d4af37 66%,#9a7b1f 100%);
```

Section rhythm: alternate near-black espresso with one slightly warmed band (a touch toward `--oxblood`) around "The Space" so the journey reads as authored, not stacked. AA note: gold text on espresso must stay >= 4.5:1 for body and >= 3:1 for large display. `--gold-light`/`--cream` on `--espresso-900` pass; never put small gold-deep text on espresso-700.

### Type — KEEP the existing pairing (it is already the award pairing)
- Display: **Bodoni Moda** (Didone, optical sizing 6..96) — the luxury signal.
- Accent / emphasized word: **Cormorant Garamond italic** — the serif-i flourish.
- UI / body: **Manrope** — clean grotesk.
- Keep the `.gold-text` background-clip gradient and the `#goldWord` mouse shimmer.

Fluid sizing (clamp): h1 `clamp(3rem,9vw,8.5rem)` line-height .95; section h2 `clamp(2.2rem,5.5vw,4.5rem)`; eyebrow labels uppercase `.2em` tracking. Load fonts via the existing `<link>` only. Run all entrance/kinetic type after `document.fonts.ready` to avoid FOUT jumps.

Optional kinetic upgrade: a variable Manrope axis for scroll-driven weight shift on one headline (see Wow Moment 3). Optional, gated, tasteful — not the whole page.

---

## 3. Section-by-section build plan (top to bottom)

Order matches the existing file; new sections noted. Each section gets exactly one cinematic beat.

### 0. Page-load curtain (NEW — wraps the hero)
Fixed full-screen `#curtain` (z-index above everything, espresso-900) with a centered "AURUM" wordmark in Bodoni and a 1px gold progress hairline. On `document.fonts.ready`: GSAP timeline runs the hairline 0 to 100% width, then lifts the curtain with `clip-path: inset(0 0 100% 0)` (or translateY), then chains into the hero reveal and starts the steam/3D loops. `body { overflow:hidden }` during curtain, released on complete. Hard cap ~1.6s so it reads as an entrance, not a loader. Reduced-motion: `#curtain { display:none }` immediately, content visible at once. This is the highest-impact, lowest-risk upgrade.

### 1. Nav (top)
Sticky, transparent over hero, gains a faint `backdrop-filter` + hairline bottom border after scroll. Left: AURUM wordmark. Right: Atelier / Origins / Menu / The Space / Visit + a gold "Reserve" pill. Nav links use the existing two-copy translateY flip on hover. CTA is magnetic (Wow Moment 4). Keyboard: visible focus ring, logical tab order, links are real anchors to in-page IDs. The "← Back to portfolio" link to `../../index.html` stays present (top-left or in footer as today).

### 2. Hero (cinematic) — SIGNATURE WOW MOMENT
Full 100vh. Left: kinetic headline ("Liquid / Gold." with `#goldWord` shimmer), tagline "Coffee, refined to alchemy.", lead, two CTAs (gold Reserve, ghost See the menu). Right: the `.cup-stage`. **Replace the static SVG cup with a real-time WebGL liquid-gold cup** (Wow Moment 1) that auto-rotates and tilts to the pointer, with the existing steam canvas layered in front. Scroll cue at bottom. The existing SVG cup stays in the DOM as the hard fallback (hidden when WebGL is active). Headline reveals via line-mask stagger after the curtain.

### 3. Manifesto / Atelier
Two-column editorial (`#atelier`). Eyebrow "The Atelier", display h2 "A craft, _slowly_ kept." (emphasized word Cormorant italic gold). Two body paragraphs (keep existing copy), the pullquote "Gold is not a color here. It is a standard.", and a stat row (lots, altitude, batch size). Beat: per-word line-mask reveal on the h2 as it enters; the italic word gets a tiny independent scale/rotation on scroll-in. Stats count up once via ScrollTrigger (reduced-motion: show final).

### 4. Single-origin / Beans (NEW or upgrade) — SIGNATURE WOW MOMENT
A draggable / inertia horizontal filmstrip of origin cards (Wow Moment 2). Eyebrow "Single Origin", h2 "Known by name." Each card: a pure-CSS coffee bag (rounded rect, clipped folded top, kraft/foil gradient, inline SVG label) plus monospaced metadata (`ETHIOPIA · GUJI · ALT 2,050M · WASHED · 2026 LOT`) and a one-line tasting note ("jasmine, bergamot, white peach"). Drag to flick through; also advances on vertical scroll when pinned. Hover lifts the card and reveals a tasting-note panel via clip-path. Reduced-motion/touch: native `overflow-x:auto` with scroll-snap.

### 5. Signature menu
Editorial list, not a grid. Eyebrow "The Menu", h2 "Poured slow." Each `.menu-item`: big Bodoni number, name with the existing gradient underline wipe, price, one-line description. Beat: numbers do a clip/count reveal as the list enters; on desktop fine-pointer hover, a small cursor-following gradient swatch shows that drink's signature color (reuse `.art-*` gradient technique, aria-hidden, pointer-events:none). Reduced-motion/touch: static list, no swatch.

### 6. Scroll-cinematic centerpiece: "Bean to Cup" pour (NEW) — SIGNATURE WOW MOMENT
Inserted between Atelier/Origins and Menu (or right before The Space). Pinned, scrubbed (Wow Moment 5). As you scroll, a liquid-gold level rises and fills a cup (clone of the hero cup or the SVG cup), steam intensifies, and three caption lines cross-fade: "The cherry." / "The roast." / "The pour." Optional thin tapered gold pour-stream drawn on a 2D canvas driven by the same scrub progress. Reduced-motion: full cup shown, captions stacked, no pin.

### 7. The Space / Gallery
Eyebrow "The Space", h2 "A room built to slow you down." Bento of CSS-gradient "photographs" (layered radial gradients tinted gold via mix-blend-mode, no images). Beat: pointer-driven 3D tilt (`rotateX/rotateY` from cursor position, `perspective` on container) plus depth parallax where the `.art` layer moves more than the caption. Keep the existing hover zoom. Reduced-motion/coarse: static grid. This band is the warmed espresso-toward-oxblood section for color rhythm.

### 8. Reservation / Visit
Eyebrow "Visit", h2 "Sit a while." Left: address, hours, a tiny CSS map abstraction (gold hairline streets on espresso). Right: the existing accessible reserve form (name, date, party size, submit) with ARIA live-region success. Beat: per-field focus glow easing (keep), gold ripple on submit, and the success checkmark animates via SVG `stroke-dashoffset` draw-on (`#checkPath` is ready). Magnetic gold submit button. Reduced-motion: instant checkmark, no ripple.

### 9. Footer
Giant Bodoni "AURUM" wordmark (kinetic — see Wow Moment 3), small-print columns (navigation, social as text links, hours), the "← Back to portfolio" link to `../../index.html`, copyright. Beat: the giant wordmark's gold gradient background-position scrubs as it scrolls into view (extends the existing mouse shimmer to scroll-reactive).

### Global through-line
A 1px fixed gold scroll-progress hairline at the very top (`scaleX` driven by scroll, GPU transform). Optional subtle body-background hue warming between sections via a ScrollTrigger-driven CSS custom property. Both decorative, both fully disabled under reduced-motion.

---

## 4. The signature WOW moments — exact build

All motion is wrapped in `gsap.matchMedia()`. The `no-preference` branch gets the full effect; the `reduce` branch (and `(pointer:coarse)` where relevant) snaps to final state with `gsap.set` and skips pin/scrub/inertia/magnet/shimmer. One RAF only: the GSAP ticker drives Lenis; never spawn a second loop.

### Foundation — Lenis smooth scroll synced to GSAP (do this first)
CDN script tags: GSAP 3.13 + ScrollTrigger, Lenis `unpkg.com/lenis@1.1.13/dist/lenis.min.js`, optional SplitText, optional Draggable + InertiaPlugin (all free now).
```js
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduce) {
  const lenis = new Lenis({ lerp: 0.1, duration: 1.2 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
```
Reduced-motion: skip Lenis entirely, keep native scroll. `lagSmoothing(0)` prevents catch-up jumps; lerp ~0.08–0.12.

### WOW 1 — Real-time 3D liquid-gold cup hero (WebGL, Three.js via importmap)
The centerpiece. Load Three.js via importmap:
```html
<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js"}}</script>
```
- `<canvas>` inside `.cup-stage`. Low-poly cup (lathe/cylinder body + a torus handle) or an icosphere "liquid-gold" blob. `MeshStandardMaterial` metalness ~0.9, roughness ~0.25, color `--gold-mid`. Lighting rig: one warm key point light, one cool rim light, faint ambient — NO HDR image (procedural only). A dark espresso plane/fog behind so gold catches edges.
- Slow auto-rotate on `rotation.y`; damped mouse-parallax tilt on `rotation.x/z`.
- Scroll integration: ScrollTrigger tweens a plain state object; the render loop applies `mesh.rotation.y = state.rot` (do not create tweens per frame).
- Performance: `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`; pause the render loop when offscreen via the existing `makeLoop`/IntersectionObserver pattern; when the 3D cup is on, consider disabling the ambient dust canvas to protect the frame budget (steam + WebGL must coexist at 60fps).
- HARD fallback: if WebGL unavailable OR reduced-motion, keep the existing SVG cup (lines ~517–544) visible and hide the canvas. The SVG cup stays in the DOM regardless.

### WOW 2 — Draggable single-origin filmstrip (horizontal + inertia)
Two-in-one: doubles as a pinned horizontal-scroll section and a throwable gallery.
```js
// horizontal-scroll-on-vertical-scroll
gsap.to(track, {
  x: () => -(track.scrollWidth - innerWidth), ease: 'none',
  scrollTrigger: { trigger:'.origins-wrap', start:'top top',
    end: () => '+=' + (track.scrollWidth - innerWidth),
    pin:true, scrub:1, invalidateOnRefresh:true }
});
// throwable
Draggable.create('.origins-track', { type:'x', bounds:'.origins-wrap', inertia:true, edgeResistance:0.85 });
```
Cards are pure CSS bags (see section 4 above). `invalidateOnRefresh:true` recalcs on resize. Reduced-motion/touch: drop pin + scrub + inertia; use native `overflow-x:auto; scroll-snap-type:x mandatory`. 60fps: animate `x` only; no box-shadow transitions during scroll.

### WOW 3 — Kinetic gold type (scroll-reactive shimmer + optional wave)
- Gold-foil shimmer: `background:linear-gradient(110deg,#7a5c1e,#f7e7b0,#d4af37,#fff6d6,#b8860b); -webkit-background-clip:text; color:transparent; background-size:200%;` then scrub `backgroundPositionX` 0 to 200% as the element passes through view (extends the existing `#goldWord` mouse shimmer to scroll). Applies to the hero gold word and the giant footer "AURUM".
- Optional wave: split a headline into chars (SplitText or manual span wrap), and in a ScrollTrigger `onUpdate` set per-char `font-variation-settings:'wght' <v>` via a sine phase using precomputed `gsap.quickTo` functions (never create tweens inside onUpdate). Limit to one headline; animate words not chars on long strings.
- Reduced-motion: freeze shimmer to a static gradient, single static weight, no onUpdate.

### WOW 4 — Custom magnetic cursor + magnetic CTAs
Keep the existing fine-pointer-gated custom cursor; add magnetism.
- Cursor: dot + trailing ring, lerp the ring with `gsap.quickTo(ring,'x',{duration:0.4,ease:'power3'})`. `cursor:none` only on fine pointers. Cursor layer `pointer-events:none`.
- Magnetic CTAs (`.btn-gold`, `.back-link`, nav Reserve): on `mousemove` within the bounding box, `gsap.to(el,{ x:dx*0.3, y:dy*0.3 })`, animate the inner label separately for parallax, snap back on `mouseleave`. Snap the cursor ring to the element center on hover.
- Reduced-motion / `(pointer:coarse)`: native cursor, no magnet, no `cursor:none`.

### WOW 5 — Pinned scrubbed "Bean to Cup" pour sequence
```js
gsap.timeline({ scrollTrigger:{ trigger:'.pour', start:'top top', end:'+=300%', pin:true, scrub:1, snap:1/3 } })
  .to('.liquid-level', { y: 0, ease:'none' })        // gold fill rises into cup
  .to('.steam', { opacity: .35 }, 0)                  // steam ramps
  .to('.cap-1', { autoAlpha:1 }, 0).to('.cap-1', { autoAlpha:0 }, 0.33)
  .to('.cap-2', { autoAlpha:1 }, 0.33).to('.cap-2', { autoAlpha:0 }, 0.66)
  .to('.cap-3', { autoAlpha:1 }, 0.66);
```
Liquid fill = a masked rect / ellipse rising inside the cup using `url(#surface)`. Optional 2D-canvas pour-stream (thin tapered gold line + droplets) driven by `self.progress`. `scrub:1` (numeric, silkier) not `true`. Captions: "The cherry." / "The roast." / "The pour." Reduced-motion: skip pin/scrub, show full cup, captions stacked, IntersectionObserver fade-in.

### Supporting reveals (vary the vocabulary — do not use one reveal everywhere)
`ScrollTrigger.batch('.reveal', { start:'top 85%', onEnter:b=>gsap.to(b,{ autoAlpha:1, y:0, stagger:0.08, ease:'power3.out' }) })`. Mix: line-mask text reveals, `scale:0.92→1` cards, depth parallax (`yPercent` at different rates per layer). Reduced-motion branch: `gsap.set('.reveal',{autoAlpha:1,y:0,clearProps:'all'})`, no parallax.

---

## 5. Hard constraints (non-negotiable, all must stay met)

- **Single self-contained file**: everything in `demos/cafe/index.html`. Libraries via CDN/importmap only. No build step, no Node, serve over http.
- **No external images**: visuals from CSS gradients, SVG, 2D canvas, and WebGL only. No `<img>`, no background-image URLs to assets, no icon fonts for art.
- **Responsive** at 375 / 768 / 1280 / 1440 (keep existing 900/880/820/640 breakpoints, verify the four targets). Horizontal-scroll and 3D effects must degrade gracefully on narrow/touch. No horizontal overflow on mobile.
- **WCAG 2.1 AA**: contrast (gold/cream on espresso >= 4.5:1 body, >= 3:1 large), visible focus-visible rings, full keyboard operability, skip link, ARIA on nav/form/live-region, all decorative canvas/cursor/swatch elements `aria-hidden` + `pointer-events:none`. Drag galleries must remain reachable/operable by keyboard (or provide an equivalent).
- **60fps + reduced-motion fallback for EVERY effect**: animate only `transform` / `opacity` / `clip-path`; use `quickTo`/`quickSetter` and `ScrollTrigger.batch` not per-frame tweens; cap canvas/WebGL DPR at 2; pause WebGL + canvases when offscreen (reuse `makeLoop`); clear `will-change` after intros. Wrap all motion in `gsap.matchMedia()`; the `reduce` branch disables curtain, Lenis, pin, scrub, inertia, magnet, shimmer, parallax, 3D rotation, and snaps to final states. Preserve the existing `prefers-reduced-motion` CSS block.
- **NO em-dashes** anywhere in copy or comments (use "to", commas, periods). The current file complies; keep it.
- **"← Back to portfolio"** link to `../../index.html` must remain present and keyboard-accessible.
- **Progressive enhancement**: layer GSAP/Three.js/Lenis ON TOP of the existing IntersectionObserver + CSS fallbacks. If JS or WebGL fails, the page must still render and read as a complete, polished site.

---

## Build order (suggested)
1. Add CDN + importmap + Lenis foundation, wrap existing motion in `gsap.matchMedia`.
2. Page-load curtain (WOW, lowest risk).
3. Scroll-progress hairline + batched reveal variety + kinetic type shimmer (WOW 3).
4. Magnetic cursor/CTAs (WOW 4).
5. Draggable origins filmstrip (WOW 2) + menu swatch + gallery 3D tilt.
6. Pinned "Bean to Cup" pour (WOW 5).
7. WebGL liquid-gold cup hero (WOW 1) last, with SVG hard-fallback verified.
8. Pass: 375/768/1280/1440 responsive, AA audit, reduced-motion full sweep, 60fps profiling.
