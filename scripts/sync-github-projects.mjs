import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmFromMarkdown, gfmToMarkdown } from 'mdast-util-gfm';
import { toMarkdown } from 'mdast-util-to-markdown';
import { gfm } from 'micromark-extension-gfm';
import sanitizeHtml from 'sanitize-html';

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

const markdownParseOptions = {
  extensions: [gfm()],
  mdastExtensions: [gfmFromMarkdown()],
};

const markdownStringifyOptions = {
  extensions: [gfmToMarkdown()],
};

const readmeHtmlSanitizeOptions = {
  allowedTags: [
    ...sanitizeHtml.defaults.allowedTags,
    'br',
    'details',
    'summary',
    'img',
    'picture',
    'source',
    'kbd',
    'sub',
    'sup',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
  ],
  allowedAttributes: {
    a: ['href', 'name', 'target', 'title', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'decoding', 'referrerpolicy'],
    source: ['src', 'srcset', 'type', 'media'],
    details: ['open'],
    th: ['align'],
    td: ['align'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {
    img: ['http', 'https'],
    source: ['http', 'https'],
  },
  allowProtocolRelative: false,
};

function visitMarkdown(node, visitor) {
  visitor(node);
  if (!node || !Array.isArray(node.children)) return;
  for (const child of node.children) visitMarkdown(child, visitor);
}

function isAbsoluteOrSpecialUrl(url) {
  return /^(?:[a-z][a-z0-9+.-]*:|#)/i.test(url.trim());
}

// javascript:/vbscript:/non-image data: URLs execute or smuggle script when a
// visitor clicks them. Astro's markdown renderer does NOT sanitize these, so we
// neutralize them at the URL-resolution layer. Markdown is parsed before this
// runs, so entity variants such as jav&#x61;script: have already been decoded.
function sanitizeReadmeUrl(url, kind) {
  const trimmed = String(url || '').trim();
  if (!trimmed) return '';

  const compact = trimmed.replace(/[\u0000-\u001F\u007F\s]+/g, '');
  const colon = compact.indexOf(':');
  const slash = compact.indexOf('/');
  const questionMark = compact.indexOf('?');
  const numberSign = compact.indexOf('#');
  const hasProtocol =
    colon > -1 &&
    (slash < 0 || colon < slash) &&
    (questionMark < 0 || colon < questionMark) &&
    (numberSign < 0 || colon < numberSign);

  if (!hasProtocol) return trimmed;

  const protocol = compact.slice(0, colon).toLowerCase();
  const allowed = kind === 'asset' ? ['http', 'https'] : ['http', 'https', 'mailto'];
  return allowed.includes(protocol) ? trimmed : '#';
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
  const trimmed = sanitizeReadmeUrl(url, kind);
  if (!trimmed || isAbsoluteOrSpecialUrl(trimmed)) return trimmed;

  const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/`;
  const blobBase = `https://github.com/${owner}/${repo}/blob/${branch}/`;
  const baseDir = trimmed.startsWith('/') ? '' : readmeDir;
  const repoPath = path.posix.normalize(path.posix.join(baseDir, trimmed.replace(/^\//, '')));
  const encoded = encodeRepoPath(repoPath.replace(/^\.\//, ''));
  return (kind === 'asset' ? rawBase : blobBase) + encoded;
}

function rewriteRawHtmlUrls(html, owner, repo, branch, baseDir) {
  return html
    .replace(/(<img\b[^>]*\bsrc\s*=\s*)(["'])([^"']+)(\2)/gi, (full, prefix, quote, src, suffix) => {
      const target = resolveRepoUrl(src, owner, repo, branch, baseDir, 'asset');
      return target === src ? full : `${prefix}${quote}${target}${suffix}`;
    })
    .replace(/(<source\b[^>]*\bsrc\s*=\s*)(["'])([^"']+)(\2)/gi, (full, prefix, quote, src, suffix) => {
      const target = resolveRepoUrl(src, owner, repo, branch, baseDir, 'asset');
      return target === src ? full : `${prefix}${quote}${target}${suffix}`;
    })
    .replace(/(<source\b[^>]*\bsrcset\s*=\s*)(["'])([^"']+)(\2)/gi, (_full, prefix, quote, srcset, suffix) => {
      const rewritten = srcset
        .split(',')
        .map((item) => {
          const [src, ...descriptor] = item.trim().split(/\s+/);
          const target = resolveRepoUrl(src, owner, repo, branch, baseDir, 'asset');
          return [target, ...descriptor].join(' ');
        })
        .join(', ');
      return `${prefix}${quote}${rewritten}${suffix}`;
    })
    .replace(/(<a\b[^>]*\bhref\s*=\s*)(["'])([^"']+)(\2)/gi, (full, prefix, quote, href, suffix) => {
      const target = resolveRepoUrl(href, owner, repo, branch, baseDir, 'link');
      return target === href ? full : `${prefix}${quote}${target}${suffix}`;
    })
    // Full-resolution README screenshots are fetched cross-origin from GitHub
    // and sit below the fold; lazy-load + async-decode them so they never block
    // first paint of the project page.
    .replace(/<img\b(?![^>]*\sloading=)([^>]*?)>/gi, '<img loading="lazy"$1>')
    .replace(/<img\b(?![^>]*\sdecoding=)([^>]*?)>/gi, '<img decoding="async"$1>')
    .replace(/<img\b(?=[^>]*\ssrc=(["'])https?:\/\/)(?![^>]*\sreferrerpolicy=)([^>]*?)>/gi, '<img referrerpolicy="no-referrer"$2>');
}

function rewriteAndSanitizeReadmeMarkdown(markdown, owner, repo, branch, readmePath = 'README.md') {
  const readmeDir = path.posix.dirname(readmePath);
  const baseDir = readmeDir === '.' ? '' : readmeDir;
  const tree = fromMarkdown(markdown, markdownParseOptions);

  visitMarkdown(tree, (node) => {
    if (node.type === 'link' || node.type === 'definition') {
      node.url = resolveRepoUrl(node.url, owner, repo, branch, baseDir, 'link');
    } else if (node.type === 'image') {
      node.url = resolveRepoUrl(node.url, owner, repo, branch, baseDir, 'asset');
    } else if (node.type === 'html') {
      const cleaned = sanitizeHtml(node.value, readmeHtmlSanitizeOptions);
      const rewritten = rewriteRawHtmlUrls(cleaned, owner, repo, branch, baseDir);
      node.value = sanitizeHtml(rewritten, readmeHtmlSanitizeOptions);
    }
  });

  return toMarkdown(tree, markdownStringifyOptions);
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
      rewriteAndSanitizeReadmeMarkdown(
        stripReadmeFrontmatter(readmeMarkdown.body),
        owner,
        repo,
        branch,
        readmeMarkdown.path,
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

async function main() {
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
}

export { rewriteAndSanitizeReadmeMarkdown, sanitizeReadmeUrl };

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  // Best-effort: a transient GitHub outage must never fail the deploy build.
  // Per-repo failures already fall back to the committed snapshot; this guards
  // against any unexpected top-level error so the build proceeds regardless.
  main().catch((error) => {
    console.warn(`[github-projects] sync skipped: ${error.message}`);
  });
}
