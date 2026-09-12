import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Retro-Futurist Terminal Palette
        terminal: {
          950: "#07090E", // deepest workstation background
          900: "#0D1118", // main surface
          850: "#131823", // panel background
          800: "#1A2230", // elevated panel / input
          750: "#222D40", // subtle border / separator
          700: "#2C3950", // prominent hairline border
          600: "#445571", // secondary border / muted text
          500: "#657A99", // label text
          400: "#94A3B8", // secondary text
          300: "#CBD5E1", // body text light
          200: "#E2E8F0", // high contrast text
          100: "#F1F5F9",
          50: "#F8FAFC",
        },
        cyan: {
          electric: "#00E5FF",
          400: "#38BDF8",
          500: "#00E5FF",
          600: "#0284C7",
          glow: "rgba(0, 229, 255, 0.15)",
        },
        phosphor: {
          green: "#10B981",
          bright: "#22C55E",
          emerald: "#10B981",
          glow: "rgba(16, 185, 129, 0.15)",
        },
        amber: {
          warm: "#F59E0B",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          glow: "rgba(245, 158, 11, 0.15)",
        },
        coral: {
          red: "#EF4444",
          400: "#F87171",
          500: "#EF4444",
          600: "#DC2626",
          glow: "rgba(239, 68, 68, 0.15)",
        },
        brand: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
          950: "#1E1B4B",
        },
        // CampusHub Observatory Dark Base
        void: {
          950: "#07090E",
          900: "#0D1118",
          800: "#131823",
          700: "#1A2230",
        },
        // CampusHub Signal Violet Brand
        signal: {
          400: "#8b7bff",
          500: "#6f5bff",
          600: "#5641e8",
        },
        dark: {
          900: "#0B0F19",
          850: "#0F172A",
          800: "#141E33",
          700: "#1E293B",
          600: "#334155",
        },
        // CampusHub Verified Emerald
        verified: {
          400: "#3fe0a5",
          500: "#1fc98a",
          emerald: "#10B981",
          bg: "rgba(16, 185, 129, 0.12)",
          border: "rgba(16, 185, 129, 0.3)",
        },
        // CampusHub Flare Warm Amber
        flare: {
          400: "#ffb454",
          500: "#f79a2e",
        },
        soon: {
          flame: "#FF4500",
          glow: "rgba(255, 69, 0, 0.2)",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        "display-xl": ["clamp(3.5rem, 9vw, 8.5rem)", { lineHeight: "0.92", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(2.5rem, 5vw, 4.5rem)", { lineHeight: "0.98", letterSpacing: "-0.02em" }],
      },
      backgroundImage: {
        grain: "url('/grain.png')",
        mesh: "radial-gradient(ellipse 80% 60% at 20% 0%, rgba(111,91,255,0.25), transparent 60%), radial-gradient(ellipse 60% 50% at 90% 20%, rgba(31,201,138,0.12), transparent 60%), radial-gradient(ellipse 70% 60% at 50% 100%, rgba(111,91,255,0.10), transparent 60%)",
      },
      transitionTimingFunction: {
        "cinematic": "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
        "soft": "cubic-bezier(0.25, 1, 0.5, 1)",
        "spring": "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      },
      boxShadow: {
        "editorial": "0 20px 40px -15px rgba(0, 0, 0, 0.5)",
        "glow-brand": "0 0 30px -5px rgba(99, 102, 241, 0.3)",
        "glow-verified": "0 0 25px -5px rgba(16, 185, 129, 0.35)",
        "glow-flame": "0 0 25px -5px rgba(255, 69, 0, 0.4)",
        "subtle": "0 4px 20px -2px rgba(0, 0, 0, 0.25)",
        "card-hover": "0 22px 35px -10px rgba(0, 0, 0, 0.6), 0 0 20px -5px rgba(99, 102, 241, 0.15)",
      },
      animation: {
        "sweep": "sweep 4s linear infinite",
        "pulse-ring": "pulse-ring 2.2s cubic-bezier(0.4,0,0.6,1) infinite",
        "drift": "drift 6s ease-in-out infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 4s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "fade-in": "fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-down": "slideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-left": "slideLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "verified-settle": "verifiedSettle 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "scanner": "scanner 2.4s ease-in-out infinite",
        "subtle-float": "subtleFloat 3s ease-in-out infinite",
      },
      keyframes: {
        sweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.6" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        drift: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        slideLeft: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        subtleFloat: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        verifiedSettle: {
          "0%": { transform: "scale(0.92)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        glowPulse: {
          "0%, 100%": { filter: "drop-shadow(0 0 8px rgba(99, 102, 241, 0.35))" },
          "50%": { filter: "drop-shadow(0 0 18px rgba(99, 102, 241, 0.65))" },
        },
        scanner: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "50%": { opacity: "0.8" },
          "100%": { transform: "translateY(240%)", opacity: "0" },
        }
      }
    },
  },
  plugins: [],
};
export default config;
