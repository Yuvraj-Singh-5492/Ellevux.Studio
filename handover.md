# Handover — Ellevux

Where things stand and what is left. Conventions, the design lock and deploy mechanics live in
`CLAUDE.md`. Date: **2026-10-28**.

## TL;DR

The site was **rebuilt from the ground up** from an editorial art portfolio into a
**conversion-focused studio site** selling websites plus SEO/AEO to business owners. Six pages, one
stylesheet, one script, zero dependencies, no build step.

The direction was locked **before** any code was written, through Refero research, and recorded in
`CLAUDE.md` under "The design lock". That ordering was the explicit instruction after two previous
rebuilds died from a moving brief.

**LIVE** at https://studio.ellevux.com and https://ellevux-studio.vercel.app. Seven pages now,
after `/ai-search/` was added on 2026-10-28.

> **Two things are outstanding and both are real.** (1) **Every canonical, OG and JSON-LD `@id`
> still says `ellevux-studio.vercel.app`** while the site serves on `studio.ellevux.com`, so the
> custom domain points search engines at the Vercel one. On a site that now sells search visibility
> this is the first thing to fix, and `CLAUDE.md` has the procedure under "Swapping the origin".
> (2) **The Vercel token pasted into the chat transcript on 2026-10-26 must be revoked**, as must the
> Figma token leaked on 2026-10-22.

## Instagram and reels (2026-10-23 to 2026-10-28)

Marketing runs outside this repo, in `D:\yuvraj-reels` (its `CLAUDE.md` has the detail).

- **@ellevux.studio** is live with **two reels**: Shugetsu (2026-10-23) and **MANZAR** (2026-10-25,
  https://www.instagram.com/reel/De6-5nyRoEp/, posted by hand with a trending sound). As of
  2026-10-28 the account has 0 followers and each reel 1 like, so there is nothing to learn from the
  numbers yet.
- **Bio** (set 2026-10-25): "Websites too good to scroll past. / DM "SITE" for a free homepage
  concept." That is the same call to action as every caption.
- **MANZAR** is an invented premium Dubai brokerage, built as the reel's site and as the free
  homepage concept for the lead list in `D:\lead-engine` (~124 established brokerages with no
  working website). The brand name lives in one place, so each lead gets the same build with their
  own name. It is a concept, never a client.
- **The reel machinery got better:** the first plate whose finger-on-the-mouse-wheel actually drives
  the scroll (`evening-monitor-mouse-02`), a fix for a cyan line round the screen, a zoom setting
  (used to keep the person's face out of frame), and three royalty-free tracks safe to auto-post.
- **Next reel:** a "why do they do this?" story reel, after a reference Yuvi sent on 2026-10-28 (3D
  cartoon, voice-over, one word on screen at a time, a website as the punchline). Breakdown and
  three versions: `D:\yuvraj-reels\ideas\2026-10-28-story-reel.md`. Not started; the version is
  his call.

**Open, and only the owner can decide:** the Instagram profile shows a **street address in
Amritsar**, which is public and contradicts the no-geography positioning; the profile's **name and
link fields are empty** (the link can only be set in the app, and should point at
`studio.ellevux.com` once the canonical swap is done).

## Latest session (2026-10-28) — `/ai-search/`, and a self-correction

**The problem, verified rather than assumed.** Ellevux sells two things. Websites were explained
everywhere; **SEO and AEO was sold in a five-bullet card and nowhere else**, and its one "learn
more" link was dead. `index.html` had the SEO card's CTA reading **"How that actually works"**
pointing at `#faq` — and **the home page has no `#faq` and no `FAQPage`.** `/pricing/` pointed a
second CTA at the same missing anchor. The only real explanation of AEO on the whole site was one
56-word answer buried as question 8 of 8 on `/about/`. The home AI panel also said "exactly like
the questions further down this page", and there were no questions further down that page.

**What shipped.** `/ai-search/`, nine bands, composed **entirely from existing CSS components** (no
new CSS section, so no `?v=` bump): why you cannot tell good SEO from bad, what Google confirms, how
assistants actually retrieve, what nobody knows, what does not work, what I do, six questions,
close. It is the longest page on the site on purpose, because depth is the argument.

**The selling mechanism is candor, not a claim.** Research found that searching for AI-citation
studies lands you in a ring of vendor sites citing each other and re-citing the same few studies
with the numbers changed. That is *why* a business owner cannot tell good from bad, and it is the
page's opening move. Google also publishes a buyer's guide to hiring an SEO that almost nobody shows
a client, including two questions aimed at AEO sellers specifically. The page quotes them and then
answers them about itself.

**Every claim carries a `.status-pill` evidence tier** (Confirmed / Peer reviewed / One study, dated
/ Independent / Unknown) with a linked primary source. The class already existed and was unused: it
was the retired "open for projects" chip. No agency grades its own claims on its own sales page, and
that is the memorable move.

**The site corrected two of its own claims.** Research contradicted them, so they changed rather
than being quietly left:

- **Structured data was being sold as an AI-citation lever.** Google states plainly that "structured
  data isn't required for generative AI search, and there's no special schema.org markup you need to
  add." The home AI panel's point 03 and the service card both implied otherwise. Point 03 is now
  "Specifics worth quoting" (the peer-reviewed finding), and schema is claimed for rich-result
  eligibility only.
- **Question-shaped headings were filed under "evidence-based".** No controlled study isolates
  heading format as a cause of citation. It is cheap and plausible, so it stays in the work, but it
  is now graded a reasonable bet, in `CLAUDE.md` and on the page.

**The numbers rule was amended, narrowly.** It was "No metrics. None." It is now: a number may
appear **only** when quoted from a named public source named in the same sentence the reader sees.
Four survive that test on the page (Pew on clicks, the KDD experiment, Google's own "fewer than 1%
of global queries" on HTTPS, and the reproducibility figure). **No number about his own results
appears anywhere, and that rule has not moved.** Cloudflare's crawl-to-refer ratios, the AI Overview
top-10 percentages, all llms.txt adoption figures and the circulating "77% of JavaScript parsing
fails" were researched and **deliberately not used**, because they are window-dependent, mutually
contradictory, or traceable to no named study.

**Two FAQ questions moved** off `/about/` (8 to 6) onto `/ai-search/`, in both the accordion and the
`FAQPage`, which `verify.mjs` pairs **positionally**. The no-guarantee answer now sits on the page
that spends its whole length explaining how ranking works, and is backed by Google's own "No one can
guarantee a #1 ranking on Google."

### The verification that actually earned its keep

Every quoted fragment was checked against its live source. **One failed, and it mattered:** the page
had rendered *"supports recommendations with official Google documentation"* in quotation marks, and
Google's real text is a question, *"Do they cite official Google documentation as supporting evidence
for their recommendations?"* **Presenting a paraphrase as a quotation is exactly the sin the page
condemns**, on the one sentence its credibility rests on. Fixed, and the corrected version is
stronger. A second quote was truncated in a way that broadened its meaning, and was restored in
full. Final state: **29 of 29 quoted spans verbatim at source**, 20 of 20 cited links returning 200.

Two cautions for whoever runs that check next. Google's CDN **served some docs in Portuguese
mid-run**, which looked exactly like six quotes having been reworded; pin `?hl=en` plus an
`Accept-Language` header. And compare on letters and digits only **after stripping tags and decoding
entities** from both sides, or `&#39;` normalises to the digits "39" and every quote containing an
apostrophe fails, while any quote spanning a link or `<code>` boundary fails too.

**`verify.mjs` passes on all eight pages, but it could not see the two things most likely to break
here**, so both were measured by hand (script kept in the session scratchpad):

- **`NAVCLASH` has been dead since the dock replaced the pill.** It queries `.nav__pill`, which
  exists in no HTML file. It is the check written *because* a hero refactor once put the nav on five
  pages' headings while everything passed, and it has protected nothing since. Measured directly: no
  overlap, any page, any width. **Repairing the selector is the highest-value follow-up in the repo.**
- **The 940 to 1024px nav window is never tested**, because chips render at 940 and the widths jump
  768 to 1280. The fourth chip measures 810px of dock against 893px available at 940px: **83px
  slack**, so `AI SEARCH` fits and the `SEO` fallback was not needed. The open drawer was also
  measured, since verify only ever sees it shut: the foot sits at 575px inside a 640px phone.

## Latest session (2026-10-23)

**The Ellevux SaaS was renamed and re-shot.** It is no longer an "AI receptionist": the live site
at ellevux.vercel.app has been rebuilt as **"Run your business on agents, not memory"**, a six
service agentic platform (Call Vault, Method Agent, Retention Radar, Commitment Tracker, Outreach
Engine, Business OS) with no call handling anywhere in it. Every visible mention now reads
**"Agentic systems"**, and all three images were re-captured from the live site: the work tile
thumbnail and the desktop and phone screens for the hero stage. The hero stage now **opens on
Agentic systems** instead of Mirror.

**The approved quote was SHORTENED, not reworded.** It opened with "Explaining an AI receptionist
is harder than it sounds. Yuvi made it click in seconds: stop missing calls, start booking jobs,
with a hero that shows a call being handled." That describes a product and a hero that no longer
exist, and a prospect who clicks through would catch the mismatch immediately. Quoting less of an
approved quote is honest; rewording it to fit the new product would be putting words in the
client's mouth, which is the exact failure this repo already had once. What remains is the client's
own still-true sentence, and the note under the quotes says plainly that it was shortened and why.
**The full text goes back only if the client re-approves it.**



**Pricing, three slabs.** `/pricing/` shows all three packages side by side with one audit toggle
above that updates every price at once in pure CSS. Rows align exactly at every width: the cards
adopt the same seven row tracks from `.plans` through **subgrid**, so each row is sized by the
tallest card and no slab can drift when the copy changes. Two real offsets were found and fixed on
the way: the recommended plan's 2px top rail sat its whole column 1px low, and between 980 and
1120px the longest name and strapline wrapped a line further, stepping the prices by 54px. iPad
landscape sits inside that band. The contrast check also caught the recommended plan's button
rendering ink-on-ink at 1.00:1, completely invisible.

**The hero was rebuilt against ai.work**, analysed frame by frame at the owner's request. It is now
a dark inset stage with a two-tone light-weight headline and a **live console** playing in the
lower half: a job card, a brief with inline chips, and a picker that opens, highlights an engine
and resolves the chip. The device stage moved to its own paper band directly below. The full
mapping, and what was deliberately not taken, is in `CLAUDE.md` under "The hero: the stage and the
console".

That rewrite shipped a regression worth remembering: **`.hero` is shared by five other pages**, so
folding the stage's padding into it put the floating nav straight on top of their headings, and
every existing check passed. There is now a `NAVCLASH` check in `verify.mjs`, proven by
reintroducing the exact bug and watching it fail on three pages at five widths.

## What the old site was

Pure-black canvas, a GPU particle-text hero that morphed on scroll, four scattered work tiles, a
giant footer wordmark. Well crafted, and it sold nothing:

- No CTA in the hero at all. No services, pricing, process or FAQ. **No form anywhere** — the only
  conversion path on the whole site was a `mailto:` in the footer.
- **Zero structured data**, on a site intending to sell SEO and AEO.
- 2.42 MB of assets, 95% images, including a **1.41 MB PNG** rendered grayscale at thumbnail size.

The particle hero was not thrown away. It lives on at **`/lab/`** as a labelled craft showpiece,
off the conversion path.

## What is built

**Direction: Blueprint.** Reference-locked to Patch (thepatchsystem.com), with the band rhythm
borrowed from Elementor, a dotted grid and mono labels from designstripe, and the answer-panel
surface from Perplexity. Light ink-on-paper canvas, a visible hairline grid, ultra-condensed heavy
all-caps display type, near-sharp radii, zero shadows, one reserved acid-green action colour.

| Page | What it does |
|---|---|
| `/` | The conversion spine. 13 strictly alternating bands. |
| `/pricing/` | Three packages, what actually differs, its own FAQ. |
| `/work/` | "Client work, 2" and "Studio pieces, 4". Counts stated out loud. |
| `/contact/` | The one conversion destination. Seven-field qualifying form. |
| `/thanks/` | Post-submit expectations. `noindex`. A countable URL. |
| `/lab/` | The preserved particle hero, framed as a capability piece. |

**The signature move** is the AI answer panel on the home page: a code-native mock of an assistant
citing a business, paired with three callouts naming what made that answer possible, each pointing
at a real element on that very page, then *"right-click, view source"*. It argues for AEO by being
the worked example. The business in it is invented and the panel is labelled an illustration at full
size, not in fine print.

**Trust strategy: craft plus candor.** There are no metrics, so nothing claims an outcome. Every
promise describes what he *does*. The site instead commits in public: prices shown, a process with
durations, the honest client count, no lock-in, a reply-time promise, and an explicit refusal to
guarantee rankings.

### Numbers

- **357 KB** home page, 13 requests, including the two live device screenshots in the
  hero. It was 251 KB before the interactive pass and 2.42 MB before the rebuild.
- Thumbnails: 2.3 MB of PNG to **413 KB** of AVIF + WebP on disk, two widths each.
- Fonts are now the largest item at ~98 KB, and are the obvious next optimization.
- The whole site is **~3,800 lines**: one 2,060-line stylesheet, one 880-line script, six pages.

### Verification

`tools/verify.mjs` passes on all six pages at **320/375/768/1280/1440**. It checks horizontal
overflow (naming culprit elements), band inversion, acid discipline, landmarks, image dimensions,
JSON-LD integrity, **FAQ answers matching the visible copy verbatim**, the reveal failsafe, and runs
a no-JS and a reduced-motion pass. `tools/interact.mjs` passes: the mobile drawer (aria-expanded,
scroll lock, `inert`, focus move, Escape, focus restore) and the form (`?p=` prefill, validation,
`aria-invalid`, error text, status announcement, focus to first invalid field).

## The interactive pass (2026-10-22, after the rebuild)

The owner asked for 3D, Apple-familiar interaction, and a hero that makes people act. Four things
were added, all within the no-build constraint and all working with JavaScript off.

**The design lock was amended deliberately, not quietly.** Blueprint says flat and sharp; Apple is
soft and layered. The resolution, backed by Lusion (a bright sharp type-led page that does exactly
this): structure stays flat and sharp, anything you can **press** gets soft radii and a whisper of
lift. The test for drift is "could you press it?"

| Added | What it is |
|---|---|
| **Device stage** | A macOS browser window and an iPhone in real CSS 3D, showing the ACTUAL client sites at real desktop and phone viewports. Drag to spin with momentum, release and it springs back. Hover parallaxes it. A segmented control swaps project. |
| **Configurator** | Apple's pick-a-model pattern on the pricing band. Pick a package, flip the audit switch, the price changes. The swap is pure CSS `:has()`, so it works with no JS and every figure stays real text. |
| **Sticky action bar** | iOS bottom bar on phones, frosted, safe-area aware, appearing once the hero is gone. On the home page its price mirrors the configurator. Also on `/pricing/` and `/work/`. |
| **Scroll-driven work reveal** | Thumbnails tilt up out of the page on scroll, using native `animation-timeline: view()`. No scroll listener, runs on the compositor. |

**Cost: about 9 KB of JavaScript.** Three.js would have been roughly 160 KB gzipped on the page
whose speed is the sales argument, so the 3D is hand-built with CSS transforms instead. Page weight
went 251 KB to 357 KB uncompressed, and almost all of that increase is the two device screenshots,
not code.

**Four real bugs were found and fixed by the automated tests**, which is the argument for keeping
them: `setPointerCapture` silently dropping pointer moves; the browser's native image-drag firing
`pointercancel` and killing the rotation; grid `min-width: auto` forcing a sideways scroll at 320;
and a misplaced CTA that would have put two acid buttons above the fold.

`tools/interact.mjs` now covers the stage (3D at rest, drag follows the pointer, clamping holds,
spring returns, project switch), the configurator (one price visible, every package and add-on
combination, the switch disabled on the package that includes it) and the action bar (hidden at
top including out of the tab order, appears after the hero, never acid, price mirrors the
configurator).

## The premium re-grade and the shortening (2026-10-22, later)

The owner's verdict on the first build: "my own website feels pretty cheap." He was right, and it
was the direction, not the polish. Four things were fixing against a 9,000 USD price:

1. **The acid green.** Lime on white is a budget-SaaS signal, and I had promoted it to the loudest
   element on the page. K72's own style guide says never make a lime accent the primary CTA.
2. **Big Shoulders Display**, a recognisable free font that reads civic signage.
3. **The visible lattice grid**, which read like a wireframe.
4. **All-caps condensed headlines in every band.** Luxury whispers; that is a startup idiom.

Every premium reference researched (Magnetism, Metalab, INK, Sequel, Bibliotheque, Zara, YSL)
shares four traits: strictly monochrome with no accent, enormous negative space, monumental refined
type, and understated text-led buttons. So:

| Changed | To |
|---|---|
| Palette | **Bone `#f8f8f6` and ink `#0b0b0b`. No accent at all.** A primary button is simply the inverse of its band. Colour enters only through client screenshots. |
| Display type | **Instrument Serif**, sentence case, weight 400, treated as an art object |
| Label type | Wide-tracked **Archivo**. The mono face is gone: monospace signals "technical tool" |
| Grid | Dropped to a whisper (0.035 alpha) |
| Radii | 0 for ruled edges, 20px for cards, pill for buttons. The old 5px was the most default-looking radius there is |
| Spacing | Bands opened up from 8.5rem to 11rem max |

**It also got faster.** Three font families became two, so fonts fell from 98 KB to 55 KB and the
page from 357 KB to 312 KB across 11 requests.

### Then: shortened, and restructured

Thirteen bands on the home page was too long for a clean premium read. The home page is now **seven
bands**: hero, who paid me, what I do, the AI answer moment, three work tiles, close, footer. It
went from 970 lines to 644.

- **The configurator moved to `/pricing/`** and became its centrepiece, giving that page a reason to
  exist beyond being a list. The static three-card grid it duplicated was removed.
- **`/about/` is new**: Yuvi's intro, what he does not do, the three process steps, and the eight
  general questions, with the `FAQPage` schema moving there from the home page.
- The quotes band was cut from home because `/work/` already carried both quotes verbatim.
- Nav simplified to **Work · Pricing · About** plus the CTA.

### Navigation and buttons

The nav became a **floating frosted pill** carrying the mark and the words, safe-area aware so it
clears a Dynamic Island. Buttons became **tactile keys** that sit on an edge and travel down when
pressed, rebuilt in CSS from a React component the owner supplied, since this site ships no React.

**Outstanding: the real logo.** `assets/img/logo-mark.svg` is a hand-authored placeholder. Drop the
real asset at that exact path and everything picks it up.

## Blocked on the owner

Invention is not permitted in any of these, so they need real answers:

1. **The three delivery timelines, revision counts and page counts.** The site currently ships my
   proposals: about one week, two to three weeks, and three weeks plus ninety days; one and two
   revision rounds; one page and up to six pages. **Confirm or correct these.** They appear on the
   home process band, both pricing surfaces and in the FAQ.
2. **The form endpoint.** Right now the form composes a prefilled email and hands it to the
   visitor's mail client, so it genuinely works with no backend. Give me a Formspree, Basin or
   Web3Forms endpoint and it POSTs in the background and lands on `/thanks/` instead. One line
   changes: the form's `action`.
3. **Client names and roles** for the two quotes. They are company-attributed and the page says so
   out loud. Two emails would upgrade the strongest section on the site, at zero cost.
4. **Availability.** "Open for projects" is evergreen. If you want a real slot count, it has to be
   kept honest.
5. **Whether to show a deposit split** on `/pricing/`. Deliberately omitted rather than invented.
6. **The domain.** Everything is built against `ellevux-studio.vercel.app`, isolated so the swap is
   one find-and-replace. See "Swapping the origin" in `CLAUDE.md`.

## Next steps

1. **Deploy: done.** Live at studio.ellevux.com and ellevux-studio.vercel.app (see the TL;DR for
   the canonical swap that is still outstanding).
2. **Commit and push to GitHub.** Still true on 2026-10-28: `git log` ends at `0f6d1a2` (the old
   portfolio), so the whole rebuild, `/ai-search/` included, exists only in the working tree. A local
   commit needs no token; pushing needs a GitHub token.
3. **Rotate the leaked Figma token** (pasted into a transcript on 2026-10-22, treat as public).
4. **Self-host the fonts.** They are 98 KB of a 251 KB page and the only remaining third-party
   request. Subset to latin, preload display and body, lazy the mono. If the budget is still tight,
   drop IBM Plex Mono and set labels in Archivo with wide tracking.
5. **Lighthouse on the preview URL.** Gate the launch on 100 across the board. For a studio selling
   SEO that score is itself the proof.

## Phase 2, when phase 1 has proven itself

Service pages `/websites/` and `/ai-search/` (this is where the multi-page SEO argument actually
pays, and each gets its own `FAQPage`); a Mirror Solutions case page in decision-log format with no
metrics; `/about/`; motion on the answer panel, plus a **real dated assistant screenshot only if one
can genuinely be obtained**; named testimonial attribution the day the names arrive.

**Do not build in phase 1:** scroll cinematics, any 3D on the conversion path, a pricing calculator,
a dark/light toggle, a chatbot, a blog engine, animated counters, a custom cursor. Each is plausible
and each would delay a shippable site. The repo's own history says that is the failure mode.

## Two corrections worth keeping

- **Mirror Solutions is finished, not "under construction".** The old site carried a stale chip that
  was actively undercutting the single strongest proof asset. `curl` returns 89 KB of real HTML with
  a complete four-step process and a working intake form. **It has shipped the exact thing this site
  asks visitors to buy**, which is the most valuable sentence in the whole proof inventory. The chip
  is gone and the framing now leads with it.
- **The Ellevux SaaS still shows "To be provided" four times.** So the home tile links to its
  `/work/` entry rather than straight out, and `/work/` sets expectations before the outbound click.

## Proof inventory

| Piece | Status | Where |
|---|---|---|
| Mirror Solutions | Real client, live, approved 5.0 quote | home tile 01, `/work/` client 01 |
| Agentic systems (Ellevux SaaS) | Real client, launching, approved 4.5 quote, **shortened** | home tile 02, `/work/` client 02 |
| Buzzy | Self-initiated build | home tile 03, `/work/` studio 01 |
| Elements | Component and motion lab, already deployed, **now relinked** | `/work/` studio 02 |
| ARC | Self-initiated concept, fiction declared before the click | `/work/` studio 03 |
| Urbane Ivy | Spec pitch for a real Kochi studio, never commissioned, **not deployed** | `/work/` studio 04, not a link |

One third-party presence exists since 2026-10-23: **Instagram @ellevux.studio** (two reels, no
followers yet), linked from the site and in `sameAs`. Still missing, and only the owner can fix: a
referenceable human, a Google Business profile, LinkedIn, Clutch. A website cannot manufacture
either.
