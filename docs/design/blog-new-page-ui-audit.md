# UI/UX Audit: /dashboard/blog/new Page

**Audit Date**: 2025-12-13
**File**: `/Users/dmitriysergeev/saas-blog/app/dashboard/blog/new/page.tsx`
**Total Lines**: 2956 lines

---

## Executive Summary

The `/dashboard/blog/new` page is a complex multi-step article generation interface with advanced features like SEO optimization, competition intelligence, and multi-language support. While the page demonstrates good component organization, there are several **glassmorphism inconsistencies**, **responsive design gaps**, and **accessibility improvements** needed.

**Overall Score**: 7.5/10

### Quick Stats
- **Good Glassmorphism**: 40% (modals, header)
- **Needs Improvement**: 60% (main Cards, form elements)
- **Responsive Coverage**: 70% (header is responsive, but many sections lack breakpoints)
- **Button Consistency**: 90% (uses Lucide icons, good sizing)
- **Form Elements**: 85% (accessible labels, but focus states need work)

---

## Critical Issues Found

### 1. Glassmorphism Inconsistency

#### Issue 1.1: Main Content Cards Missing Glassmorphism
**Severity**: HIGH
**Lines**: 1089, 1235, 1897, 2569

**Current Implementation**:
```tsx
// Line 1089 - Step 1: Input Card
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
```

**Problem**: Standard `<Card>` component without glassmorphism styling. Uses default white background with no transparency or blur effects.

**Expected**: All Cards should follow the glassmorphism pattern established in the header (line 908):
```tsx
<div className="relative overflow-hidden rounded-3xl border border-slate-200/50 bg-white/90 shadow-sm">
  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-100/50 via-transparent to-purple-100/50 opacity-70" />
```

**Fix**:
```tsx
// Replace all main content Cards with glassmorphism wrapper
<div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 backdrop-blur-xl shadow-lg">
  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30" />
  <Card className="relative bg-transparent border-none shadow-none">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        {/* Content */}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Content */}
    </CardContent>
  </Card>
</div>
```

**Affected Cards**:
1. **Input Card** (line 1089) - Source Material Input
2. **Metadata Review Card** (line 1235) - AI Detected Metadata
3. **Content Result Card** (line 1897) - Article Ready
4. **Translation Card** (line 2569) - Language Translation Section

---

#### Issue 1.2: Competition Intelligence Card - Partial Glassmorphism
**Severity**: MEDIUM
**Line**: 1533

**Current Implementation**:
```tsx
<Card className="border-2 border-orange-200 bg-orange-50/30">
```

**Problem**: Has custom background color (`bg-orange-50/30`) but missing:
- `backdrop-blur-xl` for glassmorphism effect
- Gradient overlay layer
- White border with transparency

**Fix**:
```tsx
<div className="relative overflow-hidden rounded-2xl border border-orange-200/40 bg-orange-50/20 backdrop-blur-md shadow-lg">
  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-100/20 via-transparent to-amber-100/20" />
  <Card className="relative bg-transparent border-none shadow-none">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Target className="h-5 w-5 text-orange-600" />
        Competition Intelligence Mode
        <Badge variant="secondary" className="ml-2">Premium Feature</Badge>
      </CardTitle>
      <CardDescription>
        Analyze competitor strategies and enhance content with real SERP data.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Existing content */}
    </CardContent>
  </Card>
</div>
```

---

#### Issue 1.3: SEO Enhancement Intelligence Card
**Severity**: MEDIUM
**Line**: 2114

**Current Implementation**:
```tsx
<Card className="mb-4">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      🔍 SEO Enhancement Intelligence
    </CardTitle>
```

**Problem**: Standard Card without glassmorphism. Should stand out as a premium feature visualization.

**Fix**:
```tsx
<div className="relative overflow-hidden rounded-2xl border border-blue-200/40 bg-blue-50/20 backdrop-blur-md shadow-lg mb-4">
  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20" />
  <Card className="relative bg-transparent border-none shadow-none">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <FileSearch className="h-5 w-5 text-blue-600" />
        SEO Enhancement Intelligence
      </CardTitle>
      <CardDescription>
        Competitive analysis and SEO opportunities used for content optimization
      </CardDescription>
    </CardHeader>
    <CardContent>
      {/* Existing Tabs content */}
    </CardContent>
  </Card>
</div>
```

**Note**: Replace emoji "🔍" with Lucide icon `<FileSearch />` for consistency.

---

### 2. Responsive Design Gaps

#### Issue 2.1: Progress Steps Not Responsive
**Severity**: HIGH
**Line**: 1046-1077

**Current Implementation**:
```tsx
<div className="flex items-center justify-center space-x-8 py-4">
  <div className={`flex items-center space-x-2 ${step === "input" ? "text-blue-600" : "text-green-600"}`}>
    {getStepIcon("input")}
    <span className="font-medium">1. Source Text</span>
  </div>
  <div className="h-px w-12 bg-gray-300" />
  <div className={`flex items-center space-x-2 ...`}>
    {getStepIcon("metadata")}
    <span className="font-medium">2. Metadata Analysis</span>
    {/* ... */}
  </div>
  <div className="h-px w-12 bg-gray-300" />
  <div className={`flex items-center space-x-2 ...`}>
    {getStepIcon("content")}
    <span className="font-medium">3. Final Content</span>
  </div>
</div>
```

**Problem**:
- Horizontal layout breaks on mobile (<640px)
- Step labels too long for small screens
- No vertical layout fallback
- Connector lines (`w-12`) too short on desktop, too long on mobile

**Fix**:
```tsx
{/* Mobile: Vertical stepper */}
<div className="md:hidden space-y-4 py-4">
  <div className={`flex items-center gap-3 ${step === "input" ? "text-blue-600" : "text-green-600"}`}>
    <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-current">
      {step === "input" ? "1" : <Check className="h-4 w-4" />}
    </div>
    <div className="flex-1">
      <div className="font-medium">Source Text</div>
      {step === "input" && <div className="text-xs text-muted-foreground">Paste your article</div>}
    </div>
  </div>
  <div className="h-8 w-px bg-gray-300 ml-4" />

  <div className={`flex items-center gap-3 ${step === "metadata" ? "text-blue-600" : step === "content" ? "text-green-600" : "text-gray-400"}`}>
    <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-current">
      {step === "input" ? "2" : step === "metadata" ? "2" : <Check className="h-4 w-4" />}
    </div>
    <div className="flex-1">
      <div className="font-medium">Metadata Analysis</div>
      {step === "metadata" && <div className="text-xs text-muted-foreground">Review AI detection</div>}
    </div>
  </div>
  <div className="h-8 w-px bg-gray-300 ml-4" />

  <div className={`flex items-center gap-3 ${step === "content" ? "text-blue-600" : "text-gray-400"}`}>
    <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-current">
      {step === "content" ? <Check className="h-4 w-4" /> : "3"}
    </div>
    <div className="flex-1">
      <div className="font-medium">Final Content</div>
      {step === "content" && <div className="text-xs text-muted-foreground">Article ready</div>}
    </div>
  </div>
</div>

{/* Desktop: Horizontal stepper */}
<div className="hidden md:flex items-center justify-center space-x-4 lg:space-x-8 py-6">
  <div className={`flex items-center space-x-2 transition-colors ${step === "input" ? "text-blue-600" : "text-green-600"}`}>
    {getStepIcon("input")}
    <span className="font-medium text-sm lg:text-base">1. Source Text</span>
  </div>
  <div className="h-px w-8 lg:w-16 bg-gray-300" />
  <div className={`flex items-center space-x-2 transition-colors ${step === "metadata" ? "text-blue-600" : step === "content" ? "text-green-600" : "text-gray-400"}`}>
    {getStepIcon("metadata")}
    <span className="font-medium text-sm lg:text-base">2. Metadata Analysis</span>
    {targetLanguage && (
      <Badge variant="outline" className="ml-2 text-xs">
        {getLanguageLabel(targetLanguage)}
      </Badge>
    )}
  </div>
  <div className="h-px w-8 lg:w-16 bg-gray-300" />
  <div className={`flex items-center space-x-2 transition-colors ${step === "content" ? "text-blue-600" : "text-gray-400"}`}>
    {getStepIcon("content")}
    <span className="font-medium text-sm lg:text-base">3. Final Content</span>
    {targetLanguage && (
      <Badge variant="outline" className="ml-2 text-xs">
        {getLanguageLabel(targetLanguage)}
      </Badge>
    )}
  </div>
</div>
```

---

#### Issue 2.2: Competition Intelligence Analysis Options Grid
**Severity**: MEDIUM
**Line**: 1594

**Current Implementation**:
```tsx
<div className="grid grid-cols-2 gap-3">
  <div className="flex items-center space-x-2">
    <Checkbox id="content-strategies" />
    <label htmlFor="content-strategies" className="text-sm flex items-center gap-1">
      Content Strategies
      {/* ... */}
    </label>
  </div>
  {/* 5 more checkboxes in 2-column grid */}
</div>
```

**Problem**: 2-column grid on all screen sizes. On mobile (<640px), labels wrap awkwardly.

**Fix**:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
  {/* Checkboxes will stack on mobile, 2 columns on larger screens */}
</div>
```

---

#### Issue 2.3: Translation Language Buttons Grid
**Severity**: MEDIUM
**Line**: 2588

**Current Implementation**:
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
```

**Problem**: 2 columns on mobile can still be cramped with long language names like "中文 (Chinese)".

**Fix**:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
  {/* Better progressive enhancement */}
</div>
```

---

#### Issue 2.4: Modal Dialogs - Small Screen Overflow
**Severity**: HIGH
**Lines**: 2656-2952 (all 6 info modals)

**Current Implementation**:
```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
  <div className="relative w-full max-w-md max-h-[85vh] rounded-2xl border border-white/20 bg-white/90 backdrop-blur-xl shadow-2xl overflow-hidden">
    <div className="relative p-6 overflow-y-auto max-h-[80vh]">
      {/* Content */}
    </div>
  </div>
</div>
```

**Problem**:
- `max-h-[85vh]` on outer div AND `max-h-[80vh]` on inner div causes double scrollbar
- `p-6` padding on inner div is too large on mobile
- No safe-area insets for notched phones

**Fix**:
```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
  <div
    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
    onClick={() => setContentStrategiesInfoOpen(false)}
  />
  <div className="relative w-full max-w-md max-h-[90vh] sm:max-h-[85vh] rounded-2xl border border-white/20 bg-white/90 backdrop-blur-xl shadow-2xl overflow-hidden">
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10 pointer-events-none" />
    <button
      onClick={() => setContentStrategiesInfoOpen(false)}
      className="absolute top-2 right-2 sm:top-3 sm:right-3 p-2 rounded-full bg-white/50 hover:bg-white/80 transition-colors z-10"
    >
      <X className="h-4 w-4 text-gray-600" />
    </button>
    <div className="relative p-4 sm:p-6 overflow-y-auto max-h-[90vh] sm:max-h-[85vh]">
      {/* Content with responsive padding */}
    </div>
  </div>
</div>
```

---

### 3. Button Consistency Issues

#### Issue 3.1: Emoji in Button/Header (Minor)
**Severity**: LOW
**Lines**: 2116, 1758

**Current Implementation**:
```tsx
<CardTitle className="flex items-center gap-2">
  🔍 SEO Enhancement Intelligence  {/* Line 2117 */}
</CardTitle>

<label className="text-sm flex items-center gap-1">
  🔥 SERP-Based Discovery  {/* Line 1758 */}
</label>
```

**Problem**: Project uses Lucide icons consistently, emojis break visual consistency and can render differently across platforms.

**Fix**:
```tsx
<CardTitle className="flex items-center gap-2">
  <FileSearch className="h-5 w-5 text-blue-600" />
  SEO Enhancement Intelligence
</CardTitle>

<label className="text-sm flex items-center gap-1">
  <Flame className="h-4 w-4 text-orange-500" />
  SERP-Based Discovery
</label>
```

**Note**: `Flame` icon already imported (line 46), `FileSearch` already imported (line 43).

---

#### Issue 3.2: Button Sizing Inconsistency
**Severity**: LOW
**Lines**: 927, 937, 961, 1211

**Current Implementation**:
```tsx
{/* Line 927 - Languages button */}
<Button variant="outline" size="sm" onClick={...}>
  <Languages className="h-4 w-4" />
</Button>

{/* Line 937 - Download button */}
<Button variant="outline" size="sm" onClick={...}>
  <Download className="h-4 w-4 mr-1" />
  Download
</Button>

{/* Line 961 - Publish button */}
<Button size="sm" onClick={...} className="bg-green-600 hover:bg-green-700">
  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
  {loading ? "Publishing..." : "Publish"}
</Button>

{/* Line 1211 - Analyze Article button (Input step) */}
<Button onClick={analyzeContent} disabled={loading || !originalText.trim()} className="w-full" size="lg">
  {loading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Analyzing content...
    </>
  ) : (
    <>
      <Brain className="mr-2 h-4 w-4" />
      Analyze Article
    </>
  )}
</Button>
```

**Problem**:
- Header action buttons use `size="sm"` with `h-4 w-4` icons
- Main CTA uses `size="lg"` but still has `h-4 w-4` icons (should be `h-5 w-5`)
- Inconsistent spacing: `mr-1` vs `mr-2`

**Fix**:
```tsx
{/* Header actions - keep sm size, but be consistent with spacing */}
<Button variant="outline" size="sm" onClick={...} className="gap-2">
  <Languages className="h-4 w-4" />
</Button>

<Button variant="outline" size="sm" onClick={...} className="gap-2">
  <Download className="h-4 w-4" />
  Download
</Button>

<Button size="sm" onClick={...} className="bg-green-600 hover:bg-green-700 gap-2">
  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
  {loading ? "Publishing..." : "Publish"}
</Button>

{/* Main CTAs - use lg size with larger icons */}
<Button onClick={analyzeContent} disabled={loading || !originalText.trim()} className="w-full gap-2" size="lg">
  {loading ? (
    <>
      <Loader2 className="h-5 w-5 animate-spin" />
      Analyzing content...
    </>
  ) : (
    <>
      <Brain className="h-5 w-5" />
      Analyze Article
    </>
  )}
</Button>
```

**Pattern**:
- `size="sm"` → `h-4 w-4` icons → `gap-2` spacing
- `size="lg"` → `h-5 w-5` icons → `gap-2` spacing
- Use `gap-X` class instead of `mr-X` for flex containers

---

### 4. Form Elements & Accessibility

#### Issue 4.1: Focus States Missing on Custom Tag Inputs
**Severity**: MEDIUM
**Lines**: 1302-1346 (category input), 1471-1515 (concern input)

**Current Implementation**:
```tsx
<Input
  value={newCategoryInput}
  onChange={(e) => setNewCategoryInput(e.target.value)}
  placeholder="Custom category..."
  className="h-7 w-32 text-sm"
  onKeyDown={(e) => {/* ... */}}
  autoFocus
/>
```

**Problem**:
- No visible focus state beyond browser default
- Small input size (`h-7 w-32`) hard to tap on mobile
- No visual feedback when focused

**Fix**:
```tsx
<Input
  value={newCategoryInput}
  onChange={(e) => setNewCategoryInput(e.target.value)}
  placeholder="Custom category..."
  className="h-8 sm:h-7 w-40 sm:w-32 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  onKeyDown={(e) => {/* ... */}}
  autoFocus
  aria-label="Add custom category"
/>
```

---

#### Issue 4.2: Age Range Inputs Missing Accessible Labels
**Severity**: MEDIUM
**Lines**: 1376-1392

**Current Implementation**:
```tsx
<Input
  type="number"
  value={ageRangeMin}
  onChange={(e) => setAgeRangeMin(parseInt(e.target.value) || 0)}
  className="h-7 w-16 text-sm"
  min={0}
  max={100}
/>
```

**Problem**: No `aria-label` or visible label for screen readers.

**Fix**:
```tsx
<Input
  type="number"
  value={ageRangeMin}
  onChange={(e) => setAgeRangeMin(parseInt(e.target.value) || 0)}
  className="h-8 sm:h-7 w-20 sm:w-16 text-sm focus:ring-2 focus:ring-blue-500"
  min={0}
  max={100}
  aria-label="Minimum age"
/>
<span className="text-gray-500 text-sm">-</span>
<Input
  type="number"
  value={ageRangeMax}
  onChange={(e) => setAgeRangeMax(parseInt(e.target.value) || 0)}
  className="h-8 sm:h-7 w-20 sm:w-16 text-sm focus:ring-2 focus:ring-blue-500"
  min={0}
  max={100}
  aria-label="Maximum age"
/>
```

---

#### Issue 4.3: Checkbox Labels Not Associated Properly
**Severity**: MEDIUM
**Lines**: 1550-1564 (Competition Intelligence toggle), 1596-1767 (analysis options)

**Current Implementation**:
```tsx
<Checkbox
  id="enable-competition"
  checked={competitionConfig.enabled}
  onCheckedChange={(checked) => updateCompetitionConfig({ enabled: checked as boolean })}
/>
<label htmlFor="enable-competition" className="text-sm font-medium">
  Enable Competition Intelligence Analysis
</label>
```

**Problem**: Works correctly, but missing cursor pointer on label for better UX.

**Fix**:
```tsx
<Checkbox
  id="enable-competition"
  checked={competitionConfig.enabled}
  onCheckedChange={(checked) => updateCompetitionConfig({ enabled: checked as boolean })}
/>
<label htmlFor="enable-competition" className="text-sm font-medium cursor-pointer">
  Enable Competition Intelligence Analysis
</label>
```

**Apply to all labels** on lines: 1561, 1613, 1641, 1669, 1699, 1726, 1755.

---

#### Issue 4.4: Select Dropdown Missing Responsive Width
**Severity**: LOW
**Line**: 1143

**Current Implementation**:
```tsx
<Select value={targetLanguage} onValueChange={setTargetLanguage}>
  <SelectTrigger className="w-48">
    <SelectValue />
  </SelectTrigger>
  <SelectContent className="max-h-[400px]">
    {/* Languages */}
  </SelectContent>
</Select>
```

**Problem**: Fixed `w-48` width can overflow on very small screens.

**Fix**:
```tsx
<SelectTrigger className="w-full sm:w-48">
  <SelectValue />
</SelectTrigger>
```

---

### 5. Color Contrast & Accessibility Issues

#### Issue 5.1: Badge Color Contrast in Quality Section
**Severity**: LOW
**Lines**: 1920-1956

**Current Implementation**:
```tsx
<Badge variant={transformedContent.lengthValidation.qualityLevel === "excellent" ? "default" : transformedContent.lengthValidation.qualityLevel === "good" ? "secondary" : "destructive"}>
  📝 {transformedContent.lengthValidation.wordCount} words
</Badge>
```

**Problem**:
- Emoji in Badge (inconsistent)
- No guaranteed color contrast for text

**Fix**:
```tsx
<Badge
  variant={transformedContent.lengthValidation.qualityLevel === "excellent" ? "default" : transformedContent.lengthValidation.qualityLevel === "good" ? "secondary" : "destructive"}
  className="flex items-center gap-1"
>
  <FileText className="h-3 w-3" />
  {transformedContent.lengthValidation.wordCount} words
</Badge>
```

---

#### Issue 5.2: Info Button Hover States Too Subtle
**Severity**: LOW
**Lines**: 1617-1622, 1644-1649, etc.

**Current Implementation**:
```tsx
<button
  onClick={(e) => { e.preventDefault(); setContentStrategiesInfoOpen(true); }}
  className="p-0.5 rounded-full hover:bg-blue-100 transition-colors"
  title="Learn more"
>
  <Info className="h-3.5 w-3.5 text-blue-400" />
</button>
```

**Problem**:
- Very small hitbox (`p-0.5` = 2px padding)
- Light hover color (`bg-blue-100`) hard to see
- No focus state for keyboard navigation

**Fix**:
```tsx
<button
  onClick={(e) => { e.preventDefault(); setContentStrategiesInfoOpen(true); }}
  className="p-1 rounded-full hover:bg-blue-200 focus:bg-blue-200 focus:ring-2 focus:ring-blue-400 transition-colors"
  title="Learn more about Content Strategies"
  aria-label="Learn more about Content Strategies"
>
  <Info className="h-4 w-4 text-blue-500" />
</button>
```

---

## Implementation Priority

### Priority 1: Critical (Implement First)
1. **Glassmorphism on Main Cards** (Issue 1.1) - 4 cards to update
2. **Responsive Progress Steps** (Issue 2.1) - Mobile UX blocker
3. **Modal Dialog Overflow Fix** (Issue 2.4) - All 6 modals

### Priority 2: High (Implement Second)
4. **Competition Intelligence Card Glassmorphism** (Issue 1.2)
5. **SEO Card Glassmorphism** (Issue 1.3)
6. **Form Accessibility** (Issues 4.1, 4.2, 4.3)

### Priority 3: Medium (Implement Third)
7. **Responsive Grids** (Issues 2.2, 2.3)
8. **Button Sizing Consistency** (Issue 3.2)
9. **Select Dropdown Width** (Issue 4.4)

### Priority 4: Low (Polish)
10. **Replace Emojis with Icons** (Issues 3.1, 5.1)
11. **Info Button Improvements** (Issue 5.2)
12. **Checkbox Label Cursors** (Issue 4.3)

---

## Code Quality Observations

### Strengths
✅ **Excellent use of Lucide icons** throughout (imported all needed icons)
✅ **Good component separation** (header, steps, cards)
✅ **Consistent use of shadcn/ui components** (Button, Card, Select, Checkbox)
✅ **Proper state management** with React hooks
✅ **Good TypeScript typing** with interfaces
✅ **Accessible HTML structure** (proper semantic tags)

### Weaknesses
⚠️ **File is too large** (2956 lines) - consider splitting into components
⚠️ **Inconsistent glassmorphism** - some areas have it, others don't
⚠️ **Limited responsive design** - many fixed widths without breakpoints
⚠️ **Console.logs in production** (lines 801, 2095, 2142, 2203) - should be removed
⚠️ **Repeated modal code** - 6 nearly identical modal blocks (refactor opportunity)

---

## Recommended Component Refactoring

### 1. Extract Glassmorphic Card Component

**Create**: `/components/ui/glassmorphic-card.tsx`

```tsx
import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GlasmorphicCardProps {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  gradientFrom?: string;
  gradientTo?: string;
  borderColor?: string;
}

export function GlasmorphicCard({
  title,
  description,
  children,
  className,
  gradientFrom = "from-blue-50/30",
  gradientTo = "to-purple-50/30",
  borderColor = "border-white/20",
}: GlasmorphicCardProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl shadow-lg",
      `border ${borderColor}`,
      className
    )}>
      <div className={cn(
        "pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent",
        gradientFrom,
        gradientTo
      )} />
      <Card className="relative bg-transparent border-none shadow-none">
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent className="space-y-4">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
```

**Usage**:
```tsx
{/* Replace line 1089 */}
<GlasmorphicCard
  title={
    <div className="flex items-center gap-2">
      <FileText className="h-5 w-5" />
      Source Material Input
    </div>
  }
  description="Paste an article from any source. AI will automatically detect categories and target audience."
>
  {/* Existing CardContent children */}
</GlasmorphicCard>

{/* Competition Intelligence - custom colors */}
<GlasmorphicCard
  className="border-2"
  gradientFrom="from-orange-100/20"
  gradientTo="to-amber-100/20"
  borderColor="border-orange-200/40"
  title={
    <div className="flex items-center gap-2">
      <Target className="h-5 w-5 text-orange-600" />
      Competition Intelligence Mode
      <Badge variant="secondary" className="ml-2">Premium Feature</Badge>
    </div>
  }
  description="Analyze competitor strategies and enhance content with real SERP data."
>
  {/* Existing content */}
</GlasmorphicCard>
```

---

### 2. Extract Info Modal Component

**Create**: `/components/ui/info-modal.tsx`

```tsx
import { ReactNode } from "react";
import { X, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function InfoModal({
  isOpen,
  onClose,
  icon: Icon,
  iconColor,
  iconBgColor,
  gradientFrom,
  gradientVia,
  gradientTo,
  title,
  subtitle,
  children,
}: InfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md max-h-[90vh] sm:max-h-[85vh] rounded-2xl border border-white/20 bg-white/90 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className={cn(
          "absolute inset-0 rounded-2xl bg-gradient-to-br pointer-events-none",
          gradientFrom,
          gradientVia,
          gradientTo
        )} />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 p-2 rounded-full bg-white/50 hover:bg-white/80 transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="h-4 w-4 text-gray-600" />
        </button>
        <div className="relative p-4 sm:p-6 overflow-y-auto max-h-[90vh] sm:max-h-[85vh]">
          <div className="flex items-center gap-3 mb-4">
            <div className={cn("p-2.5 rounded-xl", iconBgColor)}>
              <Icon className={cn("h-5 w-5", iconColor)} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
```

**Usage**:
```tsx
<InfoModal
  isOpen={contentStrategiesInfoOpen}
  onClose={() => setContentStrategiesInfoOpen(false)}
  icon={FileSearch}
  iconColor="text-blue-600"
  iconBgColor="bg-blue-100"
  gradientFrom="from-blue-500/10"
  gradientVia="via-purple-500/5"
  gradientTo="to-pink-500/10"
  title="Content Strategies Analysis"
  subtitle="+3 credits per analysis"
>
  <p className="text-sm text-muted-foreground mb-4">
    Analyzes top 20 ranking pages for your keywords to extract competitor content patterns and structures.
  </p>
  <div className="space-y-2">
    <div className="flex items-start gap-2">
      <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
      <span className="text-sm">Competitor snippets with position & title</span>
    </div>
    {/* More features */}
  </div>
</InfoModal>
```

---

### 3. Extract Progress Stepper Component

**Create**: `/components/blog/progress-stepper.tsx`

```tsx
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "input" | "metadata" | "content";

interface ProgressStepperProps {
  currentStep: Step;
  loading: boolean;
  targetLanguage?: string;
  getLanguageLabel: (code: string) => string;
}

export function ProgressStepper({
  currentStep,
  loading,
  targetLanguage,
  getLanguageLabel
}: ProgressStepperProps) {
  const getStepIcon = (step: Step) => {
    if (currentStep === step && loading) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    if (
      (step === "metadata" && ["metadata", "content"].includes(currentStep)) ||
      (step === "content" && currentStep === "content")
    ) {
      return <Check className="h-4 w-4 text-green-500" />;
    }
    return null;
  };

  const steps = [
    { id: "input" as Step, label: "Source Text", shortLabel: "Source" },
    { id: "metadata" as Step, label: "Metadata Analysis", shortLabel: "Metadata" },
    { id: "content" as Step, label: "Final Content", shortLabel: "Content" },
  ];

  return (
    <>
      {/* Mobile: Vertical */}
      <div className="md:hidden space-y-4 py-4">
        {steps.map((step, index) => (
          <div key={step.id}>
            <div className={cn(
              "flex items-center gap-3 transition-colors",
              currentStep === step.id ? "text-blue-600" :
              steps.indexOf(steps.find(s => s.id === currentStep)!) > index ? "text-green-600" : "text-gray-400"
            )}>
              <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-current">
                {getStepIcon(step.id) || (index + 1)}
              </div>
              <div className="flex-1">
                <div className="font-medium">{step.shortLabel}</div>
                {currentStep === step.id && <div className="text-xs text-muted-foreground">In progress</div>}
              </div>
              {targetLanguage && currentStep === step.id && step.id !== "input" && (
                <Badge variant="outline" className="text-xs">
                  {getLanguageLabel(targetLanguage)}
                </Badge>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className="h-6 w-px bg-gray-300 ml-4 my-1" />
            )}
          </div>
        ))}
      </div>

      {/* Desktop: Horizontal */}
      <div className="hidden md:flex items-center justify-center space-x-4 lg:space-x-8 py-6">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-4">
            <div className={cn(
              "flex items-center space-x-2 transition-colors",
              currentStep === step.id ? "text-blue-600" :
              steps.indexOf(steps.find(s => s.id === currentStep)!) > index ? "text-green-600" : "text-gray-400"
            )}>
              {getStepIcon(step.id)}
              <span className="font-medium text-sm lg:text-base">{index + 1}. {step.label}</span>
              {targetLanguage && step.id !== "input" && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {getLanguageLabel(targetLanguage)}
                </Badge>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className="h-px w-8 lg:w-16 bg-gray-300" />
            )}
          </div>
        ))}
      </div>
    </>
  );
}
```

**Usage**:
```tsx
{/* Replace lines 1046-1077 */}
<ProgressStepper
  currentStep={step}
  loading={loading}
  targetLanguage={targetLanguage}
  getLanguageLabel={getLanguageLabel}
/>
```

---

## Testing Checklist

After implementing fixes, test on:

### Desktop (1920px+)
- [ ] All cards show glassmorphism effects
- [ ] Progress stepper displays horizontally
- [ ] Modals are centered and scrollable
- [ ] All buttons have correct sizes
- [ ] Competition Intelligence grid shows 2 columns

### Tablet (768px - 1024px)
- [ ] Progress stepper still horizontal
- [ ] Translation buttons show 3 columns
- [ ] Modal padding adjusts
- [ ] Cards maintain glassmorphism
- [ ] Form inputs are easily tappable

### Mobile (320px - 640px)
- [ ] Progress stepper switches to vertical
- [ ] All grids stack to single column
- [ ] Modal fits screen with safe padding
- [ ] Buttons are large enough to tap (min 44px)
- [ ] Select dropdowns take full width
- [ ] Custom tag inputs are easy to use

### Accessibility
- [ ] All form inputs have labels (visible or aria-label)
- [ ] Focus states visible on all interactive elements
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Screen reader announces all sections correctly
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Modals trap focus when open

### Cross-browser
- [ ] Chrome/Edge (Chromium)
- [ ] Safari (WebKit)
- [ ] Firefox (Gecko)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Estimated Implementation Time

| Task | Lines to Change | Time Estimate |
|------|----------------|---------------|
| Glassmorphism on 4 main cards | ~80 lines | 1 hour |
| Responsive progress stepper | ~120 lines | 1.5 hours |
| Modal dialog fixes (6 modals) | ~300 lines | 2 hours |
| Competition Intelligence card | ~30 lines | 30 mins |
| SEO card glassmorphism | ~40 lines | 30 mins |
| Form accessibility fixes | ~50 lines | 1 hour |
| Responsive grid adjustments | ~20 lines | 30 mins |
| Button consistency | ~40 lines | 45 mins |
| Replace emojis with icons | ~15 lines | 30 mins |
| Info button improvements | ~60 lines | 1 hour |
| **Component refactoring** | ~400 lines | 3 hours |
| **Testing** | - | 2 hours |
| **TOTAL** | ~1,155 lines | **14 hours** |

---

## Summary

The `/dashboard/blog/new` page has a solid foundation but needs systematic improvements to glassmorphism consistency, responsive design, and accessibility. The main issues are:

1. **Inconsistent glassmorphism** - only 40% coverage, needs to be applied to all Cards
2. **Limited responsive design** - progress stepper and grids need mobile-first breakpoints
3. **Modal overflow issues** - double scrollbars and padding need fixing
4. **Minor accessibility gaps** - missing ARIA labels and focus states

Recommended approach:
1. **Phase 1**: Fix critical issues (glassmorphism, responsive stepper, modals) - 4.5 hours
2. **Phase 2**: Accessibility and consistency (forms, buttons, grids) - 3.5 hours
3. **Phase 3**: Component refactoring (extract reusable components) - 3 hours
4. **Phase 4**: Testing and polish - 2 hours

Total project effort: ~13-14 hours for one developer.

---

**Next Steps**:
1. Review and approve this audit
2. Prioritize which issues to fix first
3. Create backup of current file
4. Implement fixes incrementally
5. Test on multiple devices
6. Deploy to staging for QA

**Questions?** Review the specific code fixes above for each issue.
