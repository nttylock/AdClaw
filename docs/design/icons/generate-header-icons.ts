/**
 * Generate unique icons for page headers in Citedy app
 * Uses existing reference icons as style guide
 *
 * Usage: npx tsx scripts/generate-header-icons.ts [--test]
 * --test: Generate only first 3 icons for testing
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

// Load reference images
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

function loadAllReferences(): {
  inlineData: { mimeType: string; data: string };
}[] {
  const refs: { inlineData: { mimeType: string; data: string } }[] = [];
  for (const filename of STYLE_REFERENCES) {
    const ref = loadReferenceImage(filename);
    if (ref) refs.push(ref);
  }
  return refs;
}

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

// Header icons configuration
const HEADER_ICONS = [
  // Home & General pages
  {
    id: "header-contact",
    url: "/contact",
    title: "Contact Us",
    prompt: `Subject: A glowing speech bubble or chat icon with connecting lines, representing communication and contact.
Colors: blue and cyan gradient (#3B82F6 to #06B6D4)
Style: Friendly, approachable, welcoming
${BASE_STYLE}`,
  },
  {
    id: "header-privacy",
    url: "/privacy",
    title: "Privacy Policy",
    prompt: `Subject: A glowing shield with lock symbol and protection aura, representing privacy and security.
Colors: green and emerald gradient (#10B981 to #22C55E)
Style: Trustworthy, protective, secure
${BASE_STYLE}`,
  },
  {
    id: "header-terms",
    url: "/terms",
    title: "Terms of Use",
    prompt: `Subject: A glowing shield with checkmark symbol inside, representing legal protection and agreement acceptance.
Colors: amber and orange gradient (#F59E0B to #F97316)
Style: Trustworthy, protective, modern legal compliance
${BASE_STYLE}`,
  },

  // Dashboard pages
  {
    id: "header-dashboard-welcome",
    url: "/dashboard/new",
    title: "Welcome back!",
    prompt: `Subject: A glowing welcome mat or doorway with warm light, representing return and personalization.
Colors: violet and purple gradient (#8B5CF6 to #A855F7)
Style: Warm, welcoming, personalized greeting
${BASE_STYLE}`,
  },
  {
    id: "header-dashboard-blog",
    url: "/dashboard/blog",
    title: "Blog Posts",
    prompt: `Subject: A glowing stack of floating blog post cards with text lines, representing content management.
Colors: blue and cyan gradient (#3B82F6 to #06B6D4)
Style: Content-focused, organized, blogging
${BASE_STYLE}`,
  },
  {
    id: "header-dashboard-writer",
    url: "/dashboard/blog/new",
    title: "Writer Agent",
    prompt: `Subject: A glowing quill pen writing on floating paper with AI sparks, representing content creation.
Colors: emerald and green gradient (#10B981 to #22C55E)
Style: Creative, writing, AI-assisted creation
${BASE_STYLE}`,
  },
  {
    id: "header-dashboard-design",
    url: "/dashboard/blog/new/demo",
    title: "Design Improvements",
    prompt: `Subject: A glowing checklist with checkmarks and improvement arrows, representing design approval.
Colors: amber and orange gradient (#F59E0B to #F97316)
Style: Quality, approval, improvement
${BASE_STYLE}`,
  },
  {
    id: "header-dashboard-editor",
    url: "/dashboard/blog/[articleId]",
    title: "Article Editor",
    prompt: `Subject: A glowing edit cursor on document with price tag, representing article editing and monetization.
Colors: violet and purple gradient (#8B5CF6 to #A855F7)
Style: Editing, monetization, content value
${BASE_STYLE}`,
  },
  {
    id: "header-dashboard-ai-insights",
    url: "/dashboard/ai-insights",
    title: "AI Visibility Dashboard",
    prompt: `Subject: A glowing radar screen with AI brain waves, representing AI analytics and visibility.
Colors: blue and cyan gradient (#3B82F6 to #06B6D4)
Style: Analytics, AI, visibility tracking
${BASE_STYLE}`,
  },
  {
    id: "header-dashboard-ai-readiness",
    url: "/dashboard/ai-insights/ai-readiness",
    title: "AI Readiness Analysis",
    prompt: `Subject: A glowing progress bar with AI gears and checkmarks, representing AI readiness assessment.
Colors: emerald and green gradient (#10B981 to #22C55E)
Style: Assessment, readiness, AI evaluation
${BASE_STYLE}`,
  },
  {
    id: "header-dashboard-autopilot",
    url: "/dashboard/autopilot",
    title: "Autopilot Agents",
    prompt: `Subject: A glowing steering wheel with AI autopilot indicators, representing automated agents.
Colors: amber and orange gradient (#F59E0B to #F97316)
Style: Automation, self-driving, intelligent agents
${BASE_STYLE}`,
  },
  {
    id: "header-dashboard-billing",
    url: "/dashboard/billing",
    title: "Billing & Subscription",
    prompt: `Subject: A glowing credit card with subscription cycle arrows, representing payment and billing.
Colors: violet and purple gradient (#8B5CF6 to #A855F7)
Style: Financial, subscription, payment processing
${BASE_STYLE}`,
  },
  {
    id: "header-dashboard-exports",
    url: "/dashboard/exports",
    title: "Export Jobs",
    prompt: `Subject: A glowing download arrow with data streams, representing data export operations.
Colors: blue and cyan gradient (#3B82F6 to #06B6D4)
Style: Data export, download, job processing
${BASE_STYLE}`,
  },
  {
    id: "header-dashboard-settings",
    url: "/dashboard/settings",
    title: "Settings",
    prompt: `Subject: A glowing gear with configuration sliders, representing system settings and preferences.
Colors: emerald and green gradient (#10B981 to #22C55E)
Style: Configuration, settings, preferences
${BASE_STYLE}`,
  },

  // Onboarding
  {
    id: "header-onboarding",
    url: "/onboarding",
    title: "Welcome to Citedy",
    prompt: `Subject: A glowing rocket ship blasting off with dynamic trail of particles, representing launch and beginning of journey.
Colors: amber and orange gradient (#F59E0B to #F97316)
Style: Dynamic, energetic, exciting startup and new beginnings
${BASE_STYLE}`,
  },
];

async function removeBackgroundFromImage(imagePath: string): Promise<Buffer> {
  try {
    console.log(`  Removing background with @imgly/background-removal-node...`);

    // @imgly/background-removal-node works with file paths and returns Blob
    const result = await removeBackground(imagePath);

    // Convert Blob to Buffer
    const arrayBuffer = await result.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(
      `  ✓ Background removed (free, local processing) - ${buffer.length} bytes`,
    );
    return buffer;
  } catch (error: any) {
    console.error(`  ✗ Background removal failed: ${error.message || error}`);
    // Return original image if background removal fails
    console.log("  ⚠ Returning original image (background removal failed)");
    return fs.readFileSync(imagePath);
  }
}

async function generateIcon(
  iconConfig: (typeof HEADER_ICONS)[0],
  allRefs: { inlineData: { mimeType: string; data: string } }[],
): Promise<Buffer | null> {
  console.log(`\nGenerating: ${iconConfig.id}...`);
  console.log(`  URL: ${iconConfig.url}`);
  console.log(`  Title: ${iconConfig.title}`);
  console.log(`  Using ${allRefs.length} style references`);

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
          console.log(`  ✓ Generated ${iconConfig.id}`);
          return Buffer.from(part.inlineData.data, "base64");
        }
      }
    }

    const text = response.text;
    if (text) {
      console.log(`  ✗ No image. Response: ${text.substring(0, 150)}...`);
    }
    return null;
  } catch (error: any) {
    console.error(`  ✗ Error: ${error.message || error}`);
    return null;
  }
}

async function main() {
  console.log("=== Generating Header Icons ===\n");
  console.log("Style references: onboarding and stats icons");
  console.log("Total icons to generate: 15\n");

  // Check for test mode (generate only first 3 icons)
  const isTestMode = process.argv.includes("--test");
  const iconsToGenerate = isTestMode ? HEADER_ICONS.slice(0, 3) : HEADER_ICONS;

  if (isTestMode) {
    console.log("🧪 TEST MODE: Generating only first 3 icons\n");
  }

  const allRefs = loadAllReferences();
  console.log(`Loaded ${allRefs.length} style reference images\n`);

  if (allRefs.length === 0) {
    console.error("No reference images found!");
    process.exit(1);
  }

  const outputDir = path.join(process.cwd(), "public", "new-icons");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  console.log(`Output: ${outputDir}\n`);

  const results: {
    id: string;
    url: string;
    title: string;
    success: boolean;
    path?: string;
  }[] = [];

  for (let i = 0; i < iconsToGenerate.length; i++) {
    const iconConfig = iconsToGenerate[i];

    const imageBuffer = await generateIcon(iconConfig, allRefs);

    if (imageBuffer) {
      // First save the generated image temporarily
      const tempFilename = `${iconConfig.id}-temp.png`;
      const tempFilepath = path.join(outputDir, tempFilename);
      fs.writeFileSync(tempFilepath, imageBuffer);

      // Remove background to make it transparent
      const transparentBuffer = await removeBackgroundFromImage(tempFilepath);

      // Clean up temp file
      fs.unlinkSync(tempFilepath);

      const filename = `${iconConfig.id}.png`;
      const filepath = path.join(outputDir, filename);
      fs.writeFileSync(filepath, transparentBuffer);
      results.push({
        id: iconConfig.id,
        url: iconConfig.url,
        title: iconConfig.title,
        success: true,
        path: `/new-icons/${filename}`,
      });
    } else {
      results.push({
        id: iconConfig.id,
        url: iconConfig.url,
        title: iconConfig.title,
        success: false,
      });
    }

    if (i < iconsToGenerate.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  console.log("\n=== Summary ===");
  const successCount = results.filter((r) => r.success).length;
  console.log(
    `Generated: ${successCount}/${iconsToGenerate.length}${isTestMode ? " (test mode)" : ""}\n`,
  );

  results.forEach((r) => {
    const status = r.success ? "✓" : "✗";
    console.log(
      `  ${status} ${r.id} (${r.url}) ${r.path ? `→ ${r.path}` : ""}`,
    );
  });

  const jsonPath = path.join(outputDir, "results.json");
  fs.writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        generated: new Date().toISOString(),
        results,
      },
      null,
      2,
    ),
  );
  console.log(`\nResults: ${jsonPath}`);

  console.log("\n=== Component Code ===");
  console.log(`
const HEADER_ICONS = {
${results
  .filter((r) => r.success)
  .map((r) => `  "${r.url}": "/new-icons/${r.id}.png",`)
  .join("\n")}
};
`);
}

main().catch(console.error);
