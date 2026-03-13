/**
 * Convert all header icons from PNG to WebP format
 * Uses sharp for optimal compression and quality
 */

import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";

const iconsDir = path.join(process.cwd(), "public", "new-icons");

async function convertToWebP(
  inputPath: string,
  outputPath: string,
): Promise<{ originalSize: number; webpSize: number }> {
  const originalBuffer = fs.readFileSync(inputPath);
  const originalSize = originalBuffer.length;

  // Convert to WebP with high quality and lossless compression
  const webpBuffer = await sharp(originalBuffer)
    .webp({
      quality: 85, // Good quality for icons
      lossless: false, // Lossy compression for better size reduction
      effort: 6, // Higher effort for better compression
    })
    .toBuffer();

  fs.writeFileSync(outputPath, webpBuffer);

  return {
    originalSize,
    webpSize: webpBuffer.length,
  };
}

async function convertAllIcons(): Promise<void> {
  console.log("🚀 Converting header icons to WebP format...\n");

  const pngFiles = fs
    .readdirSync(iconsDir)
    .filter((file) => file.endsWith(".png") && file.startsWith("header-"))
    .sort();

  console.log(`Found ${pngFiles.length} PNG icons to convert:\n`);

  let totalOriginalSize = 0;
  let totalWebPSize = 0;
  const results: Array<{
    name: string;
    original: number;
    webp: number;
    reduction: string;
  }> = [];

  for (const pngFile of pngFiles) {
    const baseName = pngFile.replace(".png", "");
    const webpFile = `${baseName}.webp`;

    const inputPath = path.join(iconsDir, pngFile);
    const outputPath = path.join(iconsDir, webpFile);

    console.log(`Converting: ${pngFile} → ${webpFile}`);

    try {
      const { originalSize, webpSize } = await convertToWebP(
        inputPath,
        outputPath,
      );

      const reductionPercent = (
        ((originalSize - webpSize) / originalSize) *
        100
      ).toFixed(1);
      const reduction = `${originalSize} → ${webpSize} bytes (${reductionPercent}% reduction)`;

      console.log(`  ✓ ${reduction}\n`);

      totalOriginalSize += originalSize;
      totalWebPSize += webpSize;

      results.push({
        name: baseName,
        original: originalSize,
        webp: webpSize,
        reduction: `${reductionPercent}%`,
      });
    } catch (error: any) {
      console.error(`  ✗ Failed to convert ${pngFile}: ${error.message}\n`);
    }
  }

  // Print summary
  const totalReduction = (
    ((totalOriginalSize - totalWebPSize) / totalOriginalSize) *
    100
  ).toFixed(1);
  const totalReductionBytes = totalOriginalSize - totalWebPSize;

  console.log("📊 Conversion Summary:");
  console.log("=".repeat(50));
  console.log(`Total icons converted: ${results.length}`);
  console.log(
    `Total original size: ${(totalOriginalSize / 1024).toFixed(1)} KB`,
  );
  console.log(`Total WebP size: ${(totalWebPSize / 1024).toFixed(1)} KB`);
  console.log(
    `Space saved: ${(totalReductionBytes / 1024).toFixed(1)} KB (${totalReduction}% reduction)`,
  );
  console.log(
    `Average WebP size: ${(totalWebPSize / results.length / 1024).toFixed(1)} KB per icon`,
  );
  console.log("\nDetailed results:");

  results.forEach((result) => {
    console.log(
      `  ${result.name}: ${(result.original / 1024).toFixed(1)}KB → ${(result.webp / 1024).toFixed(1)}KB (${result.reduction})`,
    );
  });

  console.log("\n✅ All header icons converted to WebP successfully!");
  console.log(`📁 Location: /public/new-icons/`);
}

convertAllIcons().catch(console.error);
