/* ============================================================
   Ellevux · deploy to Vercel via the REST API
   Static deploy, no build. Run from the repo root.

     node deploy.mjs --list                 # dry run, print the upload set
     VERCEL_TOKEN=... node deploy.mjs       # upload + deploy to production

   The token is read from the environment only. It is never written to
   disk, never echoed, and never interpolated into a logged string.
   ============================================================ */
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { relative, join } from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const TEAM = 'ellevux';
const PROJECT = 'ellevux-studio';

/* ---- what ships ----
   Per CLAUDE.md: no *.md, no .gitignore, no tools/, no
   assets/img/src/, no demos/cafe/assets/README.txt. ARC and
   CLIENT-DEMO are separate gitignored Vite apps and never ship. */
const SKIP_DIRS = new Set([
  '.git', '.verify', 'node_modules', 'ARC', 'CLIENT-DEMO',
  'tools', '.claude', '.vscode', 'Ellevux WEB',
]);
const SKIP_PATHS = new Set(['demos/cafe/assets/README.txt']);
/* Unlinked stale duplicates of the Buzzy demo, 94KB each. Nothing
   links to them and robots.txt allows everything but /thanks/, so
   deployed they are two crawlable copies of a page that already
   exists at its real URL. */
const SKIP_RE = [/\.aurum-backup\.html$/, /^demos\/_cafe-backup/];
const SKIP_EXACT = new Set(['.gitignore', '.DS_Store', 'Thumbs.db']);

function collect(dir = ROOT, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, e.name);
    const rel = relative(ROOT, abs).split('\\').join('/');
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name) || rel === 'assets/img/src') continue;
      collect(abs, out);
      continue;
    }
    if (SKIP_EXACT.has(e.name)) continue;
    if (/\.md$/i.test(e.name)) continue;
    if (SKIP_PATHS.has(rel)) continue;
    if (SKIP_RE.some((re) => re.test(rel))) continue;
    out.push({ rel, abs, size: statSync(abs).size });
  }
  return out;
}

/* ---- THE GITIGNORE GUARD ----
   A stray Chrome automation profile once landed in the repo root, and
   the walker above happily collected 1,825 of its files, Cookies and
   Local State among them, for upload to a PUBLIC url. Deploying is
   publishing. So the upload set is intersected with what git can see:
   anything .gitignore excludes can never ship, whatever it is named.
   This is a denylist that maintains itself, instead of one more
   hardcoded directory name that the next stray folder will not match. */
const gitVisible = new Set(
  execSync('git ls-files --cached --others --exclude-standard', {
    maxBuffer: 64 * 1024 * 1024,
  })
    .toString()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
);

const walked = collect();
const files = walked.filter((f) => gitVisible.has(f.rel));
const withheld = walked.filter((f) => !gitVisible.has(f.rel));
const total = files.reduce((s, f) => s + f.size, 0);

if (withheld.length) {
  const byDir = {};
  for (const f of withheld) {
    const d = f.rel.includes('/') ? f.rel.split('/')[0] : '(root)';
    byDir[d] = (byDir[d] || 0) + 1;
  }
  console.log('gitignore guard: withheld ' + withheld.length + ' ignored file(s) from the upload set');
  for (const [d, n] of Object.entries(byDir).sort((a, b) => b[1] - a[1])) {
    console.log('  ' + String(n).padStart(5) + '  ' + d);
  }
  console.log('');
}

if (process.argv.includes('--list')) {
  const byDir = {};
  for (const f of files) {
    const d = f.rel.includes('/') ? f.rel.split('/')[0] : '(root)';
    byDir[d] = (byDir[d] || 0) + 1;
  }
  console.log(`files: ${files.length}  ·  total: ${(total / 1024 / 1024).toFixed(2)} MB\n`);
  console.log('by folder:');
  for (const [d, n] of Object.entries(byDir).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(4)}  ${d}`);
  }
  console.log('\nroot + page files:');
  files.filter((f) => !f.rel.includes('/') || f.rel.endsWith('index.html'))
       .forEach((f) => console.log(`  ${f.rel}`));
  process.exit(0);
}

const TOKEN = process.env.VERCEL_TOKEN;
if (!TOKEN) {
  console.error('VERCEL_TOKEN is not set. Refusing to continue.');
  process.exit(1);
}
const auth = { Authorization: `Bearer ${TOKEN}` };
const qs = `?teamId=${TEAM}`;

/* ---- 1 · upload every file, keyed by its SHA1 ---- */
console.log(`uploading ${files.length} files (${(total / 1024 / 1024).toFixed(2)} MB)…`);
let done = 0;
for (const f of files) {
  const body = readFileSync(f.abs);
  f.sha = createHash('sha1').update(body).digest('hex');
  const res = await fetch(`https://api.vercel.com/v2/files${qs}`, {
    method: 'POST',
    headers: {
      ...auth,
      'Content-Type': 'application/octet-stream',
      'x-vercel-digest': f.sha,
      'Content-Length': String(body.length),
    },
    body,
  });
  if (!res.ok && res.status !== 409) {
    console.error(`\nupload failed: ${f.rel} → ${res.status} ${await res.text()}`);
    process.exit(1);
  }
  done += 1;
  if (done % 20 === 0 || done === files.length) {
    process.stdout.write(`\r  ${done}/${files.length}`);
  }
}
console.log('\nuploaded.');

/* ---- 2 · create the deployment ---- */
const res = await fetch(`https://api.vercel.com/v13/deployments${qs}`, {
  method: 'POST',
  headers: { ...auth, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: PROJECT,
    project: PROJECT,
    target: 'production',
    files: files.map((f) => ({ file: f.rel, sha: f.sha, size: f.size })),
    projectSettings: {
      framework: null,
      buildCommand: null,
      outputDirectory: null,
      installCommand: null,
      devCommand: null,
    },
  }),
});
const out = await res.json();
if (!res.ok) {
  console.error('deployment failed:', res.status, JSON.stringify(out.error || out, null, 2));
  process.exit(1);
}
console.log('\ndeployment created');
console.log('  id:      ', out.id);
console.log('  url:     ', 'https://' + out.url);
console.log('  state:   ', out.readyState || out.status);
console.log('  target:  ', out.target);

/* ---- 3 · wait for it to go READY ---- */
const id = out.id;
for (let i = 0; i < 60; i++) {
  await new Promise((r) => setTimeout(r, 3000));
  const s = await fetch(`https://api.vercel.com/v13/deployments/${id}${qs}`, { headers: auth });
  const d = await s.json();
  const state = d.readyState || d.status;
  process.stdout.write(`\r  state: ${state}            `);
  if (state === 'READY') {
    console.log(`\n\nLIVE: https://${d.url}`);
    console.log('aliases:', (d.alias || []).map((a) => 'https://' + a).join('  ') || '(none yet)');
    process.exit(0);
  }
  if (state === 'ERROR' || state === 'CANCELED') {
    console.log(`\n\ndeployment ${state}`);
    process.exit(1);
  }
}
console.log('\n\nstill building after 3 minutes; check the Vercel dashboard.');
