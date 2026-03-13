# Two-Tone Headings Design Guidelines

## Overview

Two-tone headings combine **black text** with **colored gradient text** to create visual hierarchy and emphasis. The pattern draws attention to key phrases while maintaining readability.

**Structure**: `[Black Part] + [Gradient Part]`

---

## 1. Basic Pattern

```
"AI to help you" + "focus and get more done"
     ↓                      ↓
   BLACK                GRADIENT
```

### Code Example

```tsx
<h1 className="text-4xl font-bold">
  AI to help you{" "}
  <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
    focus and get more done
  </span>
</h1>
```

---

## 2. Color Palettes

### Orange-Red (Energy, Action)

```tsx
className =
  "bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent";
```

**Use for**: Productivity, focus, urgency

### Green-Teal (Trust, Verification)

```tsx
className =
  "bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent";
```

**Use for**: Security, verification, trust

### Blue-Cyan (Technology, Speed)

```tsx
className =
  "bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent";
```

**Use for**: AI, technology, innovation

### Yellow-Amber (Global, Community)

```tsx
className =
  "bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent";
```

**Use for**: Global reach, community, warmth

### Multi-Color (Dynamic, Evolution)

```tsx
className =
  "bg-gradient-to-r from-orange-500 via-emerald-500 to-cyan-500 bg-clip-text text-transparent";
```

**Use for**: Transformation, evolution, multi-feature

---

## 3. Implementation Patterns

### Pattern A: Single Gradient Phrase

```tsx
<h2 className="text-3xl font-bold">
  From SEO to{" "}
  <span className="bg-gradient-to-r from-orange-500 via-emerald-500 to-cyan-500 bg-clip-text text-transparent">
    AI Dominance
  </span>
</h2>
```

### Pattern B: Two Gradient Phrases

```tsx
<h2 className="text-3xl font-bold">
  <span className="bg-gradient-to-r from-red-500 via-orange-500 to-red-400 bg-clip-text text-transparent">
    Fire Copywriters.
  </span>{" "}
  <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
    Cancel SEO Subscriptions.
  </span>
</h2>
```

### Pattern C: With Line Break

```tsx
<h1 className="text-4xl font-bold">
  AI to help you{" "}
  <span className="block bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
    find content opportunities
  </span>
</h1>
```

### Pattern D: Inline Highlight

```tsx
<p className="text-lg">
  It's not about ranking anymore —{" "}
  <span className="font-medium bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
    it's about being the AI's answer
  </span>
  .
</p>
```

---

## 4. CSS Classes

### Required Classes for Gradient Text

```css
.bg-gradient-to-r   /* Direction: left to right */
.from-[color]-500   /* Start color */
.via-[color]-500    /* Middle color (optional) */
.to-[color]-500     /* End color */
.bg-clip-text       /* Clip background to text */
.text-transparent   /* Make text transparent to show gradient */
```

### Pre-built Class: text-gradient-genius

For header titles with animated shimmer effect:

```tsx
<h1 className="text-gradient-genius">Page Title</h1>
```

Defined in `globals.css`:

```css
.text-gradient-genius {
  background: linear-gradient(
    135deg,
    #4a5568 0%,
    #718096 25%,
    #2d3748 50%,
    #4a5568 75%,
    #718096 100%
  );
  background-size: 200% 200%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: text-shimmer 3s ease infinite;
}
```

---

## 5. Typography Rules

### Font Weight

- Black text: `font-bold` (700)
- Gradient text: `font-bold` (700) - same weight

### Font Size

- Keep same size for both parts
- Common sizes: `text-3xl`, `text-4xl`, `text-5xl`

### Spacing

- Use `{" "}` for proper spacing between parts
- No extra margin/padding between spans

---

## 6. Composition Rules

### What Goes in Black

- Setup/context phrases
- "AI to help you..."
- "From X to..."
- "Stop X..."
- "The..."

### What Goes in Gradient

- Key value proposition
- Action words
- Emotional triggers
- Differentiators

### Examples

| Black Part                  | Gradient Part                        | Gradient Color |
| --------------------------- | ------------------------------------ | -------------- |
| "AI to help you"            | "focus and get more done"            | orange-red     |
| "AI to help you"            | "verify the videos you see online"   | green-teal     |
| "AI to help you"            | "access fast, frontier intelligence" | blue-cyan      |
| "From SEO to"               | "AI Dominance"                       | multi-color    |
| "Stop watching the charts." | "Start owning the answers."          | emerald        |

---

## 7. Do's and Don'ts

### Do's

- Use gradient for emphasis on key phrases
- Keep black part short and contextual
- Match gradient color to content meaning
- Ensure sufficient contrast
- Use `bg-clip-text` + `text-transparent` together

### Don'ts

- Don't gradient entire heading
- Don't use more than 2-3 gradient spans per heading
- Don't use gradients on small text (< 16px)
- Don't use low-contrast gradient colors
- Don't forget `text-transparent` class

---

## 8. Accessibility

- Gradient text must have sufficient contrast (4.5:1 minimum)
- Test with grayscale filter to ensure readability
- Gradient is decorative; meaning should be clear from text alone
- Screen readers read text normally (no special handling needed)

---

## 9. Reference Examples

| File                                            | Pattern                                 |
| ----------------------------------------------- | --------------------------------------- |
| `components/landing/LLMDominanceModule.tsx:135` | Single gradient phrase                  |
| `components/landing/TrustProof.tsx:213-218`     | Two gradient phrases                    |
| `app/tools/content-gaps/page.tsx:238`           | Block gradient with line break          |
| `app/demo/page.tsx:117`                         | Animated shimmer (text-gradient-genius) |

---

_Last updated: December 30, 2025_
