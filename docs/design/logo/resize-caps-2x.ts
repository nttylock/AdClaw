/**
 * Resize cited-caps-transparent images x2
 */

import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";

const inputDir = path.join(process.cwd(), "public", "logo", "cited-caps-transparent");
const outputDir = path.join(process.cwd(), "public", "logo", "cited-caps-2x");

async function main() {
  console.log("=== Resize x2 ===\n");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const files = fs.readdirSync(inputDir).filter((f) => f.endsWith(".png"));
  console.log(`Found ${files.length} PNG files\n`);

  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const baseName = file.replace(".png", "");

    process.stdout.write(`${file}... `);

    const metadata = await sharp(inputPath).metadata();
    const newWidth = (metadata.width || 1024) * 2;

    // Resize PNG
    const resizedPng = await sharp(inputPath)
      .resize(newWidth, null, { kernel: "lanczos3" })
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(outputDir, `${baseName}.png`), resizedPng);

    // Also create WebP
    const resizedWebp = await sharp(resizedPng)
      .webp({ quality: 90 })
      .toBuffer();
    fs.writeFileSync(path.join(outputDir, `${baseName}.webp`), resizedWebp);

    const finalMeta = await sharp(resizedPng).metadata();
    console.log(`✓ ${finalMeta.width}x${finalMeta.height}`);
  }

  console.log(`\n=== Done ===`);
  console.log(`Output: ${outputDir}`);
}

main().catch(console.error);
