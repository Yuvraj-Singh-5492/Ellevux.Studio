/* ============================================================
   ELLEVUX · three-hero.js  (ES module — imports "three" via the
   import map declared in index.html)
   ------------------------------------------------------------
   The hero headline ("INDEPENDENT WEB DEVELOPER") is rendered as a
   HUGE CLUSTER OF TINY PARTICLES on <canvas id="hero-canvas">,
   sampled from the REAL <h1> so the particle text matches the
   headline and stays responsive. The hero BOOTS STRAIGHT as
   particles (the crisp DOM text is swapped out the instant the
   canvas is live).

   SCROLL MORPH: while #hero is pinned, scrolling scrubs the
   particles from "INDEPENDENT WEB DEVELOPER" → a scattered swarm →
   "SELECTED WORKS", then fades them out as the work section arrives.

   GPU-DRIVEN: the morph blend, the mid-morph explosion, the idle
   wobble and the cursor repel ALL run in the vertex shader. The CPU
   only sets a handful of uniforms per frame (progress, time, cursor)
   — there is NO per-particle JS loop and NO per-frame buffer
   re-upload, so it stays at 60fps with tens of thousands of points.
   Particle attributes (the two layouts + scatter + colour) upload
   once at build and only change on resample (resize / fonts).

   ACCESSIBILITY / FAIL-OPEN
     • The real <h1> stays in the DOM, only HIDDEN (opacity:0 — still in
       the a11y tree, still reserves layout) via html.hero-particled. An
       inline <head> script adds that class PRE-PAINT (only if WebGL +
       motion are OK) so the hero boots straight as particles with no
       crisp-text flash; revealHeadline() removes it on ANY failure and a
       2.5s failsafe removes it if the script never confirms ⇒ fail open.
     • Decorative canvas is aria-hidden (owned by index.html).
     • prefers-reduced-motion → the headline is NOT taken over; the
       crisp <h1> is left untouched and no loop / morph runs.

   COORDINATE SYSTEM
     • OrthographicCamera mapped 1:1 to canvas CSS pixels (x 0→W
       left→right, y 0→H top→bottom) — exact DOM alignment.

   PERFORMANCE / ROBUSTNESS CONTRACT
     • setPixelRatio(min(devicePixelRatio, 2))
     • IntersectionObserver → pause the loop when offscreen
     • pause on document.hidden (visibilitychange)
     • dispose geometry / material / renderer / ScrollTrigger
     • webglcontextlost → fail open (restore the crisp headline, drop pin)
     • transparent clear (the pure-black page shows through)
   ============================================================ */

import * as THREE from 'three';

(function () {
  'use strict';

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const heroSection = document.getElementById('hero');
  const titleEl = document.getElementById('hero-title');
  if (!heroSection || !titleEl) return;
  const lineEls = titleEl.querySelectorAll('.hero__line');
  if (!lineEls.length) return;
  const workTitleEl = document.getElementById('work-title'); // the morph TARGET heading

  function webglAvailable() {
    try {
      const test = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (test.getContext('webgl') || test.getContext('experimental-webgl'))
      );
    } catch (e) { return false; }
  }
  if (!webglAvailable()) return;

  const prefersReducedMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // Real mouse only (never touch): gate the cursor-repel so touch devices never get
  // the "blackhole" effect. Particles run on ALL screen sizes, including phones.
  const finePointer =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  let renderer, scene, camera, mesh, geometry, material;
  let posA;                 // Float32Array (x,y,z) — layout A attribute (the 'position')
  let targets;              // Float32Array (x,y) — layout A working buffer (headline)
  let targetsB;             // Float32Array (x,y) — layout B attribute (Selected Works)
  let scatterVecs;          // Float32Array (x,y) — per-particle explosion attribute
  let heroDoc = null;       // cached document-space top-left of the hero <h1>
  let workDoc = null;       // cached document-space top-left of the #work <h2>
  let count = 0;
  let raf = 0;
  let running = false;
  let visibleInView = true;
  let disposed = false;
  let booted = false;
  let bootRaf = 0;
  let morphReady = false;
  let morphP = 0;
  let morphST = null;

  const IS_SMALL = (typeof window !== 'undefined' && window.innerWidth && window.innerWidth < 720);
  // Mobile: MANY more particles so the small glyphs read SOLID (was 11000 → sparse/scattered),
  // smaller dots that tile thin strokes, and almost no idle wobble/jitter so the text sits crisp.
  const PARTICLE_COUNT = IS_SMALL ? 22000 : 24000;
  const PARTICLE_PX = IS_SMALL ? 1.7 : 2.4;
  const WOBBLE_AMP = IS_SMALL ? 0.5 : 1.7;
  const JITTER = IS_SMALL ? 0.45 : 1.4;   // placement spread around each sampled glyph pixel
  const CURSOR_RADIUS = 110;
  const CURSOR_FORCE = 46;
  const CURSOR_EASE = 0.08;

  let cursorActive = 0, cursorTarget = 0;
  let cursorX = -1e9, cursorY = -1e9;
  let pointerNX = 0, pointerNY = 0, parX = 0, parY = 0;

  const now = (typeof performance !== 'undefined' && performance.now)
    ? function () { return performance.now(); }
    : function () { return Date.now(); };
  let elapsedSec = 0;
  let lastTick = 0;

  /* ---- GPU shaders: the whole animation lives here (CPU just feeds uniforms) ---- */
  const VERT = [
    'attribute vec2 aPosB;',
    'attribute vec2 aScatter;',
    'attribute vec3 aColor;',
    'attribute float aSeed;',
    'uniform float uProgress;',
    'uniform float uTime;',
    'uniform float uSize;',
    'uniform float uWobble;',
    'uniform vec2 uCursor;',
    'uniform float uCursorActive;',
    'uniform float uCursorRadius;',
    'uniform float uCursorForce;',
    'uniform vec2 uAOffset;',
    'uniform vec2 uBOffset;',
    'varying vec3 vColor;',
    'void main() {',
    '  float p = clamp(uProgress, 0.0, 1.0);',
    '  float pe = p * p * (3.0 - 2.0 * p);',            // smoothstep blend
    '  vec2 base = mix(position.xy + uAOffset, aPosB + uBOffset, pe);', // both layouts: glyph-local + live element offset
    '  base += aScatter * sin(p * 3.14159265);',        // explosion (0 at ends, max mid)
    '  float wob = max(0.0, 1.0 - p * 3.0) * uWobble;', // idle shimmer, off by p~0.33
    '  base.x += sin(uTime * 0.9 + aSeed * 6.2831) * wob;',
    '  base.y += cos(uTime * 0.8 + aSeed * 5.1731) * wob;',
    '  float cs = uCursorActive * (1.0 - p);',          // cursor repel fades during morph
    '  if (cs > 0.001) {',
    '    vec2 d = base - uCursor;',
    '    float dist = length(d);',
    '    if (dist < uCursorRadius && dist > 0.0001) {',
    '      float f = 1.0 - dist / uCursorRadius;',
    '      base += (d / dist) * (cs * f * f * uCursorForce);',
    '    }',
    '  }',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(base, 0.0, 1.0);',
    '  gl_PointSize = uSize;',
    '  vColor = aColor;',
    '}',
  ].join('\n');

  const FRAG = [
    'uniform float uOpacity;',
    'varying vec3 vColor;',
    'void main() {',
    '  vec2 uv = gl_PointCoord - 0.5;',
    '  float a = smoothstep(0.5, 0.0, length(uv));',    // soft round dot
    '  if (a <= 0.0) discard;',
    '  gl_FragColor = vec4(vColor, a * uOpacity);',      // additive: rgb * (a*opacity)
    '}',
  ].join('\n');

  // Document-space top-left of an element (layout position via the offsetParent
  // chain — ignores transforms, so a transient reveal transform on #work can't
  // yank the particle target; computed once per (re)sample, not per frame).
  function docPos(el) {
    let x = 0, y = 0, n = el;
    while (n) { x += n.offsetLeft || 0; y += n.offsetTop || 0; n = n.offsetParent; }
    // The offsetParent chain is layout-only (ignores transforms); add the element's
    // OWN transform so e.g. .work__title's permanent translateY(-2rem) lift is
    // accounted for (the particles must land on the RENDERED position, not flow).
    try {
      const t = window.getComputedStyle(el).transform;
      const m = (t && t !== 'none') ? t.match(/matrix(3d)?\(([^)]+)\)/) : null;
      if (m) {
        const p = m[2].split(',').map(parseFloat);
        if (m[1]) { x += p[12] || 0; y += p[13] || 0; } // matrix3d
        else { x += p[4] || 0; y += p[5] || 0; }        // matrix
      }
    } catch (e) {}
    return { x: x, y: y };
  }

  // Greedy word-wrap into visual lines no wider than maxW (canvas-measured).
  function wrapWords(ctx, text, maxW) {
    const words = String(text).split(/\s+/).filter(Boolean);
    if (!words.length) return [text];
    const lines = [];
    let cur = '';
    for (let i = 0; i < words.length; i++) {
      const test = cur ? cur + ' ' + words[i] : words[i];
      if (!cur || ctx.measureText(test).width <= maxW) cur = test;
      else { lines.push(cur); cur = words[i]; }
    }
    if (cur) lines.push(cur);
    return lines;
  }

  /* Sample the live <h1> lines into 2D points (canvas-pixel space). */
  function sampleHeadline() {
    const out = [];
    const off = document.createElement('canvas');
    const octx = off.getContext('2d', { willReadFrequently: true });
    if (!octx) return out;
    // Sample GLYPH-LOCAL (relative to the <h1> box); the shader adds the live
    // uAOffset (the headline's viewport position) so A is correct at any scroll.
    const titleRect = titleEl.getBoundingClientRect();

    lineEls.forEach(function (line) {
      const rect = line.getBoundingClientRect();
      const w = Math.max(1, Math.ceil(rect.width));
      const h = Math.max(1, Math.ceil(rect.height));
      if (rect.width < 2 || rect.height < 2) return;

      const cs = window.getComputedStyle(line);
      const fontSize = parseFloat(cs.fontSize) || 80;
      const weight = cs.fontWeight || '900';
      const family = cs.fontFamily || 'Inter, sans-serif';
      const transform = cs.textTransform;
      let text = (line.textContent || '').replace(/\s+/g, ' ').trim();
      if (transform === 'uppercase') text = text.toUpperCase();
      else if (transform === 'lowercase') text = text.toLowerCase();

      off.width = w;
      off.height = h;
      octx.clearRect(0, 0, w, h);
      octx.fillStyle = '#fff';
      octx.textAlign = 'left';
      octx.textBaseline = 'middle';
      octx.font = weight + ' ' + fontSize + 'px ' + family;
      try {
        const ls = parseFloat(cs.letterSpacing);
        if (isFinite(ls)) octx.letterSpacing = ls + 'px';
      } catch (e) { /* unsupported — fine */ }
      let lineBoxH = parseFloat(cs.lineHeight);
      if (!isFinite(lineBoxH) || lineBoxH < fontSize * 0.5) lineBoxH = fontSize * 1.15;
      const visualLines = Math.max(1, Math.round(h / lineBoxH));
      const runs = visualLines > 1 ? wrapWords(octx, text, w) : [text];
      const slot = h / runs.length;
      for (let li = 0; li < runs.length; li++) octx.fillText(runs[li], 0, slot * (li + 0.5));

      let data;
      try { data = octx.getImageData(0, 0, w, h).data; }
      catch (e) { return; }
      const offX = rect.left - titleRect.left;
      const offY = rect.top - titleRect.top;
      for (let y = 0; y < h; y++) {
        const row = y * w * 4;
        for (let x = 0; x < w; x++) {
          if (data[row + x * 4 + 3] > 110) out.push(offX + x, offY + y);
        }
      }
    });
    return out;
  }

  /* Sample the real #work heading ("Selected Works") into glyph-LOCAL points
     (relative to its own box top-left). At render the shader adds uBOffset = the
     heading's LIVE on-screen position, so the particles track it as it scrolls in
     and land exactly on it. Returns [] if the heading is missing / not yet laid out. */
  function sampleWorkTitle() {
    if (!workTitleEl) return [];
    const rect = workTitleEl.getBoundingClientRect();
    const w = Math.max(1, Math.ceil(rect.width));
    const h = Math.max(1, Math.ceil(rect.height));
    if (rect.width < 2 || rect.height < 2) return [];
    const off = document.createElement('canvas');
    const octx = off.getContext('2d', { willReadFrequently: true });
    if (!octx) return [];
    const cs = window.getComputedStyle(workTitleEl);
    const fontSize = parseFloat(cs.fontSize) || 80;
    const weight = cs.fontWeight || '900';
    const family = cs.fontFamily || 'Inter, sans-serif';
    let text = (workTitleEl.textContent || 'Selected Works').replace(/\s+/g, ' ').trim();
    const tf = cs.textTransform;
    if (tf === 'uppercase') text = text.toUpperCase();
    else if (tf === 'lowercase') text = text.toLowerCase();
    const align = cs.textAlign === 'center' ? 'center' : (cs.textAlign === 'right' ? 'right' : 'left');
    off.width = w; off.height = h;
    octx.fillStyle = '#fff';
    octx.textAlign = align;
    octx.textBaseline = 'middle';
    octx.font = weight + ' ' + fontSize + 'px ' + family;
    try { const ls = parseFloat(cs.letterSpacing); if (isFinite(ls)) octx.letterSpacing = ls + 'px'; } catch (e) {}
    let lineBoxH = parseFloat(cs.lineHeight);
    if (!isFinite(lineBoxH) || lineBoxH < fontSize * 0.5) lineBoxH = fontSize * 1.15;
    const visualLines = Math.max(1, Math.round(h / lineBoxH));
    const runs = visualLines > 1 ? wrapWords(octx, text, w) : [text];
    // The particle copy is ALL one face (the DOM "Works" is a narrower serif), so on
    // phones it can be wider than the heading box and the edge glyphs get clipped by
    // the offscreen canvas. Shrink font + tracking to fit (never grow): desktop,
    // where it already fits, is untouched.
    let fitSize = fontSize;
    for (let pass = 0; pass < 2; pass++) {
      let widest = 0;
      for (let li = 0; li < runs.length; li++) widest = Math.max(widest, octx.measureText(runs[li]).width);
      if (widest <= w) break;
      const k = (w / widest) * 0.98;
      fitSize *= k;
      octx.font = weight + ' ' + fitSize + 'px ' + family;
      try { const ls2 = parseFloat(octx.letterSpacing); if (isFinite(ls2)) octx.letterSpacing = (ls2 * k) + 'px'; } catch (e) {}
    }
    const x = align === 'center' ? w / 2 : (align === 'right' ? w : 0);
    const slot = h / runs.length;
    for (let li = 0; li < runs.length; li++) octx.fillText(runs[li], x, slot * (li + 0.5));

    let data;
    try { data = octx.getImageData(0, 0, w, h).data; }
    catch (e) { return []; }
    const out = [];
    for (let y = 0; y < h; y++) {
      const row = y * w * 4;
      for (let xx = 0; xx < w; xx++) {
        if (data[row + xx * 4 + 3] > 90) out.push(xx, y);
      }
    }
    return out;
  }

  function shufflePairs(flat) {
    for (let i = flat.length / 2 - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const ax = flat[i * 2], ay = flat[i * 2 + 1];
      flat[i * 2] = flat[j * 2]; flat[i * 2 + 1] = flat[j * 2 + 1];
      flat[j * 2] = ax; flat[j * 2 + 1] = ay;
    }
  }

  function fillTargets(buf, flat) {
    const lit = flat.length / 2;
    for (let i = 0; i < count; i++) {
      const s = (i % lit) * 2;
      buf[i * 2] = flat[s] + (Math.random() - 0.5) * JITTER;
      buf[i * 2 + 1] = flat[s + 1] + (Math.random() - 0.5) * JITTER;
    }
  }

  /* Recompute layout A (headline), layout B ("Selected Works") + scatter vectors
     into the working buffers. Returns false if the headline gave no usable pixels. */
  function computeTargets() {
    const W = canvas.clientWidth || 1, H = canvas.clientHeight || 1;
    const flatA = sampleHeadline();
    if (flatA.length / 2 < 50) return false;
    shufflePairs(flatA);
    count = PARTICLE_COUNT;
    if (!targets || targets.length !== count * 2) targets = new Float32Array(count * 2);
    fillTargets(targets, flatA);

    // Layout B = the REAL #work heading, sampled glyph-local (the shader adds its
    // live on-screen offset each frame so the particles land right on it).
    const flatB = sampleWorkTitle();
    if (!targetsB || targetsB.length !== count * 2) targetsB = new Float32Array(count * 2);
    if (flatB.length / 2 >= 50) {
      shufflePairs(flatB);
      fillTargets(targetsB, flatB);
      morphReady = true;
    } else {
      morphReady = false;
    }

    if (!scatterVecs || scatterVecs.length !== count * 2) scatterVecs = new Float32Array(count * 2);
    const sMag = Math.min(W, H) * 0.20;
    const fcx = W * 0.5, fcy = H * 0.5;
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const rad = (0.3 + Math.random() * 0.7) * sMag;
      const ox = targets[i * 2] - fcx, oy = targets[i * 2 + 1] - fcy;
      const ol = Math.sqrt(ox * ox + oy * oy) || 1;
      scatterVecs[i * 2] = Math.cos(ang) * rad * 0.5 + (ox / ol) * rad * 0.8;
      scatterVecs[i * 2 + 1] = Math.sin(ang) * rad * 0.5 + (oy / ol) * rad * 0.8;
    }

    // Cache the headings' document positions so update() can place both layouts
    // from (docPos - scroll) every frame — no per-frame layout read.
    heroDoc = docPos(titleEl);
    workDoc = workTitleEl ? docPos(workTitleEl) : null;
    return true;
  }

  // Copy the working buffers into the live GPU attributes + flag for re-upload
  // (only ever called at build and on resample — never per frame).
  function applyGeometry() {
    if (!geometry) return;
    const arr = geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      arr[i * 3] = targets[i * 2];
      arr[i * 3 + 1] = targets[i * 2 + 1];
      arr[i * 3 + 2] = 0;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.aPosB.needsUpdate = true;
    geometry.attributes.aScatter.needsUpdate = true;
  }

  function build() {
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance',
      });
    } catch (e) { return false; }
    if (!renderer || !renderer.getContext()) return false;
    canvas.addEventListener('webglcontextlost', onContextLost, false);
    canvas.addEventListener('webglcontextrestored', onContextRestored, false);

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    if ('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;

    const W = canvas.clientWidth, H = canvas.clientHeight;
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(0, W, 0, H, 0.1, 1000);
    camera.position.z = 10;
    camera.updateMatrixWorld();

    try { if (!computeTargets()) return false; }
    catch (e) { return false; }

    try {
      posA = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const seeds = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        posA[i * 3] = targets[i * 2];
        posA[i * 3 + 1] = targets[i * 2 + 1];
        posA[i * 3 + 2] = 0;
        let v = 0.82 + Math.random() * 0.18;
        if (Math.random() < 0.10) v = 0.5 + Math.random() * 0.25;
        colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = v;
        seeds[i] = Math.random();
      }
      geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(posA, 3));
      geometry.setAttribute('aPosB', new THREE.BufferAttribute(targetsB, 2));
      geometry.setAttribute('aScatter', new THREE.BufferAttribute(scatterVecs, 2));
      geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    } catch (e) { return false; }

    const dpr = renderer.getPixelRatio();
    try {
      material = new THREE.ShaderMaterial({
        uniforms: {
          uProgress: { value: 0 },
          uTime: { value: 0 },
          uSize: { value: PARTICLE_PX * dpr },
          uWobble: { value: WOBBLE_AMP },
          uOpacity: { value: 1 },
          uCursor: { value: new THREE.Vector2(-1e9, -1e9) },
          uCursorActive: { value: 0 },
          uCursorRadius: { value: CURSOR_RADIUS },
          uCursorForce: { value: CURSOR_FORCE },
          uAOffset: { value: new THREE.Vector2(0, 0) },
          uBOffset: { value: new THREE.Vector2(0, 0) },
        },
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      });
    } catch (e) { return false; }

    mesh = new THREE.Points(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);

    sizeToBox();
    booted = true;
    return true;
  }

  // Did the ShaderMaterial's program actually LINK? Three compiles GLSL lazily
  // on the first render and only console.errors on failure (it never throws), so
  // without this a driver that choked on the shader would leave the <h1> hidden
  // over a blank canvas. Returns false ONLY on a positively-failed link, so the
  // common path (or an unreadable internal) is never wrongly failed open.
  function programLinked() {
    try {
      const props = renderer.properties && renderer.properties.get(material);
      const cp = props && props.currentProgram;
      const glProg = cp && cp.program;
      if (!glProg) return true;
      const gl = renderer.getContext();
      return gl.getProgramParameter(glProg, gl.LINK_STATUS) !== false;
    } catch (e) { return true; }
  }

  /* Per-frame: feed uniforms only — NO per-particle JS, NO buffer re-upload. */
  function update(t, dt) {
    if (!material) return;
    const u = material.uniforms;
    let p = morphReady ? morphP : 0;
    if (p < 0) p = 0; else if (p > 1) p = 1;
    u.uProgress.value = p;
    u.uTime.value = t;
    // NO fade: the particles PERSIST as the "Selected Works" heading — they ARE
    // it (the real DOM <h2> is hidden via html.work-particled). uBOffset tracks the
    // heading's position, so the particle wordmark scrolls with it (never vanishes).
    u.uOpacity.value = 1;
    if (mesh) mesh.visible = true;

    const dscale = dt > 0 ? dt * 60 : 1;
    cursorActive += (cursorTarget - cursorActive) * (1 - Math.pow(1 - CURSOR_EASE, dscale));
    u.uCursorActive.value = cursorActive;
    // Faint whole-field parallax (a hint of dimension; never a swing). Eased to
    // zero as the morph lands so the particles register exactly on the #work heading.
    const par = 1 - Math.pow(1 - 0.04, dscale);
    const pf = 9 * (1 - p);
    parX += (pointerNX * pf - parX) * par;
    parY += (pointerNY * pf - parY) * par;
    if (mesh) { mesh.position.x = parX; mesh.position.y = parY; }
    // Cursor in particle-local space (cancel the parallax translate).
    u.uCursor.value.set(cursorX - parX, cursorY - parY);
  }

  function sizeToBox() {
    if (!renderer || !camera) return false;
    const w = canvas.clientWidth || (canvas.parentElement && canvas.parentElement.clientWidth) || 0;
    const h = canvas.clientHeight || (canvas.parentElement && canvas.parentElement.clientHeight) || 0;
    if (w === 0 || h === 0) return false;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.left = 0; camera.right = w; camera.top = 0; camera.bottom = h;
    camera.updateProjectionMatrix();
    if (material) material.uniforms.uSize.value = PARTICLE_PX * renderer.getPixelRatio();
    return true;
  }

  function onPointerMove(e) {
    if (!finePointer) { cursorTarget = 0; return; }   // touch devices: no cursor repel / parallax (the "blackhole")
    if (!visibleInView || document.hidden) { cursorTarget = 0; return; }
    const rect = canvas.getBoundingClientRect();
    cursorX = e.clientX - rect.left;
    cursorY = e.clientY - rect.top;
    const inside = cursorX >= 0 && cursorX <= rect.width && cursorY >= 0 && cursorY <= rect.height;
    cursorTarget = inside ? 1 : 0;
    pointerNX = (e.clientX / window.innerWidth) * 2 - 1;
    pointerNY = (e.clientY / window.innerHeight) * 2 - 1;
  }
  function onWindowBlur() { cursorTarget = 0; }
  function onPointerOut(e) { if (!e.relatedTarget) cursorTarget = 0; }

  // Reveal BOTH crisp DOM headings (fail open) + cancel the reveal failsafe.
  function revealHeadline() {
    try {
      const de = document.documentElement;
      de.classList.remove('hero-particled');
      de.classList.remove('work-particled');
    } catch (e) {}
    if (window.__heroFailsafe) { window.clearTimeout(window.__heroFailsafe); window.__heroFailsafe = 0; }
  }

  function onContextLost(e) {
    e.preventDefault();
    revealHeadline();
    if (morphST) { try { morphST.kill(); } catch (e2) {} morphST = null; morphP = 0; }
    if (window.ScrollTrigger) { try { window.ScrollTrigger.refresh(); } catch (e2) {} }
    stop();
  }
  function onContextRestored() {
    if (disposed || !booted) return;
    if (geometry) {
      Object.keys(geometry.attributes).forEach(function (k) { geometry.attributes[k].needsUpdate = true; });
    }
    if (material) material.needsUpdate = true;
    sizeToBox();
    start();
    initMorphScroll();
  }

  function reconcileMorph() {
    if (!morphReady) {
      // No morph possible → tear down any pin and SHOW the real #work heading.
      if (morphST) {
        try { morphST.kill(); } catch (e) {} morphST = null; morphP = 0;
        if (window.ScrollTrigger) { try { window.ScrollTrigger.refresh(); } catch (e) {} }
      }
      document.documentElement.classList.remove('work-particled');
    } else if (!morphST) {
      initMorphScroll(); // morph can run → create the scrub + keep #work hidden (particles are it)
    }
  }

  // Place both particle layouts at their elements' LIVE viewport positions
  // (cached document position minus current scroll). Cheap — no layout read —
  // and run on EVERY frame (static + animated) so the first frame is correct too.
  function setOffsets() {
    if (!material) return;
    const sx = window.pageXOffset || 0, sy = window.pageYOffset || 0;
    if (heroDoc) material.uniforms.uAOffset.value.set(heroDoc.x - sx, heroDoc.y - sy);
    if (workDoc) material.uniforms.uBOffset.value.set(workDoc.x - sx, workDoc.y - sy);
  }

  function renderFrame(elapsed, animate, dt) {
    if (disposed || !renderer || !mesh) return;
    setOffsets();
    if (animate) update(elapsed, dt);
    renderer.render(scene, camera);
  }

  function loop() {
    if (!running || disposed) return;
    const t = now();
    let dt = (t - lastTick) / 1000;
    if (!isFinite(dt) || dt < 0) dt = 0;
    if (dt > 0.05) dt = 0.05;
    elapsedSec += dt;
    lastTick = t;
    renderFrame(elapsedSec, true, dt);
    raf = window.requestAnimationFrame(loop);
  }

  function start() {
    if (running || disposed || !booted) return;
    if (!visibleInView || document.hidden) return;
    running = true;
    lastTick = now();
    // Hand the hero headline over to the particles (and, once the morph can run,
    // the #work heading too) — only now that the canvas is live, so a dead script
    // never hides the text. The particles ARE both headings.
    // Canvas is live + the shader linked → KEEP the hero headline hidden (the
    // inline <head> script hid it pre-paint so there's no crisp flash) and cancel
    // the reveal failsafe. The #work heading is hidden by initMorphScroll() ONLY
    // once the morph driver exists — so a missing GSAP can't leave #work headless.
    document.documentElement.classList.add('hero-particled');
    if (window.__heroFailsafe) { window.clearTimeout(window.__heroFailsafe); window.__heroFailsafe = 0; }
    raf = window.requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
  }

  /* Pin #hero and scrub the headline → "Selected Works" morph (GSAP global). */
  function initMorphScroll() {
    if (morphST) return;
    // No layout B sampled (work-title not measurable) → we can't form particles
    // there, so the real #work heading MUST stay visible (fail open).
    if (!morphReady) { document.documentElement.classList.remove('work-particled'); return; }
    const ST = window.ScrollTrigger;
    // No GSAP/ScrollTrigger (e.g. CDN blocked): we cannot DRIVE the morph, so the
    // real #work heading MUST become visible — never hide it without a driver.
    if (!ST || !window.gsap) { document.documentElement.classList.remove('work-particled'); return; }
    try {
      try { window.gsap.registerPlugin(ST); } catch (e) {}
      // Ignore the mobile address-bar show/hide (a height-only viewport change) so the
      // scrubbed morph never jumps or sticks on touch devices that run the hero.
      try { ST.config({ ignoreMobileResize: true }); } catch (e) {}
      // No pin: the page scrolls normally and the headline particles fly DOWN
      // the page, reassembling onto the real #work heading as it reaches its rest.
      morphST = ST.create({
        trigger: heroSection,
        start: 'center top',   // HOLD the headline through the first ~half, then break
        endTrigger: workTitleEl,
        end: 'top 28%',
        scrub: 0.6,
        onUpdate: function (self) { morphP = self.progress; },
        onRefresh: function (self) { morphP = self.progress; },
      });
      ST.refresh();
      // The morph CAN run now → the particles become the #work heading, so keep
      // the real <h2> hidden (it was hidden pre-paint; stays in the a11y tree).
      document.documentElement.classList.add('work-particled');
    } catch (e) {
      morphST = null;
      document.documentElement.classList.remove('work-particled'); // no driver → keep real heading
    }
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    stop();
    if (bootRaf) { window.cancelAnimationFrame(bootRaf); bootRaf = 0; }
    if (morphST) {
      try { morphST.kill(); } catch (e) {} morphST = null;
      if (window.ScrollTrigger) { try { window.ScrollTrigger.refresh(); } catch (e) {} }
    }
    window.removeEventListener('resize', onResize);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('blur', onWindowBlur);
    window.removeEventListener('mouseout', onPointerOut);
    canvas.removeEventListener('webglcontextlost', onContextLost);
    canvas.removeEventListener('webglcontextrestored', onContextRestored);
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pagehide', onPageHide);
    window.removeEventListener('pageshow', onPageShow);
    if (io) io.disconnect();
    if (scene) {
      scene.traverse(function (obj) {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
    }
    if (renderer) {
      renderer.dispose();
      const ctx = renderer.getContext && renderer.getContext();
      const lose = ctx && ctx.getExtension && ctx.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    }
    revealHeadline(); // always reveal BOTH crisp headings on teardown (inline hid them pre-paint)
    renderer = scene = camera = mesh = geometry = material = null;
    posA = targets = targetsB = scatterVecs = null;
  }

  let resizeTimer = 0, lastResizeW = (typeof window !== 'undefined' ? window.innerWidth : 0);
  function onResize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      if (disposed || !booted) return;
      var w = window.innerWidth;
      var widthChanged = w !== lastResizeW;
      lastResizeW = w;
      sizeToBox();   // always keep the canvas covering the viewport
      // Height-only change (e.g. mobile address bar): the svh-based layout is stable, so
      // do NOT resample or refresh ScrollTrigger here — that re-cache + refresh is what
      // made the scrubbed morph jump/stick. Only do the heavy work on real WIDTH changes.
      if (!widthChanged) { if (!running) renderFrame(elapsedSec, false); return; }
      try { if (computeTargets()) applyGeometry(); } catch (e) { /* keep previous */ }
      reconcileMorph();
      if (window.ScrollTrigger) { try { window.ScrollTrigger.refresh(); } catch (e) {} }
      if (!running) renderFrame(elapsedSec, false);
    }, 160);
  }

  function onVisibility() {
    if (document.hidden) stop();
    else start();
  }

  // Back/forward cache (bfcache). The work links (the internal demos AND the
  // external Ellevux site) open in the SAME tab, so leaving the portfolio fires
  // pagehide and the Back button RESTORES this page from bfcache WITHOUT
  // re-running init(). Two failure modes followed from the old teardown-on-unload:
  //   1) WHITE PAGE — disposing here force-lost the GL context, leaving the fixed
  //      z-index:-1 canvas dead and painted white over the black page.
  //   2) DEAD PARTICLES — a WebGL + ScrollTrigger hero does not reliably wake
  //      from a frozen snapshot even when the context survives.
  // Fix: onPageHide only PAUSES (keeps the context, so the cached frame is the
  // last particle frame, never white) and onPageShow RELOADS for a clean hero.
  function onPageHide(e) {
    // Persisted = entering bfcache: just PAUSE (keep the GL context) so Back can
    // resume instantly. Only a real unload frees GPU resources via dispose().
    if (e && e.persisted) { stop(); return; }
    dispose();
  }
  function onPageShow(e) {
    if (!e || !e.persisted) return; // a fresh load already runs init()
    // Restored from the back/forward cache. A WebGL + ScrollTrigger hero does NOT
    // reliably wake from a frozen snapshot across browsers — even when the GL
    // context technically survives, the particle loop and the morph scrub can come
    // back dead. So reload for a guaranteed-clean hero (correct even mid-page: the
    // particles place from cached doc-position minus live scroll). onPageHide only
    // PAUSED (never disposed) on the way in, so the cached last frame still shows
    // the particles — not a white canvas — for the instant before this reload.
    window.location.reload();
  }

  let io = null;
  function observe() {
    if (typeof window.IntersectionObserver !== 'function') { visibleInView = true; return; }
    io = new window.IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visibleInView = entry.isIntersecting;
        if (visibleInView) start(); else stop();
      });
    }, { threshold: 0.01 });
    io.observe(canvas);
  }

  let bootAttempts = 0;
  function tryBoot() {
    if (disposed) return;
    const w = canvas.clientWidth || (canvas.parentElement && canvas.parentElement.clientWidth) || 0;
    const h = canvas.clientHeight || (canvas.parentElement && canvas.parentElement.clientHeight) || 0;
    if ((w === 0 || h === 0) && bootAttempts < 120) {
      bootAttempts++;
      bootRaf = window.requestAnimationFrame(tryBoot);
      return;
    }
    let ok = false;
    try { ok = build(); } catch (e) { ok = false; }
    if (!ok) {
      revealHeadline(); // build failed → reveal the crisp headline (fail open)
      if (renderer) { try { renderer.dispose(); } catch (e) {} }
      return;
    }

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('blur', onWindowBlur);
    window.addEventListener('mouseout', onPointerOut);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('pageshow', onPageShow);

    if (document.fonts && document.fonts.ready && typeof document.fonts.ready.then === 'function') {
      document.fonts.ready.then(function () {
        if (!disposed && booted) {
          try { if (computeTargets()) applyGeometry(); } catch (e) {}
          reconcileMorph();
          if (window.ScrollTrigger) { try { window.ScrollTrigger.refresh(); } catch (e) {} }
        }
      });
    }

    observe();
    renderFrame(0, false); // first render compiles + links the shader program
    // Fail open if the GLSL failed to LINK (older/blocklisted GPUs): dispose()
    // calls revealHeadline() so the pre-paint-hidden crisp <h1> comes back.
    if (!programLinked()) { dispose(); return; }
    start();
    initMorphScroll();
  }

  function init() { bootRaf = window.requestAnimationFrame(tryBoot); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
