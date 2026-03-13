/**
 * Generate CITEDY wordmark with symbol + text
 * Symbol: quote in Chilli Red / Red
 * Text: 4 color variants matching design style of minimal-c
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

// Reference images
const QUOTE_SYMBOL = "public/logo/citedy-colors/quote/quote-chilli-red.png";
const QUOTE_SYMBOL_RED = "public/logo/citedy-colors/quote/quote-red.png";
const TEXT_STYLE_REF = "public/logo/citedy-generated/concept-a1-minimal-c.png";

// Text colors
const TEXT_COLORS = [
  { id: "terracotta", name: "Terracotta", hex: "#E2725B" },
  { id: "olive", name: "Olive", hex: "#BAB86C" },
  { id: "khaki", name: "Khaki", hex: "#F0E68C" },
  { id: "mustard", name: "Mustard Yellow", hex: "#E1AD01" },
];

// Symbol colors
const SYMBOL_COLORS = [
  { id: "chilli-red", name: "Chilli Red", hex: "#FF2F00" },
  { id: "red", name: "Red", hex: "#FF0000" },
];

function loadImage(filepath: string): { inlineData: { mimeType: string; data: string } } | null {
  const fullPath = path.join(process.cwd(), filepath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`Not found: ${fullPath}`);
    return null;
  }
  const data = fs.readFileSync(fullPath).toString("base64");
  return { inlineData: { mimeType: "image/png", data } };
}

async function generateWordmark(
  symbolRef: { inlineData: { mimeType: string; data: string } },
  textStyleRef: { inlineData: { mimeType: string; data: string } },
  symbolColor: (typeof SYMBOL_COLORS)[0],
  textColor: (typeof TEXT_COLORS)[0]
): Promise<Buffer | null> {
  console.log(`\nGenerating: symbol ${symbolColor.id} + text ${textColor.id}...`);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        symbolRef,
        textStyleRef,
        {
          text: `Create a professional logo combining a symbol and text "CITEDY".

LAYOUT:
- Symbol (quotation marks from first image) on the LEFT
- Text "CITEDY" on the RIGHT of symbol
- Horizontally aligned, centered vertically
- Symbol and text should be proportional (symbol height = text cap height)

SYMBOL:
- Use the exact quotation mark design from the first reference image
- Color: ${symbolColor.hex} (${symbolColor.name})

TEXT "CITEDY":
- Use clean, minimal sans-serif font similar to the second reference image style
- Font weight: Medium to Bold
- Letter spacing: Normal to slightly tracked
- Color: ${textColor.hex} (${textColor.name})
- All caps: CITEDY

STYLE:
- Clean white background
- Modern tech startup aesthetic
- Professional, minimal
- 1024x512 pixels (horizontal)
- High contrast, sharp edges

Generate the complete logo with symbol + text side by side.`,
        },
      ],
      config: { responseModalities: ["Text", "Image"] },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.mimeType?.startsWith("image/")) {
          console.log(`  ✓ Generated`);
          return Buffer.from(part.inlineData.data, "base64");
        }
      }
    }
    console.log(`  ✗ No image generated`);
    return null;
  } catch (error: any) {
    console.error(`  ✗ Error: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log("=== CITEDY Wordmark Generator ===\n");

  // Load references
  const quoteChilli = loadImage(QUOTE_SYMBOL);
  const quoteRed = loadImage(QUOTE_SYMBOL_RED);
  const textStyle = loadImage(TEXT_STYLE_REF);

  if (!quoteChilli || !quoteRed || !textStyle) {
    console.error("Failed to load reference images");
    process.exit(1);
  }

  // Output directory
  const outputDir = path.join(process.cwd(), "public", "logo", "citedy-wordmark");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const results: { filename: string; success: boolean }[] = [];

  // Generate all combinations
  for (const symbolColor of SYMBOL_COLORS) {
    const symbolRef = symbolColor.id === "chilli-red" ? quoteChilli : quoteRed;

    for (const textColor of TEXT_COLORS) {
      const imageBuffer = await generateWordmark(symbolRef, textStyle, symbolColor, textColor);

      const filename = `citedy-${symbolColor.id}-${textColor.id}.png`;
      if (imageBuffer) {
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, imageBuffer);
        results.push({ filename, success: true });
        console.log(`  Saved: ${filepath}`);
      } else {
        results.push({ filename, success: false });
      }

      // Rate limiting
      await new Promise((r) => setTimeout(r, 2500));
    }
  }

  // Summary
  console.log("\n=== Summary ===");
  const success = results.filter((r) => r.success).length;
  console.log(`Generated: ${success}/${results.length}\n`);

  results.forEach((r) => {
    console.log(`${r.success ? "✓" : "✗"} ${r.filename}`);
  });

  console.log(`\nOutput: ${outputDir}`);
}

main().catch(console.error);
