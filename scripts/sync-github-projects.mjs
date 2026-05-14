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

function isAbsoluteOrSpecialUrl(url) {
  return /^(?:[a-z][a-z0-9+.-]*:|#)/i.test(url.trim());
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
      rewriteMarkdownUrls(
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

await mkdir(readmesDir, { recursive: true });
await mkdir(dataDir, { recursive: true });

const files = (await readdir(projectsDir)).filter((file) => file.endsWith('.md'));
const metadata = [];
for (const file of files) {
  try {
    const item = await syncProject(file);
    if (item) metadata.push(item);
  } catch (error) {
    console.warn(`[github-projects] Failed to sync ${file}: ${error.message}`);
  }
}

await writeFile(
  path.join(dataDir, 'github-projects.json'),
  JSON.stringify({ syncedAt: new Date().toISOString(), projects: metadata }, null, 2) + '\n',
  'utf8',
);

console.log(`[github-projects] synced ${metadata.length} GitHub-backed project(s)`);
