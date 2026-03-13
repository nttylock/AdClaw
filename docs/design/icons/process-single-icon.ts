/**
 * Process a single icon: remove background and convert to WebP
 * Usage: npx tsx scripts/process-single-icon.ts <icon-name>
 * Example: npx tsx scripts/process-single-icon.ts header-dashboard-autopilot
 */

import sharp from "sharp";
import { removeBackground } from "@imgly/background-removal-node";
import * as fs from "fs";
import * as path from "path";

const iconsDir = path.join(process.cwd(), "public", "new-icons");

async function processIcon(iconName: string): Promise<void> {
  const pngFile = `${iconName}.png`;
  const webpFile = `${iconName}.webp`;

  const inputPath = path.join(iconsDir, pngFile);
  const outputPath = path.join(iconsDir, webpFile);

  console.log(`🔄 Processing: ${iconName}`);
  console.log(`Input: ${inputPath}`);
  console.log(`Output: ${outputPath}\n`);

  // Check if PNG file exists
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Error: PNG file not found: ${inputPath}`);
    process.exit(1);
  }

  try {
    // Step 1: Remove background
    console.log("Step 1: Removing background...");
    const result = await removeBackground(inputPath);
    const arrayBuffer = await result.arrayBuffer();
    const transparentBuffer = Buffer.from(arrayBuffer);

    console.log(`✓ Background removed (${transparentBuffer.length} bytes)`);

    // Step 2: Convert to WebP
    console.log("Step 2: Converting to WebP...");
    const webpBuffer = await sharp(transparentBuffer)
      .webp({
        quality: 85, // Good quality for icons
        lossless: false, // Lossy compression for better size reduction
        effort: 6, // Higher effort for better compression
      })
      .toBuffer();

    // Save WebP file
    fs.writeFileSync(outputPath, webpBuffer);

    // Calculate savings
    const originalSize = fs.readFileSync(inputPath).length;
    const webpSize = webpBuffer.length;
    const reductionPercent = (
      ((originalSize - webpSize) / originalSize) *
      100
    ).toFixed(1);

    console.log(`✓ Converted to WebP (${webpBuffer.length} bytes)`);
    console.log(
      `📊 Size reduction: ${originalSize} → ${webpSize} bytes (${reductionPercent}% reduction)`,
    );
  } catch (error: any) {
    console.error(`❌ Error processing icon: ${error.message || error}`);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error(
      "❌ Usage: npx tsx scripts/process-single-icon.ts <icon-name>",
    );
    console.error(
      "Example: npx tsx scripts/process-single-icon.ts header-dashboard-autopilot",
    );
    process.exit(1);
  }

  const iconName = args[0];

  console.log("=== Processing Single Icon ===\n");

  await processIcon(iconName);

  console.log("\n✅ Icon processed successfully!");
  console.log(`📁 Location: /public/new-icons/${iconName}.webp`);
}

main().catch(console.error);
