# Citedy Icon Guidelines

**Last Updated**: January 2025
**Version**: 1.0.0

This document defines the icon usage standards for the Citedy platform. Following these guidelines ensures visual consistency and brand identity across all features.

---

## Table of Contents

1. [Philosophy](#philosophy)
2. [When to Use Generated Icons](#when-to-use-generated-icons)
3. [When lucide-react Is Acceptable](#when-lucide-react-is-acceptable)
4. [How to Generate New Icons](#how-to-generate-new-icons)
5. [Icon Naming Conventions](#icon-naming-conventions)
6. [Icon Storage Locations](#icon-storage-locations)
7. [Usage in Code](#usage-in-code)
8. [Existing Icon Catalog](#existing-icon-catalog)

---

## Philosophy

Citedy uses **custom AI-generated icons** for all feature, product, and branding elements. This approach ensures:

- **Unique brand identity**: Our icons are distinct and recognizable
- **Consistent visual language**: All icons share the same 3D isometric style
- **Premium aesthetic**: Glassmorphism effects convey modern, professional quality
- **Scalability**: The generation system allows rapid creation of new icons

**Core Principle**: Generic icon libraries (lucide-react, heroicons, etc.) are ONLY for UI controls, never for feature representation.

---

## When to Use Generated Icons

Use custom AI-generated icons for:

| Use Case                  | Examples                                                     |
| ------------------------- | ------------------------------------------------------------ |
| **Feature icons**         | AI Insights, Autopilot, Content Gaps, LLM Visibility         |
| **Page headers**          | Dashboard pages, settings, billing, blog                     |
| **Onboarding steps**      | Website setup, competitor scanning, content strategy         |
| **Agent representations** | Writer Agent, Scout Agent, Strategy Agent, Linker, Publisher |
| **Product showcase**      | Marketing pages, feature cards, landing sections             |
| **Stats & metrics**       | Articles count, domains tracked, cost savings                |
| **Tools**                 | AI Brand Scanner, Competitor Finder                          |

### Visual Requirements for Generated Icons

All generated icons follow the Citedy design system:

- **3D isometric perspective** with soft depth
- **Glassmorphism effects** with transparency and glow
- **Glowing gradients** on main objects
- **Soft drop shadows**
- **Single centered composition**
- **Transparent backgrounds** (auto-removed during generation)
- **512x512px source** optimized to WebP

---

## When lucide-react Is Acceptable

Use lucide-react icons ONLY for:

| Use Case                  | Recommended Icons                                          |
| ------------------------- | ---------------------------------------------------------- |
| **Close/dismiss buttons** | `X`, `XCircle`                                             |
| **Navigation arrows**     | `ChevronLeft`, `ChevronRight`, `ChevronDown`, `ArrowRight` |
| **Menu toggles**          | `Menu`, `MoreVertical`, `MoreHorizontal`                   |
| **Form controls**         | `Check`, `Plus`, `Minus`, `Search`, `Filter`               |
| **Status indicators**     | `AlertCircle`, `CheckCircle`, `Info`, `AlertTriangle`      |
| **Generic actions**       | `Edit`, `Trash`, `Copy`, `Download`, `Upload`, `Share`     |
| **Layout controls**       | `Grid`, `List`, `Columns`, `Maximize`, `Minimize`          |
| **Time/calendar**         | `Calendar`, `Clock`, `RefreshCw`                           |

### Example: Correct Usage

```tsx
// CORRECT: lucide-react for UI controls
import { X, ChevronRight, Search, Plus } from 'lucide-react';

// Close button
<button onClick={onClose}>
  <X className="h-4 w-4" />
</button>

// Navigation arrow
<ChevronRight className="h-5 w-5 text-muted-foreground" />
```

```tsx
// CORRECT: Generated icon for feature representation
import Image from "next/image";

<Image
  src="/new-icons/header-dashboard-ai-insights.webp"
  alt="AI Insights"
  width={64}
  height={64}
  className="object-contain"
/>;
```

### Example: Incorrect Usage

```tsx
// INCORRECT: Using lucide-react for feature icons
import { Brain, Rocket, Target } from 'lucide-react';

// DON'T DO THIS for features
<Brain className="h-8 w-8" /> // For AI Insights
<Rocket className="h-8 w-8" /> // For Autopilot
<Target className="h-8 w-8" /> // For Content Gaps
```

---

## How to Generate New Icons

### Method 1: Using the /icon Slash Command (Recommended)

The easiest way to generate icons is via Claude Code:

```bash
# Topic-based generation
/icon create 5 icons for competitor analysis

# URL-based generation (auto-detects context)
/icon create icons for /dashboard/billing

# Russian language also works
/icon create icons on the topic "AI readiness check" 3 icons
```

### Method 2: Direct Script Execution

For more control, use the generator script directly:

```bash
# Basic usage
npx tsx scripts/generate-icons-universal.ts \
  --topic "content gap analysis" \
  --count 3 \
  --output ai-insights-icons \
  --prefix content-gap

# For dashboard headers
npx tsx scripts/generate-icons-universal.ts \
  --url "/dashboard/settings" \
  --count 3 \
  --output new-icons \
  --prefix header-settings
```

### Generation Parameters

| Parameter  | Description                           | Default               |
| ---------- | ------------------------------------- | --------------------- |
| `--topic`  | Topic description for icon generation | Required (or --url)   |
| `--url`    | Page URL to auto-detect context       | Required (or --topic) |
| `--count`  | Number of variations to generate      | 3                     |
| `--output` | Output folder in /public/             | generated-icons       |
| `--prefix` | Filename prefix                       | icon                  |

### Post-Generation Steps

1. Review generated PNG files in the output folder
2. Select the best variation
3. Use the WebP version for production (auto-generated)
4. Delete unused variations
5. Update this catalog if adding new category

### Reference Images

The generator uses 6 reference images to maintain style consistency:

- `/agent-icons/onboarding/onboarding-context-step6.png`
- `/agent-icons/onboarding/onboarding-context-step7.png`
- `/agent-icons/onboarding/onboarding-step4-gaps.png`
- `/agent-icons/onboarding/onboarding-step7-autopilot.png`
- `/agent-icons/stats/stats-articles.png`
- `/agent-icons/stats/stats-domains.png`

---

## Icon Naming Conventions

### Filename Format

```
{category}-{feature}-{variant}.{ext}
```

### Categories and Prefixes

| Category             | Prefix                | Example                             |
| -------------------- | --------------------- | ----------------------------------- |
| Dashboard headers    | `header-dashboard-`   | `header-dashboard-ai-insights.webp` |
| General headers      | `header-`             | `header-onboarding.webp`            |
| AI Insights features | `{feature}-`          | `competitor-analysis.webp`          |
| Onboarding steps     | `onboarding-step{N}-` | `onboarding-step3-competitors.webp` |
| Multi-agent system   | `multiagent-`         | `multiagent-writer.webp`            |
| Stats widgets        | `stats-`              | `stats-articles.webp`               |
| LLM phases           | `llm-phase-`          | `llm-phase-present.webp`            |
| Tools                | `{tool-name}-`        | `ai-brand-scanner-1.webp`           |

### Naming Rules

1. Use lowercase with hyphens (kebab-case)
2. Be descriptive but concise
3. Include variant number if multiple versions exist (`-1`, `-2`, `-v2`)
4. Always provide both PNG and WebP versions

---

## Icon Storage Locations

### Directory Structure

```
/public/
  /new-icons/              # Dashboard header icons
    header-dashboard-*.webp
    header-*.webp

  /ai-insights-icons/      # AI Insights feature icons
    competitor-*.webp
    content-gap.webp
    llm-visibility.webp
    ai-readiness-*.webp

  /agent-icons/            # Agent system icons
    /onboarding/           # Onboarding flow
    /stats/                # Statistics widgets
    /multiagent/           # Agent roles
    /llm-dominance/        # LLM market phases
    /casestudy/            # Case study visuals

  /tools-icons/            # Free tools icons
    ai-brand-scanner-*.webp

  /llm_logos/              # LLM provider logos (external)
    /icons/                # Small provider icons
```

### Choosing the Right Location

| Icon Type                 | Location                          |
| ------------------------- | --------------------------------- |
| New dashboard page header | `/public/new-icons/`              |
| AI Insights feature       | `/public/ai-insights-icons/`      |
| Agent visualization       | `/public/agent-icons/{category}/` |
| Free tool                 | `/public/tools-icons/`            |
| Onboarding step           | `/public/agent-icons/onboarding/` |

---

## Usage in Code

### Standard Pattern with Next.js Image

```tsx
import Image from 'next/image';

// Basic usage
<Image
  src="/new-icons/header-dashboard-autopilot.webp"
  alt="Autopilot"
  width={64}
  height={64}
  className="object-contain"
/>

// With fill mode (requires relative parent)
<div className="relative w-16 h-16">
  <Image
    src="/ai-insights-icons/content-gap.webp"
    alt="Content Gap Analysis"
    fill
    className="object-contain"
  />
</div>

// Responsive sizing
<Image
  src="/agent-icons/multiagent/multiagent-writer.webp"
  alt="Writer Agent"
  width={128}
  height={128}
  className="w-16 h-16 md:w-24 md:h-24 object-contain"
/>
```

### With Fallback

```tsx
import Image from "next/image";
import { useState } from "react";

function FeatureIcon({ src, alt, fallbackIcon: FallbackIcon }) {
  const [error, setError] = useState(false);

  if (error && FallbackIcon) {
    return <FallbackIcon className="w-16 h-16 text-muted-foreground" />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={64}
      height={64}
      onError={() => setError(true)}
      className="object-contain"
    />
  );
}
```

### Common Sizes

| Context      | Size           | Class                      |
| ------------ | -------------- | -------------------------- |
| Page header  | 64x64 or 80x80 | `w-16 h-16` or `w-20 h-20` |
| Feature card | 48x48          | `w-12 h-12`                |
| List item    | 32x32          | `w-8 h-8`                  |
| Small badge  | 24x24          | `w-6 h-6`                  |

---

## Existing Icon Catalog

### Dashboard Headers (`/public/new-icons/`)

| Icon                      | File                                                    | Purpose               |
| ------------------------- | ------------------------------------------------------- | --------------------- |
| AI Insights               | `header-dashboard-ai-insights.webp`                     | AI Insights dashboard |
| AI Readiness              | `header-dashboard-ai-readiness.webp`                    | AI Readiness check    |
| Autopilot                 | `header-dashboard-autopilot.webp`                       | Autopilot system      |
| Autopilot (Digital Agent) | `header-dashboard-autopilot-digital-agent-closeup.webp` | Autopilot variant     |
| Autopilot (Dynamic)       | `header-dashboard-autopilot-super-agent-dynamic.webp`   | Autopilot variant     |
| Billing                   | `header-dashboard-billing.webp`                         | Billing page          |
| Blog                      | `header-dashboard-blog.webp`                            | Blog management       |
| Design                    | `header-dashboard-design.webp`                          | Design settings       |
| Editor                    | `header-dashboard-editor.webp`                          | Content editor        |
| Exports                   | `header-dashboard-exports.webp`                         | Export functionality  |
| Settings                  | `header-dashboard-settings.webp`                        | Settings page         |
| Welcome                   | `header-dashboard-welcome.webp`                         | Dashboard welcome     |
| Writer                    | `header-dashboard-writer.webp`                          | Writer agent          |
| Contact                   | `header-contact.webp`                                   | Contact page          |
| Onboarding                | `header-onboarding.webp`                                | Onboarding flow       |
| Privacy                   | `header-privacy.webp`                                   | Privacy policy        |
| Terms                     | `header-terms.webp`                                     | Terms of service      |

### AI Insights Features (`/public/ai-insights-icons/`)

| Icon                  | File                         | Purpose               |
| --------------------- | ---------------------------- | --------------------- |
| AI Readiness Basic    | `ai-readiness-basic.webp`    | Basic AI readiness    |
| AI Readiness Enhanced | `ai-readiness-enhanced.webp` | Enhanced AI readiness |
| Competitor Analysis   | `competitor-analysis.webp`   | Competitor analysis   |
| Competitor Discovery  | `competitor-discovery.webp`  | Finding competitors   |
| Competitor Scout      | `competitor-scout.webp`      | Scout feature         |
| Content Gap           | `content-gap.webp`           | Content gap analysis  |
| Keyword Analysis      | `keyword-analysis.webp`      | Keyword research      |
| LLM Visibility        | `llm-visibility.webp`        | LLM visibility check  |
| SERP AI Analysis      | `serp-ai-analysis.webp`      | SERP AI platforms     |

### Agent Icons (`/public/agent-icons/`)

#### Multiagent System (`/multiagent/`)

| Icon      | File                        | Purpose                |
| --------- | --------------------------- | ---------------------- |
| Writer    | `multiagent-writer.webp`    | Writer agent           |
| Scout     | `multiagent-scout.webp`     | Scout agent            |
| Strategy  | `multiagent-strategy.webp`  | Strategy agent         |
| Linker    | `multiagent-linker.webp`    | Internal linking agent |
| Publisher | `multiagent-publisher.webp` | Publishing agent       |

#### Stats Widgets (`/stats/`)

| Icon      | File                   | Purpose          |
| --------- | ---------------------- | ---------------- |
| Articles  | `stats-articles.webp`  | Article count    |
| Autopilot | `stats-autopilot.webp` | Autopilot status |
| Cost      | `stats-cost.webp`      | Cost savings     |
| Domains   | `stats-domains.webp`   | Domains tracked  |

#### LLM Market Phases (`/llm-dominance/`)

| Icon            | File                       | Purpose                       |
| --------------- | -------------------------- | ----------------------------- |
| Past            | `llm-phase-past.webp`      | Past phase (Google dominance) |
| Present         | `llm-phase-present.webp`   | Current transition            |
| Future          | `llm-phase-future.webp`    | AI-first future               |
| Demand Pillar   | `llm-pillar-demand.webp`   | Demand capture                |
| Stealing Pillar | `llm-pillar-stealing.webp` | Traffic stealing              |
| USP Pillar      | `llm-pillar-usp.webp`      | Brand differentiation         |

#### Onboarding Steps (`/onboarding/`)

| Icon               | File                                | Purpose          |
| ------------------ | ----------------------------------- | ---------------- |
| Step 1 Website     | `onboarding-step1-website.webp`     | Add website      |
| Step 2 Scan        | `onboarding-step2-scan.webp`        | Visibility scan  |
| Step 3 Competitors | `onboarding-step3-competitors.webp` | Add competitors  |
| Step 4 Gaps        | `onboarding-step4-gaps.webp`        | Content gaps     |
| Step 5 Recon       | `onboarding-step5-recon.webp`       | Reconnaissance   |
| Step 6 Strike      | `onboarding-step6-strike.webp`      | Counter strike   |
| Step 7 Autopilot   | `onboarding-step7-autopilot.webp`   | Enable autopilot |

#### Case Study (`/casestudy/`)

| Icon     | File                     | Purpose         |
| -------- | ------------------------ | --------------- |
| Articles | `casestudy-articles.png` | Articles metric |
| Cost     | `casestudy-cost.png`     | Cost metric     |
| Time     | `casestudy-time.png`     | Time saved      |
| Traffic  | `casestudy-traffic.png`  | Traffic growth  |

### Root Agent Icons (`/public/agent-icons/`)

| Icon      | File                                   | Purpose             |
| --------- | -------------------------------------- | ------------------- |
| Linker    | `linker-4.webp`                        | Internal linking    |
| Publisher | `publisher-4.webp`                     | Content publishing  |
| Scout     | `scout-3.webp`, `scout-4.webp`         | Competitor scouting |
| Strategy  | `strategy-1.webp` to `strategy-4.webp` | Strategy planning   |
| Writer    | `writer-1.webp` to `writer-4.webp`     | Content writing     |

### Tools Icons (`/public/tools-icons/`)

| Icon             | File                                                   | Purpose             |
| ---------------- | ------------------------------------------------------ | ------------------- |
| AI Brand Scanner | `ai-brand-scanner-1.webp` to `ai-brand-scanner-3.webp` | Brand scanning tool |

---

## Performance Notes

- **PNG**: 40-200KB (keep as source)
- **WebP**: 20-100KB (use in production)
- **Generation time**: ~10-30 seconds per icon
- **Background removal**: ~1-2 seconds per image

Always use WebP versions in production for optimal performance.

---

## Quick Reference

```
Need a feature icon?     -> Generate with /icon command
Need a UI control icon?  -> Use lucide-react
New dashboard page?      -> Generate header-dashboard-{name}.webp
New AI Insight feature?  -> Generate to /ai-insights-icons/
Need agent visual?       -> Check /agent-icons/ first
```

---

## Related Documentation

- [Icon Generation Scripts](/docs/design/icons/README.md)
- [Design System Overview](/docs/design/README.md)
- [Glassmorphism Popup Manual](/docs/design/popup/manual.md)
