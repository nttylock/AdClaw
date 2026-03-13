/**
 * Remove background from cited-caps-colors
 */

import sharp from "sharp";
import { removeBackground } from "@imgly/background-removal-node";
import * as fs from "fs";
import * as path from "path";

const inputDir = path.join(process.cwd(), "public", "logo", "cited-caps-colors");
const outputDir = path.join(process.cwd(), "public", "logo", "cited-caps-transparent");

async function processFile(filename: string): Promise<boolean> {
  const inputPath = path.join(inputDir, filename);
  const baseName = filename.replace(".png", "");
  const outputPng = path.join(outputDir, `${baseName}.png`);
  const outputWebp = path.join(outputDir, `${baseName}.webp`);

  try {
    const result = await removeBackground(inputPath);
    const arrayBuffer = await result.arrayBuffer();
    const transparentBuffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(outputPng, transparentBuffer);

    const webpBuffer = await sharp(transparentBuffer)
      .webp({ quality: 90, lossless: false })
      .toBuffer();
    fs.writeFileSync(outputWebp, webpBuffer);
    return true;
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("=== Remove BG: Caps Colors ===\n");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const files = fs.readdirSync(inputDir).filter((f) => f.endsWith(".png"));
  console.log(`Found ${files.length} files\n`);

  let success = 0;
  for (const file of files) {
    process.stdout.write(`${file}... `);
    const ok = await processFile(file);
    if (ok) {
      console.log("✓");
      success++;
    } else {
      console.log("✗");
    }
  }

  console.log(`\n=== Done: ${success}/${files.length} ===`);
  console.log(`Output: ${outputDir}`);
}

main().catch(console.error);
