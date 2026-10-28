/* ============================================================
   ELLEVUX · verify.mjs
   ------------------------------------------------------------
   Automated checks that enforce the design lock and the a11y
   baseline. Not deployed: exclude tools/ from the upload set.

   Run:
     python -m http.server 5510      (from the repo root)
     node tools/verify.mjs

   playwright-core lives in ARC/node_modules (ARC is a separate,
   gitignored project), and ESM resolves packages from the SCRIPT's
   directory rather than cwd, so it is resolved explicitly below.
   That makes this runnable from anywhere. We launch the INSTALLED
   Edge via channel:'msedge', so no browser download is needed.

   Why newContext({viewport}) and never --window-size: raw
   headless Chrome clamps --window-size to ~482px and HIDES real
   mobile overflow. That exact trap masked a live bug in this
   repo once.
   ============================================================ */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, '..', 'ARC', 'package.json'));
const { chromium } = require('playwright-core');

const BASE = process.env.BASE || 'http://localhost:5510';
const WIDTHS = [320, 375, 768, 1280, 1440]; // 320 covers WCAG 1.4.10 reflow
const PAGES = (process.env.PAGES || '/').split(',');
const OUT = join(here, '..', '.verify');

mkdirSync(OUT, { recursive: true });
const fails = [];
const browser = await chromium.launch({ channel: 'msedge' });

for (const width of WIDTHS) {
  const ctx = await browser.newContext({
    viewport: { width, height: 900 },
    deviceScaleFactor: 2, // exercises the HiDPI hairline of the grid
  });
  const page = await ctx.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error') fails.push(`CONSOLE @${width}: ${m.text()}`);
  });
  page.on('pageerror', (e) => fails.push(`PAGEERROR @${width}: ${e.message}`));

  for (const path of PAGES) {
    const res = await page.goto(BASE + path, { waitUntil: 'load' });
    if (!res || !res.ok()) {
      fails.push(`HTTP ${path} @${width}: ${res ? res.status() : 'no response'}`);
      continue;
    }

    // MANDATORY before measuring. The ultra-condensed display face is
    // far narrower than its fallback, so measuring before fonts land
    // produces both false passes and false failures.
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(200);

    /* ---- 1 · HORIZONTAL OVERFLOW ----
       documentElement.scrollWidth, not body: body can be narrower
       than an overflowing absolutely positioned child.
       This check only works because body has NO overflow-x. */
    const { scrollW, innerW } = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth,
    }));
    if (scrollW > innerW + 1) {
      const culprits = await page.evaluate((iw) =>
        [...document.querySelectorAll('body *')]
          .map((el) => {
            const r = el.getBoundingClientRect();
            if (!r.width && !r.height) return null;
            return r.right > iw + 1 || r.left < -1
              ? {
                  sel:
                    el.tagName.toLowerCase() +
                    (el.className && typeof el.className === 'string'
                      ? '.' + el.className.split(' ')[0]
                      : ''),
                  left: Math.round(r.left),
                  right: Math.round(r.right),
                }
              : null;
          })
          .filter(Boolean)
          .slice(0, 10), innerW);
      fails.push(
        `OVERFLOW ${path} @${width}: ${scrollW} > ${innerW}\n` +
          culprits.map((c) => `    ${c.sel}  ${c.left}..${c.right}`).join('\n')
      );
    }

    /* ---- 2 · CARD SEPARATION ----
       Band inversion is retired. The page is ONE canvas now, so two
       adjacent bands sharing a tone is the design rather than a bug,
       and the old check failed on every page by definition.

       What replaced inversion is the hairline: a card is the canvas
       lifted a step with a border, so if the border goes the card
       stops existing. That is the thing worth guarding, plus the one
       deliberate exception, the hero stage, which is a dark room on a
       light page and must stay clearly darker than it. */
    const cardBugs = await page.evaluate(() => {
      const lum = (c) => {
        const [r, g, b] = c.match(/[\d.]+/g).slice(0, 3).map(Number).map((v) => {
          const n = v / 255;
          return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const bad = [];
      document.querySelectorAll('.card').forEach((el) => {
        const cs = getComputedStyle(el);
        const bw = parseFloat(cs.borderTopWidth) || 0;
        const transparent = /rgba\(.*,\s*0\)$/.test(cs.borderTopColor);
        if (bw < 0.5 || transparent)
          bad.push('card with no hairline: .' + el.className.split(' ').slice(0, 2).join('.'));
      });
      const stage = document.querySelector('.hero__stage');
      if (stage) {
        const sl = lum(getComputedStyle(stage).backgroundColor);
        const pl = lum(getComputedStyle(document.body).backgroundColor);
        if (!(pl - sl > 0.25)) bad.push('the hero stage is not clearly darker than the page');
      }
      return bad;
    });
    cardBugs.forEach((b) => fails.push(`SURFACE ${path} @${width}: ${b}`));

    /* ---- 3 · ONE h1, AND LANDMARKS ---- */
    const doc = await page.evaluate(() => ({
      h1: document.querySelectorAll('h1').length,
      main: document.querySelectorAll('main').length,
      skip: !!document.querySelector('.skip-link'),
      title: document.title,
    }));
    if (doc.h1 !== 1) fails.push(`H1 ${path} @${width}: found ${doc.h1}, expected 1`);
    if (doc.main !== 1) fails.push(`MAIN ${path} @${width}: found ${doc.main}, expected 1`);
    if (!doc.skip) fails.push(`SKIPLINK ${path} @${width}: missing`);
    if (!doc.title) fails.push(`TITLE ${path} @${width}: missing`);

    /* ---- 3b · THE FLOATING PILL MUST NOT LAND ON THE CONTENT ----
       The nav is fixed and the hero reserves its clearance in
       padding, so the two are only ever one edit apart from
       colliding. Rewriting .hero for the home page's stage put the
       pill straight on top of the heading on five other pages, and
       every other check here passed. */
    const navClash = await page.evaluate(() => {
      const pill = document.querySelector('.nav__pill');
      if (!pill) return null;
      const p = pill.getBoundingClientRect();
      if (p.height === 0) return null;          // drawer-only layouts
      const first = [...document.querySelectorAll('h1, .hero .label, .hero .live-chip')]
        .map((e) => e.getBoundingClientRect())
        .filter((r) => r.height > 0)
        .reduce((a, r) => (a === null || r.top < a ? r.top : a), null);
      return first === null ? null : { over: Math.round(p.bottom - first), first: Math.round(first) };
    });
    if (navClash && navClash.over > 0)
      fails.push(
        `NAVCLASH ${path} @${width}: the floating pill covers the first heading by ${navClash.over}px`
      );

    /* ---- 4 · IMAGES: explicit dimensions kill CLS ---- */
    const imgBad = await page.evaluate(() =>
      [...document.querySelectorAll('img')]
        .filter((i) => !i.hasAttribute('width') || !i.hasAttribute('height'))
        .map((i) => (i.alt || i.src).slice(0, 48))
    );
    imgBad.forEach((a) => fails.push(`CLS-RISK ${path} @${width}: img without width/height "${a}"`));

    const altBad = await page.evaluate(() =>
      [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).length
    );
    if (altBad) fails.push(`ALT ${path} @${width}: ${altBad} img without an alt attribute`);

    /* ---- 5 · JSON-LD: parses, no dangling @id, origins match ---- */
    if (width === WIDTHS[0]) {
      const ld = await page.evaluate(() =>
        [...document.querySelectorAll('script[type="application/ld+json"]')].map((s, i) => {
          try {
            return { i, ok: true, data: JSON.parse(s.textContent) };
          } catch (e) {
            return { i, ok: false, err: e.message };
          }
        })
      );
      // A noindex page has nothing to gain from structured data, so
      // its absence there is correct rather than a finding.
      const noindex = await page.evaluate(() =>
        (document.querySelector('meta[name="robots"]')?.content || '').includes('noindex')
      );
      if (!ld.length && !noindex) fails.push(`JSONLD ${path}: no structured data on the page`);
      ld.filter((b) => !b.ok).forEach((b) =>
        fails.push(`JSONLD ${path}: parse error in block ${b.i}: ${b.err}`)
      );

      const defined = new Set();
      const referenced = new Set();
      const walk = (n) => {
        if (Array.isArray(n)) return n.forEach(walk);
        if (!n || typeof n !== 'object') return;
        const keys = Object.keys(n);
        if (n['@id'] && keys.length === 1) referenced.add(n['@id']);
        else if (n['@id']) defined.add(n['@id']);
        keys.forEach((k) => walk(n[k]));
      };
      ld.filter((b) => b.ok).forEach((b) => walk(b.data['@graph'] || b.data));
      [...referenced]
        .filter((r) => !defined.has(r))
        .forEach((r) => fails.push(`JSONLD ${path}: dangling @id reference ${r}`));

      // An @id graph rooted at the wrong origin severs every entity
      // reference, and nothing reports it loudly. So we do.
      const canonical = await page.evaluate(
        () => document.querySelector('link[rel=canonical]')?.href || ''
      );
      if (!canonical) fails.push(`CANONICAL ${path}: missing`);
      else {
        const origin = new URL(canonical).origin;
        [...defined, ...referenced]
          .filter((id) => {
            try {
              return new URL(id).origin !== origin;
            } catch {
              return true;
            }
          })
          .forEach((id) => fails.push(`JSONLD ${path}: @id origin mismatch (want ${origin}): ${id}`));
      }

      // The FAQ answers must match the visible copy verbatim, or the
      // markup misrepresents the page.
      const faqMismatch = await page.evaluate(() => {
        const blocks = [...document.querySelectorAll('script[type="application/ld+json"]')]
          .map((s) => {
            try { return JSON.parse(s.textContent); } catch { return null; }
          })
          .filter(Boolean);
        const faq = blocks
          .flatMap((b) => b['@graph'] || [b])
          .find((n) => n['@type'] === 'FAQPage');
        if (!faq) return [];
        const visible = [...document.querySelectorAll('.faq__item')].map((d) => ({
          q: d.querySelector('.faq__q')?.textContent.trim() || '',
          a: d.querySelector('.faq__a p')?.textContent.trim() || '',
        }));
        return (faq.mainEntity || [])
          .map((item, i) => {
            const v = visible[i];
            if (!v) return `FAQ item ${i} has no visible counterpart`;
            if (v.q.replace(/\s+/g, ' ') !== item.name.replace(/\s+/g, ' '))
              return `FAQ ${i} question differs:\n      ld: ${item.name}\n     dom: ${v.q}`;
            const ldA = item.acceptedAnswer.text.replace(/\s+/g, ' ');
            if (v.a.replace(/\s+/g, ' ') !== ldA) return `FAQ ${i} answer differs from the visible text`;
            return null;
          })
          .filter(Boolean);
      });
      faqMismatch.forEach((m) => fails.push(`JSONLD ${path}: ${m}`));
    }

    /* ---- 6 · MONOCHROME DISCIPLINE ----
       The accent was RETIRED on 2026-10-22: lime on white read as
       budget SaaS and fought a 9,000 USD price. The studio pages are
       now strictly monochrome, so the rule is no longer "acid only on
       actions", it is "no acid at all". Colour enters the page only
       through the client screenshots.
       /lab/ is exempt: it deliberately runs the ORIGINAL dark token
       set, where the accent legitimately styles the email pill. */
    /* The acid role fence belongs to the new design system. /lab/
       deliberately runs the ORIGINAL dark token set, where the accent
       legitimately styles the email pill, so the check is scoped to
       pages that actually use bands. */
    const usesBands = await page.evaluate(() => !!document.querySelector('[data-band]'));
    const acidStray = !usesBands ? [] : await page.evaluate(() => {
      const ACID = 'rgb(200, 250, 60)';
      // No exceptions any more. The studio pages carry no accent at
      // all, so a single acid pixel is a regression.
      const allowed = () => false;
      return [...document.querySelectorAll('body *')]
        .filter((el) => {
          const cs = getComputedStyle(el);
          const hit = cs.backgroundColor === ACID || cs.color === ACID;
          return hit && !allowed(el);
        })
        .map(
          (el) =>
            el.tagName.toLowerCase() +
            (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : '')
        )
        .slice(0, 8);
    });
    acidStray.forEach((s) =>
      fails.push(`ACID ${path} @${width}: signal colour outside its role on ${s}`)
    );

    /* The rule is not just "acid only on actions", it is "never more
       than ONE acid element in a single viewport". Whitelisting every
       .btn--primary hides exactly the case that matters, so count the
       acid-filled elements actually visible in each viewport-high
       slice of the page. */
    const acidCrowd = !usesBands ? [] : await page.evaluate((vh) => {
      const ACID = 'rgb(200, 250, 60)';
      const hits = [...document.querySelectorAll('body *')]
        .filter((el) => {
          const cs = getComputedStyle(el);
          if (cs.backgroundColor !== ACID) return false;
          const r = el.getBoundingClientRect();
          if (r.width < 8 || r.height < 8) return false; // the status dot
          // The skip link only ever appears on focus, alone, so it can
          // never crowd anything.
          if (el.classList.contains('skip-link')) return false;
          // Anything genuinely not rendered: display/visibility/opacity,
          // and the closed mobile drawer, which holds a second CTA.
          if (el.checkVisibility && !el.checkVisibility({ visibilityProperty: true, opacityProperty: true }))
            return false;
          if (el.closest('[data-open="false"]')) return false;
          return true;
        })
        .map((el) => {
          const r = el.getBoundingClientRect();
          return {
            top: Math.round(r.top + window.scrollY),
            sel: el.tagName.toLowerCase() +
              (el.className && typeof el.className === 'string'
                ? '.' + el.className.split(' ').join('.')
                : ''),
          };
        });
      const bad = [];
      hits.forEach((a, i) => {
        hits.slice(i + 1).forEach((b) => {
          if (Math.abs(a.top - b.top) < vh) bad.push(`${a.sel} + ${b.sel}`);
        });
      });
      return bad;
    }, 900);
    acidCrowd.forEach((c) =>
      fails.push(`ACID ${path} @${width}: two acid elements within one viewport: ${c}`)
    );

    /* ---- 6b · CONTRAST ON GLASS ----
       Translucent panes are exactly where text quietly drops below
       AA: the pane's declared colour looks fine, but what the eye
       sees is that colour composited over the band. So composite it
       the way the browser does, then measure. */
    if (width === 1280) {
      const lowContrast = await page.evaluate(() => {
        const parse = (c) => (c.match(/[\d.]+/g) || []).map(Number);
        const lum = ([r, g, b]) => {
          const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        };
        const ratio = (a, b) => {
          const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
          return (x + 0.05) / (y + 0.05);
        };
        const bad = [];
        document.querySelectorAll('.card, .answer, .config').forEach((pane) => {
          const pc = parse(getComputedStyle(pane).backgroundColor);
          if (pc.length < 3) return;
          const alpha = pc.length > 3 ? pc[3] : 1;
          const band = pane.closest('[data-band]');
          const bandBg = parse(getComputedStyle(band || document.body).backgroundColor);
          // What the pane actually looks like once composited.
          const eff = pc.slice(0, 3).map((v, i) => Math.round(alpha * v + (1 - alpha) * bandBg[i]));
          // Resolve the backdrop a given element ACTUALLY sits on: the
          // nearest ancestor (or itself) painting an opaque fill. A
          // button or an active segment inside a pane has its own
          // solid background, so measuring it against the pane is wrong.
          const backdrop = (el) => {
            for (let n = el; n && n !== pane.parentElement; n = n.parentElement) {
              const c = parse(getComputedStyle(n).backgroundColor);
              if (c.length >= 3 && (c.length < 4 || c[3] >= 0.95)) {
                return n === pane ? eff : c.slice(0, 3);
              }
            }
            return eff;
          };
          pane.querySelectorAll('p, li, dd, span, h3, h4, a').forEach((el) => {
            if (!el.textContent.trim()) return;
            const fg = parse(getComputedStyle(el).color);
            const size = parseFloat(getComputedStyle(el).fontSize);
            const weight = Number(getComputedStyle(el).fontWeight) || 400;
            const large = size >= 24 || (size >= 18.66 && weight >= 700);
            const need = large ? 3 : 4.5;
            const r = ratio(fg.slice(0, 3), backdrop(el));
            if (r < need) {
              bad.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} ` +
                       `${r.toFixed(2)}:1 (needs ${need})`);
            }
          });
        });
        return [...new Set(bad)].slice(0, 8);
      });
      lowContrast.forEach((b) => fails.push(`CONTRAST ${path}: text on a translucent pane ${b}`));
    }

    /* ---- 7 · REVEAL FAILSAFE: nothing may stay invisible ---- */
    await page.waitForTimeout(2800);
    const hidden = await page.evaluate(
      () =>
        [...document.querySelectorAll('[data-reveal]')].filter(
          (el) => parseFloat(getComputedStyle(el).opacity) < 0.05
        ).length
    );
    if (hidden) fails.push(`REVEAL ${path} @${width}: ${hidden} element(s) still hidden after 2.8s`);

    /* ---- 8 · BAND-BOUNDARY SCREENSHOTS ---- */
    const seams = await page.evaluate(() =>
      [...document.querySelectorAll('[data-band]')].map((el, i) => ({
        i,
        band: el.dataset.band,
        top: Math.round(el.getBoundingClientRect().top + window.scrollY),
      }))
    );
    const slug = path === '/' ? 'home' : path.replace(/\//g, '') || 'home';
    for (const s of seams) {
      await page.evaluate((y) => window.scrollTo(0, Math.max(0, y - 150)), s.top);
      await page.waitForTimeout(180);
      await page.screenshot({
        path: `${OUT}/seam-${slug}-${width}-${String(s.i).padStart(2, '0')}-${s.band}.png`,
        clip: { x: 0, y: 0, width, height: 440 },
      });
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(150);
    await page.screenshot({ path: `${OUT}/top-${slug}-${width}.png` });
  }
  await ctx.close();
}

/* ---- 9 · NO-JS PASS: the page must stand up without JavaScript ---- */
{
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    javaScriptEnabled: false,
  });
  const page = await ctx.newPage();
  for (const path of PAGES) {
    await page.goto(BASE + path, { waitUntil: 'load' });
    const r = await page.evaluate(() => ({
      hidden: [...document.querySelectorAll('[data-reveal]')].filter(
        (el) => parseFloat(getComputedStyle(el).opacity) < 0.05
      ).length,
      form: document.querySelectorAll('form[action]').length,
      formNoAction: document.querySelectorAll('form:not([action])').length,
    }));
    if (r.hidden) fails.push(`NOJS ${path}: ${r.hidden} [data-reveal] element(s) invisible without JS`);
    if (r.formNoAction) fails.push(`NOJS ${path}: ${r.formNoAction} form(s) with no action, dead without JS`);
  }
  await ctx.close();
}

/* ---- 10 · REDUCED-MOTION PASS ---- */
{
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();
  for (const path of PAGES) {
    await page.goto(BASE + path, { waitUntil: 'load' });
    await page.waitForTimeout(400);
    const hidden = await page.evaluate(
      () =>
        [...document.querySelectorAll('[data-reveal]')].filter(
          (el) => parseFloat(getComputedStyle(el).opacity) < 0.05
        ).length
    );
    if (hidden) fails.push(`REDUCED ${path}: ${hidden} element(s) hidden under reduced motion`);
  }
  await ctx.close();
}

await browser.close();

if (fails.length) {
  console.log('\n' + '='.repeat(60) + '\nFAILURES (' + fails.length + ')\n' + '='.repeat(60));
  fails.forEach((f) => console.log('· ' + f));
  process.exit(1);
} else {
  console.log('\nALL CHECKS PASSED  ·  widths ' + WIDTHS.join(', ') + '  ·  pages ' + PAGES.join(', '));
}
