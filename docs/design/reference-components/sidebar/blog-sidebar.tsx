"use client";

import {
  FileText,
  Bot,
  Settings,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Search,
  Link2,
  Mail,
  Rocket,
  Lock,
  Target,
  Carrot,
  LogIn,
  X,
  Gift,
  Crown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NotificationBell } from "@/components/notifications";
import { NavUser } from "@/components/nav-user";
import { ReferralPopup } from "@/components/referral/ReferralPopup";
import Image from "next/image";
import Link from "next/link";

// Skeleton for NavUser loading state (used during SSR)
function NavUserSkeleton({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div
      className={
        isCollapsed
          ? "h-10 w-10 p-0 flex items-center justify-center"
          : "w-full p-2 flex items-center"
      }
    >
      <div className="h-8 w-8 rounded-lg bg-slate-200 animate-pulse shrink-0" />
      {!isCollapsed && (
        <div className="ml-2 flex-1 space-y-1">
          <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
          <div className="h-2 w-24 bg-slate-200 rounded animate-pulse" />
        </div>
      )}
    </div>
  );
}
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import { useAuth } from "@/lib/auth";
import { useTenant } from "@/lib/tenant-context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSidebar } from "@/lib/sidebar-context";
import { useBillingContext } from "@/lib/billing-context";
import { OnboardingProgressPanel } from "@/components/sidebar/onboarding-progress-panel";

interface BlogSidebarProps {
  autopilotStatus?: "running" | "paused" | "stopped" | null;
  onboardingStatus?: "pending" | "done" | null;
  isOnboardingMode?: boolean;
  /** When true, shows public-facing sidebar with locks for non-authenticated users */
  isPublic?: boolean;
}

// Items that are NOT locked during onboarding
const UNLOCKED_IN_ONBOARDING = [
  "/onboarding",
  "/dashboard/billing",
  "/billing",
  "/contact",
];

// Items that are NOT locked for public (non-authenticated) visitors
const UNLOCKED_IN_PUBLIC = ["/contact", "/blog"];

type BadgeVariant = BadgeProps["variant"];

interface SidebarItem {
  icon?: LucideIcon;
  emoji?: string;
  label: string;
  href: string;
  badge?: string;
  badgeVariant?: BadgeVariant;
  disabled?: boolean;
}

export function BlogSidebar({
  autopilotStatus,
  onboardingStatus,
  isOnboardingMode = false,
  isPublic = false,
}: BlogSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { tenantId, blogHandle, tenantStatus, balanceCredits } = useTenant();
  const { toast } = useToast();

  const { isCollapsed, toggleSidebar } = useSidebar();
  const { isPaidPlan } = useBillingContext();
  const [navUserMounted, setNavUserMounted] = useState(false);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const [creditsLoaded, setCreditsLoaded] = useState(false);
  const [giftCode, setGiftCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [giftPopoverOpen, setGiftPopoverOpen] = useState(false);
  const isMountedRef = useRef(true);
  const isTenantCreating = tenantStatus === "creating" && !tenantId;
  const creditsLoadedRef = useRef(creditsLoaded);
  const tenantStatusRef = useRef(tenantStatus);

  useEffect(() => {
    creditsLoadedRef.current = creditsLoaded;
  }, [creditsLoaded]);

  useEffect(() => {
    tenantStatusRef.current = tenantStatus;
  }, [tenantStatus]);

  // Prevent hydration mismatch for NavUser (Radix UI generates different IDs on server/client)
  useEffect(() => {
    // Guard against dev-only effect re-runs (StrictMode/Fast Refresh) where cleanup can run
    // without a full remount, leaving this ref stuck in the "unmounted" state.
    isMountedRef.current = true;
    setNavUserMounted(true);
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Use the tenant context credits as a fast, non-laggy first paint.
  // A background refresh still runs via `/api/dashboard/stats`.
  useEffect(() => {
    if (!isMountedRef.current) return;
    if (typeof balanceCredits !== "number") return;
    setCreditsRemaining(balanceCredits);
    setCreditsLoaded(true);
  }, [balanceCredits]);

  const loadCredits = useCallback(async () => {
    if (!tenantId) {
      return;
    }
    // Note: Don't set creditsLoaded=false on refresh to avoid UI flicker
    // Only the initial load shows skeleton (creditsLoaded starts as false)
    try {
      const response = await fetch(
        `/api/dashboard/stats?tenantId=${tenantId}`,
        {
          // Ensure we always see the latest billing balance after mutations (e.g. gift code redeem)
          cache: "no-store",
        },
      );
      if (response.ok) {
        const data = await response.json();
        if (isMountedRef.current) {
          setCreditsRemaining(data.stats?.creditsRemaining ?? 0);
        }
      }
    } catch {
      if (isMountedRef.current) {
        setCreditsRemaining(null);
      }
    } finally {
      if (isMountedRef.current) {
        setCreditsLoaded(true);
      }
    }
  }, [tenantId]);

  useEffect(() => {
    loadCredits();
  }, [loadCredits]);

  // Keep credits in sync after any paid action elsewhere in the app.
  // - Custom event: dispatched by credit-spending UIs (QuickCheck, billing actions, etc.)
  // - Focus/visibility: user switches tabs; refresh to avoid stale badge.
  useEffect(() => {
    if (!tenantId) return;

    let rafId: number | null = null;
    const triggerRefresh = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        loadCredits();
      });
    };

    const onCreditsChanged = (event: Event) => {
      // If event carries tenantId, ignore other workspaces.
      const detail = (event as CustomEvent<{ tenantId?: string }>).detail;
      if (detail?.tenantId && detail.tenantId !== tenantId) return;
      triggerRefresh();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        triggerRefresh();
      }
    };

    window.addEventListener(
      "gs:credits-changed",
      onCreditsChanged as EventListener,
    );
    window.addEventListener("focus", triggerRefresh);
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Safety net: refresh periodically (covers flows that don't dispatch events).
    const intervalId = window.setInterval(() => {
      triggerRefresh();
    }, 60_000);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener(
        "gs:credits-changed",
        onCreditsChanged as EventListener,
      );
      window.removeEventListener("focus", triggerRefresh);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, [loadCredits, tenantId]);

  const handleRedeemGiftCode = async () => {
    if (!tenantId) {
      toast({
        title: "No workspace found",
        description: "Create a workspace before redeeming a gift code.",
        variant: "destructive",
      });
      return;
    }

    const trimmed = giftCode.trim();
    if (!trimmed) {
      toast({
        title: "Gift code required",
        description: "Enter a gift code to redeem.",
        variant: "destructive",
      });
      return;
    }

    setIsRedeeming(true);
    try {
      const response = await fetch("/api/billing/gift-codes/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed, tenantId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to redeem gift code");
      }

      toast({
        title: "Gift code redeemed",
        description: `Added ${data.creditsAdded} credits to your balance.`,
      });

      // Update UI immediately (billing already updated server-side)
      if (isMountedRef.current && typeof data.balanceAfter === "number") {
        setCreditsRemaining(data.balanceAfter);
        setCreditsLoaded(true);
      }

      setGiftCode("");
      setGiftPopoverOpen(false);
      await loadCredits();
    } catch (error) {
      toast({
        title: "Redeem failed",
        description:
          error instanceof Error ? error.message : "Could not redeem gift code",
        variant: "destructive",
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") return true;
    if (path !== "/dashboard" && pathname.startsWith(path)) return true;
    return false;
  };

  const handleLogoClick = () => {
    router.push("/dashboard");
  };

  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Citedy";

  const navItems: SidebarItem[] = [
    {
      icon: Target,
      label: "Dashboard",
      href: "/dashboard/new",
    },
    {
      icon: Rocket,
      label: "Getting Started",
      href: "/onboarding",
      // Badge hidden — progress panel shows onboarding state
      badge: undefined,
      badgeVariant: undefined,
    },
    {
      icon: FileText,
      label: "Writer Agent",
      href: "/dashboard/blog",
    },
    {
      emoji: "🦞",
      label: "Connect Agent",
      href: "/dashboard/settings?section=team&agent=connect",
      badge: "New",
      badgeVariant: "default" as const,
    },
    {
      icon: Bot,
      label: "Autopilot Agents",
      href: "/dashboard/autopilot",
      badge: autopilotStatus === "running" ? "Running" : undefined,
      badgeVariant: "default" as const,
    },
    {
      icon: Sparkles,
      label: "AI Insights",
      href: "/dashboard/ai-insights",
    },
    {
      icon: Search,
      label: "Reddit Intent",
      href: "/dashboard/ai-insights/reddit-intent",
    },
    {
      icon: X,
      label: "X Intent Scout",
      href: "/dashboard/ai-insights/x-intent",
    },
    {
      icon: Gift,
      label: "Lead Magnets",
      href: "/dashboard/lead-magnets",
      badge: "New",
      badgeVariant: "default" as const,
    },
    {
      icon: Link2,
      label: "Wiki Dead Links",
      href: "/dashboard/ai-insights/wiki-dead-links",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/dashboard/settings",
    },
    {
      icon: CreditCard,
      label: "Billing",
      href: "/dashboard/billing",
    },
  ];

  const bottomItems: SidebarItem[] = [
    {
      icon: Mail,
      label: "Contact",
      href: "/contact",
      disabled: false,
    },
    // Only show Articles link when user has a blog (logged in with tenant)
    ...(blogHandle
      ? [
          {
            icon: FileText,
            label: "Articles",
            href: `/${blogHandle}/blog`,
            disabled: false,
          },
        ]
      : []),
  ];

  return (
    <div
      className={cn(
        "relative flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden",
        "bg-gradient-to-b from-white/95 via-white/90 to-slate-50/95 backdrop-blur-xl border-r border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)]",
        isCollapsed ? "w-[60px]" : "w-[220px]",
      )}
    >
      {/* Gradient accent overlay - subtle decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 via-transparent to-purple-50/20 pointer-events-none" />

      {/* Header */}
      {isCollapsed ? (
        <div className="relative p-3 border-b border-slate-200/50 flex flex-col items-center gap-2">
          <button
            type="button"
            className="flex items-center justify-center cursor-pointer"
            onClick={handleLogoClick}
            title="Go to Dashboard"
          >
            <Image
              src="/new-logo/quote_red_logo_200x200.webp"
              alt="Citedy"
              width={72}
              height={72}
              className="h-5 w-5 object-contain"
              priority
            />
          </button>
          <button
            type="button"
            onClick={toggleSidebar}
            className="h-7 w-7 rounded-lg bg-slate-100/80 hover:bg-slate-200/80 flex items-center justify-center transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4 text-slate-500" />
          </button>
        </div>
      ) : (
        <div className="relative p-4 border-b border-slate-200/50 flex items-center justify-between">
          <div className="flex items-start gap-3">
            <button
              type="button"
              className="flex items-center gap-2 cursor-pointer"
              onClick={handleLogoClick}
              title="Go to Dashboard"
            >
              <Image
                src="/cd_flat_logo_280.webp"
                alt={siteName}
                width={140}
                height={49}
                className="h-6 w-auto object-contain"
                priority
              />
            </button>
          </div>
          <div className="flex items-center gap-1">
            {/* NotificationBell only in header when expanded */}
            <NotificationBell collapsed={isCollapsed} />
            <button
              type="button"
              onClick={toggleSidebar}
              className="h-7 w-7 rounded-lg bg-slate-100/80 hover:bg-slate-200/80 flex items-center justify-center transition-colors"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        </div>
      )}

      {/* NotificationBell above navigation when collapsed */}
      {isCollapsed && (
        <div className="relative px-3 pt-3 flex flex-col items-center gap-2">
          <NotificationBell collapsed={isCollapsed} />
        </div>
      )}

      {/* Main Navigation */}
      <div className="relative p-3 space-y-1 flex-1">
        <TooltipProvider>
          {navItems.map((item) => {
            // Lock items during onboarding OR for public visitors who aren't logged in
            // Use navUserMounted to prevent hydration mismatch - assume locked until client mount
            const isLockedOnboarding =
              isOnboardingMode && !UNLOCKED_IN_ONBOARDING.includes(item.href);
            const isLockedPublic =
              isPublic &&
              (!navUserMounted || !user) &&
              !UNLOCKED_IN_PUBLIC.includes(item.href);
            const isLocked = isLockedOnboarding || isLockedPublic;

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  {isLocked ? (
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                        "text-slate-400 cursor-not-allowed opacity-60",
                        isCollapsed && "justify-center px-2",
                      )}
                    >
                      {item.emoji ? (
                        <span className="text-base">{item.emoji}</span>
                      ) : item.icon ? (
                        <item.icon size={18} />
                      ) : null}
                      {!isCollapsed && (
                        <span className="text-sm font-medium flex-1">
                          {item.label}
                        </span>
                      )}
                      {!isCollapsed && (
                        <Lock size={14} className="text-slate-400" />
                      )}
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200",
                        isActive(item.href)
                          ? "bg-gradient-to-r from-blue-500/[0.08] to-purple-500/[0.08] text-slate-700"
                          : "text-slate-500 hover:bg-slate-100/40 hover:text-slate-700",
                        isCollapsed && "justify-center px-2",
                      )}
                      onClick={() => router.push(item.href)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          router.push(item.href);
                        }
                      }}
                      role="link"
                      tabIndex={0}
                    >
                      {item.emoji ? (
                        <span className="text-base">{item.emoji}</span>
                      ) : item.icon ? (
                        <item.icon size={18} />
                      ) : null}
                      {!isCollapsed && (
                        <span className="text-sm font-medium flex-1">
                          {item.label}
                        </span>
                      )}
                      {!isCollapsed && item.badge && (
                        <Badge
                          variant={item.badgeVariant}
                          className={cn(
                            "text-[10px] px-1.5 py-0",
                            item.badge === "Running" &&
                              "bg-green-100 text-green-700 border-green-200",
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  )}
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    <p>{item.label}</p>
                    {isLockedPublic && (
                      <span className="text-xs text-muted-foreground ml-1">
                        (Sign in required)
                      </span>
                    )}
                    {isLockedOnboarding && !isLockedPublic && (
                      <span className="text-xs text-muted-foreground ml-1">
                        (Complete onboarding)
                      </span>
                    )}
                    {!isLocked && item.badge && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({item.badge})
                      </span>
                    )}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </TooltipProvider>

        {/* Divider */}
        <div className="my-3 h-px bg-gradient-to-r from-transparent via-slate-200/60 to-transparent" />

        {/* Bottom items */}
        <TooltipProvider>
          {bottomItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                {item.disabled ? (
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                      "text-slate-400 cursor-not-allowed",
                      isCollapsed && "justify-center px-2",
                    )}
                  >
                    {item.emoji ? (
                      <span className="text-base">{item.emoji}</span>
                    ) : item.icon ? (
                      <item.icon size={18} />
                    ) : null}
                    {!isCollapsed && (
                      <span className="text-sm font-medium flex-1">
                        {item.label}
                      </span>
                    )}
                    {!isCollapsed && item.badge && (
                      <Badge
                        variant={item.badgeVariant}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200",
                      isActive(item.href)
                        ? "bg-gradient-to-r from-blue-500/[0.08] to-purple-500/[0.08] text-slate-700"
                        : "text-slate-500 hover:bg-slate-100/40 hover:text-slate-700",
                      isCollapsed && "justify-center px-2",
                    )}
                    onClick={() => router.push(item.href)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(item.href);
                      }
                    }}
                    role="link"
                    tabIndex={0}
                  >
                    {item.emoji ? (
                      <span className="text-base">{item.emoji}</span>
                    ) : item.icon ? (
                      <item.icon size={18} />
                    ) : null}
                    {!isCollapsed && (
                      <span className="text-sm font-medium flex-1">
                        {item.label}
                      </span>
                    )}
                  </div>
                )}
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right">
                  <p>{item.label}</p>
                  {item.badge && (
                    <span className="text-xs text-muted-foreground ml-1">
                      ({item.badge})
                    </span>
                  )}
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>

      {/* User Section - SSR-safe with mounted check to prevent hydration mismatch */}
      <div
        className="relative p-3 border-t border-slate-200/50"
        suppressHydrationWarning
      >
        {/* Show Sign In button for public non-authenticated visitors */}
        {/* Use navUserMounted to prevent hydration mismatch */}
        {isPublic && (!navUserMounted || !user) ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/login">
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200",
                      "text-slate-500 hover:bg-slate-100/40 hover:text-slate-700",
                      isCollapsed && "justify-center px-2",
                    )}
                  >
                    <LogIn size={18} />
                    {!isCollapsed && (
                      <span className="text-sm font-medium">Sign In</span>
                    )}
                  </div>
                </Link>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right">
                  <p>Sign In</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ) : (
          <>
            {/* Upgrade Prompt - only for non-paid users */}
            {!isPaidPlan && !isCollapsed && (
              <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100/50">
                <p className="text-xs text-slate-600 mb-2">
                  Upgrade to unlock extra features and credits discounts
                </p>
                <Link href="/dashboard/billing?tab=plans">
                  <Button size="sm" className="w-full gap-1.5 h-8 text-xs">
                    <Crown className="h-3.5 w-3.5" />
                    Upgrade
                  </Button>
                </Link>
              </div>
            )}

            {/* Collapsed version - just icon button */}
            {!isPaidPlan && isCollapsed && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/dashboard/billing?tab=plans">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-9 h-9 p-0 text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                      >
                        <Crown className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Upgrade Plan</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {onboardingStatus === "pending" && tenantId && (
              <OnboardingProgressPanel
                tenantId={tenantId}
                isCollapsed={isCollapsed}
              />
            )}

            <div
              className={cn(
                "mb-3 flex gap-2",
                isCollapsed ? "flex-col items-center" : "items-center",
              )}
            >
              <Link href="/dashboard/billing">
                <Badge
                  variant="outline"
                  className={cn(
                    "flex items-center gap-2 px-2.5 py-1 text-xs font-medium",
                    isCollapsed &&
                      "w-[52px] justify-center gap-1 px-2 text-[10px]",
                  )}
                  title={
                    creditsLoaded
                      ? `${(creditsRemaining ?? 0).toLocaleString()} credits`
                      : "Credits"
                  }
                >
                  <CreditCard
                    className={cn("h-3.5 w-3.5", isCollapsed && "h-3 w-3")}
                  />
                  <span
                    className={cn(
                      "tabular-nums whitespace-nowrap",
                      isCollapsed && "max-w-[34px] truncate",
                    )}
                  >
                    {creditsLoaded ? (
                      (creditsRemaining ?? 0).toLocaleString()
                    ) : (
                      <Loader
                        variant="dots"
                        size="sm"
                        className={cn("opacity-60", isCollapsed && "scale-90")}
                      />
                    )}
                  </span>
                </Badge>
              </Link>
              <Popover open={giftPopoverOpen} onOpenChange={setGiftPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-7 w-7 rounded-full text-slate-500 hover:text-slate-700",
                      isCollapsed && "h-6 w-6",
                    )}
                    aria-label="Redeem gift code"
                  >
                    <Carrot className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-64 space-y-3 p-3"
                  side="right"
                  align="start"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Have a gift code?</p>
                    <p className="text-xs text-muted-foreground">
                      Enter it to top up your credits.
                    </p>
                  </div>
                  <Input
                    value={giftCode}
                    onChange={(event) => setGiftCode(event.target.value)}
                    placeholder="Enter 12-character code"
                    autoComplete="off"
                  />
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={handleRedeemGiftCode}
                    disabled={isRedeeming}
                  >
                    {isRedeeming ? "Redeeming..." : "Redeem"}
                  </Button>
                </PopoverContent>
              </Popover>
              <ReferralPopup />
            </div>
            {isTenantCreating && !isCollapsed && (
              <p className="mb-2 text-[11px] text-muted-foreground">
                Account creation in progress…
              </p>
            )}
            {navUserMounted ? (
              user ? (
                <NavUser
                  user={{
                    name:
                      user.user_metadata?.full_name ||
                      user.email?.split("@")[0] ||
                      "",
                    email: user.email || "",
                    avatar: user.user_metadata?.avatar_url || "",
                  }}
                  isCollapsed={isCollapsed}
                  onboardingStatus={onboardingStatus}
                />
              ) : (
                <NavUserSkeleton isCollapsed={isCollapsed} />
              )
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
