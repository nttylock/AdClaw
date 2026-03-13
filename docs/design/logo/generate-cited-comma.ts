/**
 * Generate "Cited" + large comma/quote as "y"
 * Based on user reference: gold text + red comma
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

function loadImage(filepath: string): { inlineData: { mimeType: string; data: string } } | null {
  const fullPath = path.join(process.cwd(), filepath);
  if (!fs.existsSync(fullPath)) return null;
  const data = fs.readFileSync(fullPath).toString("base64");
  return { inlineData: { mimeType: "image/png", data } };
}

// Color combinations to try
const VARIANTS = [
  { id: "khaki-red", textColor: "#C4B454", textName: "khaki/gold", commaColor: "#E74C3C", commaName: "red" },
  { id: "khaki-terracotta", textColor: "#C4B454", textName: "khaki/gold", commaColor: "#E2725B", commaName: "terracotta" },
  { id: "olive-terracotta", textColor: "#BAB86C", textName: "olive", commaColor: "#E2725B", commaName: "terracotta" },
  { id: "black-red", textColor: "#1A1A1A", textName: "black", commaColor: "#E74C3C", commaName: "red" },
  { id: "black-terracotta", textColor: "#1A1A1A", textName: "black", commaColor: "#E2725B", commaName: "terracotta" },
  { id: "mustard-terracotta", textColor: "#E1AD01", textName: "mustard", commaColor: "#E2725B", commaName: "terracotta" },
  { id: "terracotta-mustard", textColor: "#E2725B", textName: "terracotta", commaColor: "#E1AD01", commaName: "mustard" },
  { id: "black-mustard", textColor: "#1A1A1A", textName: "black", commaColor: "#E1AD01", commaName: "mustard" },
];

async function generateVariant(
  refImage: { inlineData: { mimeType: string; data: string } },
  variant: (typeof VARIANTS)[0]
): Promise<Buffer | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        refImage,
        {
          text: `Look at this logo reference. Recreate the EXACT same concept:

1. The word "Cited" in ${variant.textName} color (${variant.textColor})
2. A LARGE comma/quotation mark at the end in ${variant.commaName} color (${variant.commaColor})

The comma is BIG - same height as the letters. It acts as the letter "y" to complete "Citedy".

IMPORTANT:
- Same font style as reference (clean sans-serif)
- Same layout: "Cited" + large comma touching/close to the "d"
- Text color: ${variant.textColor}
- Comma color: ${variant.commaColor}
- White background
- 2048x800 pixels
- The comma should be a thick, bold quotation mark shape

Copy the exact style from the reference image, just change the colors.`,
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
  console.log("=== Cited + Comma Logo ===\n");

  // Save the reference image path - user uploaded it
  const refPath = "public/logo/citedy-quote-y/reference-cited-comma.png";

  // Check if reference exists, if not try to find it
  let refImage = loadImage(refPath);

  if (!refImage) {
    // Try the uploaded image location
    const altPaths = [
      "public/logo/cited-comma-ref.png",
      "public/logo/reference.png",
    ];
    for (const p of altPaths) {
      refImage = loadImage(p);
      if (refImage) break;
    }
  }

  if (!refImage) {
    console.log("Reference image not found. Generating without reference...\n");
  }

  const outputDir = path.join(process.cwd(), "public", "logo", "cited-comma");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let count = 0;

  for (const variant of VARIANTS) {
    process.stdout.write(`${variant.id}... `);

    let imageBuffer: Buffer | null = null;

    if (refImage) {
      imageBuffer = await generateVariant(refImage, variant);
    } else {
      // Generate without reference
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: [
          {
            text: `Create a logo with TWO PARTS:

1. The word "Cited" in ${variant.textName} color (${variant.textColor})
2. A LARGE comma/quotation mark symbol right after, in ${variant.commaName} color (${variant.commaColor})

Design details:
- Clean modern sans-serif font for "Cited"
- The comma is BIG - same height as the capital C
- The comma shape: thick, bold, like a large closing quotation mark
- The comma touches or nearly touches the letter "d"
- Together it reads as "Citedy" (the comma = y)

Colors:
- "Cited" text: ${variant.textColor} (${variant.textName})
- Comma symbol: ${variant.commaColor} (${variant.commaName})

White background, 2048x800 pixels, centered.`,
          },
        ],
        config: { responseModalities: ["Text", "Image"] },
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.mimeType?.startsWith("image/")) {
            imageBuffer = Buffer.from(part.inlineData.data, "base64");
            break;
          }
        }
      }
    }

    if (imageBuffer) {
      fs.writeFileSync(path.join(outputDir, `cited-comma-${variant.id}.png`), imageBuffer);
      console.log("✓");
      count++;
    } else {
      console.log("✗");
    }

    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`\n=== Done: ${count}/${VARIANTS.length} ===`);
  console.log(`Output: ${outputDir}`);
}

main().catch(console.error);
