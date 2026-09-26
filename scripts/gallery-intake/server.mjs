import http from 'node:http';
import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ui = fileURLToPath(new URL('.', import.meta.url));
const dataDir = path.resolve(process.env.GALLERY_INTAKE_DATA || path.join(ui, '../../.local/gallery-intake'));
const port = Number(process.env.GALLERY_INTAKE_PORT || 4392);
const origin = `http://127.0.0.1:${port}`;
const manifestPath = path.join(dataDir, 'manifest.json');
let manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
let writes = Promise.resolve();

function send(res, status, value) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(value));
}

async function body(req) {
  const chunks = [];
  let length = 0;
  for await (const chunk of req) {
    length += chunk.length;
    if (length > 8192) throw new Error('表单内容过长');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function update(id, edit) {
  const index = manifest.photos.findIndex(photo => photo.id === id);
  if (index < 0) return [404, { error: '找不到照片' }];
  const photo = manifest.photos[index];
  if (photo.revision !== edit.revision) return [409, { error: '这张照片已在其他页面更新。请先导出当前清单备份，再刷新页面。' }];
  for (const [key, limit] of [['title', 200], ['location', 300], ['category', 100]]) {
    if (typeof edit[key] !== 'string' || edit[key].length > limit) return [400, { error: `${key} 内容无效或过长` }];
  }
  const next = structuredClone(manifest);
  next.photos[index] = { ...photo, title: edit.title, location: edit.location, category: edit.category, revision: photo.revision + 1 };
  next.updatedAt = new Date().toISOString();
  // Replace only after the complete file has been written. Keep the previous save recoverable.
  await mkdir(dataDir, { recursive: true });
  await writeFile(`${manifestPath}.previous`, JSON.stringify(manifest, null, 2) + '\n');
  await writeFile(`${manifestPath}.tmp`, JSON.stringify(next, null, 2) + '\n');
  await rename(`${manifestPath}.tmp`, manifestPath);
  manifest = next;
  return [200, { photo: next.photos[index], updatedAt: next.updatedAt }];
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob:; connect-src 'self'; frame-ancestors 'self'; base-uri 'none'; form-action 'none'");
  if (req.headers.host !== `127.0.0.1:${port}` || (req.headers.origin && req.headers.origin !== origin)) return send(res, 403, { error: '请从本地整理页面访问' });
  const url = new URL(req.url, origin);
  try {
    if (req.method === 'GET' && url.pathname === '/api/session') return send(res, 200, manifest);
    const editRoute = url.pathname.match(/^\/api\/photos\/([a-f0-9]{16})$/);
    if (req.method === 'PUT' && editRoute) {
      if (!req.headers['content-type']?.startsWith('application/json')) return send(res, 415, { error: '需要 JSON 表单' });
      const edit = await body(req);
      const job = writes.then(() => update(editRoute[1], edit));
      writes = job.catch(() => {});
      const [status, result] = await job;
      return send(res, status, result);
    }
    const assets = { '/': ['index.html', 'text/html; charset=utf-8'], '/app.js': ['app.js', 'text/javascript; charset=utf-8'], '/style.css': ['style.css', 'text/css; charset=utf-8'] };
    const media = url.pathname.match(/^\/(thumbs|previews)\/([a-f0-9]{16})\.jpg$/);
    let file, type;
    if (assets[url.pathname]) {
      [file, type] = assets[url.pathname];
      file = path.join(ui, file);
    } else if (media && manifest.photos.some(photo => photo.id === media[2])) {
      file = path.join(dataDir, media[1], `${media[2]}.jpg`);
      type = 'image/jpeg';
    } else return send(res, 404, { error: '页面不存在' });
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: '不支持此操作' });
    const bytes = await readFile(file);
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': bytes.length, ...(media ? { 'Cache-Control': 'private, max-age=3600' } : {}) });
    res.end(req.method === 'HEAD' ? undefined : bytes);
  } catch (error) {
    console.error(error.message);
    send(res, error instanceof SyntaxError ? 400 : 500, { error: '保存或读取失败，请保留页面并重试。' });
  }
});

server.listen(port, '127.0.0.1', () => console.log(`Gallery desk: ${origin}\nDraft: ${manifestPath}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => server.close(async () => { await writes; process.exit(0); }));
