# Public Sidebar Refactor Plan

## Current State

**public-blog-sidebar.tsx** - simple, minimal:

- Only "Articles" link
- "Sign In" button at bottom
- Used on: `/terms`, `/privacy-policy`, `/blog`, `/blog/[slug]`

**blog-sidebar.tsx** - full featured (logged-in users):

- War Room, Writer Agent, Autopilot Agents, AI Insights, Settings, Billing
- Contact at bottom
- Credits badge + gift code redeem
- NavUser component (avatar, logout)
- NotificationBell
- Onboarding lock logic

## Requirements

### Logged-in users (auth = true)

Show **FULL BlogSidebar** with all features:

- All nav items active
- Credits badge + gift code popover
- NavUser (avatar, email, logout)
- NotificationBell

### Not logged-in users (auth = false)

Show **SAME BlogSidebar layout** BUT:

| Item             | State                                                  |
| ---------------- | ------------------------------------------------------ |
| War Room         | 🔒 Locked                                              |
| Writer Agent     | 🔒 Locked                                              |
| Autopilot Agents | 🔒 Locked                                              |
| AI Insights      | 🔒 Locked                                              |
| Settings         | 🔒 Locked                                              |
| Billing          | 🔒 Locked                                              |
| **Contact**      | ✅ Open                                                |
| **Articles**     | ✅ Open → `/blog` (or tenant blog if tenantId context) |

**Bottom section (not logged in):**

- NO credits badge
- NO gift code popover
- "Sign In" button only (like current public sidebar)

## Implementation

### Option A: Modify BlogSidebar (Recommended)

Add `isPublic?: boolean` prop to BlogSidebar:

```tsx
interface BlogSidebarProps {
  autopilotStatus?: ...;
  onboardingStatus?: ...;
  isOnboardingMode?: boolean;
  isPublic?: boolean; // NEW
}
```

Logic:

1. If `isPublic && !user` → show locks on all items except Contact/Articles
2. If `isPublic && !user` → hide credits, gift code, NavUser
3. If `isPublic && !user` → show "Sign In" button at bottom

### Option B: Unify into single component

Delete `public-blog-sidebar.tsx`, use only `BlogSidebar` everywhere.

- In `/terms`, `/privacy-policy`, `/blog` pages: `<BlogSidebar isPublic />`
- Component internally checks `useAuth()` to determine logged-in state

## Files to Modify

1. **`components/blog-sidebar.tsx`**
   - Add `isPublic` prop
   - Add "Articles" to navItems for public mode
   - Add lock logic for public mode
   - Conditional bottom section (credits vs Sign In)

2. **`components/public-blog-sidebar.tsx`**
   - DELETE (or keep as backup)

3. **Pages using PublicBlogSidebar:**
   - `app/terms/page.tsx`
   - `app/privacy-policy/page.tsx`
   - `app/blog/page.tsx`
   - `app/blog/[slug]/page.tsx`
   - Replace `<PublicBlogSidebar />` → `<BlogSidebar isPublic />`

## Visual Comparison

### Before (Public Sidebar)

```
┌─────────────────┐
│ SaaS Blog       │
├─────────────────┤
│ 📄 Articles     │
│                 │
│                 │
├─────────────────┤
│ 🔓 Sign In      │
└─────────────────┘
```

### After (Unified - Not Logged In)

```
┌─────────────────────┐
│ Citedy          [<] │
├─────────────────────┤
│ 🎯 War Room     🔒  │
│ 📄 Writer Agent 🔒  │
│ 🤖 Autopilot    🔒  │
│ ✨ AI Insights  🔒  │
│ ⚙️ Settings     🔒  │
│ 💳 Billing      🔒  │
│ ───────────────     │
│ ✉️ Contact          │
│ 📄 Articles         │
├─────────────────────┤
│ [Sign In]           │
└─────────────────────┘
```

### After (Unified - Logged In)

```
┌─────────────────────┐
│ Citedy  🔔  [<] │
├─────────────────────┤
│ 🎯 War Room         │
│ 📄 Writer Agent     │
│ 🤖 Autopilot [Run]  │
│ ✨ AI Insights [New]│
│ ⚙️ Settings         │
│ 💳 Billing          │
│ ───────────────     │
│ ✉️ Contact          │
│ 📄 Articles         │
├─────────────────────┤
│ [💳 123] [🥕]       │
│ [Avatar] User       │
└─────────────────────┘
```

## Status: COMPLETED

### Changes Made:

1. **BlogSidebar** - added `isPublic` prop + lock logic for non-authenticated users
2. **Updated pages**: `/terms`, `/privacy-policy`, `/privacy`, `/blog`, `/blog/[slug]`
3. **Deleted**: `public-blog-sidebar.tsx` (backed up to `.backup`)
