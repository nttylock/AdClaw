/**
 * Regenerate autopilot icon with Apple Intelligence style - Apple-inspired design
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

// New creative autopilot prompt - Apple Intelligence style
const AUTOPILOT_PROMPT_APPLE = `Subject: An elegant, minimalist Apple Intelligence-inspired logo featuring a stylized apple silhouette integrated with flowing neural network connections and intelligence waves, representing smart automation and AI-powered autonomy. Clean, sophisticated design with subtle intelligence indicators.
Colors: slate and gray gradient (#64748B to #94A3B8)
Style: Elegant, minimalist, Apple-inspired, intelligent, sophisticated, clean design with subtle neural elements
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

async function regenerateAutopilotIconApple(): Promise<boolean> {
  console.log(
    "🍎 Regenerating autopilot icon with Apple Intelligence style...",
  );
  console.log(
    "New concept: Apple Intelligence-inspired logo with neural connections",
  );

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

  contents.push({ text: AUTOPILOT_PROMPT_APPLE });

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
          console.log(
            "✓ Generated new Apple Intelligence-style autopilot icon",
          );

          // Save temporarily
          const tempFilename = "header-dashboard-autopilot-apple-temp.png";
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
            `✓ Saved new Apple Intelligence icon (${transparentBuffer.length} bytes)`,
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
  const success = await regenerateAutopilotIconApple();

  if (success) {
    console.log(
      "\n✅ Apple Intelligence-style autopilot icon created successfully!",
    );
    console.log(
      "📍 Location: /public/new-icons/header-dashboard-autopilot.png",
    );
    console.log("📍 WebP: /public/new-icons/header-dashboard-autopilot.webp");
    console.log(
      "🍎 New concept: Apple Intelligence-inspired logo with neural connections",
    );
  } else {
    console.log(
      "\n❌ Failed to create Apple Intelligence-style autopilot icon",
    );
  }
}

main().catch(console.error);
