import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Search, ShoppingBag, Heart, User } from "lucide-react";
import { Logo } from "./Logo";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useAccount } from "@/context/AccountContext";

export function Header() {
  const { cartCount, openCart } = useCart();
  const { favoriteItems, openFavorites } = useFavorites();
  const { openAccount } = useAccount();
  const [isScrolled, setIsScrolled] = useState(false);

  const scrollToSection = (id: string) => {
    if (window.location.pathname !== "/") {
      window.location.href = "/#" + id;
    } else {
      if (id === "newin") {
        window.dispatchEvent(new CustomEvent("switchToNewIn"));
        document.getElementById("featured")?.scrollIntoView({ behavior: "smooth" });
      } else {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  // On mount: if URL has a hash, scroll to that section
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace("#", "");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b-2 border-yellow/30 transition-all duration-300">
      <div
        className={`max-w-7xl mx-auto px-4 flex items-center justify-between gap-4 relative transition-all duration-300 ${
          isScrolled ? "h-16" : "h-24 sm:h-28 lg:h-20 lg:py-3"
        }`}
      >
        {/* Mobile Centered Logo (Always visible, collapses icon on scroll) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:hidden transition-all duration-300 ease-in-out flex items-center">
          <Link to="/" className="hover:opacity-90 transition flex items-center">
            <Logo size="sm" withSlogan={true} collapseOnScroll={true} isScrolled={isScrolled} className="items-center" />
          </Link>
        </div>

        {/* Desktop Static Logo (Statically positioned in-flow, always visible on desktop) */}
        <div className="hidden lg:flex items-center">
          <Link to="/" className="hover:opacity-90 transition flex items-center">
            <Logo size="sm" withSlogan={true} collapseOnScroll={true} isScrolled={isScrolled} className="items-start" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-foreground/80">
          <Link to="/products" className="hover:text-coral transition" activeProps={{ className: "text-coral font-bold" }}>Shop</Link>
          <a href="/#newin" onClick={(e) => { e.preventDefault(); scrollToSection("newin"); }} className="hover:text-coral transition cursor-pointer">New In</a>
          <a href="/#collection" onClick={(e) => { e.preventDefault(); scrollToSection("collection"); }} className="hover:text-coral transition cursor-pointer">Stationery</a>
          <a href="/#collection" onClick={(e) => { e.preventDefault(); scrollToSection("collection"); }} className="hover:text-coral transition cursor-pointer">Gift Sets</a>
          <a href="/#reviews" onClick={(e) => { e.preventDefault(); scrollToSection("reviews"); }} className="hover:text-coral transition cursor-pointer">Reviews</a>
        </nav>

        {/* Right buttons (stays right-aligned on mobile via ml-auto) */}
        <div className="flex items-center gap-2 sm:gap-3 z-20 ml-auto lg:ml-0">
          <button className="p-2 hover:text-coral hidden lg:block"><Search className="w-5 h-5" /></button>
          <button onClick={openAccount} className="p-2 hover:text-coral hidden lg:block cursor-pointer" title="Your Profile"><User className="w-5 h-5" /></button>
          <button onClick={openFavorites} className="p-2 hover:text-coral relative hidden sm:block cursor-pointer">
            <Heart className="w-5 h-5" />
            {favoriteItems.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-coral text-white text-[10px] font-bold w-4 h-4 rounded-full grid place-items-center animate-fade-in">
                {favoriteItems.length}
              </span>
            )}
          </button>
          <button onClick={openCart} className="p-2 hover:text-coral relative hidden lg:block cursor-pointer">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-coral text-white text-[10px] font-bold w-4 h-4 rounded-full grid place-items-center animate-fade-in">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
