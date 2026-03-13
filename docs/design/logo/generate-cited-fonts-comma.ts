/**
 * Generate "Cited" + comma using:
 * - Comma reference from cited-black-red.png
 * - Font styles from txt-reference folder
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
  { id: "relate", file: "Screenshot 2025-12-28 at 02.26.25.png", desc: "bold sans-serif like Relate" },
  { id: "ultra", file: "Screenshot 2025-12-28 at 02.26.42.png", desc: "medium weight sans-serif like Ultra" },
  { id: "planar", file: "Screenshot 2025-12-28 at 02.26.50.png", desc: "geometric sans-serif like Planar" },
  { id: "stage", file: "Screenshot 2025-12-28 at 02.28.44.png", desc: "stylized serif with varying weights like Stage" },
  { id: "cited-light", file: "Screenshot 2025-12-28 at 02.29.40.png", desc: "light weight clean sans-serif" },
  { id: "cited-regular", file: "Screenshot 2025-12-28 at 02.30.51.png", desc: "regular weight clean sans-serif" },
];

const INPUT_DIR = "public/logo/txt-reference";

function loadImage(filepath: string): { inlineData: { mimeType: string; data: string } } | null {
  const fullPath = path.join(process.cwd(), filepath);
  if (!fs.existsSync(fullPath)) return null;
  const data = fs.readFileSync(fullPath).toString("base64");
  return { inlineData: { mimeType: "image/png", data } };
}

async function generateVariant(
  commaRef: { inlineData: { mimeType: string; data: string } },
  fontRef: { inlineData: { mimeType: string; data: string } },
  font: (typeof FONT_REFS)[0]
): Promise<Buffer | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        commaRef,
        fontRef,
        {
          text: `I'm showing you TWO reference images:

IMAGE 1 (first): Shows "Cited" with a RED COMMA at the end. Copy the EXACT comma shape and position - notice how the comma is LOWERED so it sits like the letter "y" (top at x-height, tail below baseline).

IMAGE 2 (second): Shows a font style reference. Use THIS FONT STYLE for the word "Cited".

YOUR TASK:
Create "Cited" + comma where:
- The word "Cited" uses the font style from IMAGE 2 (${font.desc})
- The comma shape and position EXACTLY like IMAGE 1 (lowered, red, bold)
- "Cited" color: BLACK (#1A1A1A)
- Comma color: RED (#E74C3C)
- White background
- 2048x800 pixels

Keep the comma position exactly as in the first reference - it should sit at letter height, not floating up high.`,
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
  console.log("=== Cited + Comma in Different Fonts ===\n");

  const commaRef = loadImage(COMMA_REF);
  if (!commaRef) {
    console.error("Comma reference not found!");
    process.exit(1);
  }
  console.log("Comma reference: ✓");

  const outputDir = path.join(process.cwd(), "public", "logo", "cited-fonts-comma");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let count = 0;

  for (const font of FONT_REFS) {
    const fontRef = loadImage(path.join(INPUT_DIR, font.file));
    if (!fontRef) {
      console.log(`Skip: ${font.id} - font ref not found`);
      continue;
    }

    process.stdout.write(`${font.id}... `);

    const imageBuffer = await generateVariant(commaRef, fontRef, font);

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
