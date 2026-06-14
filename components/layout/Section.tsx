"use client";

import { cn } from "@/lib/utils";

export function Section({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("px-6 pt-6", className)}>
      <p className="section-label">{label}</p>
      {children}
    </section>
  );
}

export function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PanelHeader({
  title,
  subtitle,
  meta,
  action,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between px-5 pt-5 pb-3">
      <div>
        <h3 className="text-[15px] font-bold text-foreground tracking-tight">{title}</h3>
        {subtitle && (
          <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {meta && (
          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-md">
            {meta}
          </span>
        )}
        {action}
      </div>
    </div>
  );
}

/** AI callout box that sits at the bottom of a panel (matches reference gray sparkle box) */
export function AICallout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-5 mb-5 mt-3 flex gap-2.5 rounded-lg bg-muted/60 border border-border/60 px-3 py-2.5">
      <div className="w-4 h-4 rounded bg-foreground flex items-center justify-center shrink-0 mt-0.5">
        <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-background">
          <path d="M12 2l1.9 5.8L20 9.7l-4.9 3.6L17 19l-5-3.6L7 19l1.9-5.7L4 9.7l6.1-1.9z" />
        </svg>
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed">{children}</p>
    </div>
  );
}
