import React, { useEffect, useState, useRef } from "react";
import logoImg from "@/assets/logo.png";
import heroImg from "@/assets/hero.jpg";

const MICROCOPY_STEPS = [
  "Sharpening pencils...",
  "Wrapping gifts...",
  "Sprinkling stickers...",
  "Almost cute enough...",
];

export function Preloader() {
  const [removed, setRemoved] = useState(() => {
    if (typeof window !== "undefined") {
      return !!sessionStorage.getItem("hapyezta-loaded");
    }
    return false;
  });

  const [displayProgress, setDisplayProgress] = useState(0);
  const [targetProgress, setTargetProgress] = useState(15);
  const [microcopyIndex, setMicrocopyIndex] = useState(0);
  const [microcopyFade, setMicrocopyFade] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [isPopExit, setIsPopExit] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const progressRef = useRef(0);
  const isCompleteRef = useRef(false);

  useEffect(() => {
    // If already visited this session, skip entirely
    if (sessionStorage.getItem("hapyezta-loaded")) {
      setRemoved(true);
      return;
    }

    // 1. Rotating microcopy every 700ms with smooth fade
    const microcopyInterval = setInterval(() => {
      setMicrocopyFade(false);
      setTimeout(() => {
        setMicrocopyIndex((prev) => (prev + 1) % MICROCOPY_STEPS.length);
        setMicrocopyFade(true);
      }, 150);
    }, 700);

    // 2. Real asset tracking
    let assetsLoaded = 0;
    const totalAssets = 4;

    const onAssetLoaded = () => {
      assetsLoaded += 1;
      const progressPercent = Math.min(100, Math.round((assetsLoaded / totalAssets) * 100));
      setTargetProgress((prev) => Math.max(prev, progressPercent));
    };

    // Track Fonts
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(onAssetLoaded).catch(onAssetLoaded);
    } else {
      onAssetLoaded();
    }

    // Track Logo
    const logoImage = new Image();
    logoImage.src = logoImg;
    if (logoImage.complete) {
      onAssetLoaded();
    } else {
      logoImage.onload = onAssetLoaded;
      logoImage.onerror = onAssetLoaded;
    }

    // Track Hero
    const heroImage = new Image();
    heroImage.src = heroImg;
    if (heroImage.complete) {
      onAssetLoaded();
    } else {
      heroImage.onload = onAssetLoaded;
      heroImage.onerror = onAssetLoaded;
    }

    // Track DOM readiness
    if (document.readyState === "complete" || document.readyState === "interactive") {
      onAssetLoaded();
    } else {
      window.addEventListener("DOMContentLoaded", onAssetLoaded, { once: true });
    }

    // Safety timeout: forced 100% at 1.4s max
    const maxTimeout = setTimeout(() => {
      setTargetProgress(100);
    }, 1400);

    // Smooth progress interpolation (ensures smooth 0 -> 100% transition)
    let animationFrameId: number;
    const updateInterpolation = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const minDurationMet = elapsed >= 950;

      setDisplayProgress((prev) => {
        if (isCompleteRef.current) return 100;

        // If time is passing, steadily advance progress towards target
        const timeFactor = Math.min(100, (elapsed / 1000) * 100);
        const currentTarget = Math.max(targetProgress, timeFactor);

        let step = (currentTarget - prev) * 0.18;
        if (step < 0.6 && prev < currentTarget) step = 0.6;
        const next = Math.min(currentTarget, prev + step);
        const rounded = Math.round(next);
        progressRef.current = rounded;

        if (rounded >= 100 && minDurationMet && !isCompleteRef.current) {
          isCompleteRef.current = true;
          handleCompletion();
          return 100;
        }

        return Math.min(100, rounded);
      });

      if (!isCompleteRef.current) {
        animationFrameId = requestAnimationFrame(updateInterpolation);
      }
    };

    animationFrameId = requestAnimationFrame(updateInterpolation);

    const handleCompletion = () => {
      // Mark as seen for session
      try {
        sessionStorage.setItem("hapyezta-loaded", "true");
      } catch (_) {}

      // Logo pops up at 100%
      setIsPopExit(true);

      // Begin gift box split opening
      setTimeout(() => {
        setIsExiting(true);
      }, 150);

      // Clean unmount from DOM after gift box curtains finish sliding
      setTimeout(() => {
        setRemoved(true);
      }, 850);
    };

    return () => {
      clearInterval(microcopyInterval);
      clearTimeout(maxTimeout);
      cancelAnimationFrame(animationFrameId);
    };
  }, [targetProgress]);

  if (removed) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-50 pointer-events-none select-none overflow-hidden"
    >
      {/* ── Top Half Curtain (Gift Box Lid) ── */}
      <div
        className={`absolute inset-x-0 top-0 h-1/2 bg-[#fff8ec] border-b-2 border-yellow/20 transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] ${
          isExiting ? "-translate-y-full" : "translate-y-0"
        }`}
      />

      {/* ── Bottom Half Curtain (Gift Box Base) ── */}
      <div
        className={`absolute inset-x-0 bottom-0 h-1/2 bg-[#fff8ec] border-t-2 border-yellow/20 transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] ${
          isExiting ? "translate-y-full" : "translate-y-0"
        }`}
      />

      {/* ── Center Stage & Floating Elements ── */}
      <div
        className={`relative z-10 w-full h-full flex flex-col items-center justify-between py-10 px-4 transition-all duration-500 ease-out ${
          isExiting ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        {/* Floating Kawaii Elements Layer */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* 1. Sparkle Star (Yellow, Top-Left) */}
          <div className="absolute top-[12%] left-[14%] sm:left-[20%] animate-kawaii-float-1">
            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-yellow drop-shadow-sm opacity-85">
              <path d="M12 0C12 7 7 12 0 12C7 12 12 17 12 24C12 17 17 12 24 12C17 12 12 7 12 0Z" />
            </svg>
          </div>

          {/* 2. Sweet Heart (Coral, Top-Right) */}
          <div className="absolute top-[16%] right-[15%] sm:right-[22%] animate-kawaii-float-2">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-coral drop-shadow-sm opacity-85">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>

          {/* 3. Tiny Kawaii Pencil (Teal/Orange, Mid-Left) */}
          <div className="absolute top-[46%] left-[8%] sm:left-[15%] animate-kawaii-float-3 -rotate-12">
            <svg viewBox="0 0 32 32" className="w-7 h-7 drop-shadow-sm opacity-90">
              <rect x="6" y="8" width="14" height="6" rx="2" fill="#1c978f" />
              <rect x="20" y="8" width="4" height="6" fill="#fcb11b" />
              <polygon points="24,8 30,11 24,14" fill="#f47523" />
              <rect x="2" y="8" width="4" height="6" rx="1.5" fill="#f26c58" />
            </svg>
          </div>

          {/* 4. Squishy Sticker Blob (Purple, Bottom-Left) */}
          <div className="absolute bottom-[22%] left-[12%] sm:left-[22%] animate-kawaii-float-2 rotate-6">
            <svg viewBox="0 0 36 36" className="w-8 h-8 fill-purple/75 drop-shadow-sm">
              <path d="M18 3C9 3 3 9 3 18s6 15 15 15 15-6 15-15-6-15-15-15zm-4 13a2 2 0 110-4 2 2 0 010 4zm8 0a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </div>

          {/* 5. Playful 5-Point Star (Orange, Bottom-Right) */}
          <div className="absolute bottom-[24%] right-[14%] sm:right-[20%] animate-kawaii-float-1">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-orange drop-shadow-sm opacity-85">
              <path d="M12 2l2.8 6.5 7.1.6-5.3 4.8 1.6 7-6.2-3.6-6.2 3.6 1.6-7-5.3-4.8 7.1-.6z" />
            </svg>
          </div>

          {/* 6. Mini Sparkle (Teal, Mid-Right) */}
          <div className="absolute top-[44%] right-[8%] sm:right-[16%] animate-kawaii-float-3">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-teal drop-shadow-sm opacity-85">
              <path d="M12 0C12 7 7 12 0 12C7 12 12 17 12 24C12 17 17 12 24 12C17 12 12 7 12 0Z" />
            </svg>
          </div>

          {/* 7. Sweet Daisy (White/Yellow, Top-Center) */}
          <div className="absolute top-[8%] left-[48%] animate-kawaii-float-2">
            <svg viewBox="0 0 24 24" className="w-5 h-5 opacity-80">
              <circle cx="12" cy="7" r="3.5" fill="#ffffff" />
              <circle cx="12" cy="17" r="3.5" fill="#ffffff" />
              <circle cx="7" cy="12" r="3.5" fill="#ffffff" />
              <circle cx="17" cy="12" r="3.5" fill="#ffffff" />
              <circle cx="12" cy="12" r="3" fill="#fcb11b" />
            </svg>
          </div>

          {/* 8. Tiny Heart (Purple, Bottom-Center) */}
          <div className="absolute bottom-[10%] left-[50%] -translate-x-1/2 animate-kawaii-float-3">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-purple/60 opacity-70">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        </div>

        {/* Top spacer */}
        <div className="w-full h-4" />

        {/* ── Main Content Core ── */}
        <div className="relative flex flex-col items-center justify-center my-auto">
          {/* Logo with Bounce & Squish + Pop-up on Exit */}
          <div
            className={`relative flex flex-col items-center transition-transform duration-300 ${
              isPopExit ? "scale-115 -translate-y-2" : "animate-bounce-squish"
            }`}
          >
            <div className="w-28 h-28 sm:w-32 sm:h-32 mb-2 relative">
              <img
                src={logoImg}
                alt="Hapyezta Logo"
                className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(244,117,35,0.15)]"
              />
            </div>

            {/* Breathing soft shadow beneath logo */}
            <div className="w-20 h-3 bg-purple/15 rounded-[100%] filter blur-[3px] animate-shadow-breathe -mt-1" />
          </div>

          {/* Brand Name */}
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-4 mb-1">
            <span className="text-orange">H</span>
            <span className="text-yellow">a</span>
            <span className="text-teal">p</span>
            <span className="text-purple">y</span>
            <span className="text-coral">e</span>
            <span className="text-purple">z</span>
            <span className="text-teal">t</span>
            <span className="text-orange">a</span>
          </h1>

          {/* ── Chunky Washi Tape Progress Bar & Leading Edge Rider ── */}
          <div className="mt-5 w-60 sm:w-68 flex flex-col items-center">
            <div className="relative w-full h-4 bg-white/90 rounded-full border-2 border-purple/20 shadow-inner p-0.5 overflow-visible">
              {/* Inner Gradient Washi Fill */}
              <div
                className="h-full rounded-full bg-gradient-to-r from-yellow via-coral to-purple washi-tape-bar transition-[width] duration-150 ease-out"
                style={{ width: `${displayProgress}%` }}
              />

              {/* Leading edge rider: Cute Animated Pencil Riding the progress */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -ml-3 transition-[left] duration-150 ease-out pointer-events-none"
                style={{ left: `${Math.min(displayProgress, 97)}%` }}
              >
                <div className="w-6 h-6 rounded-full bg-white shadow-md border-2 border-orange flex items-center justify-center animate-pulse">
                  <span className="text-[11px] leading-none select-none">✏️</span>
                </div>
              </div>
            </div>

            {/* Percentage counter */}
            <div className="mt-2.5 flex items-center gap-1 font-display font-bold text-sm text-purple">
              <span className="tabular-nums tracking-wide">{displayProgress}</span>
              <span className="text-xs text-orange">%</span>
            </div>
          </div>

          {/* ── Rotating Microcopy ── */}
          <div className="h-6 mt-1 flex items-center justify-center">
            <p
              className={`font-body text-xs font-semibold text-purple/80 tracking-wide transition-opacity duration-200 ${
                microcopyFade ? "opacity-100" : "opacity-0"
              }`}
            >
              {MICROCOPY_STEPS[microcopyIndex]}
            </p>
          </div>
        </div>

        {/* ── Bottom Tagline ── */}
        <div className="pb-4">
          <p className="font-display text-[10px] sm:text-[11px] uppercase tracking-[0.18em] font-bold text-orange/90 text-center">
            Where Happy Creation Begin
          </p>
        </div>
      </div>
    </div>
  );
}
