/**
 * Generate "Citedy" from txt-reference fonts in multiple colors
 */

import { GoogleGenAI } from "@google/genai";
import sharp from "sharp";
import { removeBackground } from "@imgly/background-removal-node";
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
  {
    id: "relate",
    file: "Screenshot 2025-12-28 at 02.26.25.png",
    desc: "bold sans-serif like Relate",
  },
  {
    id: "ultra",
    file: "Screenshot 2025-12-28 at 02.26.42.png",
    desc: "medium weight sans-serif like Ultra",
  },
  {
    id: "planar",
    file: "Screenshot 2025-12-28 at 02.26.50.png",
    desc: "geometric sans-serif like Planar",
  },
  {
    id: "stage",
    file: "Screenshot 2025-12-28 at 02.28.44.png",
    desc: "stylized serif with varying weights like Stage",
  },
  {
    id: "cited-light",
    file: "Screenshot 2025-12-28 at 02.29.40.png",
    desc: "light weight clean sans-serif",
  },
  {
    id: "cited-regular",
    file: "Screenshot 2025-12-28 at 02.30.51.png",
    desc: "regular weight clean sans-serif",
  },
];

const COLORS = [
  { id: "terracotta", name: "Terracotta", hex: "#E2725B" },
  { id: "olive", name: "Olive Green", hex: "#BAB86C" },
  { id: "khaki", name: "Khaki Yellow", hex: "#F0E68C" },
  { id: "mustard", name: "Mustard Yellow", hex: "#E1AD01" },
  { id: "black", name: "Black", hex: "#1A1A1A" },
];

const INPUT_DIR = "public/logo/txt-reference";
const OUTPUT_DIR = "public/logo/citedy-refs";
const TRANSPARENT_DIR = "public/logo/citedy-refs-transparent";

function loadImage(
  filepath: string,
): { inlineData: { mimeType: string; data: string } } | null {
  const fullPath = path.join(process.cwd(), filepath);
  if (!fs.existsSync(fullPath)) return null;
  const data = fs.readFileSync(fullPath).toString("base64");
  return { inlineData: { mimeType: "image/png", data } };
}

async function generateCitedy(
  refImage: { inlineData: { mimeType: string; data: string } },
  font: (typeof FONT_REFS)[0],
  color: (typeof COLORS)[0],
): Promise<Buffer | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        refImage,
        {
          text: `Look at this text logo reference. Create the word "Citedy" using the EXACT SAME font style.

REQUIREMENTS:
1. TEXT: "Citedy" (capital C, lowercase i-t-e-d-y)
2. FONT STYLE: Match the ${font.desc} from the reference image exactly
3. TEXT COLOR: ${color.hex} (${color.name}) - THIS IS MANDATORY
4. BACKGROUND: Pure white (#FFFFFF)
5. SIZE: 2048x800 pixels, text centered
6. QUALITY: Sharp, crisp edges

The text must be ${color.name} color (${color.hex}), NOT black unless black is specified!
Write "Citedy" in this exact font style.`,
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

async function removeBackgroundAndSave(
  inputPath: string,
  outputPng: string,
  outputWebp: string,
): Promise<boolean> {
  try {
    const result = await removeBackground(inputPath);
    const arrayBuffer = await result.arrayBuffer();
    const transparentBuffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(outputPng, transparentBuffer);

    const webpBuffer = await sharp(transparentBuffer)
      .webp({ quality: 90, lossless: false })
      .toBuffer();
    fs.writeFileSync(outputWebp, webpBuffer);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log("=== Generate Citedy from References ===\n");
  console.log(`Fonts: ${FONT_REFS.length}`);
  console.log(`Colors: ${COLORS.length}`);
  console.log(`Total: ${FONT_REFS.length * COLORS.length}\n`);

  // Create output directories
  const outputDir = path.join(process.cwd(), OUTPUT_DIR);
  const transDir = path.join(process.cwd(), TRANSPARENT_DIR);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  if (!fs.existsSync(transDir)) fs.mkdirSync(transDir, { recursive: true });

  let count = 0;
  const total = FONT_REFS.length * COLORS.length;

  for (const font of FONT_REFS) {
    const refImage = loadImage(path.join(INPUT_DIR, font.file));
    if (!refImage) {
      console.log(`Skip: ${font.id} - ref not found`);
      continue;
    }

    console.log(`\n${font.id}:`);

    for (const color of COLORS) {
      process.stdout.write(`  ${color.id}... `);

      const imageBuffer = await generateCitedy(refImage, font, color);

      if (imageBuffer) {
        const filename = `citedy-${font.id}-${color.id}.png`;
        const filePath = path.join(outputDir, filename);
        fs.writeFileSync(filePath, imageBuffer);

        // Remove background
        const transPng = path.join(transDir, filename);
        const transWebp = path.join(
          transDir,
          filename.replace(".png", ".webp"),
        );
        await removeBackgroundAndSave(filePath, transPng, transWebp);

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
  console.log(`Transparent: ${transDir}`);
}

main().catch(console.error);
