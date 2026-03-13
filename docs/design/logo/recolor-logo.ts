/**
 * Recolor a logo in multiple color variants
 * Usage: npx tsx docs/design/logo/recolor-logo.ts
 */

import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!apiKey) {
  console.error("Error: GOOGLE_GENERATIVE_AI_API_KEY not set");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

// Source logo
const SOURCE_LOGO = "public/logo/citedy-generated/concept-b1-modern-quote.png";

// Color variants (deduplicated)
const COLORS = [
  { id: "teal", name: "Transformative Teal", hex: "#008080" },
  { id: "olive", name: "Olive", hex: "#BAB86C" },
  { id: "terracotta", name: "Terracotta", hex: "#E2725B" },
  { id: "khaki", name: "Khaki", hex: "#F0E68C" },
  { id: "red", name: "Red", hex: "#FF0000" },
  { id: "orange", name: "Orange", hex: "#FFA500" },
  { id: "burgundy", name: "Burgundy", hex: "#800000" },
  { id: "purple", name: "Purple", hex: "#800080" },
  { id: "green", name: "Green", hex: "#008000" },
  { id: "yellow", name: "Yellow", hex: "#FFFF00" },
  { id: "caramel", name: "Caramel", hex: "#C68E17" },
  { id: "lavender", name: "Digital Lavender", hex: "#E6E6FA" },
  { id: "chilli-red", name: "Chilli Red", hex: "#FF2F00" },
  { id: "mustard", name: "Mustard Yellow", hex: "#E1AD01" },
];

function loadSourceImage(): { inlineData: { mimeType: string; data: string } } {
  const fullPath = path.join(process.cwd(), SOURCE_LOGO);
  if (!fs.existsSync(fullPath)) {
    console.error(`Source logo not found: ${fullPath}`);
    process.exit(1);
  }
  const data = fs.readFileSync(fullPath).toString("base64");
  return {
    inlineData: {
      mimeType: "image/png",
      data,
    },
  };
}

async function recolorLogo(
  sourceImage: { inlineData: { mimeType: string; data: string } },
  color: (typeof COLORS)[0]
): Promise<Buffer | null> {
  console.log(`\nGenerating: ${color.name} (${color.hex})...`);

  try {
    const contents: any[] = [
      sourceImage,
      {
        text: `This is a logo icon. Your task is to recreate this EXACT same design, but change the color.

CRITICAL REQUIREMENTS:
1. Keep the EXACT SAME shape, proportions, and design
2. Do NOT modify the shape in any way
3. Simply change the fill color to: ${color.hex} (${color.name})
4. Keep the clean white/light gray background
5. Output size: 1024x1024 pixels
6. The shape must be IDENTICAL to the reference image

Color to use: ${color.hex}
Just recolor, do not redesign.`,
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents,
      config: {
        responseModalities: ["Text", "Image"],
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.mimeType?.startsWith("image/")) {
          console.log(`  ✓ Generated ${color.id}`);
          return Buffer.from(part.inlineData.data, "base64");
        }
      }
    }

    const text = response.text;
    if (text) {
      console.log(`  ✗ No image. Response: ${text.substring(0, 150)}...`);
    }
    return null;
  } catch (error: any) {
    console.error(`  ✗ Error: ${error.message || error}`);
    return null;
  }
}

async function main() {
  console.log("=== Logo Recoloring ===\n");
  console.log(`Source: ${SOURCE_LOGO}`);
  console.log(`Colors: ${COLORS.length}\n`);

  // Load source
  const sourceImage = loadSourceImage();
  console.log("Source logo loaded\n");

  // Output directory
  const outputDir = path.join(
    process.cwd(),
    "public",
    "logo",
    "citedy-colors",
    "quote"
  );
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const results: { color: string; hex: string; success: boolean }[] = [];

  for (let i = 0; i < COLORS.length; i++) {
    const color = COLORS[i];

    const imageBuffer = await recolorLogo(sourceImage, color);

    if (imageBuffer) {
      const filename = `quote-${color.id}.png`;
      const filepath = path.join(outputDir, filename);
      fs.writeFileSync(filepath, imageBuffer);
      results.push({ color: color.name, hex: color.hex, success: true });
      console.log(`  Saved: ${filepath}`);
    } else {
      results.push({ color: color.name, hex: color.hex, success: false });
    }

    // Rate limiting
    if (i < COLORS.length - 1) {
      console.log("  Waiting 2s...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  // Summary
  console.log("\n=== Summary ===");
  const successCount = results.filter((r) => r.success).length;
  console.log(`Generated: ${successCount}/${COLORS.length}\n`);

  results.forEach((r) => {
    console.log(`${r.success ? "✓" : "✗"} ${r.color} (${r.hex})`);
  });

  console.log(`\nOutput: ${outputDir}`);
}

main().catch(console.error);
