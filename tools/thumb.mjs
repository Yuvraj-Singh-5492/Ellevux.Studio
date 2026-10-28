/* ============================================================
   ELLEVUX · thumb.mjs
   Capture a 1280x720 (16:9) hero thumbnail of a page, for the
   work tiles. Not deployed: exclude tools/ from the upload set.

   Usage: node tools/thumb.mjs <url> <out-name> [settle-ms] [scrollFraction]

   scrollFraction matters for the scroll-built 3D heroes: at 0 the
   house has not been raised yet and the shot is an empty gradient.
   ============================================================ */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, '..', 'ARC', 'package.json'));
const { chromium } = require('playwright-core');

const [url, name, settle = '3500', scrollFraction = '0'] = process.argv.slice(2);
if (!url || !name) {
  console.error('usage: node tools/thumb.mjs <url> <out-name> [settle-ms]');
  process.exit(1);
}

const browser = await chromium.launch({
  channel: 'msedge',
  // These demos are WebGL. SwiftShader renders them headlessly.
  args: ['--use-angle=swiftshader', '--use-gl=angle', '--ignore-gpu-blocklist'],
});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
// Drive the scroll explicitly rather than hoping the screenshot lands
// after the animation: a scroll-scrubbed hero shows nothing at y=0.
const frac = Number(scrollFraction);
if (frac > 0) {
  await page.evaluate(async (f) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const target = max * f;
    // Step it, so ScrollTrigger scrubs through rather than jumping.
    for (let y = 0; y <= target; y += Math.max(40, target / 40)) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(r));
    }
    window.scrollTo(0, target);
  }, frac);
}
// WebGL heroes need real time to settle, and a screenshot taken at
// load lands on a blank canvas.
await page.waitForTimeout(Number(settle));

const out = join(here, '..', 'assets', 'img', `${name}.png`);
await page.screenshot({ path: out });
console.log(out);
await browser.close();
