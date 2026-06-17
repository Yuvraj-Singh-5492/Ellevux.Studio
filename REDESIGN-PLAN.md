# Ellevux v2 — Redesign & Build Plan

> Static HTML/CSS/JS + Three.js (ESM) + GSAP (UMD, deferred). No framework, no build step.
> Design tokens are the single source of truth: `assets/css/tokens.css`. Never hard-code a value that a token already covers.

---

## 1. Verdict

Ellevux is a technically excellent engineering demo cosplaying as an agency — the WebGL hero, three lab scenes, and the UI gallery all *prove the team can build motion*, but the page never proves the studio has **done** anything. It feels bland for three structural reasons: (1) **content-starvation** — the only "work" is two invented CSS mockups (Aurora/Nebula) with no clients, screenshots, narratives, or outcomes, and every section is one viewport tall with one-sentence copy; (2) **one flat surface** — the whole document sits on `--bg-900` edge-to-edge with the footer's `--bg-850` as the only tonal break, so sections melt into one dark void; and (3) **a loud-then-whisper hierarchy** — a giant glowing hero headline followed by tiny grey `--fs-sm`/`--text-muted` captions, plus a single boilerplate fade-up reveal applied to literally everything.

**North-star for v2:** *A confident, editorial, alive studio site where type is the hero, real work carries proof, every section has its own surface and rhythm, and 2-3 signature motion moments (a real loader ritual, scroll-choreographed work storytelling, a contextual cursor) make the page feel reactive rather than static.* Keep the existing restraint and 60fps discipline — add **density, proof, and choreography**, not more WebGL everywhere.

---

## 2. Bugs to fix

| Severity | File | Symptom | Fix |
|---|---|---|---|
| **Critical** | `assets/js/animations.js` (L90-171, `gsap.set` L95) | Whole sections can stay permanently `opacity:0`. All `[data-reveal]` are hidden up front via one `gsap.set`; if any tween throws mid-loop, a trigger never reaches its start line, or `ScrollTrigger.refresh()` mis-measures before canvases/fonts settle, the rest stay hidden forever. | Set the hidden state **per-element** at tween-creation time inside a `try/catch` so one failure can't abort the loop. Add an `onComplete` that clears opacity/transform, plus a **safety net**: after init, a `setTimeout(~2.5s)` that force-shows (via `showElement`) any `[data-reveal]` still at computed `opacity:0`. Prefer driving reveals via `IntersectionObserver` (already used reliably in `ui-showcase.js` counters) over fragile start-line math. Call `ScrollTrigger.refresh()` on `window load` **and** in `document.fonts.ready`. |
| **High** | `assets/js/animations.js` (toggleActions L116/142/161; flourish L239) | Content fades back **out** (returns to `opacity:0, y:24`) when scrolling up past it. Hero eyebrow and section heads disappear when scrolling back to top. | Change `toggleActions:'play none none reverse'` → `'play none none none'` or set `once:true` on every reveal trigger so reveals are permanent. Reserve any reverse for purely decorative, never-above-the-fold elements only. |
| **High** | `assets/js/animations.js` (start `'top 85%'` on `.hero__scroll`, index L147) | The hero "Scroll" cue (and anything in the lower ~15% of the first viewport) is invisible on load until the user scrolls — the cue that *invites* scrolling is hidden. | Run first-screen reveals (hero eyebrow/title/lead/actions/trust/scroll) on a **dedicated intro timeline** fired on load (chained off the new loader), not gated by scroll position. For below-fold reveals keep ScrollTrigger but use `start:'top 90%'` and force-show first-screen items after `refresh()`. |
| **Medium** | `index.html` (L336) + `assets/js/main.js` (`initMagnetic` L317) | `[data-magnetic-text]` does nothing — JS only moves the outer `[data-magnetic]` element; the inner text never parallaxes. | In `initMagnetic`, `var textEl = el.querySelector('[data-magnetic-text]')`; in the rAF loop give it a smaller independent translate (`currentX*0.4, currentY*0.4`) so the label leads/lags the button. |
| **Medium** | `assets/css/main.css` (`.tilt-card__shine` L646-649) + `assets/js/main.js` (`initTilt` L398) | The tilt-card specular shine sits at a fixed `50% 0%` and never follows the pointer. JS sets `rotateX/Y` but never writes `--mx`/`--my`. | In the tilt `pointermove` handler set `el.style.setProperty('--mx',(px+0.5)*100+'%')` and `--my` from the normalized `px/py` already computed (L462-463). Reset on leave. |
| **Medium** | `index.html` (demo cards have BOTH `data-reveal` + `data-tilt`, L167/220) + `main.js` `initTilt` | Hovering a card mid-reveal makes it snap: the tilt `transform` overwrites GSAP's `y`/opacity reveal transform (both write inline `style.transform` from independent loops). | Separate the two transforms onto different nodes: animate `data-reveal` on the outer `<article>` and move `data-tilt` to an **inner wrapper** (e.g. a new `.demo-card__inner` around `.browser`). Or gate `initTilt` behind a `data-revealed` flag set in the reveal `onComplete`. |
| **Low** | `assets/js/main.js` (`initCustomCursor` L152-179) | Cursor ring `is-hover` can flicker on dense nav/button rows and occasionally stick on, due to capture-phase `pointerover`/`pointerout` + `relatedTarget` edge cases. | Replace the two delegated listeners with a single source of truth: on `pointermove`, `cursor.classList.toggle('is-hover', !!e.target.closest(interactiveSelector))`. Eliminates relatedTarget races. |
| **Low** | `assets/js/ui-showcase.js` (`initModals` backdrop L404-417) | Backdrop tap-to-close is `mousedown`/`mouseup` only — unreliable on touch; rest of the codebase is pointer-event based. | Use `pointerdown`/`pointerup` with the same `e.target===overlay` checks so backdrop-dismiss works for mouse, touch, and pen uniformly. |

> While in these files, also delete the **dead `initParallax()`** (animations.js L178-206) — no `[data-parallax]` element exists — *or* (better) wire it up by adding `data-parallax` hooks per the enrichment plan below. Don't leave it dormant.

---

## 3. Section-by-section enrichment

General rule applied throughout: **alternate surfaces** so sections read as composed bands, not one void. Introduce a new token set and use it to give each section its own ground:

```css
/* tokens.css additions */
--surface-base:  var(--bg-900);
--surface-raised: var(--bg-850);
--surface-panel: var(--bg-800);
--hairline: rgba(255,255,255,0.06);
--grad-aurora-anim: linear-gradient(110deg,#7c5cff,#22d3ee,#e879f9,#7c5cff); /* 300% bg-size, animated position */
```

Add a `.section--raised { background: var(--surface-raised); }` modifier and top/bottom `.divider` glows (already in components.css L293) between every section.

### Nav (`#nav`)
- **Scrollspy active state**: in `animations.js`, one `ScrollTrigger` per section that toggles `.is-active` on the matching `.nav__menu a`; animate the existing `::after` underline (main.css L179) to `scaleX(1)` on active.
- **Scroll-progress bar**: a 2px fixed bar under the nav, width driven by `ScrollTrigger` global progress, filled with `--grad-aurora-anim`. New element `#scroll-progress` (owned by index.html + main.css).
- **Animated logo mark**: make `.nav__mark` (main.css L142) a live gradient — apply `--grad-aurora-anim` with a slow `background-position` keyframe; subtle scale-breathe on hover.
- **Magnetic CTA**: add `data-magnetic` to `.nav__cta` so the primary nav button reacts (bug-fixed magnetic now also moves the label).
- Add a small **availability status dot** + "Available — Q3 2026" in the nav right cluster (mono, `--fs-xs`).

### Hero (`#hero`)
- **Kinetic headline**: split `.hero__title` with GSAP `SplitText` into lines+words, each line in an `overflow:hidden` mask, reveal `yPercent:110 → 0`, `stagger:0.08`, `power4.out`, fired by the loader's master timeline (fixes the High bugs by not gating on scroll). Add a **one-time gradient sweep** across "higher fidelity" using `--grad-text` with an animated `background-position`.
- **Animate `.hero__glow`** (main.css L280): turn the two static radial gradients into a slow-drifting aurora — keyframe the radial centers (`background-position`) over ~24s; pair with the existing WebGL blob.
- **Replace the generic trust row** (index L129-144): swap "Awwwards-tier / WebGL+GSAP / 60fps" for **real proof** — 2-3 named awards ("Awwwards SOTD ×3", "FWA", "CSSDA") or a "Trusted by" mini-row feeding into the new logo wall. Keep the gradient-clip `strong` styling (main.css L318).
- **Hero scroll cue**: keep the animated line; reveal it via the intro timeline (not ScrollTrigger).
- Add a faint **`data-parallax`** treatment to `.hero__inner` content vs `#hero-canvas` (wire the dead `initParallax`) for depth on scroll.

### Section 1 · Live Demos (`#work`)
This is the deadest section and the single biggest opportunity. Reframe from "two CSS mockups" to **"Selected Work"** with editorial framing while keeping the live demos as the marquee pieces.
- **Editorial metadata per card**: add a numbered index (`01 / 02`), uppercase mono meta rows — **Sector / Services / Year / Role** — above each `.demo-card__title`. Reuse `.eyebrow`/`--font-mono`.
- **Looping micro-motion inside the mocks** (kills the "dead placeholder" feel): animate `mock-nebula__chart` polyline with a `DrawSVG`-style dash draw + a pulsing data point; drift the `mock-aurora__bottle` with an infinite `sine.inOut` `y`/`rotate`; slowly shift the `mock-*__bg` gradient positions. All pure GSAP/CSS, `prefers-reduced-motion`-gated.
- **Richer hover**: add the WebGL/parallax-layer feel cheaply — on hover, scale `.browser` (already has the lift), add a brand-glow ring via `box-shadow: var(--glow-violet)`, and have the **custom cursor show a "View case →" label** (see Global Polish). Fix the reveal/tilt transform conflict (Bug above) by tilting an inner wrapper.
- **Outcome line per card**: one bold metric ("+38% conversion", "Launched in 6 weeks") in `--text` not `--text-muted`, to break the whisper hierarchy.
- Make the grid breathe: keep 2-col but consider one card spanning wider as a featured piece (`grid-column: span` tension) once real case studies exist.

### Section 2 · 3D & Interaction Lab (`#showcase`)
Give the canvases **context = value**, not just technique jargon.
- **Reframe captions**: keep the technique note (`--font-mono`, dim) but add a **value line** in `--text-soft`: e.g. "Morphing blob → *Signature hero motion that makes a brand unforgettable*". The note becomes the subtitle, the value becomes the title.
- Put this section on `.section--raised` so the glass lab cards pop against a slightly lighter ground.
- **Deploy the lab's delight into real UI** (it's currently quarantined): the magnetic button, tilt, focus-shine, and toggle patterns should also drive the real nav CTA, contact inputs, and work cards. Add a small "These aren't demos — they ship on every project" line to make the point explicit.
- **Pin the lab heading** with a short scrubbed `ScrollTrigger` so the three canvases reveal in a staggered, choreographed sequence (clip-path wipe, not just fade) as the section enters.

### Studio (`#studio`)
- **De-duplicate stats**: the "120+/38/99%" trio repeats in the hero, the UI counters, AND here. Pick distinct, *named* credibility here: list **actual award names + years**, name 2-3 flagship projects, show "weeks to ship". Stats should each carry a one-line proof caption.
- **Stat cards alive**: add iconography, a hover lift (`.glass--hover`), and a subtle `--grad-aurora-anim` hairline shimmer on the `.studio-stat` `ring-grad`.
- **Long-form voice**: the studio lead is one sentence. Add a 2-3 sentence **manifesto** with opinion and personality (Basement-style confident tone) — this is where the studio becomes humans with a POV.
- **Process deep-dive**: expand the 3 steps (Define/Design/Engineer) with deliverables sub-lists and durations; connect them with an animated SVG line drawn on scroll (`DrawSVG`).
- **Marquee**: keep the tech marquee but **add a second marquee of client/partner logos** (the trust the page lacks); tie marquee speed to scroll velocity via `ScrollTrigger.getVelocity()`.

### Contact (`#contact`)
- Precede it with a **full-width big-CTA band** (see New Sections) so the page doesn't end on a quiet form.
- **Enrich the form**: add **project-type chips** (Web / WebGL / Brand motion / Design system) and a **budget-range** segmented control (reuse the `.tabs` component) above the message field.
- **Deploy delight**: give `.field__input` the focus-shine/`--mx` treatment; add an **inline success animation** — an animated SVG checkmark (`DrawSVG` stroke draw) replacing the spinner, plus a brief confetti/glow burst — instead of only swapping `#form-status` text (main.js L655-668).
- Add the **studio's real contact details** beside the form: email, location, response time, social links, availability status — feeds the richer footer.

### Footer (`#footer`)
The most anemic block. Rebuild `.footer__inner` into 4 columns:
- **Brand + status**: wordmark, tagline, "● Available for new projects — Q3 2026".
- **Sitemap**: Work / Showcase / Studio / Contact (existing) **+ new sections** (Services, Process, FAQ).
- **Contact**: email (`hello@ellevux.studio`), location, response time.
- **Social + awards**: social links + small award badges (Awwwards/FWA/CSSDA).
- Add a big **kinetic footer wordmark** ("ELLEVUX" at `--fs-display`, low-opacity, gradient-clipped) bleeding off the bottom edge — a signature closing moment. Keep the `--bg-850` ground.

---

## 4. New sections to add

Ordered by page placement (top→bottom). All reuse existing components (`.glass`, `.ring-grad`, `.marquee`, `.chip`, `.tabs`, `.divider`) and tokens.

1. **Client logo wall** *(after Hero, before Work)* — "Trusted by" + a `.marquee` (or static grid) of client/partner logos (SVG/monochrome, brand-tinted on hover). Converts the page's biggest missing signal (social proof) using the component that already exists. `.section--raised`.

2. **Case studies / Selected Work expansion** *(this IS the upgraded `#work`)* — beyond the two live demos, add 2-3 **real case-study entries**: hero screenshot/video, client, sector, problem → approach → outcome, quantified result, year/role. Editorial numbered index. This is the **#1 gap** — an agency lives on real work. Each entry reveals with a clip-path mask on scroll; consider a pinned/scrubbed featured case study.

3. **Services / Capabilities** *(new, after Work)* — a **bento grid** (CSS Grid spans, per trend research) of what Ellevux actually sells: Web Design, WebGL/3D, Brand & Motion, Design Systems, Art Direction, Front-end Engineering. Each tile = icon + scope + deliverables + a representative micro-visual. Fine `--hairline` borders + inner glow so tiles feel detailed even when sparse. Distinct from the process steps (which are *how*, not *what*).

4. **Testimonials / pull-quotes** *(after Services)* — a band with one oversized display-type pull-quote (`--fs-h1`, serif-feel via `--font-display`), client name/role/company, optional avatar. Cycle 2-3 quotes; high-impact, expected agency element, currently absent.

5. **Awards / Recognition strip** *(near Studio)* — substantiates the "38 awards" claim that's currently stated but never shown. A row of named awards with dates and the project they were for (Awwwards SOTD, FWA, CSSDA, etc.).

6. **Team / About** *(inside or after Studio)* — faces, names, roles, a short studio origin story. "A small team with obsessive craft" needs actual people to feel welcoming instead of anonymous.

7. **FAQ accordion** *(after Studio, before CTA)* — buyer questions: timeline, budget range, engagement model (project vs retainer), process, post-launch support, tech stack. Accessible `<details>`/disclosure pattern (lean on the **accessibility** skill); animate open/close height. Adds substance and reduces friction.

8. **Big-CTA band** *(immediately before Contact)* — full-bleed, `--fs-display` "Have a project in mind? **Let's talk.**", animated aurora background, one magnetic primary button. Anchors the page end with a strong conversion beat. `.section--raised` or a full WebGL-tinted band.

> Optional / later: a lightweight **Journal/Insights** teaser (3 cards) for SEO + thought leadership, and a **pricing/engagement** mini-section folded into the FAQ.

---

## 5. Global polish & motion

Build the **system first** (loader, smooth scroll, cursor, surfaces, animated gradients), then layer signature moments. Everything below is `prefers-reduced-motion`-gated (tokens already collapse `--dur-*` to `0.001s` under reduced motion — extend that discipline to JS).

- **Page loader / intro ritual** *(new `#loader` + `loader.js`)*: full-screen overlay with a **real percentage counter** wired to `THREE.LoadingManager.onProgress` + `document.fonts.ready` + a `Promise.all` of hero assets. Tween the number with `gsap` + `snap`. On 100%: a `clip-path` curtain lift (`inset(0 0 0 0)→inset(0 0 100% 0)`), chained directly into the hero `SplitText` reveal. This is the **fix for the hero/first-screen reveal bugs** — first-screen content is revealed by this timeline, not by scroll triggers. Reduced motion → skip straight to revealed.

- **Smooth scroll (Lenis)**: add Lenis (`lerp ~0.09`), drive `ScrollTrigger.update` from its `scroll` event via `gsap.ticker`. The single weighted scroll value backs all parallax/pinning. **Disable entirely under reduced motion.** Keep the lerp subtle to avoid lag.

- **Scroll choreography**: replace the one-effect fade with **variety** in `animations.js` — clip-path wipes for media, directional/alternating slides for editorial rows, scale for cards, scrubbed parallax (`data-parallax`, finally wired) for backgrounds vs foregrounds. One **pinned + scrubbed** moment on the featured case study; one **horizontal-scroll** strip (services or logos) for rhythm. Scrollspy + the scroll-progress bar (Section 3).

- **Custom cursor upgrade** *(`main.js`)*: keep the eased ring; add **contextual labels** — `data-cursor="View case"` on work cards, `"Drag"`/`"Explore"` on canvases, `"Open"` on the modal trigger. Cursor reads the attribute and shows the label (the Awwwards move). Apply the single-`pointermove` hover model (fixes the Low flicker bug).

- **Micro-interactions everywhere** (lean on the **micro-interactions** skill): magnetic primary CTAs (nav + hero + big-CTA band), `:active` scale `0.97` + spring pop on buttons, the now-working tilt shine, focus-shine on inputs, a hero element "breathe" (`y:+=8, scale:1.01, yoyo, sine.inOut`). Durations 150-400ms for UI feedback.

- **Marquees**: the existing CSS marquee plus the new logo marquee; tie speed to scroll velocity; edge-fade mask already present (components.css L287).

- **Living gradients & texture**: animate `--grad-aurora` usages (text gradient, `ring-grad`, buttons, nav mark) with a slow `background-position` keyframe (`--grad-aurora-anim`, 300% size). Keep the existing `#grain` overlay; consider adding a matching grain/vignette pass to the WebGL fragment shaders so canvas and DOM share the same film grain.

- **Section/page transitions**: this is a multi-page site (live demos in `demos/`). On internal navigation, intercept clicks → play a clip-path curtain OUT → navigate; run the loader's IN timeline on arrival. Use the **page-transitions** skill (View Transitions API where supported, GSAP curtain as the universal fallback).

- **Optional welcome layer**: a persistent **sound toggle defaulting OFF** (Web Audio, subtle hover ticks/transition whooshes, remembered in `localStorage`); one tasteful easter egg. Always opt-in, reduced-motion-aware.

---

## 6. Execution map (parallelizable workstreams)

File ownership is split so multiple engineers work without merge conflicts. **WS-A (tokens) lands first** — everyone else depends on the new tokens. **WS-B (bug fixes) can start immediately and in parallel.** index.html is touched by several streams, so structure it with clearly commented section blocks and assign one owner per *new section block*.

### WS-A · Design system & surfaces *(land first — blocks others)*
**Files:** `assets/css/tokens.css`, `assets/css/base.css`, `assets/css/components.css`
- Add surface tokens (`--surface-*`, `--hairline`), `--grad-aurora-anim`, a `.section--raised` modifier, and a kinetic-type / SplitText-line mask utility (`.is-revealing .line { overflow:hidden }`).
- Add the animated-gradient keyframes + apply opt-in via a `.grad-anim` class.
- New components: `.bento`/`.bento__tile`, `.pull-quote`, `.faq`/disclosure, `.cta-band`, `.logo-wall`, `.case-study`, `.scroll-progress`, big footer wordmark. Each as a reusable, token-driven block.
- Publish the new class/token contract so other streams build against it.

### WS-B · Runtime bug fixes *(start immediately, independent)*
**Files:** `assets/js/animations.js`, `assets/js/main.js`, `assets/js/ui-showcase.js`
- Fix all 8 bugs in Section 2 (reveal fail-safe + IntersectionObserver fallback; `toggleActions`/`once`; first-screen intro handoff stub; magnetic-text; tilt `--mx`/`--my`; reveal/tilt node separation; single-`pointermove` cursor hover; pointer-event modal backdrop).
- Delete or wire the dead `initParallax`.
- Expose hooks the other streams need (`window.Ellevux.reveal(el)`, scrollspy init).

### WS-C · Loader, smooth scroll & motion choreography
**Files:** `assets/js/loader.js` *(new)*, `assets/js/animations.js`, `index.html` (loader markup + Lenis/GSAP-SplitText script tags), `assets/css/main.css` (`#loader`, `#scroll-progress`)
- Build the loader ritual (real % counter via `THREE.LoadingManager` + `fonts.ready`), curtain lift, hero `SplitText` handoff.
- Integrate Lenis + `ScrollTrigger.update`; add reveal variety (clip-path/scale/directional), parallax wiring, one pinned case study, one horizontal strip, scrollspy + progress bar.
- Coordinate with WS-B on the first-screen reveal handoff (intro timeline owns hero, scroll owns the rest).

### WS-D · WebGL & signature visuals
**Files:** `assets/js/three-hero.js`, `assets/js/showcase-3d.js`, optional `assets/js/work-distortion.js` *(new)*
- Add grain/vignette to the hero + lab fragment shaders (DOM/canvas grain parity).
- Tie the hero blob subtly to scroll progress (damped, lerp the camera/uniform — never tween the camera directly).
- Optional: a shared DOM-synced displacement plane for work-thumbnail hover distortion (ship `<img>`/CSS fallback; lazy-init; cap DPR; pause offscreen — match the existing perf contract).

### WS-E · Content & new sections (HTML/CSS authoring)
**Files:** `index.html` (new section blocks), `assets/css/main.css` (section layouts), real assets in a new `assets/img/`
- Author **real case-study content**, **Services bento**, **Testimonials**, **Awards strip**, **Team/About**, **FAQ**, **Big-CTA band**, **logo wall**, enriched **footer**. Add real imagery (the site currently has zero `<img>`).
- Rewrite thin copy into long-form, opinionated voice; de-duplicate the repeated stats; replace generic trust claims with named proof.
- Wire new sections to WS-A components and WS-C reveal hooks.

### WS-F · Interaction deployment & forms
**Files:** `assets/js/main.js`, `assets/js/ui-showcase.js`, `assets/css/main.css`
- Deploy lab delight into real UI: magnetic CTAs (nav/hero/CTA-band), contextual cursor labels (`data-cursor`), input focus-shine, tilt on work-card inner wrapper.
- Upgrade the contact form: project-type chips + budget segmented control (reuse `.tabs`), inline `DrawSVG` checkmark success + glow burst.
- Build the FAQ accordion behavior and (optional) the sound toggle + localStorage.

**Suggested sequence:** A + B in parallel first → then C, D, E, F in parallel against the published A/B contracts → integration pass (`ScrollTrigger.refresh()` after all sections exist; verify reduced-motion and touch paths; Lighthouse/60fps check).

---

### Executive summary

Ellevux is a polished engineering demo that *feels* empty because it has thin placeholder content, one flat dark surface edge-to-edge, and a loud-headline/whisper-body hierarchy reusing a single fade-up for everything. v2's north-star: an editorial, alive studio site where type is the hero, real work carries proof, every section has its own surface and rhythm, and 2-3 signature motion moments make it feel reactive. First, fix 8 real bugs — the critical one being a reveal flaw that can leave whole sections permanently invisible — plus the hero/first-screen reveals that hide until you scroll, and the dead magnetic-text/tilt-shine hooks. Then enrich every existing section (kinetic hero, alive work cards, contextual lab, de-duplicated named studio stats, richer footer) and add the missing premium-agency sections: client logos, real case studies, a services bento, testimonials, awards, team, FAQ, and a big-CTA band. Layer global polish: a real percentage loader ritual, Lenis smooth scroll, scroll choreography with variety, a contextual cursor, animated gradients, and section transitions — all reduced-motion-gated. Work is split into six file-scoped workstreams (tokens, bug fixes, loader/scroll, WebGL, content/sections, interaction deployment) so engineers build in parallel without conflicts, with the token system and bug fixes landing first.
