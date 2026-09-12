"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

interface MagneticButtonProps {
  href?: string;
  onClick?: () => void;
  variant?: "solid" | "outline" | "ghost";
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export default function MagneticButton({
  href,
  onClick,
  variant = "solid",
  children,
  icon,
  className = "",
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isTouch, setIsTouch] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      setIsTouch(coarse);
    }
  }, []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 20 });
  const springY = useSpring(y, { stiffness: 220, damping: 20 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (isTouch || shouldReduceMotion) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    // Keep translation very subtle (max ~6-8px)
    const factor = 0.15;
    x.set((e.clientX - rect.left - rect.width / 2) * factor);
    y.set((e.clientY - rect.top - rect.height / 2) * factor);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  const baseStyle =
    "relative overflow-hidden rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 select-none inline-flex items-center justify-center gap-2";

  const variantStyles = {
    solid:
      "bg-signal-500 hover:bg-signal-600 text-white shadow-lg shadow-signal-500/25 active:scale-95",
    outline:
      "border border-slate-300 dark:border-white/15 hover:border-signal-500/50 dark:hover:border-signal-400/50 bg-slate-900/5 dark:bg-white/5 hover:bg-slate-900/10 dark:hover:bg-white/10 text-slate-900 dark:text-white active:scale-95",
    ghost:
      "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 active:scale-95",
  };

  const buttonInner = (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      style={{ x: isTouch || shouldReduceMotion ? 0 : springX, y: isTouch || shouldReduceMotion ? 0 : springY }}
      className={`${baseStyle} ${variantStyles[variant]} ${className}`}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {icon}
      </span>
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {buttonInner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className="inline-block focus:outline-none">
      {buttonInner}
    </button>
  );
}
