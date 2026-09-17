"use client";

import React from "react";
import Image from "next/image";

interface CampusHubLogoProps {
  /**
   * "full" = Icon mark + "CampusHub" wordmark
   * "icon" = Just the official app icon mark
   * "horizontal" = Full logo with official subtitle tagline
   */
  variant?: "full" | "icon" | "horizontal";
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  className?: string;
}

export default function CampusHubLogo({
  variant = "full",
  size = "md",
  showTagline = false,
  className = "",
}: CampusHubLogoProps) {
  const iconSize = {
    sm: "w-9 h-9",
    md: "w-11 h-11",
    lg: "w-14 h-14",
    xl: "w-18 h-18",
  }[size];

  const textSize = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  }[size];

  const taglineSize = {
    sm: "text-[7.5px] tracking-[0.16em]",
    md: "text-[8.5px] tracking-[0.18em]",
    lg: "text-[10px] tracking-[0.2em]",
    xl: "text-xs tracking-[0.22em]",
  }[size];

  return (
    /*
     * items-end → bottom of icon aligns with text baseline
     * graduation cap naturally overhangs above, exactly like the reference
     */
    <div className={`inline-flex items-center gap-0.5 select-none ${className}`}>
      {/* Light mode icon — dark graduation cap */}
      <div className={`relative ${iconSize} shrink-0 transition-transform duration-200 group-hover:scale-105 dark:hidden`}>
        <Image
          src="/brand/app-icon-final.png"
          alt="CampusHub Logo"
          width={80}
          height={80}
          className="w-full h-full object-contain"
          priority
        />
      </div>
      {/* Dark mode icon — white graduation cap, no black hat */}
      <div className={`relative ${iconSize} shrink-0 transition-transform duration-200 group-hover:scale-105 hidden dark:block`}>
        <Image
          src="/brand/app-icon-dark-final.png"
          alt="CampusHub Logo"
          width={80}
          height={80}
          className="w-full h-full object-contain"
          priority
        />
      </div>

      {/* Wordmark + optional tagline */}
      {variant !== "icon" && (
        <div className="flex flex-col justify-center">
          <div className={`flex items-baseline font-extrabold tracking-tight leading-none ${textSize}`}>
            <span className="text-kalvium-text dark:text-white transition-colors">
              Campus
            </span>
            <span className="text-kalvium-coral">Hub</span>
          </div>

          {/* Tagline: DISCOVER • ORGANIZE • BELONG */}
          {(showTagline || variant === "horizontal") && (
            <div
              className={`mt-1.5 font-sans font-bold uppercase text-kalvium-muted dark:text-kalvium-dark-muted flex items-center gap-1.5 ${taglineSize}`}
            >
              <span>DISCOVER</span>
              <span className="text-kalvium-coral text-[6px]">•</span>
              <span>ORGANIZE</span>
              <span className="text-kalvium-coral text-[6px]">•</span>
              <span>BELONG</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
