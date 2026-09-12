import React from "react";

interface TerminalButtonProps {
  variant?: "primary" | "secondary" | "danger" | "success" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  bracketed?: boolean;
}

export default function TerminalButton({
  variant = "primary",
  size = "md",
  children,
  icon,
  onClick,
  disabled = false,
  className = "",
  type = "button",
  bracketed = true,
}: TerminalButtonProps) {
  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 gap-1.5 tracking-wider",
    md: "text-xs px-4 py-2.5 gap-2 tracking-wider",
    lg: "text-sm px-6 py-3.5 gap-2.5 tracking-widest",
  };

  const variantStyles = {
    primary:
      "bg-cyan-500 dark:bg-cyan-electric text-slate-950 border-cyan-400 hover:bg-cyan-400 dark:hover:bg-cyan-400/90 shadow-sm",
    secondary:
      "bg-slate-100 dark:bg-terminal-850 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-terminal-700 hover:border-slate-400 dark:hover:border-terminal-500 hover:text-slate-950 dark:hover:text-white",
    outline:
      "bg-transparent text-slate-700 dark:text-slate-200 border-slate-300 dark:border-terminal-700 hover:border-cyan-500 dark:hover:border-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-electric",
    danger:
      "bg-red-500/10 text-red-600 dark:text-coral-red border-red-300 dark:border-coral-red/40 hover:bg-red-600 hover:text-white dark:hover:bg-coral-red dark:hover:text-white",
    success:
      "bg-emerald-500/10 text-emerald-700 dark:text-phosphor-bright border-emerald-300 dark:border-phosphor-green/40 hover:bg-emerald-600 hover:text-white dark:hover:bg-phosphor-green dark:hover:text-terminal-950",
    ghost:
      "bg-transparent text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-terminal-850",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`font-mono uppercase font-semibold rounded-sm border transition-all duration-150 inline-flex items-center justify-center select-none active:translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none disabled:active:translate-y-0 ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {bracketed ? (
        <span>
          <span className="opacity-40 mr-1">[</span>
          {children}
          <span className="opacity-40 ml-1">]</span>
        </span>
      ) : (
        <span>{children}</span>
      )}
    </button>
  );
}
