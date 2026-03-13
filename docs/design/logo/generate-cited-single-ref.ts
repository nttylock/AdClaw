/**
 * Generate "Cited" + comma using SINGLE font reference at a time
 * More explicit prompting to force font matching
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

const FONT_REFS = [
  { id: "caps", file: "public/logo/citedy-transparent/citedy-caps-black.png", desc: "ALL CAPS bold geometric" },
  { id: "light", file: "public/logo/citedy-transparent/citedy-light-black.png", desc: "thin/light weight" },
  { id: "planar", file: "public/logo/citedy-transparent/citedy-planar-black.png", desc: "geometric monospace-like" },
  { id: "regular", file: "public/logo/citedy-transparent/citedy-regular-black.png", desc: "regular weight sans-serif" },
  { id: "sectra", file: "public/logo/citedy-final/citedy-sectra-black.png", desc: "italic serif" },
];

function loadImage(filepath: string): { inlineData: { mimeType: string; data: string } } | null {
  const fullPath = path.join(process.cwd(), filepath);
  if (!fs.existsSync(fullPath)) return null;
  const data = fs.readFileSync(fullPath).toString("base64");
  return { inlineData: { mimeType: "image/png", data } };
}

async function generateVariant(
  fontRef: { inlineData: { mimeType: string; data: string } },
  font: (typeof FONT_REFS)[0]
): Promise<Buffer | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        fontRef,
        {
          text: `This image shows "Citedy" written in a specific font style (${font.desc}).

YOUR TASK: Write "Cited" (without the Y) in THIS EXACT SAME FONT, then add a large red comma after it.

FONT REQUIREMENTS - MUST MATCH THE IMAGE:
- Same letter shapes as the image
- Same stroke weight/thickness
- Same proportions
- Same style (${font.desc})

COMMA REQUIREMENTS:
- Large bold comma shape (like a quotation mark)
- Position: LOWERED - top of comma at x-height level (same as top of lowercase letters)
- Comma tail descends below the text baseline
- Color: RED (#E74C3C)

OUTPUT:
- "Cited" in BLACK using the EXACT font from the reference image
- Red comma positioned like letter "y" would be
- White background
- 2048x800 pixels

The font MUST match the reference image exactly - ${font.desc} style.`,
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
  console.log("=== Cited + Comma (Single Ref) ===\n");

  const outputDir = path.join(process.cwd(), "public", "logo", "cited-single-ref");
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

    process.stdout.write(`${font.id} (${font.desc})... `);

    const imageBuffer = await generateVariant(fontRef, font);

    if (imageBuffer) {
      fs.writeFileSync(path.join(outputDir, `cited-${font.id}-comma.png`), imageBuffer);
      console.log("✓");
      count++;
    } else {
      console.log("✗");
    }

    await new Promise((r) => setTimeout(r, 2500));
  }

  console.log(`\n=== Done: ${count}/${FONT_REFS.length} ===`);
  console.log(`Output: ${outputDir}`);
}

main().catch(console.error);
