/**
 * Regenerate Sectra font variants with CORRECT colors
 * Sectra was generating all black - fix with stronger prompt
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

const COLORS = [
  { id: "terracotta", name: "Terracotta", hex: "#E2725B", rgb: "226, 114, 91" },
  { id: "olive", name: "Olive Green", hex: "#BAB86C", rgb: "186, 184, 108" },
  { id: "khaki", name: "Khaki Yellow", hex: "#F0E68C", rgb: "240, 230, 140" },
  { id: "mustard", name: "Mustard Yellow", hex: "#E1AD01", rgb: "225, 173, 1" },
  { id: "black", name: "Black", hex: "#1A1A1A", rgb: "26, 26, 26" },
];

function loadImage(filepath: string): { inlineData: { mimeType: string; data: string } } | null {
  const fullPath = path.join(process.cwd(), filepath);
  if (!fs.existsSync(fullPath)) return null;
  const data = fs.readFileSync(fullPath).toString("base64");
  return { inlineData: { mimeType: "image/png", data } };
}

async function generateSectraColor(
  refImage: { inlineData: { mimeType: string; data: string } },
  color: (typeof COLORS)[0]
): Promise<Buffer | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        refImage,
        {
          text: `Look at this "Cited" italic serif text. Create "Citedy" (with Y at end) in the SAME italic serif font style.

MANDATORY COLOR REQUIREMENT:
- Text color MUST be ${color.hex} (${color.name})
- RGB values: ${color.rgb}
- DO NOT use black color
- The entire text must be filled with ${color.name} color

Text: Citedy
Font style: Match the italic serif from reference exactly
Text color: ${color.hex} ${color.name} - THIS IS REQUIRED
Background: Pure white (#FFFFFF)
Size: 1024x400 pixels
Quality: Sharp, clean edges

IMPORTANT: The text color must be ${color.name} (${color.hex}), not black!`,
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
  console.log("=== Regenerate Sectra with COLORS ===\n");

  const refImage = loadImage("public/logo/cited-fonts/cited-sectra.png");
  if (!refImage) {
    console.error("Reference image not found!");
    process.exit(1);
  }

  const outputDir = path.join(process.cwd(), "public", "logo", "citedy-final");

  let count = 0;
  for (const color of COLORS) {
    process.stdout.write(`sectra-${color.id}... `);

    const imageBuffer = await generateSectraColor(refImage, color);

    if (imageBuffer) {
      const filename = `citedy-sectra-${color.id}.png`;
      fs.writeFileSync(path.join(outputDir, filename), imageBuffer);
      console.log("✓");
      count++;
    } else {
      console.log("✗");
    }

    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`\n=== Done: ${count}/${COLORS.length} ===`);
}

main().catch(console.error);
