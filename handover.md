# Handover — Ellevux portfolio

Snapshot of where the project stands and what is left to do. Day-to-day conventions live in `CLAUDE.md`.
Date: 2026-06-17.

## TL;DR
A static, no-build personal **portfolio** for **Ellevux** (the person behind it is **Yuvi**, a 20-year-old
web developer). Styled like henriheymans.com: pure-black editorial, Inter + Instrument-Serif italic
accents, a sparing acid-green accent, a **particle-text hero** (the headline is a GPU particle cluster that
morphs on scroll into the "Selected Works" heading), scattered Selected Works, playful About, giant footer
wordmark. Open it over http (see "Run").

## What is built and done
- **Hero — PARTICLE TEXT + scroll morph (`three-hero.js`, rewritten this session):** the headline
  "INDEPENDENT WEB DEVELOPER" is a GPU `ShaderMaterial` particle cluster sampled from the real `<h1>`. On
  scroll (no pin; "break" starts ~halfway down the hero) the particles fly DOWN the page and reassemble onto
  the #work "Selected Works" heading, then PERSIST as it. The `#hero-canvas` is a page-level `position:fixed;
  z-index:-1` layer (behind all content, on the black bg — relies on `section{isolation:isolate}`). Boots
  straight to particles with no crisp-text flash (the hero `<h1>` and #work `<h2>` are hidden pre-paint via
  `html.hero-particled` / `html.work-particled`). FULLY FAIL-OPEN: any WebGL/Three/GSAP/shader failure (or
  reduced-motion) reveals the crisp headings; a 2.5s failsafe + module `onerror` back it up. Also present:
  "WELCOME TO my 2026 portfolio" and a social row; the headline is centered between them and `--fs-hero` was
  bumped a bit. (REMOVED this session: the nav "AVAILABLE FOR FREELANCE WORK" marquee and the hero "SCROLL TO
  BEGIN YOUR JOURNEY" cue — their CSS in components.css/main.css is now dead but harmless. Earlier chrome-blob
  and plain particle-cloud hero builds were superseded by the particle-text morph.) Added this session: a
  small editorial **meta caption** top-right of the hero (`.hero-meta-block`: a hairline rule + "Currently /
  Open for work / Available worldwide" with a slow pulsing sage dot, >=768px, decorative). **bfcache fix:**
  work links open in the SAME tab, so returning via the browser **Back** button restored a dead white hero
  from bfcache; `three-hero.js` now PAUSES on `pagehide[e.persisted]` (keeps the GL context) and RELOADS on
  `pageshow[e.persisted]` for a clean hero.
- **Selected Works (`#work`):** the tiles are a uniform **16:9**; thumbnails are `cover`, grayscale at rest,
  full colour on hover.
  - **01 Buzzy — Coffee House** -> `demos/cafe/index.html`. Renamed from "Marigold" and rebuilt several
    times this session: earthy Marigold -> a research-driven "warm-minimalist" re-skin (rejected as bland)
    -> a dark **"Liquid Coffee Spectacle"** (full-page WebGL fluid-coffee shader you STIR with the cursor,
    pour-in hero type, pinned canvas pour, liquid footer wordmark) -> the **current CUTE COMIC / illustrated
    theme**: cream paper, **Baloo 2 + Caveat + Inter Tight**, dark-brown ink, amber/terracotta pops,
    hand-drawn doodles, chunky outlined "comic" buttons/cards, and the owner's own **watercolor iced-coffee
    illustration** as the hero art (`cafe/assets/iced-coffee.png`, background removed). The comic theme is
    toggled by `class="comic"` on `<body>`; the dark liquid theme is preserved underneath and disabled by
    that class. Built on three (ESM) + GSAP/ScrollTrigger/Draggable + Lenis. NOTE: this demo now uses ONE
    external image (the cup), so it is no longer fully self-contained. Backup of the pre-comic build:
    `demos/_cafe-backup-2026-06-16/`. Research: `CAFE-RESEARCH.md` (60-café audit + colour/design briefs).
    Thumbnail = a 16:9 screenshot of the comic hero (`assets/img/work-cafe.png`).
  - **02 Ellevux — AI SaaS** -> `https://ellevux.vercel.app/` (the owner's live project; opens in the
    **same tab** now). Thumbnail = a headless screenshot of the live site hero, 16:9
    (`assets/img/work-ellevux-site.png`; the old particle-logo `work-ellevux.png` was removed).
  - **03 Elements — UI, Motion & 3D** -> `demos/lab/index.html`. A **capabilities showcase** (not a site
    demo): one self-contained page of 11 numbered sections — navigation, a WebGL **3D render** + a
    **particle morph**, feature tabs, tilt cards, micro-interactions, an **accordion**, a **form** (with a
    success state), a **modal** (backdrop + Esc), **loaders/progress**, **count-up stats**, and footers.
    Ships **LOCKED to Dark Editorial** with a **mint `#2ee6b6`** accent: the theme switcher AND the
    6-colour accent picker were both removed (the `.lab` playful theme remains only as dead/reference CSS).
    three (ESM) + GSAP. The portfolio slot-03 thumbnail is now an **SVG text wordmark** ("Elements", in the
    same ultra-bold tight face as the footer "Ellevux" wordmark, sized to fill the tile via viewBox +
    textLength), not an image, so `assets/img/work-lab.png` is orphaned (safe to delete).
- **About:** "Hey! I'm Yuvi, a 20-year-old web developer. I build fast, expressive websites..." with a
  vertical "KNOW MORE ABOUT ME" strip and a B&W portrait (`assets/img/portrait.jpg`, a moody hooded
  silhouette at a laptop by a cliffside window, fills the 4:5 `.portrait` slot). Bio fills the card.
- **Footer:** giant "Ellevux" wordmark, "Send me an e-mail" pill, a thanks line, copyright. (The social
  rows in the hero and footer were removed: the hero now shows a tagline, "Building websites that feel
  *alive*...". The About card still carries a social row. The base `.social-links`/`.social-link` CSS is
  now only used by that one row.)
- **Polish applied across sessions:** brand reverted to Ellevux (Yuvi kept only in About); acid-green
  reduced to match the reference (italic-serif accent words are white now); Selected Works centered and
  the heading lifted; no em-dashes in copy.

## Open items / next steps
1. **Contact email is a placeholder** — the footer "Send me an e-mail" pill points to
   `mailto:hello@ellevux.studio` (og:url/og:image also use that domain). Swap in the real email/domain.
2. **No git yet.** Strongly recommended: `git init` + an initial commit so versions are recoverable
   (earlier in the project a rebuild overwrote files with no backup; reconstruction was needed). This is
   the single most important hygiene step before more changes.
3. **About photo** is filled (`assets/img/portrait.jpg`, a B&W silhouette). It is a moody stock-style
   aesthetic shot, not a real photo of Yuvi, so swap it for an actual portrait when one is available.
4. **Obsidian vault (`Ellevux WEB/`) is stale** — it documents an abandoned "AI-receptionist SaaS"
   direction, not the current portfolio. Realign it or delete it; it is not shipped with the site.
5. **Archived demos** `demos/aurora` and `demos/nebula` remain on disk, unlinked. Delete if you want a
   leaner repo, or keep for reference.
6. **Orphaned on disk:** `assets/img/work-lab.png` (slot-03 is now an SVG wordmark) is unused; delete if
   you want a leaner repo. Slot 03 itself is filled (the "Elements" capabilities showcase).

## Direction history (context, so the pivots make sense)
Started as a web-design/motion **studio** showcase -> briefly (mis)built as an **AI-receptionist SaaS**
product after a reference URL was read as a content template (later reverted) -> settled as a personal
**portfolio in the Henri Heymans style** (current). Reference sites are used for LOOK only. The earlier
`CONTRACT*.md` / `REDESIGN-PLAN.md` files are historical specs from those phases.

## Run
- **Serve over http** (the hero uses ES modules; `file://` will not load them):
  - VS Code: install **Live Server**, right-click `index.html` -> Open with Live Server, or
  - `python -m http.server 5510` in the project root, then open `http://localhost:5510/`.
- Click/scroll through: the hero particle headline + the scroll morph into "Selected Works", then the
  Selected Works (Buzzy opens the café; Ellevux opens the live site in the **same tab**), About, footer.
- **Caching:** browsers cache the ES module + CSS hard — hard-refresh (Ctrl+Shift+R) after edits, or serve
  with `Cache-Control: no-store` (a tiny `python -c` no-cache server) while iterating.

## Deploy
No build. Netlify Drop (drag the folder), Vercel (preset "Other", no build command, output = root), or
GitHub Pages on root. No env vars. Wire the contact pill to a real endpoint (Formspree / Netlify Forms)
if you want it to actually send.

## Known quirks
- The hero is `~100svh`; the particle morph spans the hero -> #work scroll. Headless Chrome can't reliably
  scroll-to-anchor and WebGL may stall, so **verify the hero + morph + lower sections in a real browser**.
- The hero particle layer is a fixed `z-index:-1` canvas behind transparent sections on black — don't move
  it back into `#hero`. There is no `.hero__scrim` (removed; it banded the hero/#work seam).
- Headless screenshots of the live ellevux site need an isolated `--user-data-dir` (else they collide with
  an open Chrome and fail to write).
- Keep using design tokens (`assets/css/tokens.css`); keep copy em-dash-free; keep reveals + the particle
  headings FAIL OPEN (see CLAUDE.md "Particle headings FAIL OPEN").
- **The Buzzy café** is the most-iterated piece. Its comic theme is a `body.comic` token-remap over the
  preserved dark liquid build; remove the `comic` class on `<body>` to get the dark version back. Headless
  Chrome can NOT scroll its 100svh/pinned sections (to QA lower sections, temporarily neutralise the
  `min-height:100svh` and capture a tall window), so verify the café by scrolling in a real browser.
