# Handover — Ellevux portfolio

Snapshot of where the project stands and what is left. Day-to-day conventions + deploy mechanics live in
`CLAUDE.md`. Date: 2026-09-21.

## TL;DR
A static, no-build personal **portfolio** for **Ellevux** (the person is **Yuvi / Yuvraj Singh**, 20, a web
developer). Henri-Heymans editorial: pure-black, Inter + Instrument-Serif accents, a sparing acid-green
accent, a **particle-text hero** that morphs on scroll into "Selected Works", four scattered Selected Works,
a playful About with a B&W portrait, a giant footer wordmark. **It is LIVE:**
- Portfolio → **https://ellevux-studio.vercel.app**
- ARC (work #4) → **https://arc-atelier.vercel.app** (its own Vite/React project)

## What is built and done
- **Hero — particle text + scroll morph (`three-hero.js`):** "INDEPENDENT WEB DEVELOPER" is a GPU
  ShaderMaterial particle cluster sampled from the real `<h1>`; on scroll the particles fly DOWN and reassemble
  onto the #work "Selected Works" heading and persist. Page-level fixed `z-index:-1` canvas. Fully FAIL-OPEN
  (any WebGL/Three/GSAP/shader failure or reduced-motion shows the crisp headings; 2.5s failsafe + module
  onerror backstops). **Runs on phones too** — mobile uses ~22000 particles, smaller dots, near-zero
  wobble/jitter so the small glyphs read SOLID (an earlier "scattered/frizzy" mobile look was the cause; a
  brief "disable particles on mobile" attempt was reverted on the owner's request). Cursor-repel is gated to
  fine pointers (no touch "blackhole"); the morph survives the mobile address bar (ignoreMobileResize +
  width-only resize guard). **bfcache** handled (pause on `pagehide[persisted]`, reload on `pageshow
  [persisted]`). Top-right **meta caption** ("Currently / Open for work / Available worldwide"); hero
  bottom-left is now a **tagline** ("Building websites that feel *alive*, with real-time 3D and choreographed
  motion."), not a social row.
- **Selected Works (`#work`) — FOUR cards, 16:9, grayscale→colour on hover:**
  - **01 Buzzy — Coffee House** → `demos/cafe/index.html`. Cute COMIC / illustrated coffee house (cream
    paper, Baloo 2 + Caveat, the owner's watercolor iced-coffee cup), toggled by `class="comic"`. A dark
    WebGL "Liquid Coffee Spectacle" is preserved underneath, disabled by that class. (Most-iterated piece:
    Marigold → warm-minimalist (rejected) → liquid → comic → renamed Buzzy.)
  - **02 Ellevux — AI SaaS** → `https://ellevux.vercel.app/` (built for a partner team, opens same tab).
    Thumbnail = headless screenshot of the live hero (reads dark — that's how the site looks).
  - **03 Mirror Solutions — AI Agency** → `https://mirror-solutions.com/` (real client, same tab). Replaced
    Elements on 2026-09-21. Also the first card on `testimonials.html`.
  - *(formerly 03)* **Elements — UI, Motion & 3D** → `demos/lab/index.html`, now UNLINKED but still deployed.
    A capabilities showcase, 11 sections (nav,
    a WebGL 3D render + particle morph, feature tabs, tilt cards, micro-interactions, accordion, form, modal,
    loaders/progress, count-up stats, footers). Locked Dark Editorial. **Accent is now CHROME / metallic
    silver** (`#d6dde6` + `--chrome`/`--chrome-surf` gradient tokens applied via `background-clip:text` to
    accent text and as beveled-metal button surfaces; the 3D render is a polished silver-chrome). The theme
    switcher + accent picker were removed; a11y was cleaned (switch label, accordion aria-expanded, modal
    focus trap, tablist roving + arrows, `--faint` contrast).
  - **04 ARC — Architecture & 3D** → `https://arc-atelier.vercel.app/` (opens same tab, rel=noopener). A
    SEPARATE Vite + React 19 + react-three-fiber + Tailwind v4 + GSAP + Lenis app ("ARC Atelier", an
    architecture studio with a scroll-built low-poly 3D house hero + a 3D/Blueprint toggle). Fonts: **Inter**
    + IBM Plex Mono (a serif display, Fraunces, was tried and rejected). Copy refined (no em-dashes). A full
    QA pass added a mobile nav, anchor scroll-margin, turned dead `#work` self-links into `<article>`,
    inerted dead social links, added fail-open to reveals + the blueprint, fixed first-load ScrollTrigger
    refresh timing, paused the 3D render loop when offscreen, and tidied the Lenis teardown. `ARC/` is
    GITIGNORED (it has its own node_modules + Vercel deploy). Thumbnail = `assets/img/work-arc.png`.
- **About:** "Hey! I'm Yuvraj, a 20-year-old web developer..." + a vertical "KNOW MORE ABOUT ME" strip + a B&W
  portrait (`assets/img/portrait.jpg`). The only social link on the whole site is the **Instagram** one here
  (→ instagram.com/ellevux). Footer has no social row.
- **Footer:** giant "Ellevux" wordmark, a "Send me an e-mail" pill (real address now), a thanks line, copyright.
- **Deploy-readiness:** `og.png` (1200x630) + `robots.txt` + `sitemap.xml` at root; canonical + twitter:image
  + og dims in the head; CSS links cache-busted `?v=11` (on both pages).

## Open items / next steps
0. **Testimonial attribution is pending.** The Mirror Solutions (5.0) and Ellevux (4.5) quotes are in, written
   with the clients' go-ahead and approved by the owner, but credited to the company. When the owner sends each
   person's real name + role, swap them into `.tm-quote__name` / `.tm-quote__role`. Never invent names.
1. **Custom domain (optional).** og:url / og:image / canonical / robots / sitemap use the live
   `ellevux-studio.vercel.app` origin. If `ellevux.studio` is ever attached in Vercel, swap them over.
2. **GitHub repo is BEHIND the live site.** The portfolio repo is `Yuvraj-Singh-5492/Ellevux.Studio`; several
   commits are committed locally but unpushed (recent turns only had a Vercel token). Push to sync when a
   GitHub PAT is provided. Live site is current regardless.
3. **Dead-code cleanup is DONE** (full breakdown in CLAUDE.md → "Dead-code cleanup"). Removed the components.css
   "PART B legacy" block + marquee/scroll-cue/placeholder/modifier leftovers + `.divider*`; the `.nav__marquee`
   rules in main.css; `.ph`/`.text-gradient`/`.text-nebula` in base.css; 62 unused tokens in tokens.css; the
   write-only `revealed` var in three-hero.js; and the orphaned `assets/img/work-lab.png`. Verified
   render-neutral (mobile pixel-identical to pre-cleanup, desktop reproduces the baseline byte-for-byte in a
   clean capture), no overflow, functional snapshot intact. All committed.
4. **ARC content is fictional placeholder** (a fake studio + email + projects). Swap in real details if ARC is
   ever meant to be more than a portfolio showcase piece.
5. **About photo** is a stock-style B&W silhouette, not a real photo of Yuvi — swap when one's available.
6. **Contact pill is a `mailto:`** (no backend). Wire to Formspree / a form endpoint if it should actually send.
7. **Obsidian vault (`Ellevux WEB/`, gitignored) is stale** (describes the abandoned AI-SaaS direction).
8. **Unlinked demos** `demos/aurora` + `demos/nebula` (archived) and `demos/lab` (Elements, unlinked when
   Mirror Solutions took slot 03) are on disk + deployed but unlinked. Delete, re-link, or keep for reference.

## Direction history (so the pivots make sense)
Web-design/motion **studio** showcase → briefly mis-built as an **AI-receptionist SaaS** (a reference URL read
as a content template; reverted) → settled as a personal **portfolio in the Henri Heymans style**, now LIVE.
Reference sites are used for LOOK only. The `CONTRACT*.md` / `REDESIGN-PLAN.md` files are historical specs.

## Run (local)
- Serve over http (the hero uses ES modules; `file://` won't load them):
  `python -m http.server 5510` in the project root, then open `http://localhost:5510/`. (Or VS Code Live Server.)
  Python itself is currently uninstalled: use `D:/Blender/5.2/python/bin/python.exe -m http.server 5510`.
- ARC can NOT run locally (no Node). Test ARC by redeploying to Vercel + screenshotting the live site.
- Caching: browsers cache CSS/ESM hard — hard-refresh (Ctrl+Shift+R) after edits.

## Deploy (no Node here → Vercel REST API; see CLAUDE.md → "Deploy" for the exact calls)
- Portfolio: static deploy to the `ellevux-studio` Vercel project (upload tracked web files by SHA, then
  create a production deployment, `framework:null`).
- ARC: build deploy to the `arc-atelier` Vercel project (`framework:"vite"`, `buildCommand:"vite build"`,
  `outputDirectory:"dist"`; upload ARC source minus node_modules/.verify/scripts; Vercel builds it).
- Tokens are per-session, stored outside the repo, and revoked after use.

## Known quirks (testing)
- Playwright is NOT installed any more: use a same-origin harness page of fixed-width iframes in headless
  Chrome for real viewports (see CLAUDE.md Stack). Headless Chrome's `--window-size`
  clamps to ~482px and HIDES true mobile overflow — do NOT trust a 375px `--window-size` screenshot.
- Verify the particle hero + morph (and the cafe/ARC scroll-built heroes) in a real browser;
  they need true scroll + WebGL.
- Keep design tokens, keep copy em-dash-free, keep the reveals + particle headings FAIL OPEN.
