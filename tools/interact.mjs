import { createRequire } from 'node:module';
const require = createRequire(new URL('../ARC/package.json', import.meta.url));
const { chromium } = require('playwright-core');
const B = 'http://localhost:5510';
const fails = [];
const browser = await chromium.launch({ channel: 'msedge' });

/* ---- Mobile drawer ---- */
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(B + '/', { waitUntil: 'load' });
  await page.waitForTimeout(400);

  const toggle = page.locator('#nav-toggle');
  const drawer = page.locator('#nav-drawer');
  if (await drawer.evaluate((d) => d.getAttribute('data-open')) !== 'false') fails.push('drawer not closed at load');

  await toggle.click();
  await page.waitForTimeout(500);
  const open = await page.evaluate(() => ({
    data: document.getElementById('nav-drawer').dataset.open,
    expanded: document.getElementById('nav-toggle').getAttribute('aria-expanded'),
    locked: document.body.dataset.scrollLocked,
    mainInert: document.getElementById('main').hasAttribute('inert'),
    footerInert: document.getElementById('footer').hasAttribute('inert'),
    focusInDrawer: document.getElementById('nav-drawer').contains(document.activeElement),
  }));
  if (open.data !== 'true') fails.push('drawer did not open');
  if (open.expanded !== 'true') fails.push('aria-expanded not synced on open');
  if (open.locked !== 'true') fails.push('body scroll not locked');
  if (!open.mainInert) fails.push('main not inert while drawer open');
  if (!open.footerInert) fails.push('footer not inert while drawer open');
  if (!open.focusInDrawer) fails.push('focus not moved into drawer');

  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const closed = await page.evaluate(() => ({
    data: document.getElementById('nav-drawer').dataset.open,
    expanded: document.getElementById('nav-toggle').getAttribute('aria-expanded'),
    mainInert: document.getElementById('main').hasAttribute('inert'),
    focusOnToggle: document.activeElement === document.getElementById('nav-toggle'),
    locked: document.body.dataset.scrollLocked,
  }));
  if (closed.data !== 'false') fails.push('Escape did not close the drawer');
  if (closed.expanded !== 'false') fails.push('aria-expanded not reset on close');
  if (closed.mainInert) fails.push('main still inert after close');
  if (!closed.focusOnToggle) fails.push('focus not restored to the toggle');
  if (closed.locked !== 'false') fails.push('body still scroll-locked after close');
  await ctx.close();
}

/* ---- Pricing choice carries into the form ---- */
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(B + '/contact/?p=search', { waitUntil: 'load' });
  await page.waitForTimeout(400);
  const picked = await page.evaluate(() =>
    document.querySelector('input[name="need"]:checked')?.value);
  if (picked !== 'search') fails.push(`?p=search did not preselect (got ${picked})`);

  /* ---- Validation: empty required fields must not submit ---- */
  await page.evaluate(() => { document.getElementById('name').value = ''; });
  await page.locator('#contact-form button[type=submit]').click();
  await page.waitForTimeout(300);
  const v = await page.evaluate(() => ({
    invalid: document.getElementById('name').getAttribute('aria-invalid'),
    err: document.getElementById('name-error').textContent.trim().length > 0,
    status: document.getElementById('form-status').textContent.trim().length > 0,
    focused: document.activeElement === document.getElementById('name'),
    url: location.pathname,
  }));
  if (v.invalid !== 'true') fails.push('empty required field not marked aria-invalid');
  if (!v.err) fails.push('no visible error message on the invalid field');
  if (!v.status) fails.push('no status message announced');
  if (!v.focused) fails.push('focus not moved to the first invalid field');
  if (v.url !== '/contact/') fails.push('form navigated away despite being invalid');
  await ctx.close();
}

/* ---- The CSS-3D device stage ---- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await ctx.newPage();
  await page.goto(B + '/', { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  // The stage has its own band below the hero now, so it has to be
  // ON SCREEN before any of this: boundingBox() hands back viewport
  // coordinates, and driving the mouse to a box that is still below
  // the fold just moves the pointer over empty page.
  await page.evaluate(() => document.getElementById('stage-scene').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(700);

  const read = () =>
    page.evaluate(() => {
      const g = document.getElementById('stage-group');
      const cs = getComputedStyle(g);
      return {
        ry: parseFloat(cs.getPropertyValue('--ry')) || 0,
        rx: parseFloat(cs.getPropertyValue('--rx')) || 0,
        matrix: cs.transform,
      };
    });

  const untouched = await read();
  // The rest pose must be a real 3D rotation, not a flat element.
  if (!untouched.matrix || untouched.matrix === 'none' || !untouched.matrix.startsWith('matrix3d'))
    fails.push(`stage: not rendering in 3D at rest (transform=${untouched.matrix})`);
  // Before any pointer touches it, --ry is UNSET and the pose comes
  // from the CSS fallback. That is the no-JS contract, so assert it
  // rather than reading a property that does not exist yet.
  if (untouched.ry !== 0)
    fails.push(`stage: --ry was already written before interaction (${untouched.ry})`);

  const box = await page.locator('#stage-scene').boundingBox();
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  // Hover dead centre so the parallax offset is zero, which makes
  // the rest pose deterministic for every measurement below.
  await page.mouse.move(cx, cy);
  await page.waitForTimeout(450);
  const rest = await read();
  if (Math.abs(rest.ry - -21) > 0.5) fails.push(`stage: rest pose is ry=${rest.ry}, expected -21`);

  // Drag, and confirm the rotation follows the pointer.
  await page.mouse.down();
  await page.mouse.move(cx + 110, cy + 40, { steps: 12 });
  await page.waitForTimeout(120); // the stage writes on rAF, so let a frame land
  const dragged = await read();
  if (!(dragged.ry > rest.ry + 8)) fails.push(`stage: drag did not rotate Y (${rest.ry} -> ${dragged.ry})`);
  // Dragging DOWN tilts the top away, so rx decreases. Assert that it
  // moved, not which way.
  if (!(Math.abs(dragged.rx - rest.rx) > 2))
    fails.push(`stage: drag did not rotate X (${rest.rx} -> ${dragged.rx})`);

  // Rotation must stay clamped while still dragging: CSS 3D has no
  // backface, so a free spin would show the flat reverse of the window.
  await page.mouse.move(cx + 1200, cy, { steps: 20 });
  await page.waitForTimeout(120);
  const far = await read();
  if (far.ry > 6.5) fails.push(`stage: rotation not clamped, reached ry=${far.ry}`);
  await page.mouse.up();

  // Release springs it back to the composed rest pose.
  await page.mouse.move(cx, cy);
  await page.waitForTimeout(1500);
  const settled = await read();
  if (Math.abs(settled.ry - rest.ry) > 1.5)
    fails.push(`stage: did not spring back to rest (${settled.ry} vs ${rest.ry})`);

  // The stage opens on ONE project, and three separate things have to
  // agree on which: the checked radio, the .is-active screens (that is
  // the no-JS state), and which images are eager rather than lazy.
  // They are edited by hand and nothing else couples them, so a
  // default change silently leaves the stage blank or double-exposed.
  const opening = await page.evaluate(() => ({
    radio: (document.querySelector('input[name="stage-project"]:checked') || {}).value,
    active: [...new Set([...document.querySelectorAll('#stage-scene .shot.is-active')]
      .map((e) => e.dataset.project))],
    activeCount: document.querySelectorAll('#stage-scene .shot.is-active').length,
    eager: [...new Set([...document.querySelectorAll('#stage-scene .shot img')]
      .filter((i) => i.loading !== 'lazy')
      .map((i) => i.closest('.shot').dataset.project))],
  }));
  if (!opening.radio) fails.push('stage: no project radio is checked at load');
  if (opening.active.length !== 1)
    fails.push(`stage: ${opening.active.length} projects marked is-active at load (${opening.active.join(',')})`);
  if (opening.active[0] !== opening.radio)
    fails.push(`stage: opens on "${opening.active[0]}" but the checked radio is "${opening.radio}"`);
  if (opening.activeCount !== 3)
    fails.push(`stage: ${opening.activeCount} active screens, expected 3 (address bar, desktop, phone)`);
  if (opening.eager.join() !== opening.radio)
    fails.push(`stage: the eager images are "${opening.eager.join(',')}" but it opens on "${opening.radio}"`);

  // The segmented control swaps the screenshot on BOTH devices.
  await page.locator('#sp-buzzy').check({ force: true });
  await page.waitForTimeout(250);
  const active = await page.evaluate(() =>
    [...document.querySelectorAll('#stage-scene .shot.is-active')].map((e) => e.dataset.project));
  if (!active.length) fails.push('stage: no active screenshot after switching project');
  if (active.some((p) => p !== 'buzzy'))
    fails.push(`stage: project switch left a stale screen (${active.join(',')})`);

  await ctx.close();
}

/* ---- The pricing slabs (on /pricing/) ---- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await ctx.newPage();
  await page.goto(B + '/pricing/', { waitUntil: 'load' });
  await page.waitForTimeout(400);

  const shown = () =>
    page.evaluate(() =>
      [...document.querySelectorAll('#pricing-tool .price')]
        .filter((e) => e.offsetParent !== null)
        .map((e) => e.textContent.trim()));

  // All three prices must be visible at once: comparison is the job
  // of this page, and hunting for them was the problem we fixed.
  let p = await shown();
  if (p.length !== 3) fails.push(`pricing: ${p.length} prices visible, expected 3`);
  if (JSON.stringify(p) !== JSON.stringify(['$2,000', '$4,500', '$9,000']))
    fails.push(`pricing: base prices are ${p.join(', ')}`);

  const cards = await page.evaluate(() => document.querySelectorAll('.plan').length);
  if (cards !== 3) fails.push(`pricing: ${cards} plan slabs, expected 3`);

  // The audit toggle updates every price at once, using approved
  // figures only. The top package already includes it, so it holds.
  await page.locator('.pricing-tool__addon').click();
  await page.waitForTimeout(200);
  if (!(await page.evaluate(() => document.getElementById('add-audit').checked)))
    fails.push('pricing: tapping the switch label did not toggle the audit');
  p = await shown();
  if (JSON.stringify(p) !== JSON.stringify(['$2,600', '$5,100', '$9,000']))
    fails.push(`pricing: with the audit on, prices are ${p.join(', ')}`);

  // Exactly one plan may be recommended.
  const picked = await page.evaluate(() => document.querySelectorAll('.plan--pick').length);
  if (picked !== 1) fails.push(`pricing: ${picked} highlighted plans, expected 1`);

  await ctx.close();
}

/* ---- The sticky action bar (phones) ---- */
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(B + '/pricing/', { waitUntil: 'load' });
  await page.waitForTimeout(600);

  const state = () =>
    page.evaluate(() => {
      const bar = document.getElementById('actionbar');
      const cs = getComputedStyle(bar);
      return {
        show: bar.dataset.show,
        visibility: cs.visibility,
        amount: document.getElementById('actionbar-amount').textContent.trim(),
        acid: cs.backgroundColor,
        btnBg: getComputedStyle(bar.querySelector('.btn')).backgroundColor,
      };
    });

  const atTop = await state();
  if (atTop.show !== 'false') fails.push('actionbar: showing while the hero is still on screen');
  if (atTop.visibility !== 'hidden')
    fails.push('actionbar: hidden bar is still visible, so it stays in the tab order');

  await page.evaluate(() => window.scrollTo(0, 2200));
  await page.waitForTimeout(700);
  const scrolled = await state();
  if (scrolled.show !== 'true') fails.push('actionbar: did not appear after the hero scrolled away');
  if (scrolled.visibility !== 'visible') fails.push('actionbar: shown but still visibility:hidden');
  // It must never wear the signal colour (see the one-acid rule).
  if (scrolled.btnBg === 'rgb(200, 250, 60)')
    fails.push('actionbar: button is acid, which breaks the one-acid-per-viewport rule');

  // The bar says "from", so it must follow the LOWEST price on screen.
  if (scrolled.amount !== '$2,000')
    fails.push(`actionbar: starting price is ${scrolled.amount}, expected $2,000`);
  await page.locator('.pricing-tool__addon').click();
  await page.waitForTimeout(300);
  const mirrored = await state();
  if (mirrored.amount !== '$2,600')
    fails.push(`actionbar: price did not follow the audit toggle (${mirrored.amount})`);

  await ctx.close();
}

await browser.close();
console.log(
  fails.length
    ? 'FAILURES:\n· ' + fails.join('\n· ')
    : 'DRAWER + FORM + STAGE + PRICING + ACTIONBAR: all interaction checks passed'
);
process.exit(fails.length ? 1 : 0);
