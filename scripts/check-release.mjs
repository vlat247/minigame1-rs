import { lstat, readdir, readFile } from 'node:fs/promises';
import { dirname, extname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptExtensions = new Set(['.js', '.mjs', '.cjs']);
const fontExtensions = new Set(['.ttf', '.otf', '.woff', '.woff2']);

function resourceReferences(source, extension) {
  const references = [];
  if (extension === '.html') {
    for (const tag of source.matchAll(/<[a-z][^>]*>/giu)) {
      for (const attribute of tag[0].matchAll(/\s(?:src|href)\s*=\s*(["'])(.*?)\1/giu)) {
        references.push({
          url: attribute[2],
          script: /^<script\b/iu.test(tag[0]),
          stylesheet: /^<link\b/iu.test(tag[0]) && /\brel\s*=\s*["']stylesheet["']/iu.test(tag[0]),
          icon: /^<link\b/iu.test(tag[0]) && /\brel\s*=\s*["'][^"']*\bicon\b/iu.test(tag[0]),
        });
      }
    }
  } else if (extension === '.css') {
    for (const match of source.matchAll(/url\(\s*(?:(["'])(.*?)\1|([^\s)]+))\s*\)/giu)) {
      references.push({ url: match[2] ?? match[3] });
    }
    for (const match of source.matchAll(/@import\s+(["'])(.*?)\1/giu)) {
      references.push({ url: match[2] });
    }
  } else if (scriptExtensions.has(extension)) {
    for (const match of source.matchAll(
      /new\s+URL\(\s*(["'`])([^"'`]*?)\1\s*,\s*import\.meta\.url\s*\)/gu,
    )) {
      references.push({ url: match[2] });
    }
    for (const match of source.matchAll(
      /\b(?:import|export)\b\s*(?:[^;"'`]*?\bfrom\s*)?(["'])([^"']+)\1/gu,
    )) {
      references.push({ url: match[2] });
    }
    for (const match of source.matchAll(/\bimport\s*\(\s*(["'`])([^"'`]+)\1\s*\)/gu)) {
      references.push({ url: match[2] });
    }
  }
  return references;
}

async function artifactFiles(directory) {
  const files = new Map();
  async function visit(path) {
    const info = await lstat(path);
    if (info.isSymbolicLink()) {
      throw new Error(
        `Release artifact contains a symbolic link: ${relative(directory, path) || '.'}`,
      );
    }
    if (info.isDirectory()) {
      for (const name of await readdir(path)) {
        await visit(resolve(path, name));
      }
    } else if (info.isFile()) {
      files.set(path, info.size);
    } else {
      throw new Error(
        `Release artifact contains an unsupported file: ${relative(directory, path)}`,
      );
    }
  }
  await visit(directory);
  return files;
}

/** Check static Vite resource references; runtime-constructed URLs still need browser QA. */
export async function validateRelease(directory = 'dist') {
  const root = resolve(directory);
  const files = await artifactFiles(root);
  const entry = resolve(root, 'index.html');
  if (!files.get(entry)) {
    throw new Error(
      'Release artifact must contain a nonempty index.html. Run npm run build first.',
    );
  }

  const required = { javascript: false, stylesheet: false, font: false, favicon: false };
  let references = 0;
  for (const [file] of files) {
    const extension = extname(file).toLowerCase();
    if (extension !== '.html' && extension !== '.css' && !scriptExtensions.has(extension)) {
      continue;
    }
    for (const reference of resourceReferences(await readFile(file, 'utf8'), extension)) {
      const url = reference.url.trim();
      if (url === '' || url.startsWith('#') || /^data:/iu.test(url)) {
        continue;
      }
      const location = relative(root, file);
      if (url.startsWith('/') || url.includes('\\') || /^[a-z][a-z\d+.-]*:/iu.test(url)) {
        throw new Error(`${location} references a nonportable resource URL: ${url}`);
      }
      if (url.includes('${')) {
        throw new Error(`${location} contains an unresolved resource template: ${url}`);
      }
      let pathname;
      try {
        pathname = decodeURIComponent(url.split(/[?#]/u)[0]);
      } catch {
        throw new Error(`${location} references an invalid encoded resource URL: ${url}`);
      }
      const target = resolve(dirname(file), pathname);
      const artifactPath = relative(root, target);
      if (
        artifactPath === '..' ||
        artifactPath.startsWith(`..${sep}`) ||
        pathname.startsWith('/') ||
        pathname.includes('\\')
      ) {
        throw new Error(`${location} references a resource outside the release artifact: ${url}`);
      }
      if (artifactPath.split(sep)[0] === 'src' || /\.(?:[cm]?ts|tsx|jsx)$/iu.test(target)) {
        throw new Error(`${location} references uncompiled source: ${url}`);
      }
      if (!files.get(target)) {
        throw new Error(`${location} references a missing or empty resource: ${url}`);
      }
      references += 1;
      const targetExtension = extname(target).toLowerCase();
      if (file === entry && reference.script && scriptExtensions.has(targetExtension))
        required.javascript = true;
      if (file === entry && reference.stylesheet && targetExtension === '.css')
        required.stylesheet = true;
      if (fontExtensions.has(targetExtension)) required.font = true;
      if (file === entry && reference.icon) required.favicon = true;
    }
  }
  const missing = Object.entries(required)
    .filter(([, present]) => !present)
    .map(([name]) => name);
  if (missing.length > 0) {
    throw new Error(`Release artifact is missing required references: ${missing.join(', ')}.`);
  }
  return { directory: root, files: files.size, references };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await validateRelease(process.argv[2]);
    process.stdout.write(
      `Release artifact verified: ${result.files} files, ${result.references} local resource references.\n`,
    );
  } catch (error) {
    process.stderr.write(
      `Release artifact check failed: ${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  }
}
