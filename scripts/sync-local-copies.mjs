// 全量同步本仓库 skills 到本机三处运行器副本（.agents/.claude/.codex）
// 规则：正文以仓库源为准，SKILL.md 按安装器格式重写（metadata 注入），资源文件覆盖拷贝；
// 仅清理"本仓库曾发布过"的残留目录，绝不动其他来源的 skill（paseo/jrebel 等）。
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, rmSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const REPO = 'D:/workspace/git/agent-skills';
const SRC = join(REPO, 'skills');
const DESTS = ['C:/Users/zhangqianfeng/.agents/skills', 'C:/Users/zhangqianfeng/.claude/skills', 'C:/Users/zhangqianfeng/.codex/skills'];
const RETIRED = new Set(['work-convention', 'github-skill-repository']);
const { execSync } = await import('node:child_process');

function discover(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (!statSync(full).isDirectory()) continue;
    if (existsSync(join(full, 'SKILL.md'))) out.push(full);
    else out.push(...discover(full));
  }
  return out;
}
function listFiles(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) out.push(...listFiles(full));
    else out.push(full);
  }
  return out;
}
const treeSha = p => execSync(`git rev-parse "HEAD:${p}"`, { cwd: REPO }).toString().trim();

const folders = discover(SRC);
const report = [];
for (const dest of DESTS) {
  mkdirSync(dest, { recursive: true });
  for (const folder of folders) {
    const srcSkill = readFileSync(join(folder, 'SKILL.md'), 'utf8');
    const name = srcSkill.match(/^name:\s*([a-z0-9-]+)\s*$/m)[1];
    const rel = folder.slice(SRC.length + 1).replace(/\\/g, '/');
    const descLine = srcSkill.split(/\r?\n/).find(l => l.startsWith('description:'));
    // 保留源 frontmatter 中除 name 外的其余字段（如 disable-model-invocation），供各运行器禁用自动触发
    const extraLines = srcSkill.split(/\r?\n/).filter(l => /^(license|compatibility|allowed-tools|disable-model-invocation):/.test(l));
    const nameLine = `name: ${name}`;
    const sha = treeSha('skills/' + rel);
    const fm = ['---', descLine, ...extraLines, 'metadata:', `    github-path: skills/${rel}`, '    github-ref: refs/heads/main', '    github-repo: https://github.com/duyiliu/agent-skills', `    github-tree-sha: ${sha}`, nameLine, '---', srcSkill.slice(srcSkill.indexOf('---', 3) + 4).replace(/^\r?\n/, '')].join('\n');
    const target = join(dest, name);
    const old = existsSync(join(target, 'SKILL.md')) ? readFileSync(join(target, 'SKILL.md'), 'utf8') : '';
    const want = fm.replace(/\r\n/g, '\n');
    const oldNorm = old.replace(/\r\n/g, '\n');
    const changes = [];
    if (oldNorm !== want) {
      mkdirSync(target, { recursive: true });
      writeFileSync(join(target, 'SKILL.md'), want);
      changes.push('SKILL.md');
    }
    // 资源文件独立按内容比对同步，不依赖 SKILL.md 是否变化
    for (const f of listFiles(folder)) {
      if (f.endsWith('SKILL.md')) continue;
      const relf = f.slice(folder.length + 1);
      const tf = join(target, relf);
      const cur = existsSync(tf) ? readFileSync(tf).toString('base64') : '';
      const next = readFileSync(f).toString('base64');
      if (cur !== next) {
        mkdirSync(join(tf, '..'), { recursive: true });
        cpSync(f, tf);
        changes.push(relf);
      }
    }
    if (changes.length) report.push(`${dest.slice(24)}/${name}: ${old ? 'UPDATED' : 'INSTALLED'} (${changes.join(', ')})`);
  }
  for (const e of readdirSync(dest)) {
    if (!RETIRED.has(e)) continue;
    const meta = existsSync(join(dest, e, 'SKILL.md')) ? readFileSync(join(dest, e, 'SKILL.md'), 'utf8') : '';
    if (meta.includes('duyiliu/agent-skills') || !meta) {
      rmSync(join(dest, e), { recursive: true, force: true });
      report.push(`${dest.slice(24)}/${e}: RETIRED-REMOVED`);
    }
  }
}
console.log(report.length ? report.join('\n') : 'ALL-SYNCED');
