/**
 * Generate "Cited" + comma positioned LOWER like letter "y"
 * Comma top aligns with x-height, tail descends below baseline
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

const VARIANTS = [
  { id: "black-terracotta", textColor: "#1A1A1A", textName: "black", commaColor: "#E2725B", commaName: "terracotta/coral" },
  { id: "black-red", textColor: "#1A1A1A", textName: "black", commaColor: "#E74C3C", commaName: "red" },
  { id: "khaki-terracotta", textColor: "#C4B454", textName: "khaki/gold", commaColor: "#E2725B", commaName: "terracotta" },
  { id: "khaki-red", textColor: "#C4B454", textName: "khaki/gold", commaColor: "#E74C3C", commaName: "red" },
];

async function generateVariant(variant: (typeof VARIANTS)[0]): Promise<Buffer | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        {
          text: `Create a logo: "Cited" followed by a COMMA symbol.

CRITICAL POSITIONING of the comma:
- The comma is NOT at quotation mark height (top of letters)
- The comma is LOWERED so its TOP aligns with the x-height (top of lowercase letters like "i", "t", "e", "d")
- The comma's TAIL descends BELOW the baseline (like letters y, g, p have descenders)
- This makes the comma visually sit like the letter "y" would

Think of it: if you replaced the comma with letter "y", they would occupy the same vertical space.

Design:
- Font: Bold modern sans-serif (like the word "Cited" in the reference)
- "Cited" color: ${variant.textColor} (${variant.textName})
- Comma color: ${variant.commaColor} (${variant.commaName})
- Comma shape: Large, bold, rounded quotation mark / comma shape
- Comma position: TOP of comma at x-height level, TAIL below baseline
- Background: White
- Size: 2048x800 pixels

The comma should look like it's sitting on the baseline with a descender, NOT floating at cap height.`,
        },
      ],
      config: { responseModalities: ["Text", "Image"] },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.mimeType?.startsWith("image/")) {
          return Buffer.from(part.inlineData.data, "base64");
        }
      }
    }
    return null;
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log("=== Cited + Lowered Comma ===\n");

  const outputDir = path.join(process.cwd(), "public", "logo", "cited-comma-low");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let count = 0;

  for (const variant of VARIANTS) {
    process.stdout.write(`${variant.id}... `);

    const imageBuffer = await generateVariant(variant);

    if (imageBuffer) {
      fs.writeFileSync(path.join(outputDir, `cited-${variant.id}.png`), imageBuffer);
      console.log("✓");
      count++;
    } else {
      console.log("✗");
    }

    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`\n=== Done: ${count}/${VARIANTS.length} ===`);
  console.log(`Output: ${outputDir}`);
}

main().catch(console.error);
