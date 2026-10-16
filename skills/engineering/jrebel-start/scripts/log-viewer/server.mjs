// JRebel 本地日志跟踪服务：只读 <当前仓库>/.tmp/jrebel-local-*.stdout.log，零依赖。
// 在项目仓库根目录启动（监控谁取决于 cwd，不取决于脚本位置）：
//   node "$HOME/.agents/skills/jrebel-start/scripts/log-viewer/server.mjs"  →  http://127.0.0.1:8199
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.LOG_VIEWER_PORT || 8199);
const ROOT = process.cwd();
const LOG_DIR = path.join(ROOT, '.tmp');
const PROJECT = path.basename(ROOT);
const NAME_RE = /^jrebel-local-.+\.stdout\.log$/;
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url)); // 静态页跟脚本在一起（skill 目录）

if (!fs.existsSync(LOG_DIR)) {
  console.error(`No .tmp dir under ${ROOT} — run this from a project repo root that has .tmp/jrebel-local-*.log`);
  process.exit(1);
}
const TAIL_CHUNK = 256 * 1024;

const listLogs = () =>
  fs.readdirSync(LOG_DIR)
    .filter((f) => NAME_RE.test(f))
    .map((name) => {
      const s = fs.statSync(path.join(LOG_DIR, name));
      return { name, size: s.size, mtimeMs: Math.round(s.mtimeMs) };
    })
    .sort((a, b) => b.name.localeCompare(a.name));

const json = (res, code, obj) => {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
};

const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://localhost');

  if (u.pathname === '/api/logs') return json(res, 200, { logs: listLogs(), logDir: LOG_DIR, project: PROJECT });

  if (u.pathname === '/api/tail') {
    const name = u.searchParams.get('name') || '';
    if (!NAME_RE.test(name)) return json(res, 400, { error: 'bad name' });
    const full = path.join(LOG_DIR, name);
    let size;
    try {
      size = fs.statSync(full).size;
    } catch {
      return json(res, 404, { error: 'not found' });
    }
    let offset = Number(u.searchParams.get('offset'));
    if (!Number.isFinite(offset) || offset < 0 || offset > size) {
      offset = Math.max(0, size - TAIL_CHUNK); // 首次/切文件：从尾部 256KB 起
    }
    if (offset === size) return json(res, 200, { offset, size, b64: '' });
    const buf = Buffer.allocUnsafe(size - offset);
    const fd = fs.openSync(full, 'r');
    try {
      fs.readSync(fd, buf, 0, buf.length, offset);
    } finally {
      fs.closeSync(fd);
    }
    return json(res, 200, { offset: size, size, b64: buf.toString('base64') });
  }

  if (u.pathname === '/' || u.pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(path.join(SCRIPT_DIR, 'index.html')));
    return;
  }

  res.writeHead(404);
  res.end('not found');
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} in use — viewer is likely already running at http://127.0.0.1:${PORT}`);
    process.exit(0);
  }
  throw e;
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[${PROJECT}] JRebel log viewer: http://127.0.0.1:${PORT}   (log dir: ${LOG_DIR})`);
});
