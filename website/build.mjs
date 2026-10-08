import { readdir, readFile, mkdir, copyFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const skillsRoot = join(root, 'skills');
const out = join(here, 'dist');
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const posix = path => path.replaceAll('\\', '/');
const fileUrl = (mode, path) => `https://github.com/duyiliu/agent-skills/${mode}/main/${path.split('/').map(encodeURIComponent).join('/')}`;
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(e => e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]))).flat();
}
const paths = await walk(skillsRoot);
const entries = [];
for (const path of paths.filter(p => p.endsWith('/SKILL.md') || p.endsWith('\\SKILL.md'))) {
  const dir = dirname(path);
  const text = await readFile(path, 'utf8');
  const name = text.match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const description = text.match(/^description:\s*(.+)$/m)?.[1]?.trim();
  if (!name || !description) throw new Error(`Missing frontmatter: ${path}`);
  const sourcePath = posix(relative(root, path));
  const category = sourcePath.startsWith('skills/engineering/') ? 'engineering' : sourcePath.startsWith('skills/goals/') ? 'goals' : 'management';
  const files = [];
  for (const file of paths.filter(p => p.startsWith(dir + '\\') || p.startsWith(dir + '/'))) {
    const repoPath = posix(relative(root, file));
    const content = await readFile(file, 'utf8');
    if (content.includes('\0')) throw new Error(`Binary file needs explicit publishing support: ${repoPath}`);
    files.push({ path: posix(relative(dir, file)), repoPath, content, editUrl: fileUrl('edit', repoPath), sourceUrl: fileUrl('blob', repoPath) });
  }
  files.sort((a,b) => (a.path === 'SKILL.md' ? -1 : b.path === 'SKILL.md' ? 1 : a.path.localeCompare(b.path)));
  entries.push({ name, description, category, files, updatedAt: git('log', '-1', '--format=%cI', '--', sourcePath), editUrl: fileUrl('edit', sourcePath) });
}
entries.sort((a,b) => a.name.localeCompare(b.name));
if (new Set(entries.map(e => e.name)).size !== entries.length) throw new Error('Duplicate skill names');
await mkdir(out, { recursive: true });
for (const file of ['index.html', 'style.css', 'app.js']) await copyFile(join(here, file), join(out, file));
await writeFile(join(out, 'catalog.json'), JSON.stringify({ repository: 'duyiliu/agent-skills', revision: git('rev-parse', 'HEAD'), builtAt: new Date().toISOString(), entries }));
console.log(`Built ${entries.length} skills / ${entries.reduce((n,e) => n + e.files.length, 0)} files into ${out}`);
