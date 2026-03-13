/**
 * Recolor selected Cited fonts in 4 colors
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

const FONTS = [
  "cited-cited-caps.png",
  "cited-cited-light.png",
  "cited-cited-regular.png",
  "cited-planar.png",
  "cited-sectra.png",
];

const COLORS = [
  { id: "terracotta", name: "Terracotta", hex: "#E2725B" },
  { id: "olive", name: "Olive", hex: "#BAB86C" },
  { id: "khaki", name: "Khaki", hex: "#F0E68C" },
  { id: "mustard", name: "Mustard Yellow", hex: "#E1AD01" },
];

const INPUT_DIR = "public/logo/cited-fonts";

function loadImage(filepath: string): { inlineData: { mimeType: string; data: string } } | null {
  const fullPath = path.join(process.cwd(), filepath);
  if (!fs.existsSync(fullPath)) return null;
  const data = fs.readFileSync(fullPath).toString("base64");
  return { inlineData: { mimeType: "image/png", data } };
}

async function recolorText(
  sourceImage: { inlineData: { mimeType: string; data: string } },
  color: (typeof COLORS)[0]
): Promise<Buffer | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        sourceImage,
        {
          text: `This is a text logo. Recreate it with the EXACT same font style, letter shapes, and proportions.

ONLY change the text color to: ${color.hex} (${color.name})

CRITICAL:
- Keep IDENTICAL letterforms and font style
- Same weight, same proportions
- Just change fill color to ${color.hex}
- Clean white background
- 1024x400 pixels
- Sharp edges

Recolor only, do not redesign.`,
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
  console.log("=== Recolor Cited Fonts ===\n");
  console.log(`Fonts: ${FONTS.length}`);
  console.log(`Colors: ${COLORS.length}`);
  console.log(`Total: ${FONTS.length * COLORS.length}\n`);

  const outputDir = path.join(process.cwd(), "public", "logo", "cited-colors");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let count = 0;
  let total = FONTS.length * COLORS.length;

  for (const fontFile of FONTS) {
    const fontName = fontFile.replace(".png", "").replace("cited-", "");
    const sourcePath = path.join(INPUT_DIR, fontFile);
    const sourceImage = loadImage(sourcePath);

    if (!sourceImage) {
      console.log(`Skip: ${fontFile} not found`);
      continue;
    }

    console.log(`\n${fontName}:`);

    for (const color of COLORS) {
      process.stdout.write(`  ${color.id}... `);

      const imageBuffer = await recolorText(sourceImage, color);

      if (imageBuffer) {
        const filename = `${fontName}-${color.id}.png`;
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
