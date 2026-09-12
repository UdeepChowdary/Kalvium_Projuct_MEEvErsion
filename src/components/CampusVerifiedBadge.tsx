"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

interface CampusVerifiedBadgeProps {
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
  verifierName?: string;
  animate?: boolean;
}

export default function CampusVerifiedBadge({
  size = "md",
  showIcon = true,
  className = "",
  verifierName,
  animate = false,
}: CampusVerifiedBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1 font-medium",
    md: "px-2.5 py-1 text-xs gap-1.5 font-medium",
    lg: "px-3.5 py-1.5 text-sm gap-2 font-semibold",
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  const content = (
    <span
      className={`inline-flex items-center rounded-full border border-verified-400/30 bg-verified-500/10 text-verified-400 backdrop-blur select-none transition-all duration-300 hover:bg-verified-500/15 ${sizeClasses[size]} ${className}`}
      title={verifierName ? `Verified by ${verifierName}` : "Verified by Campus Staff"}
    >
      {showIcon && (
        <ShieldCheck
          size={iconSizes[size]}
          className="text-verified-400 shrink-0"
        />
      )}
      <span className="tracking-tight">Campus verified</span>
    </span>
  );

  if (!animate) return content;

  return (
    <motion.span
      initial={{ scale: 1.3, opacity: 0, rotate: -4 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 360, damping: 22 }}
      className="inline-block"
    >
      {content}
    </motion.span>
  );
}
