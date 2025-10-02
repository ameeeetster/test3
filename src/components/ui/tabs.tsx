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
        "rounded-lg p-1",
        "inline-flex items-center",
        "gap-1",
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
        "inline-flex items-center justify-center",
        "whitespace-nowrap text-sm",
        "px-4 py-2 rounded-md",
        "transition-all duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-0",
        // Active state
        "data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800",
        "data-[state=active]:text-slate-900 dark:data-[state=active]:text-white",
        "data-[state=active]:shadow-sm",
        "[&[data-state=active]]:font-medium",
        // Inactive state
        "font-medium",
        "text-slate-600 dark:text-slate-400",
        "hover:text-slate-900 dark:hover:text-slate-200",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0",
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
