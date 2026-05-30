import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const projectsDir = path.join(root, 'src/content/projects');
const readmesDir = path.join(root, 'src/content/project-readmes');
const dataDir = path.join(root, 'src/data');

function frontmatterValue(source, key) {
  const match = source.match(new RegExp(`^${key}:\\s*['\"]?([^'\"\\n]+)['\"]?\\s*$`, 'm'));
  return match?.[1]?.trim();
}

function frontmatterBool(source, key) {
  return frontmatterValue(source, key) === 'true';
}

function stripReadmeFrontmatter(markdown) {
  return markdown.replace(/^---\n[\s\S]*?\n---\n?/, '');
}

function normalizeMarkdown(markdown) {
  return markdown
    // Prism in the site build does not ship every GitHub code fence alias.
    // Keep the content, render unsupported fences as plain text.
    .replace(/```bibtex\b/gi, '```text');
}

// Synced READMEs are third-party content (e.g. forks of external repos) and are
// rendered as raw HTML by Astro's markdown pipeline with no sanitizer in the
// chain. Strip the executable surface so a hostile README cannot inject
// first-party JS at build time. (Trade-off: also neutralizes any raw <script>/
// on*= shown verbatim inside README prose — acceptable for safety.)
function sanitizeReadmeHtml(markdown) {
  return markdown
    // Remove entire <script>/<style>/<iframe>/<object>/<embed> blocks
    .replace(/<\s*(script|style|iframe|object|embed)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    // Remove self-closing or unclosed dangerous tags
    .replace(/<\s*(script|iframe|object|embed)\b[^>]*\/?>/gi, '')
    // Strip inline event-handler attributes (onclick, onerror, onload, ...)
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '')
    .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, '')
    // Neutralize javascript:/vbscript: and non-image data: URIs in href/src
    // (quoted attributes)
    .replace(/(\b(?:href|src)\s*=\s*)(["'])\s*(?:javascript|vbscript):[^"']*\2/gi, '$1$2#$2')
    .replace(/(\b(?:href|src)\s*=\s*)(["'])\s*data:(?!image\/)[^"']*\2/gi, '$1$2#$2')
    // ...and unquoted attributes (e.g. href=javascript:alert(1))
    .replace(/(\b(?:href|src)\s*=\s*)(?:javascript|vbscript):[^\s>]*/gi, '$1#')
    .replace(/(\b(?:href|src)\s*=\s*)data:(?!image\/)[^\s>]*/gi, '$1#');
}

function isAbsoluteOrSpecialUrl(url) {
  return /^(?:[a-z][a-z0-9+.-]*:|#)/i.test(url.trim());
}

// javascript:/vbscript:/non-image data: URLs execute or smuggle script when a
// visitor clicks them. Astro's markdown renderer does NOT sanitize these, so we
// neutralize them at the URL-resolution layer (covers markdown links/images and
// quoted raw-HTML attributes that flow through resolveRepoUrl).
function isDangerousUrl(url) {
  return /^\s*(?:javascript|vbscript):/i.test(url) || /^\s*data:(?!image\/)/i.test(url);
}

function encodeRepoPath(repoPath) {
  const [pathWithQuery, hash = ''] = repoPath.split('#');
  const [pathname, query = ''] = pathWithQuery.split('?');
  const encodedPath = pathname
    .split('/')
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/');
  return encodedPath + (query ? `?${query}` : '') + (hash ? `#${hash}` : '');
}

function resolveRepoUrl(url, owner, repo, branch, readmeDir, kind) {
  const trimmed = url.trim();
  if (isDangerousUrl(trimmed)) return '#';
  if (!trimmed || isAbsoluteOrSpecialUrl(trimmed)) return url;

  const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/`;
  const blobBase = `https://github.com/${owner}/${repo}/blob/${branch}/`;
  const baseDir = trimmed.startsWith('/') ? '' : readmeDir;
  const repoPath = path.posix.normalize(path.posix.join(baseDir, trimmed.replace(/^\//, '')));
  const encoded = encodeRepoPath(repoPath.replace(/^\.\//, ''));
  return (kind === 'asset' ? rawBase : blobBase) + encoded;
}

function rewriteMarkdownUrls(markdown, owner, repo, branch, readmePath = 'README.md') {
  const readmeDir = path.posix.dirname(readmePath);
  const baseDir = readmeDir === '.' ? '' : readmeDir;

  return markdown
    // Markdown image/link syntax. Images need raw.githubusercontent.com; links go to GitHub blob pages.
    .replace(/(!?)\[([^\]]*)\]\(([^)]+)\)/g, (full, bang, label, url) => {
      const target = resolveRepoUrl(url, owner, repo, branch, baseDir, bang ? 'asset' : 'link');
      return target === url ? full : `${bang}[${label}](${target})`;
    })
    // Many READMEs use raw HTML for sized screenshots/logos. Astro preserves the HTML,
    // so markdown URL rewriting above never sees these image sources.
    .replace(/(<img\b[^>]*\bsrc\s*=\s*)(["'])([^"']+)(\2)/gi, (full, prefix, quote, src, suffix) => {
      const target = resolveRepoUrl(src, owner, repo, branch, baseDir, 'asset');
      return target === src ? full : `${prefix}${quote}${target}${suffix}`;
    })
    .replace(/(<source\b[^>]*\bsrc\s*=\s*)(["'])([^"']+)(\2)/gi, (full, prefix, quote, src, suffix) => {
      const target = resolveRepoUrl(src, owner, repo, branch, baseDir, 'asset');
      return target === src ? full : `${prefix}${quote}${target}${suffix}`;
    })
    .replace(/(<a\b[^>]*\bhref\s*=\s*)(["'])([^"']+)(\2)/gi, (full, prefix, quote, href, suffix) => {
      const target = resolveRepoUrl(href, owner, repo, branch, baseDir, 'link');
      return target === href ? full : `${prefix}${quote}${target}${suffix}`;
    });
}

async function githubFetch(url) {
  const headers = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'audiofool-blog-build',
  };
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res;
}

async function syncProject(file) {
  const fullPath = path.join(projectsDir, file);
  const source = await readFile(fullPath, 'utf8');
  const githubRepo = frontmatterValue(source, 'githubRepo');
  const shouldSyncReadme = frontmatterBool(source, 'githubReadme');
  if (!githubRepo) return null;

  const id = file.replace(/\.mdx?$/, '').toLowerCase();
  const [owner, repo] = githubRepo.split('/');
  if (!owner || !repo) return null;

  const metaRes = await githubFetch(`https://api.github.com/repos/${owner}/${repo}`);
  const meta = await metaRes.json();
  const branch = meta.default_branch || 'main';

  let readmeMarkdown = '';
  if (shouldSyncReadme) {
    try {
      const readmeRes = await githubFetch(`https://api.github.com/repos/${owner}/${repo}/readme`);
      const readmeMeta = await readmeRes.json();
      const rawRes = await githubFetch(readmeMeta.download_url);
      readmeMarkdown = await rawRes.text();
      readmeMarkdown = { body: readmeMarkdown, path: readmeMeta.path || 'README.md' };
    } catch (error) {
      console.warn(`[github-projects] README unavailable for ${githubRepo}: ${error.message}`);
    }
  }

  if (readmeMarkdown && readmeMarkdown.body.trim()) {
    const body = normalizeMarkdown(
      sanitizeReadmeHtml(
        rewriteMarkdownUrls(
          stripReadmeFrontmatter(readmeMarkdown.body),
          owner,
          repo,
          branch,
          readmeMarkdown.path,
        ),
      ),
    ).trim();
    const generated = `---\nproject: ${JSON.stringify(id)}\nrepo: ${JSON.stringify(githubRepo)}\nsourceUrl: ${JSON.stringify(meta.html_url)}\nsyncedAt: ${JSON.stringify(new Date().toISOString())}\n---\n\n${body}\n`;
    await writeFile(path.join(readmesDir, `readme-${id}.md`), generated, 'utf8');
  }

  return {
    project: id,
    repo: githubRepo,
    url: meta.html_url,
    homepage: meta.homepage || '',
    description: meta.description || '',
    visibility: meta.private ? 'private' : 'public',
    language: meta.language || '',
    stars: meta.stargazers_count || 0,
    forks: meta.forks_count || 0,
    openIssues: meta.open_issues_count || 0,
    defaultBranch: branch,
    pushedAt: meta.pushed_at || '',
    updatedAt: meta.updated_at || '',
    license: meta.license?.spdx_id || '',
    topics: meta.topics || [],
  };
}

await mkdir(readmesDir, { recursive: true });
await mkdir(dataDir, { recursive: true });

// Load the committed last-known-good snapshot so a transient GitHub outage or
// rate-limit does not wipe a project's metadata (the build is otherwise green
// but every project page silently loses its GitHub box + README). The synced
// files are committed to the repo, so this is a refresh, not a hard dependency.
let previous = { projects: [] };
try {
  previous = JSON.parse(await readFile(path.join(dataDir, 'github-projects.json'), 'utf8'));
} catch {
  // no prior snapshot (first run) — nothing to fall back to
}
const prevById = new Map((previous.projects || []).map((p) => [p.project, p]));

const files = (await readdir(projectsDir)).filter((file) => file.endsWith('.md'));
const metadata = [];
for (const file of files) {
  const id = file.replace(/\.mdx?$/, '').toLowerCase();
  try {
    const item = await syncProject(file);
    if (item) metadata.push(item);
  } catch (error) {
    console.warn(`[github-projects] Failed to sync ${file}: ${error.message}`);
    const prev = prevById.get(id);
    if (prev) {
      metadata.push(prev);
      console.warn(`[github-projects]   ↳ reused last-known-good metadata for ${id}`);
    }
  }
}

await writeFile(
  path.join(dataDir, 'github-projects.json'),
  JSON.stringify({ syncedAt: new Date().toISOString(), projects: metadata }, null, 2) + '\n',
  'utf8',
);

console.log(`[github-projects] synced ${metadata.length} GitHub-backed project(s)`);
