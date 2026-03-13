# Glassmorphism Popup Design Manual

## Overview

This document describes the standard design pattern for info popups across the Citedy platform. All info popups must follow this pattern to maintain visual consistency.

## Key Principles

1. **Render outside parent containers** - Popup must be rendered outside any `overflow-hidden` containers (use Fragment `<>...</>`)
2. **Fixed positioning** - Use `fixed inset-0 z-50` for full-screen overlay
3. **Glassmorphism effect** - Semi-transparent background with backdrop blur
4. **Gradient accent** - Full overlay gradient, not just a stripe

---

## Required Structure

```tsx
{
  infoOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setInfoOpen(false)}
      />

      {/* Glassmorphism Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] rounded-2xl sm:rounded-3xl border border-white/20 bg-white/90 sm:bg-white/70 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Gradient accent - MUST be inset-0, NOT h-1 stripe */}
        <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 pointer-events-none" />

        {/* Close button */}
        <button
          onClick={() => setInfoOpen(false)}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full bg-white/50 hover:bg-white/80 transition-colors z-10"
        >
          <X className="h-4 w-4 text-gray-600" />
        </button>

        {/* Content - MUST have relative class */}
        <div className="relative p-5 sm:p-8 overflow-y-auto max-h-[85vh]">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <IconComponent className="h-7 w-7 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Title</h2>
              <p className="text-sm text-gray-500">Subtitle description</p>
            </div>
          </div>

          {/* Main explanation block */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
            <p className="text-gray-700 leading-relaxed">
              Main explanation text goes here...
            </p>
          </div>

          {/* Field explanations */}
          <div className="space-y-4 mb-6">
            {/* Section card */}
            <div className="p-3 rounded-xl bg-white/80 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-1">
                Section Title
              </h3>
              <p className="text-sm text-gray-600">Section description...</p>
            </div>

            {/* Tip/Warning card (optional) */}
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50">
              <h3 className="font-semibold text-amber-800 mb-1">Tip Title</h3>
              <p className="text-sm text-amber-700">Tip content...</p>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={() => setInfoOpen(false)}
            className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg shadow-blue-500/25"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Critical Classes Reference

### Container

| Element         | Classes                                                                                                                                                          | Notes                      |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Overlay wrapper | `fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4`                                                                                                 | Full screen, centered      |
| Backdrop        | `absolute inset-0 bg-black/40 backdrop-blur-sm`                                                                                                                  | Semi-transparent with blur |
| Modal           | `relative w-full max-w-lg max-h-[90vh] rounded-2xl sm:rounded-3xl border border-white/20 bg-white/90 sm:bg-white/70 backdrop-blur-xl shadow-2xl overflow-hidden` | Glassmorphism effect       |

### Gradient Accent

```tsx
// CORRECT - Full overlay gradient
<div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 pointer-events-none" />

// WRONG - Stripe gradient (DO NOT USE)
<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
```

### Content Area

| Element         | Classes                                                                                  | Notes                  |
| --------------- | ---------------------------------------------------------------------------------------- | ---------------------- |
| Content wrapper | `relative p-5 sm:p-8 overflow-y-auto max-h-[85vh]`                                       | `relative` is REQUIRED |
| Header spacing  | `mb-6`                                                                                   | After header           |
| Main block      | `mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100` | Gradient background    |
| Section cards   | `p-3 rounded-xl bg-white/80 border border-gray-100`                                      | White semi-transparent |
| Tip cards       | `p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50` | Amber gradient         |

### Typography

| Element       | Classes                             |
| ------------- | ----------------------------------- |
| Title         | `text-xl font-bold text-gray-900`   |
| Subtitle      | `text-sm text-gray-500`             |
| Section title | `font-semibold text-gray-900 mb-1`  |
| Section text  | `text-sm text-gray-600`             |
| Tip title     | `font-semibold text-amber-800 mb-1` |
| Tip text      | `text-sm text-amber-700`            |

### Button

```tsx
<button
  onClick={() => setInfoOpen(false)}
  className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg shadow-blue-500/25"
>
  Got it!
</button>
```

---

## Color Variants

### Blue Theme (Default)

```tsx
// Gradient accent
from-blue-500/10 via-indigo-500/5 to-purple-500/10

// Main block
from-blue-50 to-indigo-50 border-blue-100

// Icon
text-blue-600
```

### Green Theme

```tsx
// Gradient accent
from-green-500/10 via-blue-500/5 to-purple-500/10

// Main block
from-green-50 to-blue-50 border-green-100

// Icon
text-green-600
```

---

## Component Placement

### WRONG - Inside Card (will be clipped by overflow-hidden)

```tsx
<Card className="overflow-hidden">
  <CardContent>{/* content */}</CardContent>

  {/* WRONG - Popup inside Card */}
  {infoOpen && <div className="fixed inset-0">...</div>}
</Card>
```

### CORRECT - Using Fragment

```tsx
return (
  <>
    <Card className="overflow-hidden">
      <CardContent>{/* content */}</CardContent>
    </Card>

    {/* CORRECT - Popup outside Card */}
    {infoOpen && <div className="fixed inset-0">...</div>}
  </>
);
```

---

## Required Imports

```tsx
import { useState } from "react";
import { X, Info } from "lucide-react"; // X for close, Info for trigger button
```

---

## Trigger Button Pattern

```tsx
<CardTitle className="text-lg flex items-center gap-2">
  <IconComponent className="h-5 w-5 text-blue-600" />
  Section Title
  <button
    onClick={() => setInfoOpen(true)}
    className="p-1 rounded-full hover:bg-blue-100 transition-colors"
    title="Learn about Section Title"
  >
    <Info className="h-4 w-4 text-blue-500" />
  </button>
</CardTitle>
```

---

## Checklist

Before submitting popup code, verify:

- [ ] Popup rendered outside parent Card using Fragment
- [ ] Gradient accent uses `inset-0`, not `h-1` stripe
- [ ] Content wrapper has `relative` class
- [ ] Header has title + subtitle
- [ ] Main explanation in gradient block
- [ ] Sections use `bg-white/80` cards
- [ ] Tips use amber gradient
- [ ] Button uses full gradient style
- [ ] Backdrop closes popup on click
- [ ] X button in top-right corner

---

## Examples

See implementations in:

- `/app/dashboard/settings/page.tsx` - `metaTagsInfoOpen`, `brandIdentityInfoOpen`, `linkPresetsInfoOpen`
- `/app/dashboard/settings/components/BlogHandlePanel.tsx` - `infoOpen`
