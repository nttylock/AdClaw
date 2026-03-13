/**
 * Generate "Cited" text in various font styles from references
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

const REFERENCES = [
  { file: "Screenshot 2025-12-28 at 02.26.25.png", id: "relate", desc: "Bold sans-serif like 'Relate' - heavy weight, unique letterforms" },
  { file: "Screenshot 2025-12-28 at 02.26.42.png", id: "ultra", desc: "Clean medium sans-serif like 'Ultra' - balanced weight" },
  { file: "Screenshot 2025-12-28 at 02.26.50.png", id: "planar", desc: "Geometric sans-serif like 'Planar' - clean, technical" },
  { file: "Screenshot 2025-12-28 at 02.28.29.png", id: "sectra", desc: "Elegant italic serif like 'Sectra' - refined, editorial" },
  { file: "Screenshot 2025-12-28 at 02.28.44.png", id: "stage", desc: "Bold mixed-weight display like 'Stage' - playful, varied stroke" },
  { file: "Screenshot 2025-12-28 at 02.29.06.png", id: "graphik", desc: "Condensed italic sans like 'Graphik Compact' - narrow, slanted" },
  { file: "Screenshot 2025-12-28 at 02.29.40.png", id: "cited-light", desc: "Light geometric sans - thin strokes, open C, round forms" },
  { file: "Screenshot 2025-12-28 at 02.30.25.png", id: "cited-regular", desc: "Regular geometric sans - slightly heavier, balanced" },
  { file: "Screenshot 2025-12-28 at 02.30.33.png", id: "cited-caps", desc: "All caps geometric sans - uniform weight, clean lines" },
];

const REF_DIR = "public/logo/txt-reference";

function loadImage(filepath: string): { inlineData: { mimeType: string; data: string } } | null {
  const fullPath = path.join(process.cwd(), filepath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`Not found: ${filepath}`);
    return null;
  }
  const data = fs.readFileSync(fullPath).toString("base64");
  return { inlineData: { mimeType: "image/png", data } };
}

async function generateCited(
  refImage: { inlineData: { mimeType: string; data: string } },
  ref: (typeof REFERENCES)[0]
): Promise<Buffer | null> {
  console.log(`\nGenerating: ${ref.id}...`);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        refImage,
        {
          text: `Look at this font/text reference image carefully.

Your task: Write the word "Cited" using the EXACT SAME font style, weight, and character design as shown in the reference.

Font characteristics to match: ${ref.desc}

CRITICAL REQUIREMENTS:
- Match the EXACT font style from the reference image
- Same stroke weight/thickness
- Same letter proportions
- Same character style (serif/sans, italic/upright, etc.)
- Text: "Cited" (capital C, lowercase ited)
- Color: Black (#1A1A1A)
- Clean white background
- Centered
- Output: 1024x400 pixels
- Sharp, crisp edges

Generate ONLY the word "Cited" in this exact font style.`,
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
    console.log(`  ✗ No image`);
    return null;
  } catch (error: any) {
    console.error(`  ✗ Error: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log("=== Cited Font Generator ===\n");

  const outputDir = path.join(process.cwd(), "public", "logo", "cited-fonts");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let count = 0;
  for (const ref of REFERENCES) {
    const refPath = path.join(REF_DIR, ref.file);
    const refImage = loadImage(refPath);

    if (!refImage) {
      console.log(`Skipping ${ref.id} - reference not found`);
      continue;
    }

    const imageBuffer = await generateCited(refImage, ref);

    if (imageBuffer) {
      const filename = `cited-${ref.id}.png`;
      fs.writeFileSync(path.join(outputDir, filename), imageBuffer);
      console.log(`  Saved: ${filename}`);
      count++;
    }

    await new Promise((r) => setTimeout(r, 2500));
  }

  console.log(`\nGenerated: ${count}/${REFERENCES.length}`);
  console.log(`Output: ${outputDir}`);
}

main().catch(console.error);
