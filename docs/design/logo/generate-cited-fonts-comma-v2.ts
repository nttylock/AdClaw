/**
 * Generate "Cited" + comma using:
 * - Comma reference from cited-black-red.png
 * - ACTUAL font references from citedy-transparent (black versions)
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

const COMMA_REF = "public/logo/cited-comma-low/cited-black-red.png";

// Use actual generated Citedy fonts as references
const FONT_REFS = [
  { id: "caps", file: "public/logo/citedy-transparent/citedy-caps-black.png" },
  { id: "light", file: "public/logo/citedy-transparent/citedy-light-black.png" },
  { id: "planar", file: "public/logo/citedy-transparent/citedy-planar-black.png" },
  { id: "regular", file: "public/logo/citedy-transparent/citedy-regular-black.png" },
  { id: "sectra", file: "public/logo/citedy-transparent/citedy-sectra-black.png" },
];

function loadImage(filepath: string): { inlineData: { mimeType: string; data: string } } | null {
  const fullPath = path.join(process.cwd(), filepath);
  if (!fs.existsSync(fullPath)) return null;
  const data = fs.readFileSync(fullPath).toString("base64");
  return { inlineData: { mimeType: "image/png", data } };
}

async function generateVariant(
  commaRef: { inlineData: { mimeType: string; data: string } },
  fontRef: { inlineData: { mimeType: string; data: string } },
  fontId: string
): Promise<Buffer | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        commaRef,
        fontRef,
        {
          text: `TWO REFERENCE IMAGES:

IMAGE 1: Shows "Cited" with a RED COMMA. This is the COMMA REFERENCE - copy the exact comma shape and its LOWERED position (sitting at letter height like "y", tail below baseline).

IMAGE 2: Shows "Citedy" in a specific FONT STYLE. This is the FONT REFERENCE - use this exact font style for the letters.

CREATE:
Write "Cited" (without the y) using the EXACT FONT from IMAGE 2, then add the RED COMMA from IMAGE 1.

Requirements:
- Font style: EXACTLY match IMAGE 2's letterforms
- Comma: EXACTLY match IMAGE 1's comma shape and position
- Text "Cited": BLACK (#1A1A1A)
- Comma: RED (#E74C3C)
- White background
- 2048x800 pixels

The result should look like "Cited" in the ${fontId} font + the lowered red comma.`,
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
  console.log("=== Cited + Comma (Real Fonts) ===\n");

  const commaRef = loadImage(COMMA_REF);
  if (!commaRef) {
    console.error("Comma reference not found!");
    process.exit(1);
  }
  console.log("Comma ref: ✓\n");

  const outputDir = path.join(process.cwd(), "public", "logo", "cited-fonts-comma-v2");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let count = 0;

  for (const font of FONT_REFS) {
    const fontRef = loadImage(font.file);
    if (!fontRef) {
      console.log(`Skip: ${font.id} - not found`);
      continue;
    }

    process.stdout.write(`${font.id}... `);

    const imageBuffer = await generateVariant(commaRef, fontRef, font.id);

    if (imageBuffer) {
      fs.writeFileSync(path.join(outputDir, `cited-${font.id}-comma.png`), imageBuffer);
      console.log("✓");
      count++;
    } else {
      console.log("✗");
    }

    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`\n=== Done: ${count}/${FONT_REFS.length} ===`);
  console.log(`Output: ${outputDir}`);
}

main().catch(console.error);
