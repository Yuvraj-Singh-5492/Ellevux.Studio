# Ellevux

A premium web-design & motion studio site — futuristic, 3D-forward, neon-glass.
Static (no build step): plain HTML/CSS/JS with **Three.js** and **GSAP** loaded from CDNs.

**Design. Motion. Dimension.**

---

## ⚠️ How to run it (read this first)

The hero and the 3D Lab use **ES-module scripts** (`<script type="module">`). Browsers
**block ES modules over the `file://` protocol** (CORS), so **double-clicking `index.html`
will load the page but the 3D scenes will be blank.** You must serve it over `http://`.

Pick any one of these — no Node required:

### Option A · VS Code Live Server (easiest)
1. Install the **Live Server** extension (by Ritwick Dey) from the Extensions panel.
2. Right-click `index.html` → **"Open with Live Server"**.
3. It opens at something like `http://127.0.0.1:5500/` — 3D works. ✅

### Option B · Python (already installed on this machine)
From this folder (`d:/Ellevux WEB`), run:
```bash
python -m http.server 5500
```
Then open <http://localhost:5500/> in your browser. ✅

> Tip: the demo sites also work fine opened directly (`file://`) because they're
> single self-contained files with no modules — but serving the whole folder over
> HTTP is the clean way to click through from the homepage.

---

## 🗂 Project structure

```
Ellevux WEB/
├── index.html                 Main landing page
│                              ├─ Section 1 · Live Demos
│                              └─ Section 2 · 3D & Interaction Lab
├── assets/
│   ├── css/
│   │   ├── tokens.css          Design system: color, type, spacing, motion (single source of truth)
│   │   ├── base.css            Reset + base elements + a11y foundations
│   │   ├── components.css      Reusable UI: buttons, glass, cards, tabs, modal, forms…
│   │   └── main.css            Page layout for index.html
│   └── js/
│       ├── three-hero.js       (module) Morphing shader icosahedron behind the hero
│       ├── showcase-3d.js      (module) 3 morphing WebGL scenes (blob · torus knot · particles)
│       ├── ui-showcase.js      Toggle, ARIA tabs, focus-trapped modal, count-up stats
│       ├── animations.js       GSAP ScrollTrigger reveals + parallax + nav state
│       └── main.js             Custom cursor, magnetic buttons, tilt, mobile nav, contact form
├── demos/
│   ├── aurora/index.html       Demo 1 · luxury beauty brand (light/organic)
│   └── nebula/index.html       Demo 2 · AI SaaS startup (dark/techy)
├── CONTRACT.md                 Architecture & integration spec used to build the site
└── README.md
```

## 🎨 Design system
Everything keys off `assets/css/tokens.css` — colors, fluid type scale, 8px spacing rhythm,
radii, shadows/glows, and motion timings are all CSS custom properties. Change a token and it
cascades site-wide. The two demo sites are intentionally self-contained with their **own**
palettes to show range.

## ✅ Built-in quality
- **Responsive**, mobile-first — tuned at 375 / 768 / 1280 / 1440px.
- **Accessible** (WCAG 2.1 AA) — semantic landmarks, ARIA widgets, keyboard support, visible focus,
  `prefers-reduced-motion` fallbacks everywhere.
- **Performance** — `devicePixelRatio` capped at 2, WebGL loops pause when offscreen / tab hidden,
  resources disposed on unload, transform/opacity-only animations, deferred scripts, lazy media.

## 🚀 Deploy (also no build needed)
Both hosts serve over HTTPS, so the 3D modules work in production.

- **Netlify Drop** — go to <https://app.netlify.com/drop> and drag the whole `Ellevux WEB` folder in.
- **Vercel** — `vercel` CLI, or import the repo at <https://vercel.com/new> (Framework preset: *Other* / no build command, output = root).
- **GitHub Pages** — push the folder to a repo and enable Pages on the root.

No environment variables are required. To make the contact form actually send, wire its submit
handler in `assets/js/main.js` to a form endpoint (e.g. Formspree, Netlify Forms, or your API).

## ✏️ Common tweaks
- **Brand colors / fonts** → `assets/css/tokens.css`.
- **Hero headline & copy** → `index.html` (`.hero__title` / `.hero__lead`).
- **Swap a demo** → replace `demos/<name>/index.html` and update the matching `.demo-card` in `index.html`.
- **3D look** → color constants and noise amplitude near the top of `three-hero.js` / `showcase-3d.js`.
