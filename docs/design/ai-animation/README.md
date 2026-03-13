# AI Animation - Viewport Glow Effect

**Location:** `components/ai-animation/`  
**Reference:** https://njho6jmh4vmue.ok.kimi.link

---

## Overview

Pure CSS viewport glow animation for AI processes. Renders **under** the content (z-index: 0) as per original instructions.

> **IMPORTANT:** This is an exact reproduction of the glow effect from the reference URL. All values are preserved:
>
> - Edge glows: 100px width, blur(35px), 4-stop gradient
> - Corners: 160px, blur(45px), radial-gradient with box-shadow
> - Orbs: exact dimensions and positions
> - Animations: 4-keyframe breathing, 8s pulse, 18s float

---

## Quick Start

### 1. Import

```tsx
import { AIAnimationOverlay } from "@/components/ai-animation";
import "@/components/ai-animation/ai-animation.css";
```

### 2. Use

```tsx
function MyComponent() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await generateWithAI();
    setIsGenerating(false);
  };

  return (
    <>
      {/* Glow effect - renders under content */}
      <AIAnimationOverlay isActive={isGenerating} />

      {/* Your content - will be visible over the glow */}
      <div className="relative z-10">
        <Button onClick={handleGenerate}>Generate</Button>
      </div>
    </>
  );
}
```

**Important:** Your content needs `position: relative` and `z-index: 1+` to appear above the glow.

---

## How It Works

The component creates a fixed overlay with CSS animations:

1. **Edge glows** (left, right, top, bottom) - linear gradients with blur
2. **Corner glows** (4 corners) - radial gradients with pulse animation
3. **Floating orbs** (3 orbs) - vertical/horizontal floating animation

All animations run independently with different durations (8-18s) for organic feel.

---

## API

### AIAnimationOverlay

| Prop         | Type         | Default     | Description                     |
| ------------ | ------------ | ----------- | ------------------------------- |
| `isActive`   | `boolean`    | required    | Show/hide the glow effect       |
| `onComplete` | `() => void` | `undefined` | Called after fade-out completes |

```tsx
<AIAnimationOverlay
  isActive={isLoading}
  onComplete={() => console.log("Animation ended")}
/>
```

---

## Usage by Feature Type

### Article Generation, Lead Magnets, Scouts

```tsx
// Full page generation - glow visible across entire viewport
<AIAnimationOverlay isActive={isGenerating} />
```

### Dialogs / Modals (Find Enemy)

```tsx
// Inside dialog - glow covers only dialog area
<Dialog>
  <DialogContent className="relative">
    <AIAnimationOverlay isActive={isRunning} />
    <div className="relative z-10">Content here</div>
  </DialogContent>
</Dialog>
```

### Card-level (Social Adaptations)

```tsx
// Inside card
<Card className="relative">
  <AIAnimationOverlay isActive={isLoading} />
  <div className="relative z-10">Card content</div>
</Card>
```

---

## CSS Reference

### Exact Values from Original

```css
/* Edges */
.glow-left,
.glow-right {
  width: 100px;
  height: 125%;
  left: -40px; /* right: -40px for right */
  top: -60px;
  filter: blur(35px);
  animation: 10-12s ease-in-out infinite;
}

.glow-top,
.glow-bottom {
  width: 125%;
  height: 90px;
  top: -40px; /* bottom: -40px for bottom */
  left: -60px;
  filter: blur(35px);
  animation: 11-14s ease-in-out infinite;
}

/* Gradient stops (exact):
   rgba(139, 92, 246, 0.22)   - violet-500 base
   rgba(168, 130, 255, 0.14)  - lighter
   rgba(192, 162, 255, 0.08)  - even lighter
   rgba(216, 190, 255, 0.03)  - very light
   transparent
*/

/* Corners */
.glow-corner {
  width: 160px;
  height: 160px;
  filter: blur(45px);
  top: -45px;
  left: -45px; /* varies by corner */
  box-shadow: 0 0 60px rgba(139, 92, 246, 0.15);
  animation: cornerPulse 8s ease-in-out infinite;
}

/* Orbs */
.glow-orb-1 {
  width: 120px;
  height: 200px;
  top: 15%;
  left: 8px;
}
.glow-orb-2 {
  width: 100px;
  height: 180px;
  top: 45%;
  right: 5px;
}
.glow-orb-3 {
  width: 140px;
  height: 100px;
  top: 20px;
  left: 25%;
}

/* Animations */
/* Left edge: 4 keyframes */
0%,
100% {
  opacity: 0.4;
  transform: translateY(0) scaleX(1);
}
25% {
  opacity: 0.85;
  transform: translateY(-40px) scaleX(1.25);
}
50% {
  opacity: 0.3;
  transform: translateY(30px) scaleX(0.88);
}
75% {
  opacity: 0.7;
  transform: translateY(-18px) scaleX(1.12);
}

/* Corners: pulse */
0%,
100% {
  opacity: 0.3;
  transform: scale(1);
}
50% {
  opacity: 0.9;
  transform: scale(1.25);
}

/* Orbs: float */
0%,
100% {
  transform: translate(0, 0);
  opacity: 0.25;
}
25% {
  transform: translate(20px, -32px);
  opacity: 0.55;
}
50% {
  transform: translate(-15px, 22px);
  opacity: 0.18;
}
75% {
  transform: translate(12px, 12px);
  opacity: 0.48;
}
```

---

## Integration Checklist

When adding AI animation to a new feature:

- [ ] Import component and CSS
- [ ] Add `isActive` state
- [ ] Wrap AI operation with state toggle
- [ ] Ensure content has `relative z-10` (or higher z-index)
- [ ] Test that glow appears under content, not over it

---

## Examples

### Lead Magnet Generation

```tsx
// components/lead-magnets/LeadMagnetGenerator.tsx
import { AIAnimationOverlay } from "@/components/ai-animation";
import "@/components/ai-animation/ai-animation.css";

export function LeadMagnetGenerator() {
  const [runId, setRunId] = useState<string | null>(null);
  const progress = useLeadMagnetProgress(runId);

  return (
    <>
      <AIAnimationOverlay isActive={!progress.isComplete} />

      {/* Content renders OVER the glow */}
      <div className="relative z-10">
        {progress.isComplete ? (
          <SuccessView />
        ) : (
          <ProgressView progress={progress} />
        )}
      </div>
    </>
  );
}
```

### Solo Article Writing

```tsx
// app/dashboard/blog/new/page.tsx
export default function SoloWritingPage() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await generateArticle();
    setIsGenerating(false);
  };

  return (
    <>
      <AIAnimationOverlay isActive={isGenerating} />

      <div className="relative z-10">{/* Page content */}</div>
    </>
  );
}
```

### Scout Agents

```tsx
// app/dashboard/ai-insights/x-intent/page.tsx
export default function XIntentScoutPage() {
  const [status, setStatus] = useState<"idle" | "running" | "complete">("idle");

  return (
    <>
      <AIAnimationOverlay isActive={status === "running"} />

      <div className="relative z-10">
        {status === "running" && <ProgressView />}
        {status === "complete" && <ResultsView />}
      </div>
    </>
  );
}
```

---

## Troubleshooting

### Glow appears OVER content

Add `relative z-10` to your content wrapper:

```tsx
<div className="relative z-10">Your content here</div>
```

### Glow not visible

1. Check `isActive` is `true`
2. Check CSS is imported
3. Check content doesn't have opaque background covering everything

### Animation too distracting

User can enable "Reduced Motion" in OS settings - animation will be disabled automatically via `@media (prefers-reduced-motion)`.

---

## Accessibility

- Respects `prefers-reduced-motion` OS setting
- No JavaScript animations (CSS only, GPU accelerated)
- Doesn't interfere with screen readers
- Content remains fully interactive

---

## DO NOT MODIFY

These values are carefully tuned. Do not change:

- Gradient stops and colors
- Blur amounts (35px, 45px, 40px)
- Animation durations (8-18s)
- Opacity keyframes
- Position offsets (-40px, -60px, etc.)

If you need customization, create a separate variant file rather than modifying the original.
