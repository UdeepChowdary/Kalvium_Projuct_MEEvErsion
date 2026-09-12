import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import DemoSwitcherBar from "@/components/DemoSwitcherBar";
import Navbar from "@/components/Navbar";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollProgress from "@/components/ScrollProgress";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "CampusHub — Verified campus events",
  description:
    "Discover verified campus events, save what matters, and never double-book yourself. Powered by AI poster analysis and certified by campus leadership.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('campushub_theme')||'dark';document.documentElement.classList.remove('dark','light');document.documentElement.classList.add(t);}catch(e){}})()`,
          }}
        />
      </head>
      <body className="font-body antialiased bg-slate-50 dark:bg-void-950 text-slate-800 dark:text-slate-200 flex flex-col min-h-screen selection:bg-signal-500/30 selection:text-white transition-colors duration-200">
        <AuthProvider>
          <ThemeProvider>
            <div className="scanline-overlay" />
            <ScrollProgress />
            <SmoothScroll>
              <div className="sticky top-0 z-40 w-full">
                <DemoSwitcherBar />
                <Navbar />
              </div>
              <main className="flex-1">{children}</main>

              <footer className="relative border-t border-slate-200 dark:border-white/5 bg-white/90 dark:bg-void-950/90 py-12 px-6 sm:px-10 text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                  <div>
                    <p className="font-display font-bold text-sm text-slate-900 dark:text-white mb-1">
                      CAMPUSHUB
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md">
                      "AI makes event creation faster. Human verification makes event discovery trustworthy."
                    </p>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-6 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    <span>POSTER TRUTH</span>
                    <span>→</span>
                    <span>AI EXTRACTION</span>
                    <span>→</span>
                    <span className="text-verified-emerald font-bold">✓ CAMPUS VERIFIED</span>
                  </div>
                </div>
              </footer>
            </SmoothScroll>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
