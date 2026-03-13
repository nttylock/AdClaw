/**
 * Generate "Citedy" text (correct name) in selected fonts and colors
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

// Original black versions as style reference
const FONT_REFS = [
  { id: "caps", file: "public/logo/cited-fonts/cited-cited-caps.png" },
  { id: "light", file: "public/logo/cited-fonts/cited-cited-light.png" },
  { id: "regular", file: "public/logo/cited-fonts/cited-cited-regular.png" },
  { id: "planar", file: "public/logo/cited-fonts/cited-planar.png" },
  { id: "sectra", file: "public/logo/cited-fonts/cited-sectra.png" },
];

const COLORS = [
  { id: "terracotta", name: "Terracotta", hex: "#E2725B" },
  { id: "olive", name: "Olive", hex: "#BAB86C" },
  { id: "khaki", name: "Khaki", hex: "#F0E68C" },
  { id: "mustard", name: "Mustard Yellow", hex: "#E1AD01" },
  { id: "black", name: "Black", hex: "#1A1A1A" },
];

function loadImage(filepath: string): { inlineData: { mimeType: string; data: string } } | null {
  const fullPath = path.join(process.cwd(), filepath);
  if (!fs.existsSync(fullPath)) return null;
  const data = fs.readFileSync(fullPath).toString("base64");
  return { inlineData: { mimeType: "image/png", data } };
}

async function generateCitedy(
  refImage: { inlineData: { mimeType: string; data: string } },
  fontId: string,
  color: (typeof COLORS)[0]
): Promise<Buffer | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        refImage,
        {
          text: `Look at this "Cited" text logo. Now write "Citedy" (with Y at the end) using the EXACT SAME font style.

CRITICAL:
- Text must be: Citedy (capital C, lowercase itedy)
- Match the EXACT same font style, weight, proportions from reference
- Color: ${color.hex} (${color.name})
- Clean white background
- Centered
- 1024x400 pixels
- Sharp edges

Write "Citedy" in this exact font style and ${color.name} color.`,
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
  console.log("=== Generate CITEDY (correct name) ===\n");

  const outputDir = path.join(process.cwd(), "public", "logo", "citedy-final");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let count = 0;
  const total = FONT_REFS.length * COLORS.length;

  for (const font of FONT_REFS) {
    const refImage = loadImage(font.file);
    if (!refImage) {
      console.log(`Skip: ${font.id} - ref not found`);
      continue;
    }

    console.log(`\n${font.id}:`);

    for (const color of COLORS) {
      process.stdout.write(`  ${color.id}... `);

      const imageBuffer = await generateCitedy(refImage, font.id, color);

      if (imageBuffer) {
        const filename = `citedy-${font.id}-${color.id}.png`;
        fs.writeFileSync(path.join(outputDir, filename), imageBuffer);
        console.log("✓");
        count++;
      } else {
        console.log("✗");
      }

      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log(`\n=== Done: ${count}/${total} ===`);
  console.log(`Output: ${outputDir}`);
}

main().catch(console.error);
