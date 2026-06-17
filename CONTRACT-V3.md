# ELLEVUX v3 — AI-RECEPTIONIST SAAS REBUILD (build contract)

**Pivot:** Ellevux is no longer a web-design studio. It is now an **AI-receptionist SaaS product**
for service businesses — modeled closely on the reference `https://ellevux.vercel.app/`.
Static, no-build HTML/CSS/JS. Working dir `D:/Ellevux WEB`; write absolute, reference relative.
Copy is realistic **placeholder** the owner will edit. Match the reference's structure & feel closely.

## Product positioning (placeholder copy direction)
- **What it is:** "The hyper-intelligent AI receptionist for service businesses. Answers in <12s.
  Qualifies leads. Books directly to your calendar. 24/7."
- **Hero headline:** **"Stop missing calls. Start booking jobs."** — set "jobs." (and similar accent
  words) in the **italic serif** accent font.
- **Voice:** confident, crisp, product-led B2B SaaS. Short. Outcome-focused (missed calls → booked jobs).
- Audience: home-service / trades / clinics / salons — "high-performance service teams".

## Aesthetic (match the reference — calmer & cleaner than our old neon site)
- **Dark, deep-navy, restrained.** Mostly white/grey text on near-black navy. ONE refined accent +
  a subtle success-green for metrics. Subtle low-opacity corner gradients (NOT neon blobs). Fine 1px
  borders, soft shadows, lots of whitespace. Premium, techy, minimal.
- **No heavy 3D, no custom cursor, no full-screen loader.** Keep it fast and clean.

## STRIP from the current site (remove/disable)
- `#loader` markup + `assets/js/loader.js` (delete file + markup).
- Custom cursor (`#cursor` markup, `.cursor*` CSS, cursor logic in main.js) — remove.
- WebGL: `assets/js/three-hero.js`, `assets/js/showcase-3d.js`, the `<canvas>` elements, the
  import map, the two `type=module` script tags — delete files + markup.
- The old studio sections already gone; remove remaining web-design content: demo cards/`#work` as
  "Selected Work", the 3D "Lab", services-as-design. The `demos/` folder may stay on disk (unlinked).
- Magnetic/tilt everywhere — drop (or keep a *very* subtle button press only).

## NEW design tokens (owner: design-system agent → tokens.css)
Replace the palette + type for the SaaS look. Keep the token NAMES the rest of the CSS uses where
possible; change their VALUES.
```css
/* Surfaces — deep navy, restrained */
--bg-900:#070a12; --bg-850:#0a0e18; --bg-800:#0e131f; --bg-700:#141a28; --bg-600:#1b2233;
--surface-base:var(--bg-900); --surface-raised:var(--bg-850); --surface-panel:var(--bg-800);
--border:rgba(255,255,255,0.08); --border-strong:rgba(255,255,255,0.14); --hairline:rgba(255,255,255,0.06);
--glass-1:rgba(255,255,255,0.03); --glass-2:rgba(255,255,255,0.05);
/* Text */
--text:#f3f5fb; --text-soft:#b9c0d0; --text-muted:#7e8699; --text-dim:#586073; /* dim NOT for body */
/* Accent — refined, sparing (not neon) + success green for metrics */
--accent:#8b93ff; --accent-strong:#6d6dff; --accent-soft:rgba(139,147,255,0.14);
--green:#46e0a0; --green-soft:rgba(70,224,160,0.14);
--brand:var(--accent); --brand-contrast:#0a0e18;
--grad-accent:linear-gradient(135deg,#8b93ff,#6d6dff);
--grad-hero-glow:radial-gradient(60% 50% at 80% 0%,rgba(139,147,255,0.18),transparent 70%);
/* Type */
--font-sans:'Manrope',system-ui,-apple-system,'Segoe UI',sans-serif;   /* base */
--font-display:var(--font-sans);
--font-serif:'Instrument Serif','Georgia',serif;   /* ITALIC accent for hero highlight words */
--font-mono:'JetBrains Mono',ui-monospace,monospace; /* the call console */
```
Keep the existing fluid type scale, spacing, radii (rounded), motion tokens; just ensure they read
clean/calm. Provide a `.accent-serif{font-family:var(--font-serif);font-style:italic;font-weight:400}`
utility for the hero highlight. Buttons: primary = accent gradient with `--brand-contrast` dark text
OR white text on solid accent (ensure AA); secondary = ghost/outline.

## Fonts (index.html `<head>`)
```html
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Instrument+Serif:ital@1&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

## PAGE STRUCTURE v3 (owner: index.html agent) — match the reference, top→bottom
```
#nav      — left: "ellevux" wordmark; center/links: How it works · Features · Pricing · Changelog;
            right: "View demo" (ghost) + "Get started" (primary). Sticky; compact-on-scroll. Mobile menu.
<main>
  #hero       — eyebrow/badge ("AI receptionist for service businesses"), h1 "Stop missing calls.
                Start booking jobs." (accent-serif on "jobs."), lead subcopy, two CTAs
                ("Get started" + "Hear a live call"), subtle corner gradient glow.
  #console    — THE signature element (see "Console spec"). A terminal-style live AI-call transcript
                card + a "Live metrics" side panel (Response time 1.2s, Lead qualification 94% (count-up),
                Calendar status: Agent 1 / latest available). data-reveal.
  #logos      — quiet "Trusted by service teams" strip of 5-6 monochrome text/SVG marks.
  #features   — "Designed for high-performance service teams." A bento/card grid of 6 capabilities,
                each: small inline-SVG icon + title + 1-2 line desc + small tag pills:
                Inbound Call Answering (Voice/24-7) · Live Lead Qualification (Scoring/Real-time) ·
                Appointment Booking (Calendar/Sync) · WhatsApp & SMS Inbound (WhatsApp/SMS) ·
                Review Collector (Reputation/Automation) · Advanced Analytics (Insights/ROI).
  #voice      — "Custom AI Voice & Tone" highlight: copy + a small visual (waveform / voice card).
  #how        — "How it works" 3 steps: 1 Connect your number, 2 Train your agent (name/tone/FAQs),
                3 Go live 24/7. Numbered, connected.
  #pricing    — 3 tiers (Starter / Pro [highlighted] / Scale) with monthly⇄annual toggle (#billing-toggle
                role=switch), price, feature lists, CTA. Reuse a tokenized pricing card.
  #metrics    — a stat band (e.g., "12s avg pickup", "94% qualified", "3.2× more booked jobs",
                "24/7 coverage") with count-up.
  #faq        — accessible <details> accordion (~5 Qs: setup time, number porting, languages,
                pricing, data/security).
  #cta        — final full-width band: "Never miss another call." + Get started + book-a-demo.
  #contact OR book — a simple "Get started / book a demo" form (name, business, phone/email) — optional;
                the CTA may just link to #cta. Keep one clear conversion path.
</main>
#footer    — wordmark + short blurb, columns (Product: Features/Pricing/Changelog/Demo; Company:
             About/Contact; Legal), socials, © year. Restrained.
```
Keep an in-page anchor for each nav link. One `<h1>` (hero). Real <details> for FAQ (fails open).

## Console spec (`assets/js/console.js`, NEW) — the hero centerpiece
A realistic "live AI call" terminal card (mono font, dark panel, traffic-light dots, a filename tab
like `live_call.ts`). It **types out** a call transcript line-by-line on loop (or once when scrolled
into view), tagged speakers: `System` (dim), `Caller` (one color), `Ellevux` (accent). Example beats:
"Incoming booking call · +1 (512) •••-••••" → Caller asks about an emergency repair → Ellevux answers,
qualifies, offers a slot → "Booking confirmed · Tue 9:00 AM". Then a `// detected intent: emergency_repair`
+ `action: Dispatch agent` footer. Beside/below it a **Live metrics** panel: Response time (1.2s),
Lead qualification (94%, count-up bar), Calendar status (Agent 1 · latest available). 
MUST: respect `prefers-reduced-motion` (show the full transcript statically, no typing); pause when
offscreen (IntersectionObserver); guard missing nodes; no console errors; pure JS, no deps (gsap optional).

## Interactions (subtle — match the clean reference)
- `assets/js/animations.js` — GSAP + ScrollTrigger: subtle fade/rise reveals (`[data-reveal]`, fail OPEN
  with the same robustness rules: once, try/catch, ~2.5s failsafe), nav compact-on-scroll. Keep it calm.
  Lenis optional; if kept, very subtle, guarded, reduced-motion off.
- `assets/js/main.js` — mobile nav (a11y), smooth in-page anchor scroll (nav offset), pricing
  monthly⇄annual toggle (#billing-toggle swaps prices + "/mo|/yr" + "save 20%" badge), footer #year,
  and the get-started/demo form (validate + success state) if present. NO custom cursor, NO magnetic/tilt.
- `assets/js/ui-showcase.js` — KEEP only what's still used: counters (for metrics) + FAQ enhancement
  (the FAQ is native <details>, JS just animates height). Remove dead widget code (toggle/tabs/modal)
  unless reused. (Or fold counters/FAQ into main.js and delete ui-showcase.js — implementer's call,
  but keep file ownership clean.)
- DELETE: `assets/js/three-hero.js`, `assets/js/showcase-3d.js`, `assets/js/loader.js`.

## Script loading (index.html, end of body — simplified, NO three/importmap/loader)
```html
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script defer src="assets/js/console.js"></script>
<script defer src="assets/js/ui-showcase.js"></script>   <!-- only if kept for counters/FAQ -->
<script defer src="assets/js/animations.js"></script>
<script defer src="assets/js/main.js"></script>
```

## File ownership by phase (no two parallel agents write the same file)
- Phase 1 (System): design-system agent → `tokens.css`, `components.css`, `base.css`.
- Phase 2 (Page): index agent → `index.html` ONLY (new structure + console markup + script tags;
  strips loader/cursor/3D/demos markup).
- Phase 3 (parallel, READ the new index.html): `main.css` agent · `console.js` agent ·
  `animations.js`+`ui-showcase.js`+`main.js` behavior agent (owns JS; also deletes the 3 obsolete JS files).
- Phase 4 (Verify→Fix): reviewers (integration, functionality, design-vs-reference, a11y/responsive) → fixers.

## Quality bar
Mobile-first 375/768/1280/1440 (no 375 overflow), WCAG 2.1 AA (landmarks, one h1, labels, ARIA on
toggle/FAQ/menu, focus visible, contrast — body never `--text-dim`), 60fps, `prefers-reduced-motion`
calm, reveals fail OPEN, no console errors, tokens only. Should read unmistakably like the reference:
dark/clean/restrained AI-SaaS with the call-console as the hero centerpiece.
