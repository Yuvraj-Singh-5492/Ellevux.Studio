/* ============================================================
   ELLEVUX · shot.mjs
   Screenshot one element, for judging a component on its own.
   Not deployed: exclude tools/ from the upload set.

   Usage:
     node tools/shot.mjs <path> <selector> <out> [width]
   Example:
     node tools/shot.mjs / .aeo aeo 1280
   ============================================================ */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, '..', 'ARC', 'package.json'));
const { chromium } = require('playwright-core');

const [path = '/', selector = 'body', name = 'shot', width = '1280'] = process.argv.slice(2);
const BASE = process.env.BASE || 'http://localhost:5510';
const OUT = join(here, '..', '.verify');
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  channel: 'msedge',
  // SwiftShader so WebGL pages (the lab's particle hero) actually render.
  args: ['--use-angle=swiftshader', '--use-gl=angle', '--ignore-gpu-blocklist'],
});
const ctx = await browser.newContext({
  viewport: { width: Number(width), height: 1000 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();
await page.goto(BASE + path, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);

// Scroll it into view so [data-reveal] lands, then let motion settle.
await page.evaluate((s) => {
  const el = document.querySelector(s);
  if (el) el.scrollIntoView({ block: 'center', behavior: 'instant' });
}, selector);
await page.waitForTimeout(1200);

const file = join(OUT, `${name}-${width}.png`);
if (selector === 'viewport') {
  // The particle canvas is a page-level fixed layer behind the
  // content, so an element screenshot of the section would miss it.
  await page.screenshot({ path: file });
} else {
  const el = await page.$(selector);
  if (!el) {
    console.error(`No element matched ${selector} on ${path}`);
    process.exit(1);
  }
  await el.screenshot({ path: file });
}
console.log(file);
await browser.close();
