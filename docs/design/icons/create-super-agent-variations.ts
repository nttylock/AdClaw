/**
 * Create variations of the super agent portrait with different styles
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

// Style reference images
const STYLE_REFERENCES = [
  "/agent-icons/onboarding/onboarding-context-step6.png",
  "/agent-icons/onboarding/onboarding-context-step7.png",
  "/agent-icons/onboarding/onboarding-step4-gaps.png",
  "/agent-icons/onboarding/onboarding-step7-autopilot.png",
  "/agent-icons/stats/stats-articles.png",
  "/agent-icons/stats/stats-domains.png",
];

// Base style requirements
const BASE_STYLE = `
CRITICAL STYLE REQUIREMENTS (match the reference images exactly):
- Clean solid background (any color is fine - will be removed automatically)
- 3D isometric perspective with soft depth
- Glowing gradient effect on the main object
- Glassmorphism with subtle transparency and glow
- Soft drop shadow underneath
- Clean, minimal, professional SaaS icon style
- Single centered object - NO complex backgrounds
- High detail, smooth gradients
- NO text, NO labels, NO numbers
- Output size: 512x512 pixels
- Background will be automatically removed using AI (free, local processing)
`;

// Different variations of super agent portrait
const SUPER_AGENT_VARIATIONS = [
  {
    name: "super-agent-clean",
    title: "Clean minimalist super agent",
    prompt: `Create a clean, minimalist portrait of a young Super Agent representing AI autopilot.

Subject: Young agent with subtle features, wearing a sleek high-tech visor. Simple, elegant design focusing on the face and mask as one cohesive icon element.

Style: Clean, minimal, professional, focused on the core elements
Colors: Subtle blue and purple gradient (#6366F1 to #8B5CF6)

${BASE_STYLE}`,
  },
  {
    name: "super-agent-dynamic",
    title: "Dynamic energetic super agent",
    prompt: `Create a dynamic, energetic portrait of a young Super Agent.

Subject: Young agent with flowing ginger hair, wearing an advanced tech visor with energy effects. The mask glows with vibrant colors suggesting power and intelligence.

Style: Dynamic, energetic, powerful, with subtle motion/energy effects
Colors: Electric blue and vibrant purple gradient (#3B82F6 to #8B5CF6)

${BASE_STYLE}`,
  },
  {
    name: "super-agent-tech",
    title: "High-tech circuit super agent",
    prompt: `Create a high-tech portrait of a young Super Agent with circuit elements.

Subject: Young agent face integrated with subtle circuit patterns and tech elements. The visor features holographic displays and technical details.

Style: High-tech, futuristic, detailed circuits, advanced technology
Colors: Cyan and blue gradient (#06B6D4 to #3B82F6)

${BASE_STYLE}`,
  },
];

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

async function createSuperAgentVariation(
  variation: (typeof SUPER_AGENT_VARIATIONS)[0],
  allRefs: { inlineData: { mimeType: string; data: string } }[],
): Promise<boolean> {
  console.log(`\n🎨 Creating variation: ${variation.name}`);
  console.log(`📝 Theme: ${variation.title}`);

  try {
    const contents: any[] = [];

    for (const ref of allRefs) {
      contents.push(ref);
    }

    contents.push({
      text: `These ${allRefs.length} images are your style references. Match their visual style exactly:

- Same 3D isometric perspective
- Same soft glowing gradients
- Same glassmorphism effects
- Same shadow and depth style
- Same professional SaaS aesthetic

Now create this specific variation:\n\n`,
    });

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
          console.log(`✓ Generated ${variation.name}`);

          // Save temporarily
          const tempFilename = `header-dashboard-autopilot-${variation.name}-temp.png`;
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
          console.log(`Removing background for ${variation.name}...`);
          const result = await removeBackground(tempFilepath);
          const arrayBuffer = await result.arrayBuffer();
          const transparentBuffer = Buffer.from(arrayBuffer);

          // Clean up temp file
          fs.unlinkSync(tempFilepath);

          // Save final versions
          const pngPath = path.join(
            process.cwd(),
            "public",
            "new-icons",
            `header-dashboard-autopilot-${variation.name}.png`,
          );
          fs.writeFileSync(pngPath, transparentBuffer);

          console.log(
            `✓ Saved PNG: header-dashboard-autopilot-${variation.name}.png (${transparentBuffer.length} bytes)`,
          );

          // Also convert to WebP
          const sharp = await import("sharp");
          const webpPath = path.join(
            process.cwd(),
            "public",
            "new-icons",
            `header-dashboard-autopilot-${variation.name}.webp`,
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
          console.log(
            `✓ Saved WebP: header-dashboard-autopilot-${variation.name}.webp (${webpBuffer.length} bytes)`,
          );

          return true;
        }
      }
    }

    const text = response.text;
    if (text) {
      console.log(
        `✗ No image for ${variation.name}. Response: ${text.substring(0, 150)}...`,
      );
    }
    return false;
  } catch (error: any) {
    console.error(
      `✗ Error generating ${variation.name}: ${error.message || error}`,
    );
    return false;
  }
}

async function main() {
  console.log("🎭 Creating Super Agent Portrait Variations\n");
  console.log(`📋 Generating ${SUPER_AGENT_VARIATIONS.length} variations`);
  console.log("🎨 All using our 6 reference images for consistent style\n");

  const allRefs = STYLE_REFERENCES.map((filename) =>
    loadReferenceImage(filename),
  ).filter(Boolean);
  console.log(`Loaded ${allRefs.length} style reference images\n`);

  if (allRefs.length === 0) {
    console.error("No reference images found!");
    process.exit(1);
  }

  const results: {
    name: string;
    title: string;
    success: boolean;
    pngSize?: number;
    webpSize?: number;
  }[] = [];

  for (let i = 0; i < SUPER_AGENT_VARIATIONS.length; i++) {
    const variation = SUPER_AGENT_VARIATIONS[i];

    const success = await createSuperAgentVariation(variation, allRefs);

    if (success) {
      // Check file sizes
      const pngPath = path.join(
        process.cwd(),
        "public",
        "new-icons",
        `header-dashboard-autopilot-${variation.name}.png`,
      );
      const webpPath = path.join(
        process.cwd(),
        "public",
        "new-icons",
        `header-dashboard-autopilot-${variation.name}.webp`,
      );

      const pngSize = fs.existsSync(pngPath) ? fs.statSync(pngPath).size : 0;
      const webpSize = fs.existsSync(webpPath) ? fs.statSync(webpPath).size : 0;

      results.push({
        name: variation.name,
        title: variation.title,
        success: true,
        pngSize,
        webpSize,
      });
    } else {
      results.push({
        name: variation.name,
        title: variation.title,
        success: false,
      });
    }

    // Wait between generations
    if (i < SUPER_AGENT_VARIATIONS.length - 1) {
      console.log("⏳ Waiting 3 seconds before next variation...\n");
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  console.log("\n=== Super Agent Variations Summary ===");
  const successCount = results.filter((r) => r.success).length;
  console.log(
    `Generated: ${successCount}/${SUPER_AGENT_VARIATIONS.length} variations\n`,
  );

  results.forEach((r, index) => {
    const status = r.success ? "✅" : "❌";
    console.log(`${index + 1}. ${status} ${r.name}`);
    console.log(`   "${r.title}"`);
    if (r.success && r.pngSize && r.webpSize) {
      console.log(
        `   PNG: ${(r.pngSize / 1024).toFixed(1)}KB, WebP: ${(r.webpSize / 1024).toFixed(1)}KB`,
      );
    }
    console.log("");
  });

  console.log("📁 All variations saved to: /public/new-icons/");
  console.log("🎨 Style: Consistent with our 6 reference images");
}

main().catch(console.error);
