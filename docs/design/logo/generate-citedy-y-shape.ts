/**
 * Generate "Citedy" where Y is a SINGLE SHAPE that looks like both Y and comma
 * NOT Y + comma merged, but ONE glyph that serves both purposes
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

const PROMPTS = [
  {
    id: "shape-1",
    prompt: `Create wordmark "Cited" followed by ONE SINGLE SHAPE at the end.

This final shape must be designed so it can be read as BOTH:
- The letter "y"
- A comma or closing quotation mark

Do NOT draw Y and comma separately. Draw ONE unified glyph that resembles both.

Think of it like an ambigram - one shape, two readings.

Font: Clean modern sans-serif
Color: Black
Background: White
Size: 2048x800`,
  },
  {
    id: "shape-2",
    prompt: `Logo design: "Cited" + a single curved symbol at the end.

The symbol is ONE STROKE that:
- Has the diagonal arms of letter Y at top
- Has a curved descender like a comma below

It's not Y next to comma. It's a SINGLE LETTER that happens to look like a comma.

Sans-serif, black on white, 2048x800`,
  },
  {
    id: "shape-3",
    prompt: `Design "Citedy" where the Y is drawn as a TEARDROP or COMMA SHAPE with a small notch/fork at the top.

The glyph looks like:
- A comma/teardrop shape overall
- But with a tiny V-fork at the top suggesting the Y

ONE shape, not two characters merged.

Modern typography, black, white bg, 2048x800`,
  },
  {
    id: "shape-4",
    prompt: `Wordmark: C-i-t-e-d followed by a special ending character.

The final character is shaped like the NUMBER 9 or a REVERSED 6:
- Round head at top (like comma head)
- Descending tail curving left (like comma/y tail)
- Can be read as lowercase y

Single unified shape. Black sans-serif on white. 2048x800`,
  },
  {
    id: "shape-5",
    prompt: `Create text "Cited" ending with a stylized glyph.

The ending glyph design:
- Start with a comma shape (curved teardrop with tail)
- Add a small diagonal stroke from upper left entering the top
- This makes it readable as "y" while keeping comma silhouette

ONE SHAPE total. Not y+comma.

Minimal sans-serif, black, white background, 2048x800`,
  },
  {
    id: "shape-6",
    prompt: `Typography logo: "Cited" + final character

Final character = APOSTROPHE/COMMA with an extra stroke:
- Base shape is a descending comma/apostrophe
- Add one diagonal line meeting at top to form Y structure
- Result: single glyph reading as both y and quote mark

Clean geometric style. Black on white. 2048x800`,
  },
  {
    id: "shape-7",
    prompt: `Design "Citedy" logo.

The letter Y is stylized as a HOOK or MUSICAL NOTE shape:
- Two short diagonal strokes meet at center (like Y top)
- Single curved stroke descends and curls (like comma)
- Entire thing is ONE connected path

This creates visual pun: word ends in Y but looks like quotation mark.

Bold sans-serif, black, 2048x800`,
  },
  {
    id: "shape-8",
    prompt: `Create wordmark where "Cited" is followed by a CHECKMARK-like shape that reads as "y".

The shape:
- Looks like a checkmark ✓ but with curved tail
- The curved descending tail resembles a comma
- Overall reads as lowercase y completing "Citedy"

Single continuous stroke. Sans-serif context. Black on white. 2048x800`,
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
  console.log("=== Citedy Y-Shape Experiments ===\n");

  const outputDir = path.join(process.cwd(), "public", "logo", "citedy-y-shape");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let count = 0;

  for (const prompt of PROMPTS) {
    process.stdout.write(`${prompt.id}... `);

    const imageBuffer = await generateVariant(prompt);

    if (imageBuffer) {
      fs.writeFileSync(path.join(outputDir, `citedy-${prompt.id}.png`), imageBuffer);
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
