import React from "react";

/**
 * MarqueeBanner – a continuously scrolling ticker strip.
 * Keyframes are injected inline so the animation always works
 * regardless of CSS build/purge settings.
 */
export function MarqueeBanner() {
  const text = "✨  Delivery All Over India  ✨";
  // Repeat enough copies to fill any viewport width seamlessly
  const copies = Array.from({ length: 10 }, (_, i) => (
    <span key={i} style={{ padding: "0 3rem", whiteSpace: "nowrap" }}>
      {text}
    </span>
  ));

  return (
    <div
      style={{
        background: "var(--color-purple, #7c3aed)",
        color: "#fff",
        fontSize: "0.8rem",
        fontWeight: 600,
        padding: "0.45rem 0",
        overflow: "hidden",
        width: "100%",
      }}
    >
      {/* Inject keyframes directly – works in production builds */}
      <style>{`
        @keyframes hapyezta-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .hapyezta-marquee-track {
          display: inline-flex;
          width: max-content;
          animation: hapyezta-marquee 35s linear infinite;
        }
        .hapyezta-marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="hapyezta-marquee-track">
        {/* Double the copies so the second half fills the gap when first half scrolls out */}
        {copies}
        {copies}
      </div>
    </div>
  );
}
