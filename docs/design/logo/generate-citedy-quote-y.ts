/**
 * Generate "Citedy" with stylized Y that looks like a quote/comma
 * The Y should resemble both the letter Y and a quotation mark/comma
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

// Different prompt variations to try
const PROMPTS = [
  {
    id: "v1-comma-y",
    prompt: `Create a text logo "Cited" followed by a stylized symbol that looks like BOTH the letter "y" AND a comma/quotation mark.

The final letter should be a creative hybrid - readable as "y" but visually resembling a typographic comma or closing quotation mark.

Style: Modern sans-serif, clean, professional
Color: #1A1A1A (black)
Background: White
Size: 2048x800 pixels

The word should read as "Citedy" but the "y" is stylized as a descending curve like a quote mark.`,
  },
  {
    id: "v2-quote-tail",
    prompt: `Design a wordmark "Citedy" where the letter Y is transformed into a quotation mark shape.

The Y should have:
- A descending tail that curves like a comma or closing quote mark
- Still be recognizable as the letter Y
- Create visual wordplay between "Cited" (citation) and the quote symbol

Font: Bold geometric sans-serif
Color: #1A1A1A (black)
Background: White
Size: 2048x800 pixels`,
  },
  {
    id: "v3-ligature",
    prompt: `Create "Cited" + a ligature that merges Y with a quotation mark.

The ending should be a typographic ligature where:
- The letter Y flows into a quote/comma shape
- It reads as "Citedy"
- The Y-quote hybrid references citations

Modern minimalist style
Color: Black (#1A1A1A)
White background
2048x800 pixels`,
  },
  {
    id: "v4-descender",
    prompt: `Design wordmark: C-i-t-e-d-y

Special requirement for the Y:
- Make the Y's descender (bottom part) look like a closing quotation mark
- The tail curves elegantly like a typographic comma
- Creates double meaning: the word "Citedy" + citation symbol

Clean sans-serif font
Black text on white
2048x800 pixels`,
  },
  {
    id: "v5-playful",
    prompt: `Create a playful logo "Citedy" where the final Y is replaced with a stylized quote mark that still reads as Y.

Think of it as: "Cited" + a quote symbol that doubles as the letter Y
The quote/comma shape should descend below the baseline like a lowercase y would.

Modern, friendly sans-serif
Color: #1A1A1A
White background
2048x800`,
  },
  {
    id: "v6-serif",
    prompt: `Design an elegant wordmark "Citedy" in a serif font.

The letter Y should be stylized as a quotation mark / apostrophe shape:
- Descending curve resembling both Y and a closing quote
- Elegant, editorial feel (fitting for a citation tool)
- The hybrid Y-quote creates clever wordplay

Serif typeface, refined
Black (#1A1A1A) on white
2048x800 pixels`,
  },
  {
    id: "v7-minimal",
    prompt: `Minimalist logo: "Cited" with a single curved stroke at the end that serves as both:
1. The letter Y (completing "Citedy")
2. A quotation mark symbol

The curve should be simple - like a comma or closing quote that descends from the baseline.

Ultra-minimal sans-serif
Black on white
2048x800`,
  },
  {
    id: "v8-geometric",
    prompt: `Geometric wordmark "Citedy" where Y = stylized quote mark.

Design the Y as:
- A simple descending curve/comma shape
- Geometric and minimal
- Visually reads as both Y and quotation mark
- References the "cited/citation" meaning

Geometric sans-serif like Futura
Black (#1A1A1A)
White background
2048x800 pixels`,
  },
];

async function generateVariant(prompt: { id: string; prompt: string }): Promise<Buffer | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [{ text: prompt.prompt }],
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
  console.log("=== Generate Citedy with Quote-Y ===\n");
  console.log(`Variants: ${PROMPTS.length}\n`);

  const outputDir = path.join(process.cwd(), "public", "logo", "citedy-quote-y");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let count = 0;

  for (const prompt of PROMPTS) {
    process.stdout.write(`${prompt.id}... `);

    const imageBuffer = await generateVariant(prompt);

    if (imageBuffer) {
      const filename = `citedy-${prompt.id}.png`;
      fs.writeFileSync(path.join(outputDir, filename), imageBuffer);
      console.log("✓");
      count++;
    } else {
      console.log("✗");
    }

    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`\n=== Done: ${count}/${PROMPTS.length} ===`);
  console.log(`Output: ${outputDir}`);
}

main().catch(console.error);
