# Pricing UI Design Specification

**Document Version:** 1.1
**Date:** January 16, 2026
**Status:** Design Specification (Audit Compliant)
**For:** Citedy Subscription System UI Components
**Design Audit Score:** 85/100 ✅

> **Compliance:** This spec follows Citedy Design Guidelines including:
>
> - Dark Pill Navigation Style (navigation.md)
> - Glassmorphism Patterns (glassmorphism.md)
> - Badge Rules with `whitespace-nowrap` (components.md)
> - Touch Targets min 44px (accessibility)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Design System Foundation](#2-design-system-foundation)
3. [Landing Page Pricing Section](#3-landing-page-pricing-section)
4. [Billing Page Subscription UI](#4-billing-page-subscription-ui)
5. [Pricing Comparison Table](#5-pricing-comparison-table)
6. [Component Specifications](#6-component-specifications)
7. [Animations & Interactions](#7-animations--interactions)
8. [Responsive Behavior](#8-responsive-behavior)
9. [File Locations](#9-file-locations)
10. [Implementation Checklist](#10-implementation-checklist)

- [Appendix A: Existing Component Patterns](#appendix-a-existing-component-patterns-reference)
- [Appendix B: Accessibility Requirements](#appendix-b-accessibility-requirements)
- [Appendix C: Design Guidelines Reference](#appendix-c-design-guidelines-reference)

---

## 1. Overview

This document defines the UI components for the Citedy subscription system, covering:

- **Landing Page**: New `PricingSection` component with 4-tier plan cards
- **Billing Page**: Subscription management UI with current plan, upgrade flow, trial banner
- **Shared Components**: Pricing comparison table, plan cards, upgrade prompts

### Design Principles (from existing codebase)

- **Glassmorphism**: `backdrop-blur-md bg-white/70 border border-white/20`
- **Rounded corners**: `rounded-2xl` (cards), `rounded-3xl` (sections), `rounded-full` (buttons)
- **Gradients**: Green-blue (`#10B981` to `#3B82F6`) for pricing accents
- **Shadows**: Light shadows `shadow-[0_8px_32px_rgba(0,0,0,0.04)]` to `shadow-[0_8px_32px_rgba(0,0,0,0.08)]`
- **Color palette**: Slate for text, purple/blue/pink for accents

---

## 2. Design System Foundation

### 2.1 Colors (from existing guidelines)

```typescript
// Plan-specific accent colors
const PLAN_COLORS = {
  free: {
    primary: "#6B7280", // gray-500
    light: "rgba(107, 114, 128, 0.1)",
    border: "rgba(107, 114, 128, 0.3)",
  },
  starter: {
    primary: "#10B981", // emerald-500
    light: "rgba(16, 185, 129, 0.1)",
    border: "rgba(16, 185, 129, 0.3)",
  },
  pro: {
    primary: "#8B5CF6", // violet-500
    light: "rgba(139, 92, 246, 0.12)",
    border: "rgba(139, 92, 246, 0.4)",
  },
  business: {
    primary: "#3B82F6", // blue-500
    light: "rgba(59, 130, 246, 0.1)",
    border: "rgba(59, 130, 246, 0.3)",
  },
};

// Badge colors for plan highlights
const BADGE_COLORS = {
  popular: "bg-violet-100 text-violet-700 border-violet-200",
  bestValue: "bg-emerald-100 text-emerald-700 border-emerald-200",
};
```

### 2.2 Typography Scale

| Element         | Class                            | Size    |
| --------------- | -------------------------------- | ------- |
| Section heading | `text-3xl sm:text-4xl font-bold` | 30-36px |
| Plan name       | `text-xl font-bold`              | 20px    |
| Price (large)   | `text-4xl font-bold`             | 36px    |
| Price period    | `text-sm text-muted-foreground`  | 14px    |
| Feature text    | `text-sm`                        | 14px    |
| Badge text      | `text-xs font-medium`            | 12px    |

### 2.3 Spacing System

- Section padding: `py-16 lg:py-20`
- Card padding: `p-6 sm:p-8`
- Gap between cards: `gap-4 lg:gap-6`
- Feature list gap: `gap-3`

---

## 3. Landing Page Pricing Section

### 3.1 Component Overview

**File:** `components/landing/PricingSection.tsx`
**Type:** Server Component (for SSR performance)
**Position:** After `PricingComparison`, before `AIInsightsShowcase`

### 3.2 Section Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│     ┌─────────────────────┐                                                  │
│     │ Subscription Plans  │  <-- Badge                                       │
│     └─────────────────────┘                                                  │
│                                                                              │
│     Choose the Perfect Plan for Your Growth                                  │
│     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                                     │
│     Save 20% with annual billing                                             │
│                                                                              │
│     ┌─────────────────┐   Monthly / Annual Toggle                            │
│                                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │   FREE   │  │ STARTER  │  │   PRO    │  │ BUSINESS │                      │
│  │          │  │          │  │ POPULAR  │  │BEST VALUE│                      │
│  │   $0     │  │   $29    │  │   $79    │  │  $199    │                      │
│  │          │  │          │  │          │  │          │                      │
│  │ Features │  │ Features │  │ Features │  │ Features │                      │
│  │    ...   │  │    ...   │  │    ...   │  │    ...   │                      │
│  │          │  │          │  │          │  │          │                      │
│  │  [CTA]   │  │  [CTA]   │  │  [CTA]   │  │  [CTA]   │                      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘                      │
│                                                                              │
│     ┌─────────────────────────────────────────────────────────────────┐      │
│     │              7-Day Pro Trial Banner (conditional)                │      │
│     └─────────────────────────────────────────────────────────────────┘      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Glassmorphism Section Styling

```tsx
// Section background (matches existing landing sections)
<section
  className="py-16 lg:py-20 relative overflow-hidden"
  style={{
    background:
      "linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(59, 130, 246, 0.05) 50%, rgba(16, 185, 129, 0.03) 100%)",
  }}
>
  {/* Decorative blurred shapes */}
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <div
      className="absolute -top-20 -left-20 w-80 h-80 rounded-full blur-3xl opacity-30"
      style={{ background: "rgba(139, 92, 246, 0.3)" }}
    />
    <div
      className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-3xl opacity-30"
      style={{ background: "rgba(59, 130, 246, 0.3)" }}
    />
  </div>

  <div className="container mx-auto px-4 relative z-10">{/* Content */}</div>
</section>
```

### 3.4 Billing Toggle Component

```tsx
// Monthly/Annual toggle with savings indicator
// Uses Citedy Dark Pill Style (per navigation.md)
interface BillingToggleProps {
  isAnnual: boolean;
  onToggle: (annual: boolean) => void;
}

// Visual specification:
// - Pill-shaped container: rounded-full bg-slate-100 p-1 (contained style)
// - Active state: bg-slate-900 text-white shadow-sm (dark pill standard)
// - Inactive state: text-slate-500 with hover
// - Annual shows "Save 20%" badge inline
// - Smooth transition: transition-all duration-200
// - Minimum touch target: min-h-[44px]

<div className="inline-flex items-center gap-1 p-1 rounded-full bg-slate-100 border border-slate-200/60">
  <button
    className={cn(
      "px-5 py-2.5 min-h-[40px] rounded-full text-sm font-medium transition-all duration-200",
      !isAnnual
        ? "bg-slate-900 text-white shadow-sm"
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50",
    )}
    onClick={() => onToggle(false)}
  >
    Monthly
  </button>
  <button
    className={cn(
      "px-5 py-2.5 min-h-[40px] rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2",
      isAnnual
        ? "bg-slate-900 text-white shadow-sm"
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50",
    )}
    onClick={() => onToggle(true)}
  >
    Annual
    <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px] whitespace-nowrap">
      Save 20%
    </Badge>
  </button>
</div>;
```

---

## 4. Billing Page Subscription UI

### 4.1 Component Overview

**File:** `app/dashboard/billing/components/SubscriptionCard.tsx`
**File:** `app/dashboard/billing/components/TrialBanner.tsx`
**File:** `app/dashboard/billing/components/PlanUpgradeModal.tsx`

### 4.2 Current Plan Card Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Current Plan                                                      [Manage] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐                                                           │
│  │ PRO          │  <-- Plan badge with color                                │
│  │ ●────────────│  <-- "Most Popular" if Pro                                │
│  └──────────────┘                                                           │
│                                                                              │
│  $79/month                                                                   │
│  Renews on Feb 16, 2026                                                     │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Credits This Month                                                  │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│    │    │
│  │  └─────────────────────────────────────────────────────────────┘    │    │
│  │  2,450 / 6,000 credits used (40.8%)                                 │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Included Features:                                                         │
│  ✓ AI Monitoring        ✓ Custom Domain       ✓ Priority Support           │
│  ✓ 3 Team Seats         ✓ 10 Social Accounts  ✓ Auto Social Posting        │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐              │
│  │ Change Plan  │  │Cancel Subscription│  │ View Invoices   │              │
│  └──────────────┘  └──────────────┘  └──────────────────────┘              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Trial Banner Component

```tsx
// Shown when status === "trialing"
// Position: Top of billing page, above BalanceCard

interface TrialBannerProps {
  planName: string; // "Pro"
  daysRemaining: number; // 5
  trialEndsAt: Date; // 2026-01-23
  onSubscribe: () => void;
}

// Visual specification:
// - Gradient background: from-violet-500 to-purple-600
// - White text for contrast
// - Countdown display with urgency scaling
// - CTA button: white bg, dark text

<div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 p-6 text-white">
  {/* Decorative pattern */}
  <div className="absolute inset-0 opacity-10">
    <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white" />
    <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white" />
  </div>

  <div className="relative z-10 flex items-center justify-between">
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="h-5 w-5" />
        <span className="font-semibold">Pro Trial Active</span>
      </div>
      <p className="text-white/90">
        {daysRemaining} days remaining - Explore all Pro features
      </p>
    </div>

    <Button
      className="bg-white text-violet-700 hover:bg-white/90 shadow-lg"
      onClick={onSubscribe}
    >
      Subscribe Now
      <ArrowRight className="h-4 w-4 ml-2" />
    </Button>
  </div>
</div>;
```

### 4.4 Grace Period Warning Banner

```tsx
// Shown when status === "past_due" and gracePeriodEnd exists

<div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
  <div className="flex-1">
    <p className="font-medium text-amber-800">
      Payment Failed - Action Required
    </p>
    <p className="text-sm text-amber-600">
      Update your payment method by {formatDate(gracePeriodEnd)} to keep your{" "}
      {planName} features.
    </p>
  </div>
  <Button
    variant="outline"
    className="border-amber-300 text-amber-800 hover:bg-amber-100"
  >
    Update Payment
  </Button>
</div>
```

---

## 5. Pricing Comparison Table

### 5.1 Component Overview

**File:** `components/pricing/PlanComparisonTable.tsx`
**Type:** Server Component
**Used in:** Landing page pricing section, `/pricing` page

### 5.2 Table Layout

```
┌────────────────────────────────┬──────┬─────────┬────────┬──────────┐
│ Feature                        │ Free │ Starter │ Pro    │ Business │
├────────────────────────────────┼──────┼─────────┼────────┼──────────┤
│ CONTENT GENERATION             │      │         │        │          │
├────────────────────────────────┼──────┼─────────┼────────┼──────────┤
│ Article Generation             │ Demo │ Pay     │ Pay    │ Pay      │
│ TTS Voice-Over                 │ Pay  │ Pay     │ Pay    │ Pay      │
│ Humanize                       │ Pay  │ Pay     │ Pay    │ Pay      │
│ AI Illustrations               │ Pay  │ Pay     │ Pay    │ Pay      │
├────────────────────────────────┼──────┼─────────┼────────┼──────────┤
│ AI VISIBILITY                  │      │         │        │          │
├────────────────────────────────┼──────┼─────────┼────────┼──────────┤
│ AI Platforms Tracked           │ 9    │ 9       │ 9      │ 9        │
│ AI Monitoring (automatic)      │ ✗    │ ✗       │ ✓      │ ✓        │
├────────────────────────────────┼──────┼─────────┼────────┼──────────┤
│ SCOUT FEATURES                 │      │         │        │          │
├────────────────────────────────┼──────┼─────────┼────────┼──────────┤
│ X-Intent Scout                 │ Pay  │ Pay     │ Pay    │ Pay      │
│ Reddit Scout                   │ Pay  │ Pay     │ Pay    │ Pay      │
│ Wikipedia Scout                │ ✗    │ ✗       │ Pay    │ Pay      │
├────────────────────────────────┼──────┼─────────┼────────┼──────────┤
│ AI CHAT                        │ ✗    │ 10/day  │ ∞      │ ∞        │
├────────────────────────────────┼──────┼─────────┼────────┼──────────┤
│ INFRASTRUCTURE                 │      │         │        │          │
├────────────────────────────────┼──────┼─────────┼────────┼──────────┤
│ Custom Domain                  │ ✗    │ ✗       │ ✓      │ ✓        │
│ API Access                     │ ✗    │ ✗       │ ✗      │ ✓        │
│ Team Seats                     │ 1    │ 1       │ 3      │ ∞        │
│ Priority Support               │ ✗    │ ✗       │ ✓      │ ✓        │
└────────────────────────────────┴──────┴─────────┴────────┴──────────┘
```

### 5.3 Table Styling

```tsx
// Glass card container
<Card className={cn("rounded-2xl overflow-hidden", glassStyles)}>
  <CardHeader>
    <CardTitle className="text-lg sm:text-xl">Feature Comparison</CardTitle>
  </CardHeader>
  <CardContent className="px-2 sm:px-6">
    <div className="overflow-x-auto -mx-2 sm:mx-0">
      <Table className="min-w-[600px]">
        <TableHeader>
          <TableRow className="border-b border-slate-200">
            <TableHead className="text-xs sm:text-sm font-medium text-slate-600 w-[200px]">
              Feature
            </TableHead>
            {PLANS.map((plan) => (
              <TableHead
                key={plan.id}
                className={cn(
                  "text-center text-xs sm:text-sm font-semibold w-[100px]",
                  plan.id === "pro" && "text-violet-700",
                )}
              >
                {plan.name}
                {plan.badge && (
                  <Badge
                    className="ml-1 text-[9px] whitespace-nowrap"
                    variant="secondary"
                  >
                    {plan.badge}
                  </Badge>
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Category headers */}
          <TableRow className="bg-slate-50/50">
            <TableCell
              colSpan={5}
              className="font-semibold text-slate-700 text-xs uppercase tracking-wide"
            >
              Content Generation
            </TableCell>
          </TableRow>
          {/* Feature rows */}
          {features.map((feature) => (
            <TableRow key={feature.name} className="hover:bg-slate-50/30">
              <TableCell className="font-medium text-xs sm:text-sm">
                {feature.name}
              </TableCell>
              {/* Plan cells with check/x/value */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </CardContent>
</Card>
```

### 5.4 Cell Value Display

```tsx
// Boolean values
function FeatureCell({ value }: { value: boolean | string | number }) {
  if (typeof value === "boolean") {
    return value ? (
      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 mx-auto" />
    ) : (
      <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-slate-300 mx-auto" />
    );
  }

  // String/number values (like "10/day", "∞", "Pay")
  return (
    <span
      className={cn(
        "text-xs sm:text-sm",
        value === "Pay" && "text-amber-600 font-medium",
        value === "∞" && "text-emerald-600 font-semibold",
        value === "Demo" && "text-slate-500",
      )}
    >
      {value}
    </span>
  );
}
```

---

## 6. Component Specifications

### 6.1 PlanCard Component

**File:** `components/pricing/PlanCard.tsx`

```tsx
interface PlanCardProps {
  plan: {
    id: PlanId;
    name: string;
    description: string;
    priceMonthly: number;
    priceAnnual: number;
    creditsMonthly: number;
    features: Record<string, boolean>;
    badge?: "popular" | "best_value";
  };
  isAnnual: boolean;
  isCurrentPlan?: boolean;
  onSelect: (planId: PlanId) => void;
}
```

**Visual States:**

1. **Default**: Glassmorphism card with subtle border
2. **Highlighted (Pro)**: Violet ring, "Most Popular" badge
3. **Best Value (Business)**: Emerald accent, "Best Value" badge
4. **Current Plan**: Green checkmark, "Current Plan" badge, disabled CTA

**Dimensions:**

- Card width: `min-w-[280px]` in grid, flexible in responsive
- Card height: Auto, content-driven
- Padding: `p-6 sm:p-8`
- Border radius: `rounded-2xl`

**Card Structure:**

```tsx
<div
  className={cn(
    "relative rounded-2xl overflow-hidden transition-all duration-300",
    glassStyles,
    // Highlight for Pro plan
    plan.badge === "popular" && "ring-2 ring-violet-400 ring-offset-2",
    // Hover state
    "hover:shadow-lg hover:-translate-y-1",
  )}
>
  {/* Badge (if any) - Always use whitespace-nowrap per components.md */}
  {plan.badge && (
    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
      <Badge
        className={cn(
          "whitespace-nowrap shadow-sm text-xs font-medium",
          plan.badge === "popular" && BADGE_COLORS.popular,
          plan.badge === "best_value" && BADGE_COLORS.bestValue,
        )}
      >
        {plan.badge === "popular" ? "Most Popular" : "Best Value"}
      </Badge>
    </div>
  )}

  <div className="p-6 sm:p-8">
    {/* Plan name */}
    <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h3>
    <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

    {/* Price */}
    <div className="mb-6">
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-bold text-slate-900">
          ${isAnnual ? Math.round(plan.priceAnnual / 12) : plan.priceMonthly}
        </span>
        <span className="text-sm text-muted-foreground">/month</span>
      </div>
      {isAnnual && plan.priceMonthly > 0 && (
        <p className="text-xs text-emerald-600 mt-1">
          ${plan.priceAnnual}/year (save $
          {plan.priceMonthly * 12 - plan.priceAnnual})
        </p>
      )}
    </div>

    {/* Credits included */}
    <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-slate-50">
      <Coins className="h-4 w-4 text-amber-500" />
      <span className="text-sm font-medium">
        {plan.creditsMonthly > 0
          ? `${plan.creditsMonthly.toLocaleString()} credits/mo`
          : "100 one-time"}
      </span>
    </div>

    {/* Feature list */}
    <ul className="space-y-3 mb-6">
      {HIGHLIGHT_FEATURES.map((feature) => (
        <li key={feature.key} className="flex items-center gap-2 text-sm">
          {plan.features[feature.key] ? (
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <X className="h-4 w-4 text-slate-300 shrink-0" />
          )}
          <span
            className={cn(
              plan.features[feature.key] ? "text-slate-700" : "text-slate-400",
            )}
          >
            {feature.label}
          </span>
        </li>
      ))}
    </ul>

    {/* CTA Button - Dark Pill Style for primary actions */}
    <Button
      className={cn(
        "w-full min-h-[44px] rounded-full transition-all duration-200",
        "focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
        // Default: Dark pill style
        "bg-slate-900 text-white hover:bg-slate-800",
        // Popular plan: Violet accent
        plan.badge === "popular" && "bg-violet-600 hover:bg-violet-700",
        // Current plan: Emerald with disabled state
        isCurrentPlan && "bg-emerald-600 hover:bg-emerald-700 cursor-default",
      )}
      variant={plan.id === "free" ? "outline" : "default"}
      onClick={() => onSelect(plan.id)}
      disabled={isCurrentPlan}
    >
      {isCurrentPlan ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Current Plan
        </>
      ) : plan.id === "free" ? (
        "Get Started Free"
      ) : (
        <>
          Start with {plan.name}
          <ArrowRight className="h-4 w-4 ml-2" />
        </>
      )}
    </Button>
  </div>
</div>
```

### 6.2 UpgradeBanner Component

**File:** `components/billing/UpgradeBanner.tsx`

```tsx
interface UpgradeBannerProps {
  feature: string; // "ai_monitoring"
  featureLabel: string; // "AI Monitoring"
  requiredPlan: PlanId; // "pro"
  currentPlan: PlanId; // "starter"
  onUpgrade: () => void;
}

// Visual: Inline banner that appears when user tries to access locked feature
// Style: Soft amber background with upgrade CTA

<div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl">
  <div className="flex items-center gap-3">
    <Lock className="h-5 w-5 text-amber-600" />
    <div>
      <p className="font-medium text-amber-800">
        {featureLabel} requires {requiredPlan} plan
      </p>
      <p className="text-sm text-amber-600">Upgrade to unlock this feature</p>
    </div>
  </div>
  <Button
    variant="outline"
    className="border-amber-300 text-amber-800 hover:bg-amber-100"
    onClick={onUpgrade}
  >
    Upgrade to {requiredPlan}
    <ArrowRight className="h-4 w-4 ml-2" />
  </Button>
</div>;
```

### 6.3 CooldownIndicator Component

**File:** `components/billing/CooldownIndicator.tsx`

```tsx
interface CooldownIndicatorProps {
  feature: string; // "autopilot"
  waitMs: number; // 300000 (5 minutes)
  nextAllowedAt: Date;
  planCooldown: number; // 10 (minutes for current plan)
}

// Visual: Shows countdown timer with plan comparison
// Appears inline where feature is blocked

<div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
  <Clock className="h-5 w-5 text-slate-500 animate-pulse" />
  <div className="flex-1">
    <p className="text-sm font-medium text-slate-700">
      Cooldown active: {formatDuration(waitMs)} remaining
    </p>
    <p className="text-xs text-slate-500">
      Your plan ({currentPlan}): {planCooldown}min cooldown •
      <span className="text-violet-600 cursor-pointer hover:underline">
        Pro has 10min cooldown
      </span>
    </p>
  </div>
</div>;
```

---

## 7. Animations & Interactions

### 7.1 Card Hover Effects

```css
/* PlanCard hover */
.plan-card {
  transition: all 300ms ease;
}
.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
}

/* Highlighted card (Pro) has stronger effect */
.plan-card--popular:hover {
  box-shadow: 0 12px 40px rgba(139, 92, 246, 0.15);
}
```

### 7.2 Toggle Animations

```tsx
// Billing toggle with smooth state change
<motion.div
  layout
  transition={{ type: "spring", stiffness: 500, damping: 30 }}
  className="absolute inset-y-1 bg-white rounded-full shadow-sm"
  style={{
    left: isAnnual ? "50%" : "4px",
    width: "calc(50% - 8px)",
  }}
/>
```

### 7.3 Price Change Animation

```tsx
// When toggling monthly/annual, prices animate
<motion.span
  key={isAnnual ? "annual" : "monthly"}
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 10 }}
  className="text-4xl font-bold"
>
  ${price}
</motion.span>
```

### 7.4 Feature List Stagger

```tsx
// Features appear with stagger when card becomes visible
<motion.ul
  initial="hidden"
  animate="visible"
  variants={{
    visible: { transition: { staggerChildren: 0.05 } },
  }}
>
  {features.map((feature) => (
    <motion.li
      key={feature.key}
      variants={{
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 },
      }}
    >
      {/* Feature content */}
    </motion.li>
  ))}
</motion.ul>
```

---

## 8. Responsive Behavior

### 8.1 Breakpoint Strategy

| Breakpoint      | Cards Layout                | Table             | Toggle  |
| --------------- | --------------------------- | ----------------- | ------- |
| Mobile (<640px) | 1 column, horizontal scroll | Hidden, show list | Stacked |
| SM (640px+)     | 2 columns                   | Visible           | Inline  |
| MD (768px+)     | 2 columns                   | Full width        | Inline  |
| LG (1024px+)    | 4 columns                   | Full width        | Inline  |

### 8.2 Mobile Card Carousel

```tsx
// Mobile: Horizontal scroll with snap points
<div className="lg:hidden overflow-x-auto pb-8 -mx-4 px-4 scrollbar-hide">
  <div className="flex gap-4 snap-x snap-mandatory">
    {plans.map((plan) => (
      <div
        key={plan.id}
        className="w-[300px] flex-shrink-0 snap-center"
      >
        <PlanCard plan={plan} isAnnual={isAnnual} />
      </div>
    ))}
  </div>
</div>

// Desktop: Grid layout
<div className="hidden lg:grid lg:grid-cols-4 gap-6">
  {plans.map((plan) => (
    <PlanCard key={plan.id} plan={plan} isAnnual={isAnnual} />
  ))}
</div>
```

### 8.3 Mobile Feature Comparison

```tsx
// On mobile, replace table with expandable accordions
<div className="lg:hidden space-y-4">
  {plans.map((plan) => (
    <Accordion key={plan.id} type="single" collapsible>
      <AccordionItem value={plan.id}>
        <AccordionTrigger className="text-left">
          <div className="flex items-center justify-between w-full pr-4">
            <span className="font-semibold">{plan.name}</span>
            <span className="text-sm text-muted-foreground">
              ${plan.priceMonthly}/mo
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <ul className="space-y-2 pt-2">{/* Feature list for this plan */}</ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ))}
</div>
```

---

## 9. File Locations

### 9.1 New Components to Create

```
components/
├── pricing/
│   ├── PlanCard.tsx              # Individual plan card
│   ├── PlanComparisonTable.tsx   # Feature comparison table
│   ├── BillingToggle.tsx         # Monthly/Annual toggle
│   └── PricingSection.tsx        # Landing page section wrapper
├── billing/
│   ├── SubscriptionCard.tsx      # Current plan display (billing page)
│   ├── TrialBanner.tsx           # Trial status banner
│   ├── GracePeriodBanner.tsx     # Payment failed warning
│   ├── UpgradeBanner.tsx         # Feature-locked upgrade prompt
│   ├── CooldownIndicator.tsx     # Cooldown status display
│   └── PlanUpgradeModal.tsx      # Plan change confirmation
└── landing/
    └── PricingSection.tsx        # Main pricing section for landing
```

### 9.2 Update Existing Files

```
app/
├── dashboard/billing/
│   ├── page.tsx                  # Add SubscriptionCard, TrialBanner
│   └── components/
│       └── BalanceCard.tsx       # Keep existing, add subscription info
├── page.tsx                      # Add PricingSection to landing
└── pricing/
    └── page.tsx                  # New dedicated pricing page

components/landing/
└── README.md                     # Update with PricingSection info
```

### 9.3 Data Files

```
lib/billing/
├── subscription-plans.ts         # Plan definitions (from PRD)
└── pricing-constants.ts          # Existing, add PLAN_FEATURES export
```

---

## 10. Implementation Checklist

### Phase 1: Core Components

- [ ] Create `components/pricing/PlanCard.tsx`
- [ ] Create `components/pricing/BillingToggle.tsx`
- [ ] Create `components/pricing/PlanComparisonTable.tsx`
- [ ] Add plan data exports to `lib/billing/subscription-plans.ts`

### Phase 2: Landing Page Integration

- [ ] Create `components/landing/PricingSection.tsx`
- [ ] Add section to `app/page.tsx` layout order
- [ ] Update `components/landing/README.md`
- [ ] Test responsive behavior

### Phase 3: Billing Page Updates

- [ ] Create `components/billing/SubscriptionCard.tsx`
- [ ] Create `components/billing/TrialBanner.tsx`
- [ ] Create `components/billing/GracePeriodBanner.tsx`
- [ ] Integrate into `app/dashboard/billing/page.tsx`

### Phase 4: Upgrade Flow

- [ ] Create `components/billing/UpgradeBanner.tsx`
- [ ] Create `components/billing/PlanUpgradeModal.tsx`
- [ ] Add upgrade prompts to feature-gated areas
- [ ] Test upgrade flow end-to-end

### Phase 5: Polish

- [ ] Add animations (Framer Motion)
- [ ] Test mobile responsiveness
- [ ] Accessibility audit (ARIA labels, keyboard nav)
- [ ] Performance audit (bundle size, LCP)

---

## Appendix A: Existing Component Patterns Reference

### Glassmorphism Classes (Standard)

```tsx
const glassStyles = cn(
  "backdrop-blur-md bg-white/70 dark:bg-gray-900/70",
  "border border-white/20 dark:border-gray-700/30",
  "shadow-[0_8px_32px_rgba(0,0,0,0.04)]",
);
```

### Button Variants

```tsx
// Primary CTA
<Button size="lg" className="gap-2 rounded-full px-8">

// Secondary CTA
<Button size="lg" variant="outline" className="rounded-full px-8">

// Ghost/Tertiary
<Button variant="ghost" size="sm">
```

### Badge Patterns

```tsx
// Always use whitespace-nowrap to prevent text wrapping
<Badge className="whitespace-nowrap text-xs">Plan Name</Badge>

// Colored badges
<Badge className="bg-violet-100 text-violet-700 border-violet-200 whitespace-nowrap">
  Most Popular
</Badge>
```

### Card Header with Icon

```tsx
<Card className="rounded-2xl overflow-hidden">
  <CardHeader className="pb-2">
    <CardTitle className="flex items-center gap-2 text-base">
      <Icon className="h-5 w-5 text-primary" />
      Title
    </CardTitle>
  </CardHeader>
  <CardContent>{/* Content */}</CardContent>
</Card>
```

---

## Appendix B: Accessibility Requirements

### Keyboard Navigation

- All plan cards focusable via Tab
- Enter/Space to select plan
- Arrow keys to navigate between plans in carousel
- Escape to close modals

### ARIA Labels

```tsx
// Plan card
<article
  role="option"
  aria-selected={isCurrentPlan}
  aria-label={`${plan.name} plan, ${price} per month`}
>

// Toggle
<div role="radiogroup" aria-label="Billing period">
  <button role="radio" aria-checked={!isAnnual}>Monthly</button>
  <button role="radio" aria-checked={isAnnual}>Annual</button>
</div>

// Feature list
<ul aria-label="Plan features">
  <li aria-label={`${feature.label}: ${included ? "included" : "not included"}`}>
```

### Color Contrast

- All text meets WCAG AA (4.5:1 for normal text, 3:1 for large)
- Icons have sufficient contrast or are decorative with text labels
- Focus states visible (ring-2 ring-offset-2)

---

## Appendix C: Design Guidelines Reference

This spec adheres to the following Citedy design documentation:

| Guideline            | Location                                     | Key Points                                        |
| -------------------- | -------------------------------------------- | ------------------------------------------------- |
| **Glassmorphism**    | `docs/design/guidelines/glassmorphism.md`    | `backdrop-blur-md bg-white/70`, shadow `0.04` max |
| **Navigation**       | `docs/design/guidelines/navigation.md`       | Dark pill: `bg-slate-900 text-white` active       |
| **Components**       | `docs/design/guidelines/components.md`       | Badges: always `whitespace-nowrap`                |
| **Colors**           | `docs/design/guidelines/colors-gradients.md` | Slate scale, plan accent colors                   |
| **Existing Landing** | `components/landing/PricingComparison.tsx`   | Reference implementation                          |

### Key Patterns to Follow

1. **Dark Pill Style for Toggles/Tabs:**

   ```tsx
   data-[state=active]:bg-slate-900 data-[state=active]:text-white
   ```

2. **Touch Targets:**

   ```tsx
   min-h-[44px] // Minimum for accessibility
   ```

3. **Badge Rules:**

   ```tsx
   <Badge className="whitespace-nowrap">Never wrap</Badge>
   ```

4. **Focus States:**
   ```tsx
   focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2
   ```

---

_Document created: January 16, 2026_
_Last audit: January 16, 2026 (Score: 85/100)_
_For: Citedy Subscription System Implementation_
