import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const publicDir = path.join(process.cwd(), "public");
const outputRoot = path.join(publicDir, "images/_generated/site");

const variants = [
  {
    source: path.join(publicDir, "images/BG.webp"),
    name: "BG",
    widths: [480, 960, 1280],
    quality: 74,
  },
  {
    source: path.join(publicDir, "images/audiofool-seal.webp"),
    name: "audiofool-seal",
    widths: [112],
    quality: 82,
  },
  {
    source: path.join(publicDir, "muse/muse.png"),
    outputDir: path.join(publicDir, "muse/_generated"),
    name: "muse-logo",
    widths: [240],
    quality: 82,
  },
  {
    source: path.join(publicDir, "muse/pipeline.png"),
    outputDir: path.join(publicDir, "muse/_generated"),
    name: "pipeline",
    widths: [720, 1200],
    quality: 78,
  },
  {
    source: path.join(publicDir, "muse/2D Density Heatmap.png"),
    outputDir: path.join(publicDir, "muse/_generated"),
    name: "latent-density",
    widths: [480, 800],
    quality: 78,
  },
];

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
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

async function generateVariant({ source, outputDir, name, quality }, width) {
  if (!(await exists(source))) {
    throw new Error(`Missing source image: ${source}`);
  }

  const outputPath = path.join(outputDir || outputRoot, `${name}-${width}.webp`);
  if (await isFresh(source, outputPath)) return false;

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await sharp(source)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toFile(outputPath);
  return true;
}

async function main() {
  let written = 0;
  for (const variant of variants) {
    for (const width of variant.widths) {
      if (await generateVariant(variant, width)) written += 1;
    }
  }

  console.log(`[site-images] ${written} generated variant(s) updated`);
}

main().catch((error) => {
  console.error("[site-images] failed", error);
  process.exit(1);
});
