#!/usr/bin/env node
/**
 * Stage docs/ into a GitHub Pages site that history-mode docsify can serve.
 *
 * docsify renders client-side, so a deep link only works if the host answers
 * *something* at that path. The usual trick is a 404.html fallback, but GitHub
 * Pages serves it with a 404 status — good enough for a human, fatal for a
 * crawler, which drops the page. So every route also gets a real directory
 * index (200), and 404.html stays only as a safety net for stale URLs.
 *
 * Also emits robots.txt and a sitemap.xml of the real, trailing-slash URLs,
 * with `lastmod` from git.
 *
 * Usage: node tools/build-docs-site.mjs [outDir]   (default: _site)
 */

import { execFileSync } from 'node:child_process';
import {
  cpSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'docs');
const OUT = resolve(ROOT, process.argv[2] ?? '_site');
const ORIGIN = 'https://docs.tokenswitch.org';

/** docsify machinery, not addressable pages. */
const NON_PAGES = new Set(['_sidebar.md', '_navbar.md', '_coverpage.md']);

/** A retired page is a stub that exists only so an old URL keeps resolving. */
const RETIRED_MARKER = '本页已下线';

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.') || entry === 'node_modules' || entry === '_media')
      continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry.endsWith('.md')) out.push(full);
  }
  return out;
}

/** ISO commit time of a file, or null when there is no history to read. */
function lastCommitIso(file) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', file], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return out || null;
  } catch {
    return null;
  }
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(DOCS, OUT, { recursive: true });

const shell = readFileSync(join(DOCS, 'index.html'), 'utf8');
writeFileSync(join(OUT, '404.html'), shell);

const routes = [{ route: '/', file: join(DOCS, 'README.md') }];
for (const file of walk(DOCS)) {
  const rel = relative(DOCS, file).split('\\').join('/');
  if (NON_PAGES.has(rel.split('/').pop()) || rel === 'README.md') continue;
  const route = `/${rel.replace(/(?:README)?\.md$/, '').replace(/\/$/, '')}`;
  routes.push({ route, file });
}
routes.sort((a, b) => a.route.localeCompare(b.route));

for (const { route } of routes) {
  if (route === '/') continue;
  const dir = join(OUT, route.slice(1));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), shell);
}

/* Retired stubs still get a directory index — old links must not break — but
 * they are not sitemap material: asking a crawler to index a tombstone spends
 * crawl budget and puts a dead end in the results. `docs/index.html` also marks
 * them `noindex` once their content is rendered. */
const urls = routes
  .filter(({ file }) => !readFileSync(file, 'utf8').includes(RETIRED_MARKER))
  .map(({ route, file }) => {
    const loc = `${ORIGIN}${route.endsWith('/') ? route : `${route}/`}`;
    const lastmod = lastCommitIso(file);
    return [
      '  <url>',
      `    <loc>${loc}</loc>`,
      ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
      '  </url>',
    ].join('\n');
  })
  .join('\n');

writeFileSync(
  join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);

/* No Disallow for *.md: docsify fetches those over XHR, and a crawler that is
 * told to skip them renders a blank page. */
writeFileSync(
  join(OUT, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`,
);

const indexed = urls.split('<loc>').length - 1;
console.log(
  `docs-site: ${routes.length} routes (${indexed} in sitemap, ${routes.length - indexed} retired) -> ${relative(ROOT, OUT)}`,
);
