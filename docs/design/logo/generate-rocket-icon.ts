/**
 * Generate rocket icons in logo colors (mustard + red)
 * Based on reference: public/new-icons/header-dashboard-autopilot copy.png
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

const REFERENCE = "public/new-icons/header-dashboard-autopilot copy.png";
const OUTPUT_DIR = "public/logo/rocket-icons";

// Logo colors
const MUSTARD = "#E1AD01";
const RED = "#E74C3C";

const VARIANTS = [
  {
    id: "red-rocket-mustard-smoke",
    name: "Red rocket + Mustard smoke",
    rocketColor: RED,
    rocketName: "red",
    smokeColor: MUSTARD,
    smokeName: "mustard/golden yellow",
  },
  {
    id: "mustard-rocket-red-smoke",
    name: "Mustard rocket + Red smoke",
    rocketColor: MUSTARD,
    rocketName: "mustard/golden yellow",
    smokeColor: RED,
    smokeName: "red/coral",
  },
];

function loadImage(filepath: string): { inlineData: { mimeType: string; data: string } } | null {
  const fullPath = path.join(process.cwd(), filepath);
  if (!fs.existsSync(fullPath)) return null;
  const data = fs.readFileSync(fullPath).toString("base64");
  return { inlineData: { mimeType: "image/png", data } };
}

async function generateVariant(
  reference: { inlineData: { mimeType: string; data: string } },
  variant: (typeof VARIANTS)[0]
): Promise<Buffer | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        reference,
        {
          text: `Look at this rocket icon. Create a similar rocket icon with different colors:

KEEP THE SAME:
- Same rocket style (tech/futuristic rocket with circuit patterns)
- Same composition (rocket launching upward with smoke/clouds below)
- Same isometric/3D style
- Same floating dashboard elements around the rocket
- Transparent/white background
- Same overall layout and proportions

COLOR CHANGES:
1. ROCKET body color: ${variant.rocketColor} (${variant.rocketName})
2. SMOKE/CLOUDS/EXHAUST color: ${variant.smokeColor} (${variant.smokeName})
3. Dashboard elements and accents: use both ${variant.rocketColor} and ${variant.smokeColor}
4. Window/porthole: lighter shade of the rocket color

OUTPUT:
- Same style tech rocket
- Rocket in ${variant.rocketName} color (${variant.rocketColor})
- Smoke/exhaust in ${variant.smokeName} color (${variant.smokeColor})
- Transparent background
- 1024x1024 pixels
- Keep the floating dashboard UI elements but in matching colors`,
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
  console.log("=== Rocket Icons in Logo Colors ===\n");

  const reference = loadImage(REFERENCE);
  if (!reference) {
    console.error("Reference image not found!");
    process.exit(1);
  }
  console.log("Reference: ✓\n");

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let count = 0;

  for (const variant of VARIANTS) {
    process.stdout.write(`${variant.id}... `);

    const imageBuffer = await generateVariant(reference, variant);

    if (imageBuffer) {
      fs.writeFileSync(path.join(OUTPUT_DIR, `${variant.id}.png`), imageBuffer);
      console.log("✓");
      count++;
    } else {
      console.log("✗");
    }

    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`\n=== Done: ${count}/${VARIANTS.length} ===`);
  console.log(`Output: ${OUTPUT_DIR}`);
}

main().catch(console.error);
