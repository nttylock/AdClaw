/**
 * Create additional variations of the digital agent closeup icon
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

// Style reference images - our 6 core references
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

// Additional variations of digital agent closeup
const DIGITAL_AGENT_VARIATIONS = [
  {
    name: "digital-agent-cyber",
    title: "Cyberpunk digital agent",
    prompt: `Close-up portrait of a cyberpunk digital agent. Neon-lit laboratory setting with holographic displays. Wearing a high-tech neural interface visor with electric blue circuit patterns glowing through the glass. Metallic silver hair with neon highlights, piercing gaze, cybernetic enhancements visible.

Style: Cyberpunk, neon, futuristic, high-tech, intense lighting
Colors: Electric blue and neon pink gradients (#00FFFF to #FF00FF)

${BASE_STYLE}`,
  },
  {
    name: "digital-agent-minimal",
    title: "Ultra-minimal digital agent",
    prompt: `Ultra-minimal close-up portrait of a digital agent. Clean white laboratory background. Wearing a simple transparent glass visor with subtle gradient. Short neat hair, calm expression, professional appearance.

Style: Minimalist, clean, professional, subtle, elegant
Colors: Soft gray and white tones (#94A3B8 to #FFFFFF)

${BASE_STYLE}`,
  },
  {
    name: "digital-agent-creative",
    title: "Creative artistic digital agent",
    prompt: `Artistic close-up portrait of a creative digital agent. Bohemian laboratory with artistic lighting. Wearing a artistic glass visor with colorful gradient effects. Wavy artistic hair, thoughtful expression, creative spark in eyes.

Style: Artistic, creative, bohemian, colorful, inspired
Colors: Vibrant purple and turquoise gradient (#8B5CF6 to #06B6D4)

${BASE_STYLE}`,
  },
  {
    name: "digital-agent-serious",
    title: "Serious professional digital agent",
    prompt: `Professional close-up portrait of a serious digital agent. Corporate laboratory setting. Wearing a sleek business-grade glass visor. Well-groomed appearance, serious expression, professional demeanor.

Style: Corporate, serious, professional, trustworthy, reliable
Colors: Navy blue and steel gray gradient (#1E40AF to #6B7280)

${BASE_STYLE}`,
  },
  {
    name: "digital-agent-energetic",
    title: "Energetic dynamic digital agent",
    prompt: `Energetic close-up portrait of a dynamic digital agent. High-energy laboratory with motion blur effects. Wearing a sporty glass visor with bold gradient. Wind-blown hair, energetic expression, dynamic pose.

Style: Dynamic, energetic, athletic, powerful, active
Colors: Bright orange and red gradient (#F97316 to #EF4444)

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

async function createDigitalAgentVariation(
  variation: (typeof DIGITAL_AGENT_VARIATIONS)[0],
  allRefs: { inlineData: { mimeType: string; data: string } }[],
): Promise<boolean> {
  console.log(`\n🤖 Creating digital agent variation: ${variation.name}`);
  console.log(`🎨 Style: ${variation.title}`);

  try {
    const contents: any[] = [];

    for (const ref of allRefs) {
      contents.push(ref);
    }

    contents.push({
      text: `These ${allRefs.length} images are your EXACT style references. Match their visual style perfectly:

CRITICAL MATCHING REQUIREMENTS:
- Same 3D isometric perspective
- Same soft glowing gradient effects
- Same glassmorphism transparency and glow
- Same shadow style and depth
- Same professional SaaS polish level
- Single centered object composition

Now create this specific digital agent variation:\n\n`,
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
  console.log("🤖 Creating Additional Digital Agent Variations\n");
  console.log(
    `📋 Generating ${DIGITAL_AGENT_VARIATIONS.length} new variations`,
  );
  console.log("🎨 All based on the original digital-agent-closeup concept");
  console.log("📚 Using our 6 core reference images for consistent style\n");

  const allRefs = STYLE_REFERENCES.map((filename) =>
    loadReferenceImage(filename),
  ).filter(Boolean);
  console.log(`✓ Loaded ${allRefs.length} style reference images\n`);

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

  for (let i = 0; i < DIGITAL_AGENT_VARIATIONS.length; i++) {
    const variation = DIGITAL_AGENT_VARIATIONS[i];

    const success = await createDigitalAgentVariation(variation, allRefs);

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
    if (i < DIGITAL_AGENT_VARIATIONS.length - 1) {
      console.log("⏳ Waiting 3 seconds before next variation...\n");
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  console.log("\n=== Digital Agent Variations Summary ===");
  const successCount = results.filter((r) => r.success).length;
  console.log(
    `Generated: ${successCount}/${DIGITAL_AGENT_VARIATIONS.length} new variations\n`,
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

  console.log("📁 All new variations saved to: /public/new-icons/");
  console.log(
    "🎨 Base concept: Digital agent closeup with glassmorphism visor",
  );
  console.log("📚 Style consistency: 6 reference images from design system");
}

main().catch(console.error);
