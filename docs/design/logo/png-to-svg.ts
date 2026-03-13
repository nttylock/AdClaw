/**
 * Convert PNG to SVG using potrace
 * For multi-color images, we need to trace each color separately
 */

import * as potrace from "potrace";
import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";

const inputFile = "public/logo/cited-caps-2x/cited-mustard-comma.png";
const outputDir = "public/logo/cited-svg";

async function extractColorChannel(
  inputPath: string,
  targetColor: { r: number; g: number; b: number },
  tolerance: number = 50
): Promise<Buffer> {
  const image = sharp(inputPath);
  const { data, info } = await image.raw().ensureAlpha().toBuffer({ resolveWithObject: true });

  // Create a new buffer for the mask
  const mask = Buffer.alloc(info.width * info.height);

  for (let i = 0; i < info.width * info.height; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const a = data[i * 4 + 3];

    // Check if pixel matches target color within tolerance
    const matches =
      a > 128 &&
      Math.abs(r - targetColor.r) < tolerance &&
      Math.abs(g - targetColor.g) < tolerance &&
      Math.abs(b - targetColor.b) < tolerance;

    mask[i] = matches ? 0 : 255; // 0 = black (will be traced), 255 = white
  }

  return sharp(mask, { raw: { width: info.width, height: info.height, channels: 1 } })
    .png()
    .toBuffer();
}

function traceToSvgPath(pngBuffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    potrace.trace(pngBuffer, { threshold: 128 }, (err: Error | null, svg: string) => {
      if (err) reject(err);
      else resolve(svg);
    });
  });
}

async function main() {
  console.log("=== PNG to SVG ===\n");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const inputPath = path.join(process.cwd(), inputFile);

  // Colors in the logo
  const mustardColor = { r: 225, g: 173, b: 1 }; // #E1AD01
  const redColor = { r: 231, g: 76, b: 60 }; // #E74C3C

  console.log("Extracting mustard text...");
  const mustardMask = await extractColorChannel(inputPath, mustardColor, 80);
  fs.writeFileSync(path.join(outputDir, "mustard-mask.png"), mustardMask);

  console.log("Extracting red comma...");
  const redMask = await extractColorChannel(inputPath, redColor, 80);
  fs.writeFileSync(path.join(outputDir, "red-mask.png"), redMask);

  console.log("Tracing mustard...");
  const mustardSvg = await traceToSvgPath(mustardMask);

  console.log("Tracing red...");
  const redSvg = await traceToSvgPath(redMask);

  // Extract paths from SVGs
  const mustardPathMatch = mustardSvg.match(/<path[^>]*d="([^"]+)"/);
  const redPathMatch = redSvg.match(/<path[^>]*d="([^"]+)"/);

  // Get dimensions
  const widthMatch = mustardSvg.match(/width="(\d+)"/);
  const heightMatch = mustardSvg.match(/height="(\d+)"/);
  const width = widthMatch ? widthMatch[1] : "2944";
  const height = heightMatch ? heightMatch[1] : "1408";

  // Create combined SVG
  const combinedSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <!-- Mustard text "Cited" -->
  <path fill="#E1AD01" d="${mustardPathMatch ? mustardPathMatch[1] : ""}"/>
  <!-- Red comma -->
  <path fill="#E74C3C" d="${redPathMatch ? redPathMatch[1] : ""}"/>
</svg>`;

  const outputPath = path.join(outputDir, "cited-mustard-comma.svg");
  fs.writeFileSync(outputPath, combinedSvg);

  console.log(`\n✓ Saved: ${outputPath}`);

  // Also save individual SVGs
  fs.writeFileSync(path.join(outputDir, "mustard-text.svg"), mustardSvg.replace('fill="#000000"', 'fill="#E1AD01"'));
  fs.writeFileSync(path.join(outputDir, "red-comma.svg"), redSvg.replace('fill="#000000"', 'fill="#E74C3C"'));

  console.log("✓ Individual SVGs saved");
  console.log(`\nOutput: ${outputDir}`);
}

main().catch(console.error);
