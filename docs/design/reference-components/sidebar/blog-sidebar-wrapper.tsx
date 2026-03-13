"use client";

import { BlogSidebar } from "@/components/blog-sidebar";
import { useTenant } from "@/lib/tenant-context";
import { useOnboardingStatus } from "@/lib/hooks/use-onboarding-status";
import { useEffect, useState } from "react";

/**
 * Props for the BlogSidebarWrapper component.
 * @interface BlogSidebarWrapperProps
 */
interface BlogSidebarWrapperProps {
  /** Whether to display in onboarding mode with restricted navigation */
  isOnboardingMode?: boolean;
}

/**
 * Wrapper component for blog sidebar with tenant and onboarding context.
 *
 * @description Higher-order component that wraps the BlogSidebar component with tenant context
 * and onboarding status management. Automatically loads onboarding navigation unlock status from
 * localStorage, preventing the sidebar navigation from being accessible until onboarding is complete.
 * Manages the visibility and functionality of the sidebar based on tenant ID and onboarding status.
 *
 * @param {BlogSidebarWrapperProps} props - Component props
 * @param {boolean} [props.isOnboardingMode=false] - Whether to restrict navigation during onboarding
 *
 * @returns {React.ReactElement} The wrapped blog sidebar component with onboarding context
 *
 * @example
 * ```tsx
 * // Display in onboarding mode
 * <BlogSidebarWrapper isOnboardingMode={true} />
 *
 * // Display in normal mode
 * <BlogSidebarWrapper />
 * ```
 */
export function BlogSidebarWrapper({
  isOnboardingMode = false,
}: BlogSidebarWrapperProps) {
  const { tenantId } = useTenant();
  const { status: onboardingStatus } = useOnboardingStatus(tenantId);
  const [navUnlocked, setNavUnlocked] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    try {
      const unlocked =
        localStorage.getItem(`onboarding_nav_unlocked_${tenantId}`) === "1";
      setNavUnlocked(unlocked);
    } catch {
      // ignore storage issues
    }
  }, [tenantId]);

  return (
    <BlogSidebar
      onboardingStatus={onboardingStatus}
      isOnboardingMode={isOnboardingMode && !navUnlocked}
    />
  );
}
