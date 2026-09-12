import React from "react";

interface TerminalBadgeProps {
  variant?: "verified" | "amber" | "coral" | "cyan" | "neutral";
  size?: "sm" | "md";
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  showDot?: boolean;
}

export default function TerminalBadge({
  variant = "neutral",
  size = "sm",
  children,
  icon,
  className = "",
  showDot = true,
}: TerminalBadgeProps) {
  const sizeStyles = {
    sm: "text-[11px] px-2.5 py-0.5 tracking-wider",
    md: "text-xs px-3 py-1 tracking-wider",
  };

  const variantStyles = {
    verified: "border-emerald-500/30 dark:border-phosphor-green/40 text-emerald-700 dark:text-phosphor-bright bg-emerald-500/10",
    amber: "border-amber-500/30 dark:border-amber-warm/40 text-amber-700 dark:text-amber-warm bg-amber-500/10",
    coral: "border-red-500/30 dark:border-coral-red/40 text-red-600 dark:text-coral-red bg-red-500/10",
    cyan: "border-cyan-500/30 dark:border-cyan-electric/40 text-cyan-700 dark:text-cyan-electric bg-cyan-500/10",
    neutral: "border-slate-300 dark:border-terminal-700 text-slate-600 dark:text-slate-400 bg-slate-100/80 dark:bg-terminal-850",
  };

  const dotStyles = {
    verified: "phosphor-dot",
    amber: "amber-dot",
    coral: "coral-dot",
    cyan: "cyan-dot",
    neutral: "w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-sm border uppercase select-none transition-colors ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {showDot && <span className={dotStyles[variant]} />}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
