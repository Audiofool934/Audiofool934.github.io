import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { AUDIO_IMAGE_PREFIX, AUDIO_IMAGE_WIDTHS, audioImageVariantPath } from "../src/utils/audioImages.mjs";

const publicDir = path.join(process.cwd(), "public");
const sourceRoot = path.join(publicDir, AUDIO_IMAGE_PREFIX.slice(1));
const outputRoot = path.join(sourceRoot, "_generated");
const widths = AUDIO_IMAGE_WIDTHS;
const generatorInputs = [import.meta.url, new URL("../src/utils/audioImages.mjs", import.meta.url)];
const generatorMtime = Math.max(...await Promise.all(
  generatorInputs.map(async (url) => (await fs.stat(fileURLToPath(url))).mtimeMs),
));
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
  const relative = path.relative(sourceRoot, sourcePath).split(path.sep).join("/");
  return path.join(publicDir, audioImageVariantPath(`${AUDIO_IMAGE_PREFIX}${relative}`, width).slice(1));
}

async function isFresh(sourcePath, outputPath) {
  try {
    const [sourceStat, outputStat] = await Promise.all([
      fs.stat(sourcePath),
      fs.stat(outputPath),
    ]);
    return outputStat.mtimeMs >= Math.max(sourceStat.mtimeMs, generatorMtime);
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
      const relative = path.parse(path.relative(sourceRoot, sourcePath));
      const stalePath = path.join(outputRoot, relative.dir, `${relative.name}-${width}.webp`);
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
