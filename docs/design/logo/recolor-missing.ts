/**
 * Generate missing color variants
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

const SOURCE_LOGO = "public/logo/citedy-generated/concept-b1-modern-quote.png";

const MISSING_COLORS = [
  { id: "chilli-red", name: "Chilli Red", hex: "#FF2F00" },
  { id: "mustard", name: "Mustard Yellow", hex: "#E1AD01" },
];

function loadSourceImage(): { inlineData: { mimeType: string; data: string } } {
  const fullPath = path.join(process.cwd(), SOURCE_LOGO);
  const data = fs.readFileSync(fullPath).toString("base64");
  return { inlineData: { mimeType: "image/png", data } };
}

async function recolorLogo(
  sourceImage: { inlineData: { mimeType: string; data: string } },
  color: (typeof MISSING_COLORS)[0]
): Promise<Buffer | null> {
  console.log(`Generating: ${color.name} (${color.hex})...`);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        sourceImage,
        {
          text: `Recreate this EXACT logo design, just change color to: ${color.hex} (${color.name}).
Keep identical shape. White background. 1024x1024px.`,
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
  const sourceImage = loadSourceImage();
  const outputDir = "public/logo/citedy-colors/quote";

  for (const color of MISSING_COLORS) {
    const imageBuffer = await recolorLogo(sourceImage, color);
    if (imageBuffer) {
      const filepath = path.join(outputDir, `quote-${color.id}.png`);
      fs.writeFileSync(filepath, imageBuffer);
      console.log(`✓ Saved: ${filepath}`);
    } else {
      console.log(`✗ Failed: ${color.name}`);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
}

main();
