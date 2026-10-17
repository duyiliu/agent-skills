import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(join(root, p), 'utf8');
const names = ['task-design', 'task-execution'];
const filename = n => 'skills/engineering/' + n + '/SKILL.md';

for (const name of names) {
  test(name + ': frontmatter and reference/template files', () => {
    const source = read(filename(name));
    assert.ok(source.startsWith('---\nname: ' + name + '\n'));
    assert.match(source, /^description: .{40,}$/m);
    const refs = [...source.matchAll(/(?:references|templates)\/[^\s\x60]+?\.md/g)].map(m => m[0]);
    assert.ok(refs.length >= 2, 'missing links to bundled resources');
    for (const ref of refs) {
      assert.ok(existsSync(join(root, 'skills/engineering', name, ref)), name + ' missing ' + ref);
    }
  });
}
test('task-design preserves the review and human approval gate', () => {
  const skill = read(filename('task-design'));
  const doc = read('skills/engineering/task-design/templates/design-template.md');
  for (const word of ['Design Review', '用户确认', '阻塞确认项', '仅讨论', 'design.md']) {
    assert.ok(skill.includes(word), 'missing design rule: ' + word);
  }
  for (const word of ['设计审查：待审查', '设计确认：待确认', 'AC01']) {
    assert.ok(doc.includes(word), 'missing design template marker: ' + word);
  }
});
test('task-execution preserves authorization, review and evidence rules', () => {
  const skill = read(filename('task-execution'));
  const doc = read('skills/engineering/task-execution/templates/tasks-template.md');
  for (const word of ['Design Review = PASS', '用户已明确确认', '状态字段本身不能替代用户授权', 'Implementation Review', '环境验收']) {
    assert.ok(skill.includes(word), 'missing execution rule: ' + word);
  }
  assert.match(skill, /不隐含 commit、push、deploy/);
  assert.match(doc, /AC.*覆盖/);
  assert.ok(doc.includes('## 阻塞项'));
});
test('work-convention has been retired; conventions and decision template survive', () => {
  assert.equal(existsSync(join(root, 'skills/engineering/work-convention/SKILL.md')), false);
  assert.ok(existsSync(join(root, 'skills/engineering/工作资料约定.md')));
  assert.ok(existsSync(join(root, 'skills/engineering/task-design/templates/决策模板.md')));
});
test('real-agent evaluation cases are structured (not model outcomes)', () => {
  const cases = JSON.parse(read('tests/agent-eval-cases.json'));
  const routes = new Set(['direct', 'task-design', 'task-execution', 'goal-fix', 'goal-investigate', 'goal-improve', 'docs-only']);
  assert.ok(cases.length >= 8);
  const ids = new Set();
  for (const item of cases) {
    assert.ok(item.id && !ids.has(item.id));
    ids.add(item.id);
    assert.ok(item.prompt.length >= 12);
    assert.ok(routes.has(item.expected_route));
    assert.ok(Array.isArray(item.acceptance) && item.acceptance.length);
  }
  for (const route of ['direct', 'task-design', 'task-execution', 'docs-only']) {
    assert.ok(cases.some(c => c.expected_route === route), 'missing case for ' + route);
  }
});
test('isolated Codex and Claude Skill installation, followed by --check', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'agent-skills-smoke-'));
  try {
    for (const runner of ['codex', 'claude']) {
      const dest = join(tmp, runner);
      const args = ['scripts/install-skills.mjs', '--runner', runner, '--dest', dest];
      execFileSync(process.execPath, args, { cwd: root });
      execFileSync(process.execPath, [...args, '--check'], { cwd: root });
      for (const name of names) {
        assert.ok(existsSync(join(dest, name, 'SKILL.md')));
      }
      assert.equal(existsSync(join(dest, 'work-convention')), false);
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
