import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { validateRelease } from '../scripts/check-release.mjs';

async function artifact(t, overrides = {}) {
  const directory = await mkdtemp(join(tmpdir(), 'cauldron-release-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const files = {
    'index.html':
      '<link rel="icon" href="./favicon.svg"><link rel="stylesheet" href="./assets/game.css"><script type="module" src="./assets/game.js"></script>',
    'favicon.svg': '<svg xmlns="http://www.w3.org/2000/svg"/>',
    'assets/game.css': '@font-face { font-family: game; src: url("./fonts/pixel.woff2"); }',
    'assets/fonts/pixel.woff2': 'fixture font',
    'assets/game.js':
      'import "./chunks/ui.js"; const sprite = new URL(`./sprites/dragon.svg`, import.meta.url).href;',
    'assets/chunks/ui.js': 'export const ready = true;',
    'assets/sprites/dragon.svg': '<svg xmlns="http://www.w3.org/2000/svg"/>',
    ...overrides,
  };
  for (const [name, content] of Object.entries(files)) {
    if (content === null) continue;
    const path = join(directory, name);
    await mkdir(join(path, '..'), { recursive: true });
    await writeFile(path, content);
  }
  return directory;
}

test('a complete artifact uses portable nested asset paths and module chunks', async (t) => {
  const directory = await artifact(t);
  assert.deepEqual(await validateRelease(directory), { directory, files: 7, references: 6 });
});

test('missing HTML is rejected before asset validation', async (t) => {
  const directory = await artifact(t, { 'index.html': null });
  await assert.rejects(validateRelease(directory), /nonempty index\.html/u);
});

for (const [name, absent] of [
  ['stylesheet', 'assets/game.css'],
  ['font', 'assets/fonts/pixel.woff2'],
  ['sprite referenced from compiled JavaScript', 'assets/sprites/dragon.svg'],
  ['module chunk', 'assets/chunks/ui.js'],
]) {
  test(`a missing ${name} fails with the referring resource`, async (t) => {
    const directory = await artifact(t, { [absent]: null });
    await assert.rejects(validateRelease(directory), /missing or empty resource/u);
  });
}

test('empty referenced resources are rejected', async (t) => {
  const directory = await artifact(t, { 'favicon.svg': '' });
  await assert.rejects(validateRelease(directory), /missing or empty resource: \.\/favicon\.svg/u);
});

for (const url of [
  '/assets/game.js',
  'https://cdn.example.com/game.js',
  '//cdn.example.com/game.js',
]) {
  test(`nonportable entry resource ${url} is rejected`, async (t) => {
    const directory = await artifact(t, {
      'index.html': `<script src="${url}"></script>`,
    });
    await assert.rejects(validateRelease(directory), /nonportable resource URL/u);
  });
}

test('a relative URL cannot escape the published artifact', async (t) => {
  const directory = await artifact(t, {
    'assets/game.css': '@import "../../outside.css";',
  });
  await assert.rejects(validateRelease(directory), /outside the release artifact/u);
});

test('percent-encoded traversal cannot escape the published artifact', async (t) => {
  const directory = await artifact(t, {
    'assets/game.css': 'body { background: url(%2e%2e/%2e%2e/outside.png); }',
  });
  await assert.rejects(validateRelease(directory), /outside the release artifact/u);
});

test('source files cannot be shipped as compiled entry resources', async (t) => {
  const directory = await artifact(t, {
    'index.html': '<script type="module" src="./src/main.ts"></script>',
    'src/main.ts': 'const ready: boolean = true;',
  });
  await assert.rejects(validateRelease(directory), /uncompiled source/u);
});

test('unused symbolic links are rejected as well as referenced links', async (t) => {
  const directory = await artifact(t);
  await symlink(join(directory, 'favicon.svg'), join(directory, 'unused.svg'));
  await assert.rejects(validateRelease(directory), /symbolic link: unused\.svg/u);
});

test('data URLs and fragment references need no local file', async (t) => {
  const directory = await artifact(t, {
    'assets/game.css':
      '@font-face { src: url(./fonts/pixel.woff2?v=1#font); } .pot { background: url("data:image/svg+xml,%3Csvg/%3E"); filter: url(#glow); }',
    'assets/game.js':
      'import("./chunks/ui.js"); const sprite = new URL("data:image/svg+xml,%3Csvg/%3E", import.meta.url);',
  });
  assert.equal((await validateRelease(directory)).references, 5);
});

test('compiled entry, stylesheet, font, and favicon references are required', async (t) => {
  const directory = await artifact(t, { 'index.html': '<!doctype html><title>Empty game</title>' });
  await assert.rejects(validateRelease(directory), /javascript, stylesheet, favicon/u);
});

test('exported module dependencies and quoted CSS imports are checked recursively', async (t) => {
  const directory = await artifact(t, {
    'assets/game.js': 'export { ready } from "./chunks/ui.js";',
    'assets/game.css': '@import "./theme.css"; @font-face { src: url(./fonts/pixel.woff2); }',
    'assets/theme.css': 'body { background: url(./missing.png); }',
  });
  await assert.rejects(
    validateRelease(directory),
    /theme\.css references a missing or empty resource/u,
  );
});

test('minified static module imports cannot hide a missing chunk', async (t) => {
  const directory = await artifact(t, {
    'assets/game.js': 'import{ready as r}from"./chunks/missing.js";export{r};',
  });
  await assert.rejects(
    validateRelease(directory),
    /missing or empty resource: \.\/chunks\/missing\.js/u,
  );
});
