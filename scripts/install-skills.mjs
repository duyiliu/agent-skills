#!/usr/bin/env node
// Install or verify complete Skill directories from this repository.
// No external dependencies, deletes, or runner-specific source forks.
import { readdir, readFile, mkdir, writeFile, copyFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = join(repoRoot, 'skills');
const args = process.argv.slice(2);
const getOption = key => {
  const index = args.indexOf(key);
  if (index < 0) return undefined;
  if (index === args.length - 1 || args[index + 1].startsWith('--')) throw new Error('Missing value for ' + key);
  return args[index + 1];
};
const runner = getOption('--runner');
const destArg = getOption('--dest');
const check = args.includes('--check');
const allowed = new Set(['--runner', '--dest', '--check']);
for (let i = 0; i < args.length; i++) {
  if (!allowed.has(args[i])) {
    if (i === 0 || !['--runner', '--dest'].includes(args[i - 1])) throw new Error('Unknown argument: ' + args[i]);
  }
}
if (!['codex', 'claude'].includes(runner)) {
  console.error('Usage: node scripts/install-skills.mjs --runner codex|claude [--dest DIRECTORY] [--check]');
  process.exit(2);
}
const destRoot = resolve(destArg || join(homedir(), runner === 'codex' ? '.codex' : '.claude', 'skills'));
async function listFiles(dir) {
  const output = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, item.name);
    if (item.isDirectory()) output.push(...await listFiles(full));
    else if (item.isFile()) output.push(full);
  }
  return output;
}
async function discover(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  if (entries.some(entry => entry.isFile() && entry.name === 'SKILL.md')) return [dir];
  const children = await Promise.all(entries.filter(entry => entry.isDirectory())
    .map(entry => discover(join(dir, entry.name))));
  return children.flat();
}
function getName(content, path) {
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  const name = frontmatter?.[1].match(/^name:\s*([a-z0-9-]+)\s*$/m)?.[1];
  if (!name) throw new Error('Invalid Skill frontmatter: ' + path);
  return name;
}
function adapt(content) {
  return runner === 'codex'
    ? content.replace(/^disable-model-invocation:\s*true\r?\n/gm, '')
    : content;
}
const folders = await discover(sourceRoot);
const skills = [];
const names = new Set();
for (const folder of folders) {
  const source = await readFile(join(folder, 'SKILL.md'), 'utf8');
  const name = getName(source, folder);
  if (name !== folder.split(/[\\/]/).at(-1) || names.has(name)) throw new Error('Duplicate or mismatched Skill name: ' + name);
  names.add(name);
  skills.push({ name, folder, files: await listFiles(folder) });
}
// Validate existing target identities before writing any files.
for (const skill of skills) {
  const target = join(destRoot, skill.name, 'SKILL.md');
  try {
    const existing = await readFile(target, 'utf8');
    if (getName(existing, target) !== skill.name) throw new Error('Conflicting installed Skill: ' + target);
  } catch (err) {
    if (err.code === 'ENOENT') {
      const children = await readdir(join(destRoot, skill.name)).catch(e => e.code === 'ENOENT' ? [] : Promise.reject(e));
      if (children.length) throw new Error('Unmanaged nonempty target directory: ' + join(destRoot, skill.name));
      if (check) throw new Error('Missing installed Skill: ' + target);
    } else throw err;
  }
}
let filesProcessed = 0;
const drift = [];
for (const skill of skills) {
  for (const path of skill.files) {
    const rel = relative(skill.folder, path);
    const target = join(destRoot, skill.name, rel);
    const source = await readFile(path);
    const output = rel === 'SKILL.md' ? Buffer.from(adapt(source.toString('utf8'))) : source;
    if (check) {
      let current;
      try { current = await readFile(target); } catch (err) { if (err.code !== 'ENOENT') throw err; }
      if (!current || !current.equals(output)) drift.push(join(skill.name, rel));
    } else {
      await mkdir(dirname(target), { recursive: true });
      if (rel === 'SKILL.md') await writeFile(target, output);
      else await copyFile(path, target);
    }
    filesProcessed++;
  }
}
if (drift.length) {
  console.error('Installation differs from canonical Skills:\n' + drift.join('\n'));
  process.exit(1);
}
console.log((check ? 'Verified ' : 'Installed ') + skills.length + ' Skills / ' + filesProcessed + ' files for ' + runner + ' at ' + destRoot);
