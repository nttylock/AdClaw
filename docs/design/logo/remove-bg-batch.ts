/**
 * Remove background from all PNG files in citedy-final folder
 */

import sharp from "sharp";
import { removeBackground } from "@imgly/background-removal-node";
import * as fs from "fs";
import * as path from "path";

const inputDir = path.join(process.cwd(), "public", "logo", "citedy-final");
const outputDir = path.join(process.cwd(), "public", "logo", "citedy-transparent");

async function processFile(filename: string): Promise<boolean> {
  const inputPath = path.join(inputDir, filename);
  const baseName = filename.replace(".png", "");
  const outputPng = path.join(outputDir, `${baseName}.png`);
  const outputWebp = path.join(outputDir, `${baseName}.webp`);

  try {
    // Remove background
    const result = await removeBackground(inputPath);
    const arrayBuffer = await result.arrayBuffer();
    const transparentBuffer = Buffer.from(arrayBuffer);

    // Save transparent PNG
    fs.writeFileSync(outputPng, transparentBuffer);

    // Convert to WebP
    const webpBuffer = await sharp(transparentBuffer)
      .webp({ quality: 90, lossless: false })
      .toBuffer();
    fs.writeFileSync(outputWebp, webpBuffer);

    return true;
  } catch (error: any) {
    console.error(`  Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("=== Remove Background Batch ===\n");

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Get all PNG files
  const files = fs.readdirSync(inputDir).filter((f) => f.endsWith(".png"));
  console.log(`Found ${files.length} PNG files\n`);

  let success = 0;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    process.stdout.write(`[${i + 1}/${files.length}] ${file}... `);

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
