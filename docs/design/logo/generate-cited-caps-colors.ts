/**
 * Generate "Cited" + comma in CAPS style
 * - Tighter letter spacing
 * - Multiple colors for "Cited"
 * - Red comma
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

// Reference image for style
const STYLE_REF = "public/logo/cited-single-ref/cited-caps-comma.png";

const COLORS = [
  { id: "terracotta", hex: "#E2725B", name: "terracotta/coral" },
  { id: "olive", hex: "#BAB86C", name: "olive green" },
  { id: "khaki", hex: "#C4B454", name: "khaki/gold" },
  { id: "mustard", hex: "#E1AD01", name: "mustard yellow" },
  { id: "black", hex: "#1A1A1A", name: "black" },
];

function loadImage(filepath: string): { inlineData: { mimeType: string; data: string } } | null {
  const fullPath = path.join(process.cwd(), filepath);
  if (!fs.existsSync(fullPath)) return null;
  const data = fs.readFileSync(fullPath).toString("base64");
  return { inlineData: { mimeType: "image/png", data } };
}

async function generateVariant(
  styleRef: { inlineData: { mimeType: string; data: string } },
  color: (typeof COLORS)[0]
): Promise<Buffer | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        styleRef,
        {
          text: `Look at this logo reference. Recreate it with these changes:

KEEP THE SAME:
- Same font style (clean modern sans-serif)
- Same comma shape and LOWERED position (comma sits like letter "y")
- Same overall layout and proportions

CHANGES:
1. TIGHTER letter spacing - letters should be CLOSER together, reduce the gaps between C-i-t-e-d
2. "Cited" text color: ${color.hex} (${color.name})
3. Comma stays RED (#E74C3C)

OUTPUT:
- "Cited" in ${color.name} color (${color.hex})
- Tighter/closer letter spacing than the reference
- Red comma in the same lowered position
- White background
- 2048x800 pixels

Make the letters closer together - tighter kerning.`,
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
  console.log("=== Cited Caps - Tight + Colors ===\n");

  const styleRef = loadImage(STYLE_REF);
  if (!styleRef) {
    console.error("Style reference not found!");
    process.exit(1);
  }
  console.log("Style ref: ✓\n");

  const outputDir = path.join(process.cwd(), "public", "logo", "cited-caps-colors");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let count = 0;

  for (const color of COLORS) {
    process.stdout.write(`${color.id}... `);

    const imageBuffer = await generateVariant(styleRef, color);

    if (imageBuffer) {
      fs.writeFileSync(path.join(outputDir, `cited-${color.id}-comma.png`), imageBuffer);
      console.log("✓");
      count++;
    } else {
      console.log("✗");
    }

    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`\n=== Done: ${count}/${COLORS.length} ===`);
  console.log(`Output: ${outputDir}`);
}

main().catch(console.error);
