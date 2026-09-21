# CLAUDE.md

Project guidance for Claude Code (and any developer) working on this repo.

## What this is
**Ellevux** is a personal front-end developer **portfolio**, designed in the editorial style of
henriheymans.com: pure-black canvas, bold grotesque headlines with italic-serif accents, one acid-green
accent used sparingly, a **particle-text hero** (the headline is a GPU particle cluster that, on scroll,
flies down and morphs into the "Selected Works" heading), scattered "Selected Works", a playful About,
and a giant footer wordmark.

- **Brand / wordmark:** "Ellevux" (lowercase `ellevux` in the nav, `Ellevux` in the footer wordmark).
- **Person:** "Yuvi" / "Yuvraj Singh" (a 20-year-old web developer) appears in the About copy only.
- Do not confuse the two: the site is branded **Ellevux**; the human is **Yuvi**.

## Status: LIVE
- **Portfolio:** deployed to Vercel, production at **https://ellevux-studio.vercel.app** (project
  `ellevux-studio`, under the `ellevux` team scope). Source repo: GitHub **Yuvraj-Singh-5492/Ellevux.Studio**.
- **ARC** (Selected Works 04) is its own Vercel project, **https://arc-atelier.vercel.app**.
- See **Deploy** below for how deploys actually happen (no Node here → Vercel REST API).

## Stack & hard constraints
- **Static, no build step** for the portfolio. Plain HTML/CSS/JS. There is **no Node/npm** on this machine
  (git is). **Python 3.12 + Playwright were UNINSTALLED (found 2026-09-18).** Workarounds: Blender's bundled
  Python `D:/Blender/5.2/python/bin/python.exe` runs stdlib-only scripts (deploy, a local http server);
  headless Chrome (`--headless=new`, own `--user-data-dir`) does screenshots, and a same-origin harness page
  of fixed-width iframes gives true-viewport overflow checks. Do not introduce a bundler/framework for the
  portfolio unless explicitly asked. (ARC is the exception — it is a separate Vite/React app, see ARC below.)
- **Libraries via CDN:** Three.js (ES module, via `<script type="importmap">`) for the hero particle-text
  system (a custom GPU `ShaderMaterial`), and GSAP + ScrollTrigger for scroll motion (incl. the hero morph).
- **Must be served over http** (the hero uses ES modules, which browsers block on `file://`).
  Run: `python -m http.server 5510` from the project root, or VS Code **Live Server**. See `README.md`.

## File map
```
index.html              the whole portfolio (nav · hero · #work · #about · footer/#contact)
testimonials.html       second page: client/project cards + hidden quote slots (see "Testimonials page")
og.png                  1200x630 social share image (the hero on black). Served at site root (/og.png).
robots.txt, sitemap.xml at root. NOTE: their host + og:url/canonical in index.html still use the PLACEHOLDER
                        domain ellevux.studio; update to the real deploy origin when a domain is attached.
.gitignore              excludes the Obsidian vault (Ellevux WEB/), the cafe backup, ARC/ (separate project),
                        secrets, and a stale in-folder cafe backup.
assets/css/             linked from index.html with ?v=8 cache-bust (bump ALL FOUR together on any CSS edit):
  tokens.css            design tokens (single source of truth) — colors, type, spacing, motion. Still has a
                        big "LEGACY TOKEN MAP" of v4 names; ~58 of them are unused and pending removal (see
                        "Dead-code cleanup" below).
  base.css              reset, base elements, a11y (focus, skip link, reduced-motion)
  components.css        reusable UI (nav, .work-item/.work-art, .pill-btn, social-links, labels...). Its
                        "PART B legacy components" block (.bento/.case/.glass/.stat/.browser/.btn/...) was
                        REMOVED in the dead-code cleanup (see "Dead-code cleanup" below).
  main.css              page layout (hero, the Selected Works scatter, about, footer; §9 phone nav 2x2
                        grid <=600px; §10 the testimonials page .tm-*)
assets/js/
  three-hero.js         (ES module) the HERO PARTICLE TEXT. #hero-canvas is a PAGE-LEVEL fixed layer
                        (z-index:-1, behind all content, on the black bg) — NOT inside #hero. Samples the
                        real <h1> into a GPU ShaderMaterial particle cluster; on scroll the particles fly
                        DOWN and morph into the #work "Selected Works" heading (scroll-scrubbed, no pin) and
                        PERSIST as it. Boots straight to particles (no crisp flash). FAIL OPEN (see below).
                        Runs on ALL screens incl. phones (mobile uses ~22000 particles, smaller dots, near-
                        zero wobble/jitter so the small glyphs read SOLID, not scattered). Cursor-repel is
                        gated to fine pointers (no touch "blackhole"). Morph survives the mobile address bar
                        (ScrollTrigger ignoreMobileResize + width-only resize guard).
  animations.js         GSAP/ScrollTrigger reveals (FAIL OPEN) + nav compact-on-scroll
  main.js               mobile nav, smooth anchor scroll, contextual custom cursor (data-cursor),
                        magnetic buttons, tilt, contact form, footer #year
assets/img/
  work-cafe.png         16:9 thumbnail for the Buzzy cafe work card (comic hero screenshot)
  work-ellevux-site.png 16:9 thumbnail for the Ellevux SaaS card (headless screenshot of ellevux.vercel.app)
  work-arc.png          16:9 thumbnail for the ARC card (the scroll-built 3D house hero, from ARC/.verify)
  work-mirror.png       16:9 thumbnail for Mirror Solutions (headless-Chrome shot of mirror-solutions.com)
  portrait.jpg          About-card B&W portrait (4:5): a moody hooded silhouette at a laptop by a cliffside
                        window. Fills the .portrait slot (object-fit:cover, grayscale). NOTE: it is a stock-
                        style aesthetic shot, not a real photo of Yuvi.
demos/                  (the cafe + lab are LINKED from #work; aurora + nebula are archived/unlinked)
  cafe/index.html       BUZZY (was Marigold), Selected Works 01, LIVE. A CUTE COMIC / illustrated coffee
                        house (cream paper, Baloo 2 + Caveat, brown ink, amber/terracotta pops, doodles,
                        chunky "comic" buttons) toggled by class="comic" on <body>. A dark "Liquid Coffee
                        Spectacle" (WebGL fluid-coffee shader you stir with the cursor) is preserved
                        UNDERNEATH and disabled by the comic class. three (ESM) + GSAP + ScrollTrigger +
                        Draggable + Lenis (InertiaPlugin tag was removed — not on any free CDN). Uses ONE
                        external image (cafe/assets/iced-coffee.png, the owner's watercolor cup).
  cafe/assets/iced-coffee.png  the owner's own watercolor iced-coffee illustration (bg removed); hero art.
  _cafe-backup-2026-06-16/     backup of the pre-comic cafe build (gitignored).
  lab/index.html        ELEMENTS (Selected Works 03), a capabilities showcase (NOT a site demo). 11 numbered
                        sections: nav, a WebGL 3D render + particle morph, feature tabs, tilt cards, micro-
                        interactions, accordion, form, modal, loaders/progress, count-up stats, footers.
                        Ships LOCKED to the dark .editorial theme. ACCENT IS NOW **CHROME / metallic silver**
                        (--accent #d6dde6, plus --chrome / --chrome-surf gradient tokens applied via
                        background-clip:text to accent text + as beveled-metal button surfaces; the 3D render
                        is a polished silver-chrome). The theme switcher + 6-colour accent picker + deep-links
                        were REMOVED (the .lab playful token set is kept below as dead/reference CSS only).
                        Self-contained; three (ESM importmap) + GSAP. a11y-cleaned (switch label, accordion
                        aria-expanded, modal focus trap, tablist roving + arrow keys, --faint contrast).
  aurora/index.html     old luxury-beauty demo, ARCHIVED, unlinked (deployed but not referenced anywhere)
  nebula/index.html     old AI-SaaS demo,        ARCHIVED, unlinked
ARC/                    GITIGNORED. A SEPARATE Vite + React 19 + react-three-fiber + Tailwind v4 + GSAP +
                        Lenis app ("ARC Atelier", an architecture studio with a scroll-built low-poly 3D
                        house hero). Deployed on its OWN Vercel project (arc-atelier.vercel.app). Has its
                        own node_modules; not part of the portfolio repo. See "ARC" below.
Ellevux WEB/            an Obsidian vault (gitignored). STALE — describes an abandoned AI-SaaS direction.
CAFE-RESEARCH.md / CAFE-SPEC.md / CONTRACT*.md / REDESIGN-PLAN.md   historical specs/research (reference only)
handover.md             current state + what's left (read alongside this file)
```

## Testimonials page (`testimonials.html`, nav link on both pages)
Three cards: **01 Mirror Solutions** (real client, https://mirror-solutions.com, a Spanish-language real-estate
engineering consultancy), **02 Ellevux** (own product), **03 ARC** (labelled a SELF-INITIATED CONCEPT, since the
studio is fictional; it has no quote slot). Each real card has a `<figure class="tm-quote" hidden>` with empty
fields. **Never invent or paraphrase a testimonial:** only fill a slot with words the owner supplies, then
remove `hidden`. Until then the page reads as a client/project list. The nav has FOUR links now; <=600px they
fold into a right-aligned 2x2 grid (one row overflows at phone widths).

## Selected Works (in `#work`) — FOUR cards now, scattered (4 corners on desktop, stacked < 768px)
The `.work-art` tiles are **16:9**; thumbnails are `object-fit: cover`, grayscale at rest, full colour on hover.
1. **Buzzy — Coffee House** → `demos/cafe/index.html` (internal; cute comic coffee house, `body.comic` theme).
2. **Ellevux — AI SaaS** → `https://ellevux.vercel.app/` (external, opens **same tab**; the owner's live
   project). Thumbnail `work-ellevux-site.png` (live-site screenshot, reads dark — that's the site).
3. **Elements — UI, Motion & 3D** → `demos/lab/index.html` (internal capabilities showcase, 11 sections,
   locked Dark Editorial with a **chrome/silver** accent, see file map). Slot-03 thumbnail is an inline SVG
   wordmark ("Elements"), not an image.
4. **ARC — Architecture & 3D** → `https://arc-atelier.vercel.app/` (external, opens **same tab**,
   `rel="noopener"`; a separate Vite/React/R3F architecture site). Thumbnail `work-arc.png`.

The #work `<h2>` "Selected Works" is the morph TARGET: the hero particles land on it and persist (the real
`<h2>` is hidden, see the FAIL-OPEN note in Conventions).

## ARC (the architecture demo, separate project under `ARC/`)
- **Stack:** Vite 6 + React 19 + TypeScript + @react-three/fiber 9 + drei 10 + three 0.180 + Tailwind v4
  (CSS-first `@theme` in `src/styles/globals.css`) + GSAP/ScrollTrigger + @gsap/react + framer-motion + Lenis.
- **Fonts:** **Inter** (display + body, self-hosted via @fontsource) + **IBM Plex Mono** (small/technical
  labels, via Google Fonts). The owner rejected a serif (Fraunces) display — keep it Inter.
- **Hero:** a scroll-built low-poly 3D house (440vh scroll) with a `3D House / Blueprint` toggle (the
  Blueprint is a line-drawn SVG section). The 3D render pauses (`frameloop="never"`) once scrolled offscreen.
- **Content is FICTIONAL placeholder** (studio "ARC Atelier", a fake email `studio@arc-atelier.com`, made-up
  projects/architects/awards). No em-dashes in copy (owner rule applied here too).
- **Deploy:** Vercel builds it (framework `vite`, buildCommand `vite build` to skip the `tsc` typecheck,
  outputDirectory `dist`). Upload the SOURCE only (exclude node_modules, .verify, scripts, dist).
- **Cannot build/run locally** (no Node) — verify ARC changes by redeploying + screenshotting the live site.

## Design system (use tokens, never hard-code)
- **Portfolio palette:** pure black `--bg:#000`, white text, ONE acid-green accent `--accent:#c8fa3c` used
  **sparingly** (the email pill, focus states). The cafe (Buzzy) is its own comic world; the Elements page is
  its own dark editorial world (CHROME accent); ARC is its own light architecture world (warm off-white,
  corten accent). Do NOT bleed the portfolio palette/fonts into the demos.
- **Type:** `--font-sans` = **Inter**, `--font-serif` = **Instrument Serif** (italic accent via `.accent-serif`
  on a few words). Loaded from Google Fonts in `index.html`.
- Editorial, asymmetric, lots of negative space, oversized type.

## Conventions / rules (follow these)
- **No em-dashes in copy.** Use commas, periods, colons, or middots. (Owner preference, ALL visible text,
  every project including the demos and ARC. Code comments may keep them.)
- **Reveals must FAIL OPEN:** `[data-reveal]` hidden states are set in JS only, with try/catch + a ~2.5s
  failsafe, so content is always visible if a script/library never loads. (ARC's framer-motion reveals + the
  blueprint also have failsafes now.)
- **Particle headings FAIL OPEN (read before touching the hero):** the hero `<h1>` and the #work `<h2>` are
  hidden via CSS (`html.hero-particled` / `html.work-particled`) so the particle text shows with no crisp-
  text flash — but ONLY after a pre-paint inline `<head>` script confirms WebGL + motion. `three-hero.js`
  REMOVES those classes (revealing the crisp headings) on ANY failure, and the inline script's 2.5s failsafe
  + the module-tag `onerror` are backstops. Do NOT hide either heading in CSS without a JS reveal path. The
  DOM keeps one real `<h1>`/`<h2>` (opacity:0, still in the a11y tree).
- **Responsive, mobile-first:** must hold at 375 / 768 / 1280 / 1440 with no horizontal overflow. Use
  Playwright (true viewports) to test — headless Chrome's `--window-size` clamps to ~482px and HIDES real
  mobile overflow (this exact trap masked a real "Selected Works" overflow bug earlier).
- **WCAG 2.1 AA:** semantic landmarks, one `<h1>`, labelled form fields, visible focus on black, decorative
  canvas/SVG `aria-hidden`. Do not use `--text-dim`-level greys for body copy.
- **`prefers-reduced-motion`:** every animation has a calm static fallback; the particle hero does NOT run.
- **60fps:** animate transform/opacity only; cap canvas `devicePixelRatio <= 2`; pause rAF/render offscreen.

## Deploy (IMPORTANT — there is no Node, so no Vercel/GitHub CLI)
- **Tokens** are provided by the owner per-session and revoked afterward. Store them OUTSIDE the repo (e.g.
  `~/.ev_vc`), never commit them, and delete them when done.
- **Portfolio → Vercel** via the REST API (a Python script): for each tracked web file, `POST /v2/files`
  with an `x-vercel-digest` SHA, then `POST /v13/deployments` with `{name:"ellevux-studio", files:[{file,
  sha,size}], target:"production", projectSettings:{framework:null,...}}`. It is a static deploy (no build).
  Exclude `.md`, `.gitignore`, and `demos/cafe/assets/README.txt` from the upload set.
- **ARC → Vercel** the same way but `projectSettings:{framework:"vite", buildCommand:"vite build",
  outputDirectory:"dist", installCommand:null}` and upload `ARC/` SOURCE (no node_modules/.verify/scripts).
  Vercel runs npm install + vite build in the cloud.
- **git push needs the token in the URL** (`https://x-access-token:<PAT>@github.com/...`); the bearer
  extraHeader does NOT work for GitHub git. Redact the token from any command output.
- **The GitHub repo is BEHIND the live site:** recent turns only had a Vercel token, so several commits are
  local-only (committed but unpushed). The LIVE site is current. Push to sync when a GitHub token is given.
- **Contact email** is real now: `mailto:yuvrajsinghgill5492@gmail.com`. The `ellevux.studio` domain in
  og:url / og:image / canonical / robots / sitemap is still a placeholder.

## Gotchas
- **Hero particle layering:** `#hero-canvas` is a page-level `position:fixed; z-index:-1` layer on the black
  body bg, BEHIND all content. Works only because every `section{isolation:isolate}` and the design is pure-
  black with transparent sections. Don't move the canvas into `#hero` or change the z-index without re-checking.
- **Hero morph is scroll-driven, no pin.** Particle positions are placed from each heading's cached document
  position minus live scroll. There is NO `.hero__scrim` anymore; legibility is content-bound `text-shadow`.
- **bfcache:** work links open in the SAME tab, so the browser **Back** button restores the page from bfcache
  without re-running init. `three-hero.js` PAUSES on `pagehide[e.persisted]` and RELOADS on `pageshow
  [e.persisted]`. Verify Back-button behaviour after touching the hero lifecycle.
- **Hero meta caption** (`.hero-meta-block`, top-right, >=768px, `aria-hidden`): "Currently / Open for work /
  Available worldwide" with a pulsing dot. Hero bottom-left is now a **tagline** (`.hero__tagline`), not a
  social row. The footer has no social row; the only social link is the **Instagram** one in the About card.
- **Test the real thing.** Headless Chrome can't reliably scroll-to-anchor and WebGL/loaders may stall;
  Playwright (installed) gives true viewports + console capture + interaction — use it. The cafe/ARC heroes
  need a real browser or Playwright (100svh/pinned/scroll-built).
- **Browser caches CSS/ESM hard.** Hard-refresh after edits; the CSS `?v=` bump exists for this.
- **Headless screenshots of external live sites** need an isolated `--user-data-dir` or they collide with an
  open Chrome and silently fail to write.

## Dead-code cleanup (DONE)
An audit found large blocks of provably-dead CSS/JS (leftover from removed features + the abandoned AI-SaaS
phase). None of it affected behavior (it was unreferenced). The whole sweep is now COMPLETE and verified:
the render is unchanged (mobile pixel-identical to pre-cleanup; desktop reproduces the baseline byte-for-byte
in a clean capture — the only variance is a headless image-decode race on a work thumbnail), no horizontal
overflow, and the functional snapshot is intact (particle hero boots, 4 work cards, 3 nav links, About
portrait, footer pill, Instagram → ellevux, slot-03 SVG wordmark). Removed across the sweep:
- **components.css:** the "PART B legacy components" block (bento/case/demo-card/glass/stat/browser/btn/badge/
  chip/loader + `ev-spin` + index/eyebrow + the legacy reduced-motion @media); the MARQUEE block; the
  SCROLL-CUE block; `.work-art__ph`; `.portrait__ph`; `.vertical-text--down`; `.big-wordmark--outline`;
  `.accent-serif--accent`; `.strike`; `.divider`/`.divider--accent`; + comment tidy.
- **main.css:** the `.nav__marquee` rules (+ its `display:none` in the <=768 @media); stale comments scrubbed
  (marquee / scroll-cue / socials / `.ph`/`.strike` / "placeholder slots 03/04"). (`.ph`/`.strike` only ever
  appeared in main.css COMMENTS, never as rules.)
- **base.css:** `.ph`; `.text-gradient`/`.text-nebula`; comment tidy.
- **tokens.css:** 62 unused tokens (the entire "LEGACY TOKEN MAP" except the still-referenced `--text-muted`,
  plus `--bg-soft-2`, `--text-dim`, `--shadow-sm/md/lg`, `--tracking-base`, `--r-none`, `--dur-slower`,
  `--dur-marquee`, `--z-bg`, `--blur-sm`, `--accent-dim`). Detected by transitive `var()`-usage; after removal
  every defined token has a live consumer and no `var()` is dangling.
- **three-hero.js:** the write-only `revealed` variable.
- **asset:** `assets/img/work-lab.png` (orphaned; slot 03 is an inline SVG wordmark).

ALWAYS keep `.social-links`/`.social-link` (the About Instagram link), `.section--raised` (#about), and the
`--text-muted` token — they are LIVE.
