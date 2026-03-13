# Icon Generation & Processing Scripts

This directory contains all scripts for generating, processing, and managing icons in the Citedy SaaS platform.

Use claude /command - .claude/commands/icon.md to launch creation.

1.  Скрипт scripts/generate-icons-universal.ts:

- Принимает --topic или --url + --count + --output + --prefix
- Использует 6 референсных изображений для стиля
- 6 цветовых палитр для вариаций
- Автоматически удаляет фон + конвертирует в WebP
- Сохраняет JSON с результатами

2. Команда .claude/commands/icon.md:

- /icon создай иконки на тему анализа конкурентов 5 штук
- /icon создай иконки для раздела /dashboard/settings
- Парсит запрос, определяет папку вывода, запускает скрипт

Примеры использования:

# Напрямую через скрипт

npx tsx scripts/generate-icons-universal.ts --topic "competitor analysis" --count 3

# Через Claude Code

/icon создай 5 иконок для AI readiness check
/icon иконки для /dashboard/billing

## 📁 Overview

All scripts use AI-powered generation with consistent styling based on our 6 core reference images:

- `/agent-icons/onboarding/onboarding-context-step6.png`
- `/agent-icons/onboarding/onboarding-context-step7.png`
- `/agent-icons/onboarding/onboarding-step4-gaps.png`
- `/agent-icons/onboarding/onboarding-step7-autopilot.png`
- `/agent-icons/stats/stats-articles.png`
- `/agent-icons/stats/stats-domains.png`

## 🎨 Design System

All generated icons follow these requirements:

- **3D isometric perspective** with soft depth
- **Glassmorphism effects** with transparency and glow
- **Glowing gradients** on main objects
- **Soft drop shadows**
- **Single centered composition**
- **Transparent backgrounds** (automatically removed)
- **512x512px output** size

## 📋 Scripts Overview

### 🔄 Processing & Conversion Scripts

#### `convert-header-icons-to-webp.ts`

Converts existing PNG header icons to optimized WebP format.

```bash
npx tsx convert-header-icons-to-webp.ts
```

**Features:**

- Batch conversion of all `header-*.png` files
- 85% quality with effort level 6 for optimal compression
- Automatic size reporting and space savings calculation

#### `process-single-icon.ts`

Process a single icon: remove background and convert to WebP.

```bash
npx tsx process-single-icon.ts <icon-name>
# Example:
npx tsx process-single-icon.ts header-dashboard-autopilot
```

**Features:**

- Remove background using AI (`@imgly/background-removal-node`)
- Convert to WebP with optimization
- Works with any PNG file in `/public/new-icons/`

### 🎨 Generation Scripts

#### `generate-header-icons.ts`

Generate complete set of header icons for all pages.

```bash
npx tsx generate-header-icons.ts [--test]
```

**Features:**

- Generates 15+ header icons for different pages
- Uses AI with style references for consistency
- `--test` flag generates only first 3 icons
- Automatic background removal and WebP conversion

**Generated icons include:**

- Dashboard pages (blog, writer, editor, ai-insights, autopilot, billing, etc.)
- General pages (contact, privacy, terms)
- Onboarding flow

### 🔧 Regeneration Scripts

#### Single Icon Regeneration

##### `regenerate-terms-icon.ts`

Regenerate the terms icon with new concept.

```bash
npx tsx regenerate-terms-icon.ts
```

**Concept:** Glowing shield with checkmark for legal compliance

##### `regenerate-onboarding-icon.ts`

Regenerate the onboarding icon.

```bash
npx tsx regenerate-onboarding-icon.ts
```

**Concept:** Glowing rocket ship for launch/journey

#### Autopilot Icon Variations

##### `regenerate-autopilot-icon.ts`

Original autopilot regeneration script.

```bash
npx tsx regenerate-autopilot-icon.ts
```

**Concept:** Autonomous robot pilot with neural connections

##### `regenerate-autopilot-icon-v2.ts`

Second variation.

```bash
npx tsx regenerate-autopilot-icon-v2.ts
```

**Concept:** Smart rocket with AI navigation beams

##### `regenerate-autopilot-icon-v3.ts`

Third variation.

```bash
npx tsx regenerate-autopilot-icon-v3.ts
```

**Concept:** Superman robot in matrix formation

##### `regenerate-autopilot-icon-apple.ts`

Apple Intelligence style.

```bash
npx tsx regenerate-autopilot-icon-apple.ts
```

**Concept:** Apple Intelligence-inspired with neural connections

### 🎭 Variation Scripts

#### `generate-autopilot-icons-custom.ts`

Generate multiple custom autopilot icons from user prompts.

```bash
npx tsx generate-autopilot-icons-custom.ts
```

**Generates 5 variations:**

1. `petals-star` - Six glowing petals with central star
2. `floating-document` - Floating glass document with text lines
3. `super-agent-portrait` - Young Super Agent with ginger hair
4. `digital-agent-closeup` - Close-up digital agent with visor
5. `diverse-agents-group` - Group of diverse AI agents

#### `create-super-agent-variations.ts`

Create variations of the super agent portrait.

```bash
npx tsx create-super-agent-variations.ts
```

**Generates 3 variations:**

1. `super-agent-clean` - Minimalist clean version
2. `super-agent-dynamic` - Dynamic energetic version
3. `super-agent-tech` - High-tech circuit version

#### `create-digital-agent-variations.ts`

Create additional variations of digital agent closeup.

```bash
npx tsx create-digital-agent-variations.ts
```

**Generates 5 variations:**

1. `digital-agent-cyber` - Cyberpunk neon style
2. `digital-agent-minimal` - Ultra-minimal clean
3. `digital-agent-creative` - Artistic creative style
4. `digital-agent-serious` - Professional corporate
5. `digital-agent-energetic` - Dynamic athletic style

#### `improve-super-agent-portrait.ts`

Improve existing super agent portrait with better style matching.

```bash
npx tsx improve-super-agent-portrait.ts
```

**Features:**

- Enhanced style matching with 6 references
- Better composition and details
- Automatic optimization

## 🛠️ Dependencies

All scripts require:

- `GOOGLE_GENERATIVE_AI_API_KEY` environment variable
- `@google/genai` for AI generation
- `@imgly/background-removal-node` for background removal
- `sharp` for image processing

## 📂 Output Locations

- **Generated icons:** `/public/new-icons/`
- **PNG format:** `header-dashboard-[name].png`
- **WebP format:** `header-dashboard-[name].webp`

## 🎯 Usage Tips

1. **Always check** `.env.local` for `GOOGLE_GENERATIVE_AI_API_KEY`
2. **Wait between generations** (scripts include 3-second delays)
3. **Use WebP versions** for production (better compression)
4. **Keep PNG versions** as originals for future processing
5. **Reference images** ensure style consistency across all icons

## 🔄 Workflow

1. **Generate new icons** using generation scripts
2. **Process individual icons** using processing scripts
3. **Convert to WebP** for optimization
4. **Test in application** with both PNG and WebP versions

## 📊 Performance Notes

- **Background removal:** ~1-2 seconds per image
- **WebP conversion:** ~0.5 seconds per image
- **AI generation:** ~10-30 seconds per image
- **File sizes:** Typically 40-200KB PNG, 20-100KB WebP

---

_Generated icons are automatically optimized for web use with transparent backgrounds and modern compression formats._
