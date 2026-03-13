/**
 * Regenerate autopilot icon with another creative concept - Version 2
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

// Base style matching existing icons
const BASE_STYLE = `
CRITICAL STYLE REQUIREMENTS (match the reference images exactly):
- Clean solid background (any color is fine - will be removed automatically)
- 3D isometric perspective with soft depth
- Glowing gradient effect on the main object
- Glassmorphism with subtle transparency and glow
- Soft drop shadow underneath
- Clean, minimal, professional SaaS icon style
- Single centered object
- High detail, smooth gradients
- NO text, NO labels, NO numbers
- Output size: 512x512 pixels
- Background will be automatically removed using AI (free, local processing)
`;

// New creative autopilot prompt - Version 2: Smart rocket with AI navigation
const AUTOPILOT_PROMPT_V2 = `Subject: A glowing smart rocket with AI navigation beams, trajectory calculations, and autonomous flight indicators, representing intelligent automation and precise AI-guided systems.
Colors: emerald and green gradient (#10B981 to #22C55E)
Style: Intelligent navigation, autonomous flight, AI precision, smart automation
${BASE_STYLE}`;

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

async function regenerateAutopilotIconV2(): Promise<boolean> {
  console.log("🚀 Regenerating autopilot icon with new creative concept...");
  console.log("New concept v2: Smart rocket with AI navigation beams");

  const allRefs = STYLE_REFERENCES.map((filename) =>
    loadReferenceImage(filename),
  ).filter(Boolean);
  console.log(`Loaded ${allRefs.length} style reference images\n`);

  const contents: any[] = [];

  for (const ref of allRefs) {
    contents.push(ref);
  }

  contents.push({
    text: `These ${allRefs.length} images are style references. Match their EXACT visual style:
- Same 3D isometric perspective
- Same soft glowing gradients
- Same glassmorphism transparency effect
- Same shadow style
- Same level of detail and polish

Now create a NEW icon with this exact style:\n\n`,
  });

  contents.push({ text: AUTOPILOT_PROMPT_V2 });

  try {
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
          console.log("✓ Generated new autopilot icon v2");

          // Save temporarily
          const tempFilename = "header-dashboard-autopilot-temp-v2.png";
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
            "header-dashboard-autopilot.png",
          );
          fs.writeFileSync(finalPath, transparentBuffer);

          console.log(
            `✓ Saved new autopilot icon v2 (${transparentBuffer.length} bytes)`,
          );

          // Also convert to WebP
          const sharp = await import("sharp");
          const webpPath = path.join(
            process.cwd(),
            "public",
            "new-icons",
            "header-dashboard-autopilot.webp",
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
      console.log(`✗ No image. Response: ${text.substring(0, 150)}...`);
    }
    return false;
  } catch (error: any) {
    console.error(`✗ Error: ${error.message || error}`);
    return false;
  }
}

async function main() {
  const success = await regenerateAutopilotIconV2();

  if (success) {
    console.log("\n✅ Autopilot icon v2 regenerated successfully!");
    console.log(
      "📍 Location: /public/new-icons/header-dashboard-autopilot.png",
    );
    console.log("📍 WebP: /public/new-icons/header-dashboard-autopilot.webp");
    console.log("🚀 New concept v2: Smart rocket with AI navigation beams");
  } else {
    console.log("\n❌ Failed to regenerate autopilot icon v2");
  }
}

main().catch(console.error);
