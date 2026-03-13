/**
 * Generate missing fonts: regular + sectra
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

const FONT_REFS = [
  { id: "regular", file: "public/logo/citedy-transparent/citedy-regular-black.png" },
  { id: "sectra", file: "public/logo/citedy-final/citedy-sectra-black.png" },
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
          text: `TWO REFERENCES:

IMAGE 1: "Cited" + RED COMMA - copy the COMMA shape and LOWERED position exactly.

IMAGE 2: "Citedy" font - use this EXACT FONT STYLE for letters.

CREATE:
"Cited" in the font from IMAGE 2 + red comma from IMAGE 1.

- Match font exactly from IMAGE 2
- Match comma shape/position from IMAGE 1
- Text: BLACK (#1A1A1A)
- Comma: RED (#E74C3C)
- White bg, 2048x800`,
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
  console.log("=== Add Missing Fonts ===\n");

  const commaRef = loadImage(COMMA_REF);
  if (!commaRef) {
    console.error("Comma ref not found!");
    process.exit(1);
  }

  const outputDir = path.join(process.cwd(), "public", "logo", "cited-fonts-comma-v2");

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
    } else {
      console.log("✗");
    }

    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log("\n=== Done ===");
}

main().catch(console.error);
