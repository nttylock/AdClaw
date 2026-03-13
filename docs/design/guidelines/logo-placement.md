# Logo Placement Guidelines

> Citedy Brand Logo Usage Standards
> Last Updated: December 2025

---

## Logo Files Overview

| File | Dimensions | Size | Usage |
|------|------------|------|-------|
| `cd_flat_logo.png` | 1413x488 | Original | Source file |
| `cd_flat_logo_280.webp` | 280x96 | 10 KB | Headers, Sidebars (2x retina) |
| `cd_flat_logo_140.webp` | 140x49 | ~5 KB | Legacy (deprecated) |
| `quote-logo-330x330.webp` | 330x330 | 8 KB | Footer icon |
| `logo-email.png` | 300x103 | 22 KB | Email templates (2x retina) |
| `logo.png` | 1500x1500 | 173 KB | Legacy square (deprecated) |

---

## 1. Header Logo

### Specifications
- **File:** `/public/cd_flat_logo_280.webp`
- **Display size:** `width={140} height={48}` (CSS: `h-8` to `h-10`)
- **Source size:** 280x96 (2x for retina displays)

### Implementation
```tsx
import Image from "next/image";

<Link href="/" className="...">
  <Image
    src="/cd_flat_logo_280.webp"
    alt="Citedy"
    width={140}
    height={48}
    className="h-8 w-auto lg:h-10"
    priority
  />
</Link>
```

### Usage Locations
- `app/page.tsx` - Landing page header
- `app/login/page.tsx` - Login page
- `app/register/page.tsx` - Register page
- `app/reset-password/page.tsx` - Reset password page

---

## 2. Sidebar Logo

### Specifications
- **File:** `/public/cd_flat_logo_280.webp`
- **Display size:** `width={140} height={49}`
- **CSS class:** `h-8 w-auto object-contain`

### Implementation
```tsx
<Image
  src="/cd_flat_logo_280.webp"
  alt={siteName}
  width={140}
  height={49}
  className="h-8 w-auto object-contain"
  priority
/>
```

### Usage Locations
- `components/blog-sidebar.tsx` - Dashboard sidebar header

---

## 3. Footer

### Structure (Recommended Central Component)

```
┌─────────────────────────────────────────────────────────────┐
│  [Icon] Citedy  [Badge]     Blog | Contact | Privacy | Terms     © 2025  │
└─────────────────────────────────────────────────────────────┘
```

### Specifications
- **Logo file:** `/public/quote-logo-330x330.webp`
- **Display size:** `width={24} height={24}` (CSS: `w-6 h-6`)
- **Layout:** Flexbox, responsive (column on mobile, row on desktop)

### Current Implementation (app/page.tsx)
```tsx
<footer className="py-8 border-t">
  <div className="container mx-auto px-4">
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <Image
          src="/quote-logo-330x330.webp"
          alt="Citedy"
          width={24}
          height={24}
          className="w-6 h-6"
        />
        <span className="font-semibold">Citedy</span>
        <Badge variant="secondary">Be the AI&apos;s Answer</Badge>
      </div>

      {/* Navigation */}
      <nav className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
        <Link href="/blog">Blog</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </nav>

      {/* Copyright */}
      <p className="text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Citedy. All rights reserved.
      </p>
    </div>
  </div>
</footer>
```

### Proposed: Central Footer Component

**File:** `components/site-footer.tsx`

```tsx
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface SiteFooterProps {
  showBadge?: boolean;
  variant?: "default" | "minimal";
}

export function SiteFooter({ showBadge = true, variant = "default" }: SiteFooterProps) {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
  ];

  return (
    <footer className="py-8 border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <Image
              src="/quote-logo-330x330.webp"
              alt="Citedy"
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <span className="font-semibold">Citedy</span>
            {showBadge && (
              <Badge variant="secondary">Be the AI&apos;s Answer</Badge>
            )}
          </div>

          {/* Navigation */}
          {variant === "default" && (
            <nav className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Citedy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
```

**Usage:**
```tsx
import { SiteFooter } from "@/components/site-footer";

// Default footer with all elements
<SiteFooter />

// Minimal footer without badge
<SiteFooter showBadge={false} variant="minimal" />
```

---

## 4. Email Templates

### Specifications
- **File:** `/public/logo-email.png`
- **URL:** `https://www.citedy.com/logo-email.png`
- **Source size:** 300x103 (2x for retina)
- **Display size:** `width="150" height="52"`
- **Format:** PNG (better email client compatibility)

### Implementation
```html
<img
  src="https://www.citedy.com/logo-email.png"
  alt="Citedy"
  width="150"
  height="52"
  style="margin-bottom: 24px"
/>
```

### Template Locations
- `lib/templates/email/newsletter/` - 2 templates
- `lib/templates/email/notifications/` - 3 templates
- `lib/templates/email/onboarding/` - 7 templates
- `lib/templates/email/contact/` - 1 template (uses `{{logoUrl}}` variable)

---

## 5. Retina Display Guidelines

| Context | Source Size | Display Size | Ratio |
|---------|-------------|--------------|-------|
| Header/Sidebar | 280x96 | 140x48 | 2x |
| Footer icon | 330x330 | 24x24 | ~14x |
| Email | 300x103 | 150x52 | 2x |

### Best Practices
1. Always use 2x source images for retina displays
2. Set explicit `width` and `height` attributes to prevent layout shift
3. Use `webp` format for web, `png` for email compatibility
4. Keep file sizes minimal (< 30KB for web logos)

---

## 6. Logo Colors

| Element | Color | Hex |
|---------|-------|-----|
| Primary text "Cited" | Black | `#000000` |
| Comma accent | Orange/Yellow | Brand gradient |
| Background | Transparent | - |

---

## 7. Do's and Don'ts

### Do's
- Use the correct file for each context
- Maintain aspect ratio (never stretch)
- Use `priority` prop for above-the-fold logos
- Include meaningful `alt` text

### Don'ts
- Don't use `logo.png` (legacy, 173KB)
- Don't resize logos without maintaining aspect ratio
- Don't use web logos in emails (use `logo-email.png`)
- Don't add shadows or effects to the logo

---

## Quick Reference

```
Header:     /cd_flat_logo_280.webp  → 140x48 display
Sidebar:    /cd_flat_logo_280.webp  → 140x49 display
Footer:     /quote-logo-330x330.webp → 24x24 display
Email:      /logo-email.png         → 150x52 display
```
