"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs@1.1.3";

import { cn } from "./utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
  return (
    <TabsPrimitive.List
      ref={ref}
      data-slot="tabs-list"
      className={cn(
        "bg-slate-50/60 dark:bg-white/[0.03] text-muted-foreground",
        "border border-slate-200 dark:border-slate-800",
        "rounded-2xl p-2 shadow-sm backdrop-blur",
        "flex md:grid overflow-x-auto md:overflow-visible",
        "gap-2 md:gap-3",
        "md:grid-cols-6",
        "scroll-smooth snap-x snap-mandatory",
        "[-ms-overflow-style:none] [scrollbar-width:none]",
        "[&::-webkit-scrollbar]:hidden",
        className,
      )}
      {...props}
    />
  );
});
TabsList.displayName = "TabsList";

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "snap-start inline-flex items-center justify-center",
        "whitespace-nowrap md:whitespace-normal text-sm",
        "min-w-[140px] md:min-w-0 md:flex-1",
        "px-4 md:px-5 py-2.5 md:py-3 rounded-xl",
        "transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-0",
        // Active state - VERY prominent
        "data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950",
        "data-[state=active]:text-slate-900 dark:data-[state=active]:text-white",
        "data-[state=active]:shadow-[0_0_0_1px_rgba(79,70,229,0.1),0_8px_16px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.06)]",
        "dark:data-[state=active]:shadow-[0_0_0_1px_rgba(99,102,241,0.2),0_8px_16px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.3)]",
        "data-[state=active]:scale-[1.02]",
        "[&[data-state=active]]:font-semibold",
        // Inactive state
        "font-medium",
        "text-slate-500 dark:text-slate-500",
        "hover:bg-white/70 dark:hover:bg-white/10",
        "hover:text-slate-700 dark:hover:text-slate-300",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
