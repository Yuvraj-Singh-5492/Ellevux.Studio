/* ============================================================
   ELLEVUX · device-shots.mjs
   Capture each real project at DESKTOP and PHONE viewports, for
   the CSS-3D device stage in the hero. Not deployed.

   Run: node tools/device-shots.mjs
   ============================================================ */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, '..', 'ARC', 'package.json'));
const { chromium } = require('playwright-core');

const OUT = join(here, '..', 'assets', 'img', 'src');
mkdirSync(OUT, { recursive: true });

// The three projects the hero can show. Settle times differ because
// two of these are animated and one is a local WebGL-ish demo.
const PROJECTS = [
  { slug: 'mirror', url: 'https://mirror-solutions.com/', settle: 4500 },
  { slug: 'receptionist', url: 'https://ellevux.vercel.app/', settle: 4500 },
  { slug: 'buzzy', url: 'http://localhost:5510/demos/cafe/index.html', settle: 5000 },
];

// Desktop is captured at 1440x900 then shown inside a browser window
// frame. Phone is a true iPhone-ish viewport so the site's own mobile
// layout is what appears on the phone, which is the entire point.
const VIEWS = [
  { name: 'desk', width: 1440, height: 900, dsf: 2 },
  { name: 'phone', width: 390, height: 844, dsf: 3, mobile: true },
];

const browser = await chromium.launch({
  channel: 'msedge',
  args: ['--use-angle=swiftshader', '--use-gl=angle', '--ignore-gpu-blocklist'],
});

for (const p of PROJECTS) {
  for (const v of VIEWS) {
    const ctx = await browser.newContext({
      viewport: { width: v.width, height: v.height },
      deviceScaleFactor: v.dsf,
      isMobile: !!v.mobile,
      hasTouch: !!v.mobile,
      // A real mobile UA so responsive sites serve their phone layout.
      userAgent: v.mobile
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        : undefined,
    });
    const page = await ctx.newPage();
    try {
      await page.goto(p.url, { waitUntil: 'load', timeout: 45000 });
      await page.evaluate(() => document.fonts.ready).catch(() => {});
      // Nudge the scroll so lazy content and entrance animations fire,
      // then come back to the top for the shot.
      await page.evaluate(async () => {
        window.scrollTo(0, 400);
        await new Promise((r) => setTimeout(r, 400));
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(p.settle);
      const file = join(OUT, `screen-${p.slug}-${v.name}.png`);
      await page.screenshot({ path: file });
      console.log(`${p.slug} ${v.name.padEnd(5)} -> ${file}`);
    } catch (err) {
      console.error(`FAILED ${p.slug} ${v.name}: ${err.message}`);
    }
    await ctx.close();
  }
}

await browser.close();
