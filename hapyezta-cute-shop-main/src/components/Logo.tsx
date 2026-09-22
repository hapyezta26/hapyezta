import React from "react";
import logoImg from "@/assets/logo.png";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  withSlogan?: boolean;
  size?: "sm" | "md" | "lg";
  collapseOnScroll?: boolean;
  isScrolled?: boolean;
}

export function LogoIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <img
      src={logoImg}
      alt="Hapyezta Logo Icon"
      className={`${className} object-contain`}
    />
  );
}

export function LogoText({ className = "" }: { className?: string }) {
  return null;
}

export function Logo({
  className = "",
  size = "md",
  collapseOnScroll = false,
  isScrolled: controlledIsScrolled,
}: LogoProps) {
  const [internalIsScrolled, setInternalIsScrolled] = React.useState(false);

  React.useEffect(() => {
    if (!collapseOnScroll || controlledIsScrolled !== undefined) return;
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setInternalIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [collapseOnScroll, controlledIsScrolled]);

  const isScrolled = controlledIsScrolled !== undefined ? controlledIsScrolled : internalIsScrolled;
  const isCollapsed = collapseOnScroll && isScrolled;

  const logoHeights = {
    sm: isCollapsed ? "h-8 sm:h-9" : "h-11 sm:h-12",
    md: "h-14 sm:h-16",
    lg: "h-20 sm:h-24",
  };

  return (
    <div className={`flex items-center justify-center transition-all duration-300 ${className}`}>
      <img
        src={logoImg}
        alt="Hapyezta Logo"
        className={`${logoHeights[size]} w-auto object-contain transition-all duration-300 ease-in-out hover:scale-[1.02]`}
      />
    </div>
  );
}
