import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const publicDir = path.join(process.cwd(), "public");
const sourceRoot = path.join(publicDir, "images/audioshow");
const outputRoot = path.join(sourceRoot, "_generated");
const widths = [96, 320];
const workerCount = Math.max(2, Math.min(8, Number(process.env.AUDIOSHOW_IMAGE_WORKERS) || 6));
const sourceExts = new Set([".webp", ".jpg", ".jpeg", ".png"]);

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function listImages(dir) {
  if (!(await exists(dir))) return [];

  const images = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "_generated") continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      images.push(...(await listImages(fullPath)));
    } else if (
      entry.isFile() &&
      !entry.name.endsWith("-og.jpg") &&
      sourceExts.has(path.extname(entry.name).toLowerCase())
    ) {
      images.push(fullPath);
    }
  }
  return images;
}

function outputPathFor(sourcePath, width) {
  const relative = path.relative(sourceRoot, sourcePath);
  const parsed = path.parse(relative);
  return path.join(outputRoot, parsed.dir, `${parsed.name}-${width}.webp`);
}

async function isFresh(sourcePath, outputPath) {
  try {
    const [sourceStat, outputStat] = await Promise.all([
      fs.stat(sourcePath),
      fs.stat(outputPath),
    ]);
    return outputStat.mtimeMs >= sourceStat.mtimeMs;
  } catch {
    return false;
  }
}

async function generateVariant(sourcePath, width) {
  const outputPath = outputPathFor(sourcePath, width);
  if (await isFresh(sourcePath, outputPath)) return false;

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await sharp(sourcePath)
    .rotate()
    .resize({
      width,
      height: width,
      fit: "cover",
      withoutEnlargement: true,
    })
    .webp({ quality: width <= 96 ? 68 : 74, effort: 4 })
    .toFile(outputPath);
  return true;
}

async function main() {
  const sources = await listImages(sourceRoot);
  let written = 0;
  let cursor = 0;
  const tasks = sources.flatMap((sourcePath) =>
    widths.map((width) => ({ sourcePath, width })),
  );

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (cursor < tasks.length) {
        const task = tasks[cursor++];
        if (await generateVariant(task.sourcePath, task.width)) written += 1;
      }
    }),
  );

  for (const sourcePath of sources) {
    for (const width of [640]) {
      const stalePath = outputPathFor(sourcePath, width);
      if (await exists(stalePath)) {
        await fs.rm(stalePath);
      }
    }
  }

  console.log(
    `[audioshow-images] ${sources.length} source image(s), ${written} generated variant(s) updated`,
  );
}

main().catch((error) => {
  console.error("[audioshow-images] failed", error);
  process.exit(1);
});
