import React, { useEffect, useState } from "react";
import logoImg from "@/assets/logo.png";

export function Preloader() {
  const [visible, setVisible] = useState(true);
  const [removed, setRemoved] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    // Wait for all fonts to be fully loaded before showing text
    document.fonts.ready.then(() => {
      setFontsReady(true);
    });

    // Show preloader for 1.4 seconds, then start fading out
    const timer = setTimeout(() => {
      setVisible(false);
    }, 1400);

    // Completely remove preloader from DOM after transition (500ms)
    const removeTimer = setTimeout(() => {
      setRemoved(true);
    }, 1900);

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (removed) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="relative flex flex-col items-center select-none">
        {/* Pulsing logo icon */}
        <div className="relative w-28 h-28 mb-5 animate-preloader-bounce">
          <img
            src={logoImg}
            alt="Hapyezta Loading Logo"
            className="w-full h-full object-contain"
          />
          {/* Pulsing glow ring */}
          <div className="absolute -inset-2 rounded-full border-4 border-yellow/20 animate-ping opacity-60" />
        </div>

        {/* Brand Text — only rendered once fonts are confirmed loaded */}
        <h1
          className="font-display text-3xl font-bold tracking-tight mb-1"
          style={{ visibility: fontsReady ? "visible" : "hidden" }}
        >
          <span className="text-orange">H</span>
          <span className="text-yellow">a</span>
          <span className="text-teal">p</span>
          <span className="text-purple">y</span>
          <span className="text-coral">e</span>
          <span className="text-purple">z</span>
          <span className="text-teal">t</span>
          <span className="text-orange">a</span>
        </h1>

        {/* Slogan */}
        <p
          className="text-[9px] uppercase tracking-[0.15em] font-bold text-orange mb-6"
          style={{
            fontFamily: "var(--font-display)",
            visibility: fontsReady ? "visible" : "hidden",
          }}
        >
          Where Happy Creation Begin
        </p>

        {/* Loading progress bar */}
        <div className="relative w-40 h-1.5 bg-yellow/20 rounded-full overflow-hidden">
          <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-yellow to-orange rounded-full animate-preloader-progress" />
        </div>
      </div>
    </div>
  );
}
