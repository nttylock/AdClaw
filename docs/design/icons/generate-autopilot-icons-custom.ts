/**
 * Generate multiple custom autopilot icons based on user's prompts
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

// Custom prompts from user
const CUSTOM_PROMPTS = [
  {
    name: "petals-star",
    title: "Six translucent glowing petals surrounding a central bright star",
    prompt: `Six translucent glowing petals surrounding a central bright star. The petals are made of layered iridescent glass. Color palette: sunset orange to electric blue. Style: Elegant, mystical, radiant, harmonious
${BASE_STYLE}`,
  },
  {
    name: "floating-document",
    title: "Floating digital document sheet made of frosted glass",
    prompt: `Floating digital document sheet made of frosted glass. Inside the sheet, glowing lines of text in neon blue and pink. A small glowing star (like in the logo) sparkles in the corner. Style: Digital, futuristic, illuminated, data-driven
${BASE_STYLE}`,
  },
  {
    name: "super-agent-portrait",
    title: "Hyper-realistic cinematic portrait of a young Super Agent",
    prompt: `Head, Hyper-realistic cinematic portrait of a young "Super Agent" with ginger hair and freckles. He is wearing a sleek, futuristic matte-finish mask that looks like high-tech superhero goggles. The mask features a vibrant smooth gradient of sunset orange, magenta, and electric blue. Style: Cinematic, heroic, futuristic, detailed
${BASE_STYLE}`,
  },
  {
    name: "digital-agent-closeup",
    title: "Close-up portrait of a digital agent personified",
    prompt: `Close-up portrait of a digital agent personified. Wearing a minimalist glassmorphism visor with a glowing orange-to-blue gradient. Soft pastel background, high-tech laboratory lighting. Detailed skin texture, messy hair, looking directly into the camera. Style: Personal, approachable, technical, human-AI hybrid
${BASE_STYLE}`,
  },
  {
    name: "diverse-agents-group",
    title: "A diverse group of AI agents portraits",
    prompt: `A diverse group of AI agents portraits. Each person is wearing a signature futuristic matte mask with a vibrant pink, orange, and blue gradient. Style: Diverse, unified, futuristic, collaborative
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

async function generateCustomIcon(
  iconConfig: (typeof CUSTOM_PROMPTS)[0],
  allRefs: { inlineData: { mimeType: string; data: string } }[],
): Promise<boolean> {
  console.log(`\n🎨 Generating: ${iconConfig.name}`);
  console.log(`📝 Title: ${iconConfig.title}`);
  console.log(`🔄 Using ${allRefs.length} style references`);

  try {
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

    contents.push({ text: iconConfig.prompt });

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
          console.log(`✓ Generated ${iconConfig.name}`);

          // Save temporarily
          const tempFilename = `header-dashboard-autopilot-${iconConfig.name}-temp.png`;
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
          console.log(`Removing background for ${iconConfig.name}...`);
          const result = await removeBackground(tempFilepath);
          const arrayBuffer = await result.arrayBuffer();
          const transparentBuffer = Buffer.from(arrayBuffer);

          // Clean up temp file
          fs.unlinkSync(tempFilepath);

          // Save final PNG version
          const finalPngPath = path.join(
            process.cwd(),
            "public",
            "new-icons",
            `header-dashboard-autopilot-${iconConfig.name}.png`,
          );
          fs.writeFileSync(finalPngPath, transparentBuffer);

          console.log(
            `✓ Saved PNG: header-dashboard-autopilot-${iconConfig.name}.png (${transparentBuffer.length} bytes)`,
          );

          // Also convert to WebP
          const sharp = await import("sharp");
          const webpPath = path.join(
            process.cwd(),
            "public",
            "new-icons",
            `header-dashboard-autopilot-${iconConfig.name}.webp`,
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
            `✓ Saved WebP: header-dashboard-autopilot-${iconConfig.name}.webp (${webpBuffer.length} bytes)`,
          );

          return true;
        }
      }
    }

    const text = response.text;
    if (text) {
      console.log(
        `✗ No image for ${iconConfig.name}. Response: ${text.substring(0, 150)}...`,
      );
    }
    return false;
  } catch (error: any) {
    console.error(
      `✗ Error generating ${iconConfig.name}: ${error.message || error}`,
    );
    return false;
  }
}

async function main() {
  console.log(
    "🚀 Generating custom autopilot icons based on user prompts...\n",
  );
  console.log(`📋 Total icons to generate: ${CUSTOM_PROMPTS.length}\n`);

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

  for (let i = 0; i < CUSTOM_PROMPTS.length; i++) {
    const iconConfig = CUSTOM_PROMPTS[i];

    const success = await generateCustomIcon(iconConfig, allRefs);

    if (success) {
      // Check file sizes
      const pngPath = path.join(
        process.cwd(),
        "public",
        "new-icons",
        `header-dashboard-autopilot-${iconConfig.name}.png`,
      );
      const webpPath = path.join(
        process.cwd(),
        "public",
        "new-icons",
        `header-dashboard-autopilot-${iconConfig.name}.webp`,
      );

      const pngSize = fs.existsSync(pngPath) ? fs.statSync(pngPath).size : 0;
      const webpSize = fs.existsSync(webpPath) ? fs.statSync(webpPath).size : 0;

      results.push({
        name: iconConfig.name,
        title: iconConfig.title,
        success: true,
        pngSize,
        webpSize,
      });
    } else {
      results.push({
        name: iconConfig.name,
        title: iconConfig.title,
        success: false,
      });
    }

    // Wait between generations to avoid rate limits
    if (i < CUSTOM_PROMPTS.length - 1) {
      console.log("⏳ Waiting 3 seconds before next generation...\n");
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  console.log("\n=== Summary ===");
  const successCount = results.filter((r) => r.success).length;
  console.log(
    `Generated: ${successCount}/${CUSTOM_PROMPTS.length} custom icons\n`,
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

  console.log("📁 All icons saved to: /public/new-icons/");
  console.log("🎨 Generated with custom prompts from user");
}

main().catch(console.error);
