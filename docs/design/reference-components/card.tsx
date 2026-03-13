import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Card container component.
 *
 * Base card container with border, shadow, and rounded corners.
 * Provides semantic grouping for card-based content.
 *
 * @component
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Standard HTML div attributes
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded ref to card element
 * @returns {JSX.Element} The rendered card container
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

/**
 * Card header section.
 *
 * Header container within a card for titles, descriptions, and header content.
 * Provides top padding and vertical spacing.
 *
 * @component
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Standard HTML div attributes
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded ref to header element
 * @returns {JSX.Element} The rendered card header
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

/**
 * Card title element.
 *
 * Large, semibold heading for the card. Typically placed within CardHeader.
 *
 * @component
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Standard HTML div attributes
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded ref to title element
 * @returns {JSX.Element} The rendered card title
 */
const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

/**
 * Card description element.
 *
 * Smaller, muted text for descriptive content. Typically placed within CardHeader.
 *
 * @component
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Standard HTML div attributes
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded ref to description element
 * @returns {JSX.Element} The rendered card description
 */
const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

/**
 * Card content section.
 *
 * Main content area of the card. Contains the primary card content
 * with padding on sides and bottom.
 *
 * @component
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Standard HTML div attributes
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded ref to content element
 * @returns {JSX.Element} The rendered card content
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

/**
 * Card footer section.
 *
 * Footer container at the bottom of the card, typically containing action buttons.
 * Uses flex layout with centered alignment and padding on sides and bottom.
 *
 * @component
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Standard HTML div attributes
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded ref to footer element
 * @returns {JSX.Element} The rendered card footer
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
