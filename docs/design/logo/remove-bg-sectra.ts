/**
 * Remove background from sectra files only
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
    console.error(`  Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("=== Remove BG from Sectra ===\n");

  const files = fs.readdirSync(inputDir).filter((f) => f.includes("sectra") && f.endsWith(".png"));
  console.log(`Found ${files.length} sectra files\n`);

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
}

main().catch(console.error);
