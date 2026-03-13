# Pattern: Team Invite Dialog (Gold Standard)

## Overview

This document describes the **gold-standard** popup structure used by **Invite team member**.
It is the reference pattern for refactoring other “colored / glassmorphism” popups.

Key idea: for “glassmorphism / custom shell” modals, use `DialogContentBare` (from `components/ui/dialog.tsx`)
as a positioning container, and render the real rounded/clipped “modal shell” inside.

### Problem this pattern solves

The base `DialogContent` wrapper (`components/ui/dialog.tsx`) ships with:

- a default background (`bg-background`)
- default padding (`p-6`)
- responsive rounding (`sm:rounded-lg`)

When a popup uses **large rounding** (e.g. `rounded-3xl`) and **semi-transparent gradients**,
the default `bg-background` can appear as a **square “white plate”** under rounded corners,
and the default `sm:rounded-lg` can compete with custom rounding.

This pattern avoids that by:

- using `DialogContentBare` (no panel styles, no clipping overflow)
- drawing **all visible UI** in an inner wrapper with:
  - `rounded-3xl`
  - `overflow-hidden` (critical for clipping overlays)
  - gradient + blur backgrounds
  - internal `p-*` padding

## Required structure (layering)

### High-level layout

1. `Dialog` / `DialogTrigger`
2. `DialogContentBare` (positioning container)
3. **Modal shell** (the real rounded box)
4. **Gradient overlay** (`absolute inset-0 ... pointer-events-none`)
5. **Content** (`relative` to stay above overlay)

### Critical classes reference

| Element                   | Required classes                                       | Why it matters                                                      |
| ------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------- |
| DialogContentBare         | (usually none)                                         | Avoid default “white plate”, padding, border, and overflow clipping |
| Modal shell (visible box) | `relative overflow-hidden rounded-3xl ... p-6`         | Provides the true rounded bounds + clips inner overlay              |
| Gradient overlay          | `absolute inset-0 rounded-3xl ... pointer-events-none` | Full-surface gradient accent; never blocks clicks                   |
| Content wrapper           | `relative`                                             | Ensures content is above overlay (z-stack correctness)              |

## Full reference snippet (copy/paste)

This snippet mirrors the production implementation in `components/team/InviteModal.tsx`.

```tsx
<Dialog open={isOpen} onOpenChange={handleOpenChange}>
  <DialogTrigger asChild>
    <Button
      disabled={isAtLimit && !isUnlimited}
      className={cn(
        "gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200",
        isAtLimit && !isUnlimited
          ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
          : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-sm hover:shadow-md",
      )}
    >
      <UserPlus className="w-4 h-4" />
      Invite
    </Button>
  </DialogTrigger>

  {/* 1) Bare positioning container (do NOT style the visible popup here) */}
  <DialogContentBare className="sm:max-w-md">
    {/* 2) Modal shell = real rounded box */}
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/95 via-slate-50/90 to-gray-50/95 backdrop-blur-md border border-white/50 shadow-[0_8px_40px_rgba(0,0,0,0.08)] p-6">
      {/* 3) Full overlay gradient accent */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />

      {/* 4) Content must be relative (above overlay) */}
      <DialogHeader className="relative">
        <DialogTitle className="flex items-center gap-2 text-slate-800">
          <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100/50">
            <UserPlus className="w-5 h-5 text-indigo-600" />
          </div>
          Invite team member
        </DialogTitle>

        <DialogDescription className="text-slate-600">
          Send an invitation by email. The recipient will get access to all
          shared resources.
        </DialogDescription>

        <p className="flex items-start gap-1.5 text-xs text-slate-500 mt-2 bg-slate-50/50 p-2 rounded-lg border border-slate-100/50">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-500" />
          <span>
            If the person already has their own Citedy workspace, they'll need
            to use a different email to join your team.
          </span>
        </p>
      </DialogHeader>

      {isAtLimit && !isUnlimited ? (
        <div className="relative text-center py-6">
          {/* ... upgrade UI ... */}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="relative space-y-6 mt-4">
          {/* ... inputs, select, actions ... */}
        </form>
      )}
    </div>
  </DialogContentBare>
</Dialog>
```

## Do / Don’t for refactoring other popups

- **Do**: use `DialogContentBare` when the visible popup is a custom “shell” (glassmorphism, Card, etc.).
- **Do**: use `overflow-hidden` on the shell to clip all gradients/overlays to the rounded border.
- **Do**: ensure the content area has `relative` so it renders above the overlay.
- **Don’t**: fight default `DialogContent` styles via `!important` overrides (e.g. `!bg-transparent !p-0`).
- **Don’t**: rely on breakpoint rounding overrides competing with the base `sm:rounded-lg`.

## References

- Implementation: `components/team/InviteModal.tsx`
- Base primitive: `components/ui/dialog.tsx`
- Popup standard manual: `docs/design/popup/manual.md`
