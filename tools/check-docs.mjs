#!/usr/bin/env node
/**
 * TokenSwitch docs consistency check.
 *
 * Verifies, over docs/:
 *   1. every internal link resolves to an existing page
 *   2. every content page is either listed in _sidebar.md or explicitly marked
 *      as a retired stub (the retirement banner)
 *   3. no page links to a retired stub (stubs exist only so old URLs survive)
 *   4. sidebar entries all point at files that exist
 *
 * Usage: node tools/check-docs.mjs
 * Exit code 1 on any failure.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'docs');
const SIDEBAR = join(DOCS, '_sidebar.md');
const RETIRED_MARKER = '本页已下线';

/** Files that are docsify machinery, not content pages. */
const NON_CONTENT = new Set([
  '_sidebar.md',
  '_navbar.md',
  '_coverpage.md',
  'README.md',
]);

const failures = [];
const fail = (msg) => failures.push(msg);

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

const pages = walk(DOCS);
const relPages = pages.map((p) => relative(DOCS, p).split('\\').join('/'));
const pageSet = new Set(relPages);

/** '/intro/architecture' -> 'intro/architecture.md'; '/' -> 'README.md' */
function routeToFile(route) {
  let r = route.split('#')[0].split('?')[0];
  if (!r.startsWith('/')) return null;
  r = r.slice(1);
  if (r === '') return 'README.md';
  if (r.endsWith('/')) return `${r}README.md`;
  if (r.endsWith('.md')) return r;
  return `${r}.md`;
}

const retired = new Set(
  relPages.filter((p) => readFileSync(join(DOCS, p), 'utf8').includes(RETIRED_MARKER)),
);

// ---------------------------------------------------------------- sidebar ---
if (!existsSync(SIDEBAR)) {
  fail('docs/_sidebar.md is missing');
}
const sidebarText = readFileSync(SIDEBAR, 'utf8');
const sidebarRoutes = new Set();
for (const m of sidebarText.matchAll(/\]\((\/[^)]*)\)/g)) {
  const file = routeToFile(m[1]);
  if (!file) continue;
  sidebarRoutes.add(file);
  if (!pageSet.has(file)) {
    fail(`_sidebar.md links to a missing page: ${m[1]} -> docs/${file}`);
  }
  if (retired.has(file)) {
    fail(`_sidebar.md still lists retired stub: ${m[1]}`);
  }
}

// ------------------------------------------------------------- link check ---
for (const page of relPages) {
  const text = readFileSync(join(DOCS, page), 'utf8');
  const isStub = retired.has(page);

  for (const m of text.matchAll(/\]\((\/[^)\s]*)\)/g)) {
    const route = m[1];
    if (route.startsWith('//')) continue; // protocol-relative external
    const file = routeToFile(route);
    if (!file) continue;
    if (!pageSet.has(file)) {
      fail(`docs/${page}: dead link ${route} (expected docs/${file})`);
      continue;
    }
    if (retired.has(file) && !isStub && page !== 'reference/retired.md') {
      fail(
        `docs/${page}: links to retired stub ${route}; link to the live page instead`,
      );
    }
  }

  // Relative .md links are not used by this site; flag them so they don't creep in.
  for (const m of text.matchAll(/\]\((\.{1,2}\/[^)\s]*\.md)\)/g)) {
    fail(`docs/${page}: relative link ${m[1]}; use an absolute route like /intro/architecture`);
  }
}

// ---------------------------------------------------------- orphan check ---
for (const page of relPages) {
  if (NON_CONTENT.has(page)) continue;
  if (retired.has(page)) continue;
  if (!sidebarRoutes.has(page)) {
    fail(`docs/${page} is not listed in _sidebar.md (add it, or mark it as a retired stub)`);
  }
}

// ------------------------------------------------------------------ report ---
console.log(
  `checked ${relPages.length} pages (${retired.size} retired stubs, ${sidebarRoutes.size} sidebar entries)`,
);
if (failures.length === 0) {
  console.log('docs check: PASS');
  process.exit(0);
}
console.error(`\ndocs check: ${failures.length} problem(s)`);
for (const f of failures) console.error(`  - ${f}`);
process.exit(1);
