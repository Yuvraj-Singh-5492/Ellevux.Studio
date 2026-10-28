# CLAUDE.md

Project guidance for Claude Code (and any developer) working on this repo.

## What this is

**Ellevux** is a **one-person web studio site**. It sells two things to business owners:
websites (design and build) and **SEO/AEO** (answer engine optimization, getting a business quoted
by AI assistants, not just ranked by Google).

It is **not** a portfolio any more. It was one until 2026-10-22, and the rebuild is described below.

- **Brand:** Ellevux (lowercase `ellevux` in the nav, `Ellevux` in the footer wordmark).
- **Person:** **Yuvi** (legal name Yuvraj Singh). All visible copy says "Yuvi". The only "Yuvraj" in
  shipped files is the real mailbox `yuvrajsinghgill5492@gmail.com`, which must never be renamed.
- **Voice: studio, person-led.** "Ellevux is a one-person web studio. I'm Yuvi." Always "I", never
  "we", never "the team". **His age never appears on the site.**
- **Market: international, remote, English, USD.** No geography is ever claimed for Ellevux itself.
  Local SEO is still a *service sold*, so "near me" copy may describe a client, never the studio.

## Status: LIVE

- Production: **https://studio.ellevux.com** and **https://ellevux-studio.vercel.app** (Vercel
  project `ellevux-studio`, team `ellevux`, id `prj_Y4oC7i8GWoKkV67JOFX12Jn0P5zE`). `ellevux.com` is
  registered at GoDaddy (`ns55/ns56.domaincontrol.com`); the apex is still parked, the `studio`
  subdomain is aliased to this project. **Every canonical, OG and JSON-LD `@id` still says
  `ellevux-studio.vercel.app`**, so the custom domain currently serves pages that point search
  engines at the Vercel one. See "Swapping the origin".
- Source repo: GitHub **Yuvraj-Singh-5492/Ellevux.Studio**.
- ARC (a studio piece) is its own Vercel project: **https://arc-atelier.vercel.app**.

## Marketing: Instagram and reels (lives outside this repo)

- **Instagram @ellevux.studio** (Business account). The site already links it (12 links plus
  `Organization.sameAs`). Bio, set 2026-10-25: "Websites too good to scroll past. / DM "SITE" for a
  free homepage concept." Two reels posted (2026-10-23 Shugetsu, 2026-10-25 MANZAR).
- **The reel pipeline is `D:\yuvraj-reels`** (Node engine + Studio at localhost:4747); its own
  `CLAUDE.md` is the source of truth for reels, plates, music and posting. The lead list it feeds
  is `D:\lead-engine` (Dubai brokerages without a working website).
- **MANZAR is an invented brand**: a concept site in `D:\yuvraj-reels\sites\manzar` used in a reel
  and as the free homepage concept for leads. It is never a client and never goes on `/work/` as one.
- **The same rules bind posts as the site:** "I", no em-dashes, no invented clients, names or
  results, no "guaranteed". Reel scenes and photos are AI-generated, so every post carries
  Instagram's AI label. Licensed trending songs are picked in the Instagram app only, never
  downloaded and baked into a video.

## Stack and hard constraints

- **Static, no build step.** Plain HTML/CSS/JS. No bundler, no framework, no `package.json`, no npm
  dependency ships. Do not introduce one for this site. (ARC and CLIENT-DEMO are separate Vite apps.)
- **Libraries:** none on the studio pages. `/lab/` alone loads Three.js and GSAP from CDN.
- **Must be served over http** for `/lab/` (ES modules are blocked on `file://`).
  Run `python -m http.server 5510` from the repo root.
- **Local toolchain (verified 2026-10-22):** node v24.19.0, npm 11.17.0, git 2.55, Python 3.12.10,
  Chrome and Edge. `playwright-core` 1.61.0 lives in `ARC/node_modules` and is resolved explicitly by
  the scripts in `tools/`, so they run from anywhere.

## File map

```
index.html              the home page · 8 bands. The STAGE hero with the live console, the
                        device stage, who paid me, what I do, the AI answer moment, three work
                        tiles, close, footer. Deliberately short: everything else has a page
                        of its own.
pricing/index.html      the CONFIGURATOR (its centrepiece) + what differs + money FAQ
work/index.html         "Client work, 2" and "Studio pieces, 4", with both quotes
about/index.html        Yuvi's intro, what I do not do, the process, the 6 general questions
ai-search/index.html    THE evidence page. 9 bands: why you cannot tell good SEO from bad,
                        what Google confirms, how assistants retrieve, what nobody knows,
                        what does not work, what I do, 6 questions, close. Every claim
                        carries a .status-pill evidence tier and a linked primary source.
                        The longest page on the site, on purpose: depth IS the argument.
contact/index.html      the one conversion destination · the real form
thanks/index.html       post-submit expectations · noindex · a countable URL
lab/index.html          the preserved GPU particle hero, as a craft showpiece
vercel.json             clean URLs, the /testimonials.html redirect, cache + security headers
robots.txt sitemap.xml llms.txt og.png     at root
assets/css/site.css     THE stylesheet for the studio pages. One file, 31 numbered sections.
                        1-23 are the page system; 24-31 are the interactive layer.
                        §10 is the stage hero, §31 the console.
assets/js/site.js       THE script for the studio pages. Zero dependencies, 14 features.
assets/css/tokens.css   ) the ORIGINAL dark system. Loaded ONLY by /lab/.
assets/css/base.css     ) Do not load these alongside site.css: both define
assets/css/components.css ) .container, .nav and .btn, and they would collide.
assets/css/main.css     )
assets/js/three-hero.js the 840-line particle hero. Used ONLY by /lab/.
assets/js/animations.js ) the original GSAP reveal engine + cursor/magnetic.
assets/js/main.js       ) Used ONLY by /lab/. site.js replaces both elsewhere.
assets/img/logo-mark.svg  the brand mark. PLACEHOLDER: a hand-authored vortex standing in
                        until the real asset lands. Overwrite this one file and the nav,
                        favicon reference and everything else picks it up.
assets/img/*.avif|webp  the shipped thumbnails + the hero device screens, in two widths
assets/img/src/         the source PNGs + the unused portrait. EXCLUDED from deploys.
tools/verify.mjs        the automated design-lock and a11y checks. NOT deployed.
tools/interact.mjs      drawer, form, stage, configurator, action bar. NOT deployed.
tools/shot.mjs          screenshot one element, or "viewport". NOT deployed.
tools/thumb.mjs         capture a 16:9 work thumbnail from a URL. Takes a scrollFraction,
                        because a scroll-built 3D hero shows nothing at all at y=0.
tools/device-shots.mjs  capture each project at desktop AND phone viewports, for the hero
                        stage. Uses a real iPhone UA so sites serve their mobile layout.
demos/cafe/             Buzzy, linked from /work/. An illustrated comic coffee house.
demos/lab/              Elements, linked from /work/. 11 sections of UI and motion.
demos/aurora|nebula/    archived, unlinked, still deployed.
ARC/ CLIENT-DEMO/       GITIGNORED separate Vite apps. CLIENT-DEMO is "Urbane Ivy".
Ellevux WEB/            a stale Obsidian vault. Gitignored.
handover.md             current state and what is left
```

## The design lock (read before touching any CSS)

The direction was chosen through Refero research and is **locked**. Primary reference:
**Patch, thepatchsystem.com**. Five traits that must not soften. If a change softens one, it is drift:

1. **A visible hairline grid** as page structure, not decoration.
2. **Ultra-condensed heavy all-caps display type.** Leading ~0.85, tracking ~0.03em.
3. **Near-sharp radii (~5px).** Flat colour blocks, no gradients.
4. **Zero box-shadows, ever.** Depth comes only from surface inversion.
5. **One reserved action colour.**

Bounded borrows, each with one job and no more: **Elementor** gives only the alternating band rhythm;
**designstripe** gives only the dotted-grid variant and mono technical labels; **Perplexity** gives
only the surface language *inside* the AI answer panel, which must not leak onto the page.

### The one amendment: the interactive layer (2026-10-22)

Traits 3 and 4 above apply to **structure**: bands, the grid, cards, dividers. Anything the visitor
can **touch** instead gets soft radii and a whisper of lift, so the controls feel like the phone they
already own. That is `--r-control: 12px`, `--r-surface: 20px` and `--shadow-lift`.

This is a deliberate amendment, not drift, and it is reference-backed. **Lusion** (lusion.co) is a
bright, sharp, type-led technical page described by Refero as a "computational laboratory
blueprint" with lime-green punctuation, and it does exactly this: flat surfaces throughout, soft
radii and a 0.04-alpha shadow reserved for interactive and elevated components. `--shadow-lift` *is*
Lusion's value. The radii come from **Sleeve** (replay.software/sleeve), a macOS app page: 12px
controls, ~24px window-like surfaces.

The test for whether a change is drift: **could you press it?** If no, it stays flat and sharp.

**Reject list.** Warm ivory/cream/parchment canvases, olive or terracotta palettes, and decorative
serif-italic word swaps in headlines: these are current AI-slop defaults. The canvas is *neutral*
paper. Also reject: a third accent colour, softening the display face to a polite grotesque, and
adding a shadow to make a card "pop".

## Design system

**One canvas, and one dark room.** Replicated from **ai.work** (Refero style "Henry") on
2026-10-23 at the owner's instruction, then turned light on the same day: the page is a soft
warm off-white, and the hero stage is the single dark element on the site.

| Token | Value | Role |
|---|---|---|
| `--canvas` | `#f4f3f0` | **the page.** Soft, never `#ffffff`: full-bleed hard white is glare |
| `--raised` | `#faf9f7` | cards and panels, one step above the canvas |
| `--sunk` | `#eceae5` | wells, inputs, inset recesses |
| `--graphite` | `#171614` | primary text. Soft black, not `#000` |
| `--slate` | `#6b6963` | muted text · **5.6:1** on canvas |
| `--hairline` | `rgba(23,22,20,0.11)` | the border that makes a card a card |

The **dark room** stack is reserved for the hero stage and the drawer, and appears nowhere else:
`--obsidian #000`, `--tar #0c0c0c`, `--carbon #141414`, `--smoke #615f5c`, `--ash #878581`,
`--bone #d4d0c9`, `--chalk #ffffff`.

Warm-neutral throughout. **Not cream, ivory or parchment** — those are on the reject list and read
as AI-default. This is grey with a trace of warmth. **There is still no accent colour.** A filled
button is graphite on the canvas, and chalk inside the dark room.

**Type. ONE family: Inter.** The reference sets NB International Pro, which cannot be licensed, and
names Inter as its own substitute. What carries over is how it is *used*: **headlines at weight 300**
(`--w-light`), line-height 1.0 at display size, tracking about -0.02em, and never 600 or heavier on
display text. The display voice is weight and tracking, not a second typeface.

**Shape scale, from the reference exactly:** tags 2px, icons and inputs 6px (`--r-icon`), cards and
panels 10px (`--r-surface`), **buttons 100px** (`--r-control`). Buttons are pills.

## The home page, after the 2026-10-23 cuts

Six bands: hero, the two-service split (inside the hero), services, the AI answer panel, the work
folder, close, footer. Three things were removed outright at the owner's request and are not coming
back without being asked for:

- **The clients strip** ("Who has paid for this", two named rows). Its `.clients*` CSS went with it.
- **The hero console** (ticket + brief + engine picker) and the studio intro paragraph.
- **The three work tiles.** Replaced by `.folder`.

**The work folder** (`§16`). One object instead of a grid: "My work" on the left, a folder on the
right with three real project screenshots peeking out of it, and the whole folder is a single link
to `/work/`. Three things are load-bearing: the stack order is back → papers → front, because the
front panel has to paint *over* the papers or nothing is in the folder; the folder needs
`overflow: hidden` or the papers rise past its top edge on hover; and the fan spread is `left` while
the tilt is `transform`, because mixing a centring translate with a per-paper offset in one
transform makes every later value fight the first.

**`.work-item__*` and `.work-row*` still belong to `/work/`.** They were shared with the home grid,
and removing the grid's whole CSS block dropped `/work/`'s facts list to unstyled stacked text.
`§16` now says which three selectors are genuinely dead (`.work`, `.work-item`, `.work__foot`).

**`head--split`** is a head that spans the section on the same grid as the content below it: heading
in the left track, lead in the right. The default `.head` is capped at 46ch, which left the answer
section's heading in a narrow column with most of the section empty and nothing aligned.

**The section rhythm lives on `.band`**, and it is easy to lose: replacing the band-inversion block
once deleted `.band` entirely, and every section on every page rendered with **zero vertical
padding**. `--band-y` is `clamp(3.5rem, 2rem + 4.5vw, 6rem)`, so adjacent bands put ~192px between
content. It was 11rem, which put 352px between bands, wider than most of the blocks it separated.

## Retired on 2026-10-23: glass, inversion, and the tactile key

Three systems were removed wholesale when the site was rebuilt against ai.work. They are described
here so nobody reintroduces them thinking they are missing:

- **Frosted glass on cards.** `backdrop-filter` panes, rims and inset sheens. The reference's own
  don't list forbids shadows and hover lift on cards, and a frosted pane over a flat canvas does
  nothing anyway. A card is now `--raised` plus a hairline.
- **Band inversion.** `[data-band]` no longer alternates: **both values resolve to the same canvas**
  in one shared scope. The attribute survives in the markup so the page could be re-banded without
  touching every file, but nothing flips. One continuous surface is the single biggest reason the
  reference reads as one object rather than a stack of blocks. **Cards no longer invert either.**
- **The tactile key.** `--btn-edge`, `--btn-sheen` and the press travel. Both tokens still exist and
  are `transparent`, so any rule that still references them is inert rather than broken.

`verify.mjs` lost its band-inversion check with them, because under one canvas it failed on every
page by definition. **It was replaced, not deleted:** a `SURFACE` check asserts every `.card` has a
real hairline border (the only thing separating it from the page now) and that the hero stage stays
clearly darker than the body.

## Logo

Real assets, supplied by the owner, in `assets/img/`:

| File | Use |
|---|---|
| `apple-touch-icon.png` 180px | source for the nav mark, and the iOS home-screen icon |
| `logo-mark.png` 104px | the nav mark, generated from the above (3 KB) |
| `favicon-32.png` / `favicon-64.png` | the real favicons; the old inline SVG data-URI is gone |
| `logo-icon.png` | white-on-light variant, unused so far |
| `logo-lockup.png` / `logo-lockup-420.png` | white mark + wordmark, used in the ink drawer |

The dark-tile versions are for the bone nav; the lockup is white and only works on ink. **Do not put
a CSS `border-radius` on `.nav__mark`** — the asset carries its own rounded tile and a second corner
clips the artwork.

**Band inversion is structural, not a convention.** `[data-band="paper"|"ink"]` **remaps** the
semantic tokens in scope, and `--card-surface` is defined as the opposite of `--surface` in *both*
scopes, so a card can never match its parent band. A `.card` is itself a full token scope: it flips
`--line`, `--on-surface`, `--well` and `--focus` too. Inverting only the background is the bug that
made ghost-button borders invisible on cards. **Never hardcode `var(--ink)` or `var(--paper)` for
anything inside a band** — use `--on-surface`, `--line`, `--well`. The nav, the drawer and the
answer panel are the deliberate exceptions, because they are fixed chrome or a quoted artifact.

## Conventions and rules

- **No em-dashes in any visible copy. Absolute.** Commas, periods, colons or middots. This covers alt
  text, meta descriptions, form labels, button and chip text, **JSON-LD strings**, and 404 copy.
- **No metrics about his own work. None, ever.** There are zero real performance numbers for
  Ellevux. If a number appears it is a price, a duration, a page count, a revision count, or an
  approved star rating. **Amended 2026-10-28 for `/ai-search/` only:** a number may also appear when
  it is **quoted from a named public source that is named in the same sentence the reader sees**, for
  example "Pew Research Center found ... about 1% of visits". A number without its source in the
  sentence is not allowed anywhere, and a number about his own results is never allowed at all.
- **Claims describe what he does, never what will happen.** "Structured so assistants can quote it"
  is allowed. "Gets you quoted" is not. "Guaranteed" is banned, and its absence is stated once, in
  the FAQ. This single rule keeps the site truthful with no case-study data.
- **Never invent a testimonial, a person's name, or a role.** The two approved quotes live in
  `work/index.html` (the home page's quotes band was cut on 2026-10-22) and came from the clients.
  They are company-attributed until the owner supplies real names. *(This rule exists because
  quotes were once fabricated here and had to be replaced with the approved text.)*
- **An approved quote may be SHORTENED, never reworded.** When the Ellevux product was rebuilt from
  an AI receptionist into an agentic platform, its quote still described call handling that no
  longer exists. Quoting less of what a client said is ordinary editorial practice; changing their
  words to fit a new product is fabrication. The elision is disclosed in visible copy under the
  quotes, and the removed sentence is preserved in an HTML comment beside it.
- **Honesty labels are first-class copy at full size, never fine print:** "Illustration",
  "Self-initiated concept", "Spec pitch, not a client", "Published with the client's approval".
- **Reveals must FAIL OPEN.** `[data-reveal]` has **no hidden state in CSS**, by design. The
  from-state is set in JS only, with per-element try/catch and a 2.5s failsafe. Do not add an
  `opacity: 0` rule for it.
- **`prefers-reduced-motion`:** every animation has a calm static fallback, and the particle hero
  does not run at all.
- **Responsive:** must hold at 320/375/768/1280/1440 with no horizontal overflow.
- **`body` has NO `overflow-x`.** A global `hidden` or `clip` stops `documentElement.scrollWidth`
  reporting real overflow and silently voids the automated check. Anything that legitimately bleeds
  (the footer wordmark) clips itself locally.

## Verification

```bash
python -m http.server 5510                        # from the repo root
node tools/verify.mjs                             # home only
PAGES="/,/ai-search/,/about/,/pricing/,/work/,/contact/,/thanks/,/lab/" node tools/verify.mjs
node tools/interact.mjs                           # drawer, form, stage, console, pricing, bar
```

In Git Bash, prefix with `MSYS_NO_PATHCONV=1` or a leading `/` is mangled into a Windows path.

> **`NAVCLASH` IS DEAD, and it is the check that matters most here.** `verify.mjs:153` queries
> `.nav__pill`. That class exists in **no HTML file in the repo**: the nav has been `.nav__dock`
> since 2026-10-23. `querySelector` returns null, the check returns null, and it **silently skips on
> every page at every width**. It was written precisely because a hero refactor once dropped the nav
> onto five pages' headings while every check passed, so the repo currently has no protection
> against the exact bug it was built for. Until the selector is repaired, any new page must get its
> clearance **by construction**: the first band carries `class="band hero"`, which supplies the
> `padding-top` that clears the dock. Omitting `hero` puts the dock on the `<h1>` and **the whole
> suite still reports ALL CHECKS PASSED.**
>
> Two more blind spots, both verified by hand on 2026-10-28 instead:
> **the 940 to 1024px window is never measured** (chips render at `min-width: 940px`, and the
> widths jump 768 to 1280), and **the drawer is only ever measured shut**, so a link added to it is
> unchecked. Measured with the fourth chip: dock 810px against 893px available at 940px, 83px slack;
> drawer foot at 575px inside a 640px-tall phone.

`verify.mjs` checks, at five widths: horizontal overflow (naming the culprit elements), **band
inversion** (no two adjacent or nested bands share a tone), **acid discipline** (role fence plus
never two acid elements in a viewport), **the floating pill not covering the first heading on
any page** (see the warning above: this one does nothing), one `<h1>` and the landmarks, explicit `width`/`height` on
every image, JSON-LD parses with no dangling `@id` and origins matching the canonical, **the FAQ
answers matching the visible copy verbatim**, the reveal failsafe, plus a no-JS pass and a
reduced-motion pass. It drives **true viewports** via `newContext({ viewport })`: raw headless
Chrome's `--window-size` clamps to ~482px and hides real mobile overflow.

## Images

No build step, so derivatives are generated **once, by hand**, with `sharp` installed in a scratch
directory so nothing lands in the repo:

```bash
cd "$SCRATCH" && npm i sharp     # then resize to 640 + 1280, avif q52 + webp q74
```

Sources live in `assets/img/src/` and are **excluded from the deploy set**. The shipped pages
reference only `.avif` and `.webp` through `<picture>`, with the 1280 WebP as the `<img>` fallback.
This took the four thumbnails from 2.3 MB to 413 KB on disk and ~28 KB per page load.
`tools/thumb.mjs` captures a new 16:9 thumbnail from any URL, with a `scrollFraction` argument
because the scroll-built 3D heroes show nothing at all at y=0.

## Structured data and AEO

Every page carries `Organization` + `WebSite`/`WebPage`. The home page adds two `Service` nodes whose
`priceSpecification` must match the visible "from" prices exactly. **The home page has NO `FAQPage`
and no `#faq`** (this file claimed otherwise until 2026-10-28, and two CTAs pointed at that
non-existent anchor). Three pages carry a `FAQPage`, each with **different questions**, because
duplicating them would be the obvious mistake: `/about/` 6, `/pricing/` 4, `/ai-search/` 6.
`/work/`, `/contact/`, `/pricing/`, `/ai-search/` and `/lab/` carry `BreadcrumbList`.

**`verify.mjs` pairs `FAQPage.mainEntity[i]` with the i-th visible `.faq__item` POSITIONALLY**, and
reads only the first `<p>` of each `.faq__a`. So reordering an accordion without reordering the
JSON-LD fails, and a two-paragraph answer silently compares against paragraph one.

- **Do NOT use `LocalBusiness` or `ProfessionalService`.** Both imply an address and would break the
  no-geography positioning. `Organization` carries none.
- **Do NOT add `Review` or `AggregateRating`.** Self-serving review markup about your own business is
  a policy risk and buys nothing. The stars stay visual with an `aria-label`.
- **Google's Rich Results Test will report "no eligible rich results"** for `Organization`,
  `Service` and `FAQPage`. **That is the expected, correct outcome, not a failure.** The obvious
  "fix" is to add `AggregateRating`, which is exactly the trap above. Only `BreadcrumbList` lights up.
- **The evidence grades, researched 2026-10-28 and regraded on the spot.** Two claims this file
  used to make were wrong, and `/ai-search/` now states the corrected versions publicly:

  - **Confirmed, and load-bearing:** everything in the initial HTML (GPTBot, ClaudeBot and
    PerplexityBot *fetch* JavaScript but do not execute it, per Vercel and MERJ, December 2024),
    crawlable and indexable, the mobile page carrying everything, fast load, self-contained answers
    of 40 to 60 words with no "as mentioned above" (an assistant can only lift an answer that does
    not refer to the page around it).
  - **Confirmed, but NOT an AI lever:** `structured data`. Google states plainly that "structured
    data isn't required for generative AI search, and there's no special schema.org markup you need
    to add." Keep it for **rich-result eligibility** and for stating facts that agree with the
    visible page. **Do not sell it as the reason an assistant quotes you.**
  - **Peer reviewed:** quotable material in the text. The one controlled experiment (GEO, KDD 2024)
    found direct quotations, statistics and cited sources raised visibility, and **keyword stuffing
    scored below doing nothing**. It ran on 2023-era models; say so whenever it is cited.
  - **Reasonable bet, NOT evidence-based:** question-shaped headings. No controlled study isolates
    heading format as a cause of citation. The mechanism is plausible and it costs nothing, so it
    stays in the work, but it does not go in the evidence column.
  - **Speculative:** `llms.txt`. Google states "Google Search itself doesn't use them." It ships
    because it is cheap and harmless. **It is never sold, and `/ai-search/` says so in public.**

## Swapping the origin

Absolute URLs appear in each page's `<head>` block (canonical + OG + Twitter) and in the JSON-LD
`@id` values, plus `robots.txt`, `sitemap.xml` and `llms.txt`. They all use
`https://ellevux-studio.vercel.app`. When a real domain is attached, find and replace that one
string. `verify.mjs` fails loudly if a JSON-LD `@id` origin stops matching the canonical, which is
the error that would otherwise sever every entity reference silently.

## Deploy (Vercel REST API, proven)

- **Tokens** are supplied by the owner per session and revoked afterward. Store them OUTSIDE the repo
  (`~/.ev_vc`), never commit them, delete them when done, and redact them from command output.
- **Portfolio → Vercel:** for each tracked web file, `POST /v2/files` with an `x-vercel-digest` SHA,
  then `POST /v13/deployments` with `{name:"ellevux-studio", files:[{file,sha,size}],
  target:"production", projectSettings:{framework:null,...}}`. A static deploy, no build.
  **Exclude from the upload set:** `*.md`, `.gitignore`, `tools/`, `assets/img/src/`,
  `demos/cafe/assets/README.txt`.
- **Confirm `vercel.json` is honoured** on the first deploy, since this is a `framework: null` REST
  deploy. If the headers come back absent, the config was not processed and that blocks everything
  else. Check: `/assets/*` should return `max-age=31536000, immutable`, and `/testimonials.html`
  should 308 to `/work/`.
- **`vercel.json` allows NO extra keys.** A `"comment"` field inside a redirect object fails the
  whole deployment with `INVALID_VERCEL_CONFIG`, and the deploy goes to ERROR rather than degrading.
  Explain a rule in this file, not in the JSON.
- **`cleanUrls` and `trailingSlash` normalise the path BEFORE `redirects` are matched.** So
  `/testimonials.html` arrives at the rules as `/testimonials/`, and sources written as
  `/testimonials.html` and `/testimonials` both miss. Verified live on 2026-10-26: it 308'd to
  `/testimonials/` and then **404'd**, on a URL that is in the old sitemap. All three variants are
  now listed. **Test a redirect by following it to its final status**, not by checking it returns a
  308.
- **git push needs the token in the URL** (`https://x-access-token:<PAT>@github.com/...`); the bearer
  extraHeader does not work for GitHub git.

## The hero: the stage

The home page hero is a **dark photographic stage, inset and rounded**, carrying the headline on the
left and the real client sites on the right. It is the one dark element on a light site, and it is a
replication of **ai.work**, analysed frame by frame on 2026-10-23.

| ai.work | here |
|---|---|
| stage inset 8px / radius 8px, over `#141414` | inset 12px / radius 14px, over `--canvas` |
| **one full-bleed golden-hour photograph** | `assets/img/hero.jpg`, same role, same tonal structure |
| headline 64px weight 400, line-height **1.0**, tracking -0.02em, two lines | same, Inter at `--w-light` |
| line 1 at `#d4d0c9`, line 2 the **same colour at 60% alpha** | `--on-surface`, then `color-mix(… 52%, transparent)` |
| transparent nav flush over the photo, fill on scroll | `.nav--over-dark`, then `.nav--scrolled` |

**The photograph does the work.** It was generated to a written brief and its tonal structure is
load-bearing, not decorative: dark storm sky in the **top third** so the headline reads, the lit
valley through the **middle**, shadowed foreground at the **bottom**. Replace it with an evenly lit
image and the headline stops separating. `.hero__atmos` is the scrim that guarantees the rest, and
`.hero__copy` carries a `text-shadow` as the floor under that, because a photograph makes no promise
about what sits under any given glyph.

**Four things are load-bearing:**

- **`.hero__stage` declares the whole dark scope itself**, including `color: var(--on-surface)`.
  Redefining the token alone is not enough: `.band` already resolved `color` from the page scope
  further up, and **inherited colour does not re-resolve when a descendant changes the variable**.
  The headline's first line stayed graphite on a dark photograph until that one line existed.
- **`.hero--stage` is the home page; `.hero` is shared.** The other five pages are a heading on a
  band and still need the padding that clears the nav. Folding the stage's padding into `.hero` put
  the nav on top of their headings and **every check passed**. Hence the `NAVCLASH` check.
- **The nav asks the stage, not the scroll position.** `nav--scrolled` fires at 40px, where you are
  still inside the stage; `nav--over-dark` is driven by the stage's own `getBoundingClientRect`, and
  pages without a stage never get the class. Both can be on the element at once, so the dark rules
  are written after.
- **Vertical rhythm answers to viewport HEIGHT.** `vh`-based clamps plus a `@media (max-height:
  880px)` block scoped `and (min-width: 600px)`: a phone is short by nature and has its own smaller
  display size. Letting the laptop block reach the phone put the 36px floor back and wrapped a
  two-line headline into four.

**Cut from the hero on 2026-10-23, at the owner's request:** the studio intro paragraph, and the
"console" (a scripted ticket + brief + engine-picker demo). The device stage, which had been moved
to its own band, came back into the right-hand column. `initConsole` and its tests are gone.

## Navigation: the dock

A **dark floating dock**, replicated from the Mirror Solutions nav at the owner's request on
2026-10-23: the brand in its own light tile, then every destination as its own chip with an icon
and an uppercase label, then the filled action. It replaced a flush full-width bar, which replaced
a small capsule.

**Four destination chips** since 2026-10-28: Work, Pricing, AI search, About, plus the brand tile
and the filled Contact CTA. Chips render **only at `min-width: 940px`**, so a chip costs phones and
tablets nothing. The budget is real but not tight: each chip is ~73px of fixtures (48px padding,
2px border, 14px icon, 9px gap) plus ~9px per character, and `.nav__link` is `white-space: nowrap`,
so chips cannot shrink. They overflow instead. **A fifth chip needs measuring at 940, 1000 and 1024
by hand**, because `verify.mjs` never tests that window.

**Four things are load-bearing:**

- **It is dark on EVERY page, including the light ones.** One state instead of three. The bar it
  replaced had to flip its colours between the dark hero and the light page, driven by the hero
  stage's own geometry (`nav--over-dark`); none of that is needed now and all of it is deleted.
  `nav--scrolled` survives only to deepen the shadow.
- **The chips are 12px rounded rectangles, not the 100px pills the rest of the site uses.** That is
  the reference. The dock is the one place it applies. Do not "fix" it to match the buttons.
- **The mark is `logo-mark-light.png`**, generated once by inverting `logo-mark.png` with sharp. The
  normal mark is a *dark* tile and vanishes on a dark dock. It carries its own rounded corner, so
  there is **no `border-radius` on `.nav__mark`**: a second corner clips the artwork.
- **Safe areas still matter.** The outer `.nav` padding includes `env(safe-area-inset-*)`, which is
  what keeps the dock clear of a Dynamic Island, and the layer is `pointer-events: none` so the
  empty space beside the dock never swallows a click.

**Appending same-specificity overrides: put them in §32, at the end of the file.** A narrow-screen
`.seg__label` override was spliced into the middle of the `forced-colors` block by a script that
anchored on the last matching selector. It matched nothing, **the brace count still balanced, and
every check still passed.** Brace counting is not structural validation.

## Buttons

**Pills, 100px radius, flat.** Chalk-filled inside the hero's dark room, graphite-filled on the
page, ghost is a hairline with no fill. **No shadow, no key edge, no press travel** — the reference
forbids all three on a button, and the `TactileButton` treatment the owner supplied earlier was
retired with the rest of that direction on 2026-10-23.

## The interactive components

**The device stage** (`site.css` §25, `site.js` §10). A macOS browser window and an iPhone rotated
in real CSS 3D, showing the ACTUAL client sites. No library, no canvas: the whole interaction costs
about 9 KB of JavaScript, where Three.js would have been ~160 KB gzipped on a page whose Lighthouse
score is the sales argument. Four things that are load-bearing:

- **Rotation is clamped** (`MIN_RY`/`MAX_RY`). CSS 3D has no backface geometry, so a free spin shows
  the flat reverse of the window. Apple's own product viewers are constrained the same way.
- **Drag is tracked on `window`, not with `setPointerCapture`.** Capture retargets events in a way
  that silently drops moves, and a drag must survive the pointer leaving the stage.
- **`.shot img` needs `pointer-events: none`.** Otherwise the browser starts its own image-drag on
  pointerdown, fires `pointercancel`, and the rotation dies a few pixels in. This cost real debugging
  time; do not remove it.
- **Grid children need `min-width: 0`.** The segmented control is wider than 280px, and `min-width:
  auto` lets it force the whole hero track wide and scroll the page sideways at 320.

**The configurator** (§26, §11). Apple's pick-a-model pattern. The price and panel swap is **pure
CSS `:has()`**, so it works with JavaScript off and every figure stays real text for crawlers and
assistants. JS only rewrites the CTA link and mirrors the visible price into the sticky bar; it
never computes money. **Only approved prices appear**: 2,000 / 4,500 / 9,000, plus the 600 audit
(2,600 and 5,100 combined). Do not add a figure that the owner has not approved.

**The sticky action bar** (§27, §12). Phones only, after the hero leaves view. Its button is **ink,
never acid**: a fixed acid element would share a viewport with the pricing CTA and break the
one-acid-per-viewport rule. It toggles `visibility` as well as `transform`, or a hidden off-screen
link stays in the tab order.

**The scroll-driven work reveal** (§28) is a native `animation-timeline: view()` animation on the
inner `.work-item__art` only, so it composes with the JS `[data-reveal]` engine that owns the
parent's opacity. Browsers without support simply get the existing reveal.

## Gotchas

- **`/lab/` is a separate world.** It loads the original dark CSS and `three-hero.js`, and must never
  load `site.css`. It needs `#hero-canvas`, `#hero`, `#hero-title` with `.hero__line` spans, **and**
  `#work-title` as the morph target: remove the second heading and the morph breaks.
- **The particle hero fails open.** The pre-paint inline script hides both headings only after
  confirming WebGL and motion; `three-hero.js` reveals them on any failure, with a 2.5s failsafe and
  the module tag's `onerror` as backstops. Never hide either heading in CSS without a JS reveal path.
- **bfcache:** `three-hero.js` pauses on `pagehide[persisted]` and reloads on `pageshow[persisted]`.
- **Test the real thing.** Drive scroll explicitly in Playwright rather than hoping a screenshot
  lands after the animation. WebGL pages need `--use-angle=swiftshader --use-gl=angle
  --ignore-gpu-blocklist` to render headlessly.
- **Browsers cache CSS and JS hard.** `?v=` on `site.css` and `site.js` is load-bearing, because
  `vercel.json` marks `/assets/` immutable. Bump it on every edit:
  ```bash
  grep -rl 'site.css?v=' --include=*.html . | xargs sed -i 's/site\.css?v=[0-9]*/site.css?v=2/'
  ```

## History: two deleted rebuilds

A ground-up rebuild as "Ellevux Studios" was built in a `STUDIO/` directory over two sessions and
**deleted at the owner's request** on 2026-10-22, never deployed, never committed. An earlier
scroll-driven cinematic was scrapped before it. **Do not resurrect either.**

What went wrong was not a coding problem, and the lesson governs this repo:

- **It was built before the direction was settled.** The brief, the reference lock and the content
  all moved while the implementation was being written, so every piece was rebuilt several times and
  none of it felt chosen. Pin down what the site IS, who it is for, and what it must look like, with
  references agreed, **before** writing code. The current site was built that way: research, a
  locked reference, then a plan, then code.
- **A procedural 3D set piece has a hard ceiling.** No amount of iteration closes the gap to a
  reference made by a large studio. The honest options are a licensed rigged model or a separate
  showpiece page, never an inline sequence on the conversion path. `/lab/` is that separate page.
- **Iterating fast made it worse.** Change code, take a screenshot, repeat produces work that is
  roughly right and never good. Build it properly, judge it on its own, then integrate.

## Local tooling (this machine)

- **No `claude` CLI.** The VSCode extension bundles its runtime, so `claude mcp add` is unavailable.
  MCP servers are configured by writing `.mcp.json` in the project root.
- **MCP `refero`** is connected and is the primary design research tool. The `refero-design` skill
  says to prefer it over generic frontend-design skills, and research is mandatory before design work.
- **MCP `figma`** needs recreating; spawn it as `cmd /c npx` (bare `npx` fails on Windows) and
  reference the token as `${FIGMA_API_KEY}` so no secret lands in the repo. The Figma REST API is
  read-only for design content. **A Figma token was leaked into a transcript on 2026-10-22 and must
  be rotated.**
- **Blender 5.2.1 LTS** at `D:/Blender/blender.exe`. Headless works. Blender is **Z up**.
