/**
 * Generate CITEDY text only - various fonts and colors
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

// Style reference
const STYLE_REF = "public/logo/citedy-generated/concept-a1-minimal-c.png";

// Colors for text
const TEXT_COLORS = [
  { id: "terracotta", name: "Terracotta", hex: "#E2725B" },
  { id: "olive", name: "Olive", hex: "#BAB86C" },
  { id: "khaki", name: "Khaki", hex: "#F0E68C" },
  { id: "mustard", name: "Mustard Yellow", hex: "#E1AD01" },
  { id: "black", name: "Black", hex: "#1A1A1A" },
  { id: "charcoal", name: "Charcoal", hex: "#333333" },
];

// Font styles that match quote symbol
const FONT_STYLES = [
  {
    id: "geometric",
    name: "Geometric Sans",
    desc: "Clean geometric sans-serif like Futura or Proxima Nova. Perfect circles, uniform stroke width.",
  },
  {
    id: "grotesque",
    name: "Neo Grotesque",
    desc: "Neutral grotesque like Helvetica or Inter. Minimal, professional, no personality.",
  },
  {
    id: "humanist",
    name: "Humanist Sans",
    desc: "Slightly warmer sans-serif like Gill Sans or Frutiger. Subtle curves, friendly but professional.",
  },
  {
    id: "modern",
    name: "Modern Minimal",
    desc: "Ultra-clean modern like Montserrat or Poppins. Geometric but with slight softness.",
  },
];

function loadImage(filepath: string): { inlineData: { mimeType: string; data: string } } | null {
  const fullPath = path.join(process.cwd(), filepath);
  if (!fs.existsSync(fullPath)) return null;
  const data = fs.readFileSync(fullPath).toString("base64");
  return { inlineData: { mimeType: "image/png", data } };
}

async function generateText(
  styleRef: { inlineData: { mimeType: string; data: string } },
  fontStyle: (typeof FONT_STYLES)[0],
  color: (typeof TEXT_COLORS)[0]
): Promise<Buffer | null> {
  console.log(`Generating: ${fontStyle.id} + ${color.id}...`);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        styleRef,
        {
          text: `Create text logo: the word "CITEDY" only.

FONT STYLE: ${fontStyle.name}
${fontStyle.desc}

REQUIREMENTS:
- Text: CITEDY (all caps)
- Color: ${color.hex} (${color.name})
- Font weight: Medium to Semi-Bold (not too thin, not too heavy)
- Letter spacing: Normal or slightly tracked
- Clean white background
- Centered horizontally
- Match the minimal aesthetic of the reference image
- NO symbols, NO icons - ONLY the text "CITEDY"
- 1024x400 pixels (wide format)
- Sharp, crisp edges
- Professional tech startup look

Generate ONLY the text "CITEDY" in this style.`,
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
    console.error(`  Error: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log("=== CITEDY Text Generator ===\n");

  const styleRef = loadImage(STYLE_REF);
  if (!styleRef) {
    console.error("Style reference not found");
    process.exit(1);
  }

  const outputDir = path.join(process.cwd(), "public", "logo", "citedy-text");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate: 4 font styles x 6 colors = 24 variants
  // But let's do strategic combinations first
  const combinations = [
    // Each font with requested colors
    ...FONT_STYLES.flatMap((font) =>
      TEXT_COLORS.slice(0, 4).map((color) => ({ font, color }))
    ),
    // Black/charcoal for contrast options
    ...FONT_STYLES.map((font) => ({ font, color: TEXT_COLORS[4] })), // black
  ];

  let count = 0;
  for (const { font, color } of combinations) {
    const imageBuffer = await generateText(styleRef, font, color);
    const filename = `citedy-${font.id}-${color.id}.png`;

    if (imageBuffer) {
      fs.writeFileSync(path.join(outputDir, filename), imageBuffer);
      console.log(`  ✓ ${filename}`);
      count++;
    } else {
      console.log(`  ✗ ${filename}`);
    }

    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`\nGenerated: ${count}/${combinations.length}`);
  console.log(`Output: ${outputDir}`);
}

main().catch(console.error);
