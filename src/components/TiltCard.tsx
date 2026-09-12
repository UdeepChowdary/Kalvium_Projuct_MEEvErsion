"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  glare?: boolean;
  maxTilt?: number;
  onClick?: () => void;
}

export default function TiltCard({
  children,
  className = "",
  glare = true,
  maxTilt = 6,
  onClick,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // Detect touch / coarse pointer
    if (typeof window !== "undefined") {
      const touchQuery = window.matchMedia("(pointer: coarse)");
      setIsTouchDevice(touchQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => setIsTouchDevice(e.matches);
      touchQuery.addEventListener("change", handleChange);
      return () => touchQuery.removeEventListener("change", handleChange);
    }
  }, []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for fluid inertia
  const springConfig = { damping: 22, stiffness: 260, mass: 0.5 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const rotateX = useTransform(springY, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-maxTilt, maxTilt]);

  // Glare position
  const glareX = useTransform(springX, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(springY, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || shouldReduceMotion) return;
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const normalizedX = mouseX / width - 0.5;
    const normalizedY = mouseY / height - 0.5;

    x.set(normalizedX);
    y.set(normalizedY);
  };

  const handleMouseEnter = () => {
    if (!isTouchDevice && !shouldReduceMotion) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  if (isTouchDevice || shouldReduceMotion) {
    return (
      <div className={className} onClick={onClick}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`relative perspective-1000 will-change-transform ${className}`}
    >
      {children}

      {/* Dynamic specular glare overlay */}
      {glare && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 z-30"
          style={{
            opacity: isHovered ? 0.12 : 0,
            background: useTransform(
              [glareX, glareY],
              ([gx, gy]) =>
                `radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.85) 0%, transparent 65%)`
            ),
          }}
        />
      )}
    </motion.div>
  );
}
