/**
 * Improve the super agent portrait icon with better composition and style matching
 */

import { GoogleGenAI } from "@google/genai";
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

// Style reference images - same 6 references
const STYLE_REFERENCES = [
  "/agent-icons/onboarding/onboarding-context-step6.png",
  "/agent-icons/onboarding/onboarding-context-step7.png",
  "/agent-icons/onboarding/onboarding-step4-gaps.png",
  "/agent-icons/onboarding/onboarding-step7-autopilot.png",
  "/agent-icons/stats/stats-articles.png",
  "/agent-icons/stats/stats-domains.png",
];

// Enhanced style requirements with more specific guidance
const ENHANCED_BASE_STYLE = `
CRITICAL STYLE REQUIREMENTS (match the reference images exactly):
- Clean solid background (any color is fine - will be removed automatically)
- 3D isometric perspective with soft depth
- Glowing gradient effect on the main object
- Glassmorphism with subtle transparency and glow
- Soft drop shadow underneath
- Clean, minimal, professional SaaS icon style
- Single centered object - NO complex backgrounds or multiple elements
- High detail, smooth gradients
- NO text, NO labels, NO numbers
- Output size: 512x512 pixels
- Background will be automatically removed using AI (free, local processing)

IMPORTANT: The result should be a clean, single icon element that fits our existing design system.
Focus on the character's face and mask as one cohesive icon element.
`;

// Improved prompt for super agent portrait
const IMPROVED_SUPER_AGENT_PROMPT = `Create a stylized portrait icon of a young Super Agent representing AI autopilot capabilities.

Subject: A confident young agent with subtle ginger hair and freckles, wearing a sleek high-tech visor/mask. The mask features a vibrant gradient of sunset orange, magenta, and electric blue.

Style requirements:
- Heroic but approachable expression
- Clean, modern design
- Focus on face and mask as central icon element
- Professional SaaS aesthetic
- Single centered composition

Key elements:
- Young agent face (ginger hair, freckles)
- Futuristic visor with glowing gradient
- Determined, intelligent expression
- Clean background (will be removed)

${ENHANCED_BASE_STYLE}`;

function loadReferenceImage(
  filename: string,
): { inlineData: { mimeType: string; data: string } } | null {
  const cleanFilename = filename.startsWith("/agent-icons/")
    ? filename.slice("/agent-icons/".length)
    : filename;

  const filepath = path.join(
    process.cwd(),
    "public",
    "agent-icons",
    cleanFilename,
  );
  if (!fs.existsSync(filepath)) {
    console.warn(`Reference not found: ${filepath}`);
    return null;
  }
  const data = fs.readFileSync(filepath).toString("base64");
  return {
    inlineData: {
      mimeType: "image/png",
      data,
    },
  };
}

async function improveSuperAgentPortrait(): Promise<boolean> {
  console.log("🎭 Improving super agent portrait icon...");
  console.log("🎨 Using enhanced style guidance and better composition");
  console.log("📋 Loading 6 reference images from our design system\n");

  const allRefs = STYLE_REFERENCES.map((filename) =>
    loadReferenceImage(filename),
  ).filter(Boolean);

  if (allRefs.length !== 6) {
    console.warn(`Warning: Expected 6 references, found ${allRefs.length}`);
  }

  console.log(`✓ Loaded ${allRefs.length} style reference images`);
  console.log("Reference files:");
  STYLE_REFERENCES.forEach((ref, index) => {
    console.log(`  ${index + 1}. ${ref}`);
  });
  console.log("");

  try {
    const contents: any[] = [];

    // Add all reference images
    for (const ref of allRefs) {
      contents.push(ref);
    }

    // Detailed style instruction
    contents.push({
      text: `These ${allRefs.length} images are your EXACT style references. Study them carefully:

CRITICAL REQUIREMENTS:
- Match the 3D isometric perspective exactly
- Copy the soft glowing gradient effects precisely
- Replicate the glassmorphism transparency and glow effects
- Use the same shadow style and depth
- Maintain the same level of professional polish
- Keep the single centered object composition

The result should look like it belongs in this exact design system.
No complex backgrounds, no multiple elements - just one clean icon.

Now create an IMPROVED version of the super agent portrait that perfectly matches this style:\n\n`,
    });

    contents.push({ text: IMPROVED_SUPER_AGENT_PROMPT });

    console.log("🤖 Generating improved super agent portrait...");
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
          console.log("✓ Generated improved super agent portrait");

          // Save temporarily
          const tempFilename =
            "header-dashboard-autopilot-super-agent-improved-temp.png";
          const tempFilepath = path.join(
            process.cwd(),
            "public",
            "new-icons",
            tempFilename,
          );
          fs.writeFileSync(
            tempFilepath,
            Buffer.from(part.inlineData.data, "base64"),
          );

          // Remove background
          console.log("Removing background...");
          const result = await removeBackground(tempFilepath);
          const arrayBuffer = await result.arrayBuffer();
          const transparentBuffer = Buffer.from(arrayBuffer);

          // Clean up temp file
          fs.unlinkSync(tempFilepath);

          // Save final version (overwrite existing)
          const finalPath = path.join(
            process.cwd(),
            "public",
            "new-icons",
            "header-dashboard-autopilot-super-agent-portrait.png",
          );
          fs.writeFileSync(finalPath, transparentBuffer);

          console.log(
            `✓ Saved improved icon (${transparentBuffer.length} bytes)`,
          );

          // Also convert to WebP
          const sharp = await import("sharp");
          const webpPath = path.join(
            process.cwd(),
            "public",
            "new-icons",
            "header-dashboard-autopilot-super-agent-portrait.webp",
          );

          const webpBuffer = await sharp
            .default(transparentBuffer)
            .webp({
              quality: 85,
              lossless: false,
              effort: 6,
            })
            .toBuffer();

          fs.writeFileSync(webpPath, webpBuffer);
          console.log(`✓ Also saved WebP version (${webpBuffer.length} bytes)`);

          return true;
        }
      }
    }

    const text = response.text;
    if (text) {
      console.log(
        `✗ No image generated. Response: ${text.substring(0, 200)}...`,
      );
    }
    return false;
  } catch (error: any) {
    console.error(`✗ Error: ${error.message || error}`);
    return false;
  }
}

async function main() {
  console.log("=== Improving Super Agent Portrait Icon ===\n");

  const success = await improveSuperAgentPortrait();

  if (success) {
    console.log("\n✅ Super agent portrait icon improved successfully!");
    console.log(
      "📍 Location: /public/new-icons/header-dashboard-autopilot-super-agent-portrait.png",
    );
    console.log(
      "📍 WebP: /public/new-icons/header-dashboard-autopilot-super-agent-portrait.webp",
    );
    console.log("🎨 Style: Enhanced to match our 6 reference images perfectly");
    console.log("📋 References used: 6 design system icons");
  } else {
    console.log("\n❌ Failed to improve super agent portrait icon");
  }
}

main().catch(console.error);
