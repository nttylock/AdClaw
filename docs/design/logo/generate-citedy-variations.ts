/**
 * Generate additional variations of selected CITEDY logo concepts
 *
 * Usage: npx tsx docs/design/logo/generate-citedy-variations.ts
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

// Reference competitor logos (use first 6 for Gemini 2.5)
const LOGO_REFERENCES = [
  "public/logo/examples-data/groq.png",
  "public/logo/examples-data/luma-color.png",
  "public/logo/examples-data/replit-color.png",
  "public/logo/examples-data/doc2x-color.png",
  "public/logo/examples-data/nebius.png",
  "public/logo/examples-data/minimax-color.png",
];

function loadReferenceImage(
  filepath: string
): { inlineData: { mimeType: string; data: string } } | null {
  const fullPath = path.join(process.cwd(), filepath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`Reference not found: ${fullPath}`);
    return null;
  }
  const data = fs.readFileSync(fullPath).toString("base64");
  return {
    inlineData: {
      mimeType: "image/png",
      data,
    },
  };
}

function loadAllReferences(): {
  inlineData: { mimeType: string; data: string };
}[] {
  const refs: { inlineData: { mimeType: string; data: string } }[] = [];
  for (const filepath of LOGO_REFERENCES) {
    const ref = loadReferenceImage(filepath);
    if (ref) refs.push(ref);
  }
  return refs;
}

// Base style requirements
const BASE_STYLE = `
CRITICAL REQUIREMENTS:
- Clean solid background (white or light gray - will be removed via AI)
- Minimalist tech startup logo icon style
- Single centered symbol, NO TEXT, NO LETTERS inside the symbol
- Suitable for favicon, app icon, header
- High contrast, sharp clean edges
- Output size: 1024x1024 pixels
- Professional Silicon Valley tech aesthetic
- Match the minimalist style of the reference logo images provided
`;

// Additional variations for selected concepts
const VARIATIONS = [
  // Concept A1: Minimal C - 2 variations
  {
    id: "concept-a1-minimal-c-v2",
    name: "Minimal C V2 - Thinner stroke",
    prompt: `Create a minimalist logo icon: A stylized letter "C" with clean geometric lines.
Style: Ultra-minimal like Groq or Nebius logos
Color: Pure black (#000000) on white background
Design: THINNER stroke than typical, elegant hairline aesthetic, modern geometric curve
Variation: More open C shape, wider opening
Feeling: Elegant, refined, premium tech
${BASE_STYLE}`,
  },
  {
    id: "concept-a1-minimal-c-v3",
    name: "Minimal C V3 - Bold chunky",
    prompt: `Create a minimalist logo icon: A stylized letter "C" with clean geometric lines.
Style: Ultra-minimal like Groq or Nebius logos
Color: Pure black (#000000) on white background
Design: EXTRA BOLD thick stroke, chunky weight, strong presence, perfect circle base
Variation: Almost closed C with small gap, powerful appearance
Feeling: Strong, confident, impactful
${BASE_STYLE}`,
  },

  // Concept A3: Geometric C - 2 variations
  {
    id: "concept-a3-geometric-c-v2",
    name: "Geometric C V2 - Stacked blocks",
    prompt: `Create a logo icon: Letter "C" constructed from geometric block shapes.
Style: Blocky geometric like Replit logo
Color: Electric orange (#F97316) solid fill
Design: Made of 3-4 STACKED horizontal rectangles arranged to form C shape, rounded corners
Variation: Blocks are clearly separated with small gaps between them
Feeling: Modular, builder aesthetic, tech stack
${BASE_STYLE}`,
  },
  {
    id: "concept-a3-geometric-c-v3",
    name: "Geometric C V3 - Pixel grid",
    prompt: `Create a logo icon: Letter "C" constructed from geometric block shapes.
Style: Blocky geometric like Replit logo
Color: Electric orange (#F97316) solid fill
Design: Made of SQUARE pixels/tiles arranged in grid pattern forming C letterform
Variation: Pixel art style but minimal, 5-7 squares wide
Feeling: Digital, retro-modern, tech heritage
${BASE_STYLE}`,
  },

  // Concept B1: Modern Quote - 2 variations
  {
    id: "concept-b1-modern-quote-v2",
    name: "Modern Quote V2 - Single mark",
    prompt: `Create a logo icon: A stylized SINGLE quotation mark representing citation.
Style: Minimal geometric like Groq
Color: Black (#000000) mono
Design: ONE bold quotation mark (not pair), geometric treatment, thick stroke
Variation: Rotated or tilted for dynamic feel
Feeling: Singular focus, bold statement, citation authority
${BASE_STYLE}`,
  },
  {
    id: "concept-b1-modern-quote-v3",
    name: "Modern Quote V3 - Abstract comma",
    prompt: `Create a logo icon: An abstract comma/quote shape representing citation.
Style: Minimal geometric like Groq or Pika
Color: Black (#000000) mono
Design: Abstract curved teardrop or comma shape, smooth organic curve
Variation: More abstract, less literal quote mark
Feeling: Subtle, sophisticated, editorial
${BASE_STYLE}`,
  },
];

async function generateLogo(
  variation: (typeof VARIATIONS)[0],
  allRefs: { inlineData: { mimeType: string; data: string } }[]
): Promise<Buffer | null> {
  console.log(`\nGenerating: ${variation.id}...`);
  console.log(`  Name: ${variation.name}`);

  try {
    const contents: any[] = [];

    // Add all reference images first
    for (const ref of allRefs) {
      contents.push(ref);
    }

    // Add instruction to match style
    contents.push({
      text: `These ${allRefs.length} images are reference logos from modern AI tech startups (Groq, Luma, Replit, Doc2x, Nebius, Minimax).

Study their EXACT visual style:
- Clean minimalist design
- Professional tech aesthetic
- Simple geometric forms
- High contrast clarity

Now create a NEW logo icon for "CITEDY" (an AI SEO platform, name derived from "cited"):

`,
    });

    // Add specific variation prompt
    contents.push({ text: variation.prompt });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents,
      config: {
        responseModalities: ["Text", "Image"],
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.mimeType?.startsWith("image/")) {
          console.log(`  ✓ Generated ${variation.id}`);
          return Buffer.from(part.inlineData.data, "base64");
        }
      }
    }

    const text = response.text;
    if (text) {
      console.log(`  ✗ No image. Response: ${text.substring(0, 200)}...`);
    }
    return null;
  } catch (error: any) {
    console.error(`  ✗ Error: ${error.message || error}`);
    return null;
  }
}

async function main() {
  console.log("=== CITEDY Logo Variations ===\n");
  console.log("Generating 2 additional variations for each of 3 selected concepts\n");

  // Load references
  const allRefs = loadAllReferences();
  console.log(`Loaded ${allRefs.length} reference logo images\n`);

  if (allRefs.length === 0) {
    console.error("No reference images found!");
    process.exit(1);
  }

  // Output directory
  const outputDir = path.join(
    process.cwd(),
    "public",
    "logo",
    "citedy-generated"
  );

  const results: {
    id: string;
    name: string;
    success: boolean;
    path?: string;
  }[] = [];

  for (let i = 0; i < VARIATIONS.length; i++) {
    const variation = VARIATIONS[i];

    const imageBuffer = await generateLogo(variation, allRefs);

    if (imageBuffer) {
      const filename = `${variation.id}.png`;
      const filepath = path.join(outputDir, filename);
      fs.writeFileSync(filepath, imageBuffer);
      results.push({
        id: variation.id,
        name: variation.name,
        success: true,
        path: `/logo/citedy-generated/${filename}`,
      });
      console.log(`  Saved: ${filepath}`);
    } else {
      results.push({
        id: variation.id,
        name: variation.name,
        success: false,
      });
    }

    // Rate limiting delay between generations
    if (i < VARIATIONS.length - 1) {
      console.log("  Waiting 3s before next generation...");
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  // Summary
  console.log("\n=== Generation Summary ===");
  const successCount = results.filter((r) => r.success).length;
  console.log(`Generated: ${successCount}/${VARIATIONS.length}\n`);

  console.log("Minimal C variations:");
  results
    .filter((r) => r.id.startsWith("concept-a1"))
    .forEach((r) => {
      console.log(`  ${r.success ? "✓" : "✗"} ${r.name}`);
    });

  console.log("\nGeometric C variations:");
  results
    .filter((r) => r.id.startsWith("concept-a3"))
    .forEach((r) => {
      console.log(`  ${r.success ? "✓" : "✗"} ${r.name}`);
    });

  console.log("\nModern Quote variations:");
  results
    .filter((r) => r.id.startsWith("concept-b1"))
    .forEach((r) => {
      console.log(`  ${r.success ? "✓" : "✗"} ${r.name}`);
    });

  // Update results JSON
  const jsonPath = path.join(outputDir, "results.json");
  const existingResults = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  existingResults.variations = results;
  existingResults.variationsGenerated = new Date().toISOString();
  fs.writeFileSync(jsonPath, JSON.stringify(existingResults, null, 2));
  console.log(`\nResults updated: ${jsonPath}`);
}

main().catch(console.error);
