/**
 * Generate CITEDY logo symbol variations using Gemini AI
 * Uses competitor logos as style references
 *
 * Usage: npx tsx docs/design/logo/generate-citedy-logo.ts [--test]
 * --test: Generate only first 3 variations for testing
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

// Load reference image
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

// Logo variations to generate
const LOGO_VARIATIONS = [
  // Concept A: Letter "C" (4 variations)
  {
    id: "concept-a1-minimal-c",
    name: "Minimal Mono C",
    concept: "Letter C",
    prompt: `Create a minimalist logo icon: A stylized letter "C" with clean geometric lines.
Style: Ultra-minimal like Groq or Nebius logos
Color: Pure black (#000000) on white background
Design: Thick rounded stroke, modern sans-serif aesthetic, single clean curve
Feeling: Professional, clean, tech-focused
${BASE_STYLE}`,
  },
  {
    id: "concept-a2-gradient-c",
    name: "Gradient C",
    concept: "Letter C",
    prompt: `Create a logo icon: A flowing letter "C" with smooth gradient fill.
Style: Smooth gradient like Luma or Doc2x logos
Color: Cyan to purple gradient (#06B6D4 to #8B5CF6)
Design: 3D depth effect, soft glow, modern curves, single letter shape
Feeling: Premium AI technology, innovative
${BASE_STYLE}`,
  },
  {
    id: "concept-a3-geometric-c",
    name: "Geometric C",
    concept: "Letter C",
    prompt: `Create a logo icon: Letter "C" constructed from geometric block shapes.
Style: Blocky geometric like Replit logo
Color: Electric orange (#F97316) solid fill
Design: Made of connected rectangles or squares with rounded corners forming C shape
Feeling: Energetic, builder, modern tech
${BASE_STYLE}`,
  },
  {
    id: "concept-a4-dotted-c",
    name: "Dotted C",
    concept: "Letter C",
    prompt: `Create a logo icon: Letter "C" formed entirely by dots/circles pattern.
Style: Dot pattern similar to how Adobe Firefly builds their "A" from dots
Color: Deep purple (#7C3AED) gradient dots, varying sizes
Design: Multiple circles arranged to form clear C letterform
Feeling: Dynamic, AI-neural network aesthetic
${BASE_STYLE}`,
  },

  // Concept B: Quotation Mark (4 variations)
  {
    id: "concept-b1-modern-quote",
    name: "Modern Quote",
    concept: "Quotation",
    prompt: `Create a logo icon: A stylized quotation mark " representing citation.
Style: Minimal geometric like Groq logo
Color: Black (#000000) mono
Design: Single or double quote mark with modern geometric treatment, thick strokes
Feeling: Editorial, authoritative, reference/citation
${BASE_STYLE}`,
  },
  {
    id: "concept-b2-glowing-quote",
    name: "Glowing Quote",
    concept: "Quotation",
    prompt: `Create a logo icon: Quotation marks with soft glow effect.
Style: Gradient glow like Doc2x logo
Color: Blue-cyan gradient (#3B82F6 to #06B6D4) with soft glow aura
Design: Two stylized quote marks with light emanation effect
Feeling: Digital, AI-powered citations, modern tech
${BASE_STYLE}`,
  },
  {
    id: "concept-b3-abstract-quote",
    name: "Abstract Quote",
    concept: "Quotation",
    prompt: `Create a logo icon: Abstract curved shapes suggesting quotation marks.
Style: Organic flowing curves like Minimax sound wave logo
Color: Pink-purple gradient (#EC4899 to #8B5CF6)
Design: Two curved flowing shapes that evoke quotation marks abstractly
Feeling: Creative, content flow, information
${BASE_STYLE}`,
  },
  {
    id: "concept-b4-quote-brackets",
    name: "Quote Brackets",
    concept: "Quotation",
    prompt: `Create a logo icon: Square brackets [ ] styled as modern citation marks.
Style: Clean geometric like Straico lightning bolt
Color: Indigo (#4F46E5) solid fill
Design: Two bracket shapes with subtle 3D depth, facing each other
Feeling: Technical, code reference, precision
${BASE_STYLE}`,
  },

  // Concept C: Network/Connection (4 variations)
  {
    id: "concept-c1-connected-nodes",
    name: "Connected Nodes",
    concept: "Network",
    prompt: `Create a logo icon: Three connected dots forming a network triangle.
Style: Minimal network diagram aesthetic like Groq
Color: Black (#000000) mono
Design: 3 circles connected by thin lines in triangular arrangement
Feeling: Interconnection, citations as links, SEO network
${BASE_STYLE}`,
  },
  {
    id: "concept-c2-citation-chain",
    name: "Citation Chain",
    concept: "Network",
    prompt: `Create a logo icon: Abstract chain links symbolizing connected citations.
Style: Gradient like Luma 3D shapes
Color: Cyan-blue gradient (#22D3EE to #3B82F6)
Design: Two or three interlocking rounded link shapes
Feeling: Connected sources, trust chain, authority links
${BASE_STYLE}`,
  },
  {
    id: "concept-c3-radial-links",
    name: "Radial Links",
    concept: "Network",
    prompt: `Create a logo icon: Central node with radiating connection lines to outer dots.
Style: Geometric burst/hub pattern
Color: Orange to red gradient (#F97316 to #EF4444)
Design: Central circle with 4-6 lines extending to smaller dots around it
Feeling: Source of information, hub, influence center
${BASE_STYLE}`,
  },
  {
    id: "concept-c4-flow-symbol",
    name: "Flow Symbol",
    concept: "Network",
    prompt: `Create a logo icon: Abstract arrow or flow shape suggesting information movement.
Style: Single solid flowing shape like Pika rabbit silhouette
Color: Deep teal (#0D9488) solid fill
Design: Abstract flowing arrow or movement mark, dynamic direction
Feeling: Content flow, SEO ranking movement, growth
${BASE_STYLE}`,
  },
];

async function generateLogo(
  variation: (typeof LOGO_VARIATIONS)[0],
  allRefs: { inlineData: { mimeType: string; data: string } }[]
): Promise<Buffer | null> {
  console.log(`\nGenerating: ${variation.id}...`);
  console.log(`  Name: ${variation.name}`);
  console.log(`  Concept: ${variation.concept}`);
  console.log(`  Using ${allRefs.length} style references`);

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
  console.log("=== CITEDY Logo Generation ===\n");
  console.log("Using competitor logos as style references");
  console.log("Model: gemini-2.5-flash-image\n");

  // Check for test mode
  const isTestMode = process.argv.includes("--test");
  const variationsToGenerate = isTestMode
    ? LOGO_VARIATIONS.slice(0, 3)
    : LOGO_VARIATIONS;

  if (isTestMode) {
    console.log("🧪 TEST MODE: Generating only first 3 variations\n");
  }

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
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  console.log(`Output: ${outputDir}\n`);

  const results: {
    id: string;
    name: string;
    concept: string;
    success: boolean;
    path?: string;
  }[] = [];

  for (let i = 0; i < variationsToGenerate.length; i++) {
    const variation = variationsToGenerate[i];

    const imageBuffer = await generateLogo(variation, allRefs);

    if (imageBuffer) {
      const filename = `${variation.id}.png`;
      const filepath = path.join(outputDir, filename);
      fs.writeFileSync(filepath, imageBuffer);
      results.push({
        id: variation.id,
        name: variation.name,
        concept: variation.concept,
        success: true,
        path: `/logo/citedy-generated/${filename}`,
      });
      console.log(`  Saved: ${filepath}`);
    } else {
      results.push({
        id: variation.id,
        name: variation.name,
        concept: variation.concept,
        success: false,
      });
    }

    // Rate limiting delay between generations
    if (i < variationsToGenerate.length - 1) {
      console.log("  Waiting 3s before next generation...");
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  // Summary
  console.log("\n=== Generation Summary ===");
  const successCount = results.filter((r) => r.success).length;
  console.log(
    `Generated: ${successCount}/${variationsToGenerate.length}${isTestMode ? " (test mode)" : ""}\n`
  );

  // Group by concept
  const concepts = ["Letter C", "Quotation", "Network"];
  for (const concept of concepts) {
    const conceptResults = results.filter((r) => r.concept === concept);
    console.log(`\n${concept}:`);
    conceptResults.forEach((r) => {
      const status = r.success ? "✓" : "✗";
      console.log(`  ${status} ${r.name} (${r.id})`);
    });
  }

  // Save results JSON
  const jsonPath = path.join(outputDir, "results.json");
  fs.writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        generated: new Date().toISOString(),
        model: "gemini-2.5-flash-image",
        references: LOGO_REFERENCES,
        results,
      },
      null,
      2
    )
  );
  console.log(`\nResults saved: ${jsonPath}`);

  // Next steps
  console.log("\n=== Next Steps ===");
  console.log("1. Review generated logos in: public/logo/citedy-generated/");
  console.log("2. Select best candidates");
  console.log(
    "3. Remove background: npx tsx docs/design/icons/process-single-icon.ts <logo-name>"
  );
  console.log("4. Copy final to: public/logo/citedy-final/");
}

main().catch(console.error);
