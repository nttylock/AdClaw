/**
 * Regenerate Sectra Mustard in 2K resolution
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

function loadImage(filepath: string): { inlineData: { mimeType: string; data: string } } | null {
  const fullPath = path.join(process.cwd(), filepath);
  if (!fs.existsSync(fullPath)) return null;
  const data = fs.readFileSync(fullPath).toString("base64");
  return { inlineData: { mimeType: "image/png", data } };
}

async function main() {
  console.log("=== Sectra Mustard 2K ===\n");

  const refImage = loadImage("public/logo/cited-fonts/cited-sectra.png");
  if (!refImage) {
    console.error("Reference not found!");
    process.exit(1);
  }

  process.stdout.write("Generating 2K... ");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: [
      refImage,
      {
        text: `Look at this "Cited" italic serif text. Create "Citedy" (with Y at end) in the SAME italic serif font style.

MANDATORY:
- Text: Citedy
- Font: Same italic serif as reference
- Color: #E1AD01 (Mustard Yellow) - THE TEXT MUST BE THIS GOLDEN YELLOW COLOR
- Background: Pure white
- Size: 2560x1024 pixels (2K wide)
- Quality: Ultra sharp, crisp edges, high resolution

The text color MUST be mustard yellow (#E1AD01), NOT black!`,
      },
    ],
    config: { responseModalities: ["Text", "Image"] },
  });

  let imageBuffer: Buffer | null = null;
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData?.mimeType?.startsWith("image/")) {
        imageBuffer = Buffer.from(part.inlineData.data, "base64");
        break;
      }
    }
  }

  if (!imageBuffer) {
    console.log("✗ Failed to generate");
    process.exit(1);
  }
  console.log("✓");

  // Save original
  const finalDir = path.join(process.cwd(), "public", "logo", "citedy-final");
  const transDir = path.join(process.cwd(), "public", "logo", "citedy-transparent");

  fs.writeFileSync(path.join(finalDir, "citedy-sectra-mustard.png"), imageBuffer);
  console.log("Saved to citedy-final/");

  // Remove background
  process.stdout.write("Removing background... ");
  const result = await removeBackground(path.join(finalDir, "citedy-sectra-mustard.png"));
  const arrayBuffer = await result.arrayBuffer();
  const transparentBuffer = Buffer.from(arrayBuffer);

  fs.writeFileSync(path.join(transDir, "citedy-sectra-mustard.png"), transparentBuffer);

  const webpBuffer = await sharp(transparentBuffer)
    .webp({ quality: 90, lossless: false })
    .toBuffer();
  fs.writeFileSync(path.join(transDir, "citedy-sectra-mustard.webp"), webpBuffer);
  console.log("✓");

  console.log("\n=== Done ===");
}

main().catch(console.error);
