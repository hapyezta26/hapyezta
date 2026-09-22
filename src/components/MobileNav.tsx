import React, { useState } from "react";
import { Home, Search, LayoutGrid, ShoppingCart, User, X } from "lucide-react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductContext";
import { useAccount } from "@/context/AccountContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function MobileNav() {
  const { cartCount, openCart, isCartOpen } = useCart();
  const { products } = useProducts();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { openAccount } = useAccount();
  const navigate = useNavigate();
  const location = useLocation();

  const isHomeActive = location.pathname === "/";
  const isShopActive = location.pathname === "/products";

  // Search logic
  const [searchQuery, setSearchQuery] = useState("");
  const filteredProducts = searchQuery
    ? products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleTabClick = (tab: string) => {
    if (tab === "home") {
      navigate({ to: "/" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (tab === "shop") {
      navigate({ to: "/products" });
    } else if (tab === "search") {
      setIsSearchOpen(true);
    } else if (tab === "cart") {
      openCart();
    } else if (tab === "account") {
      openAccount();
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-coral/10 shadow-[0_-8px_24px_rgba(242,108,88,0.08)] pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          {/* Home */}
          <button
            onClick={() => handleTabClick("home")}
            className={`flex flex-col items-center justify-center w-16 h-full transition-all duration-300 relative cursor-pointer ${
              isHomeActive
                ? "text-coral scale-105 font-bold"
                : "text-coral/70 hover:text-coral"
            }`}
          >
            <Home className="w-[22px] h-[22px] stroke-[2.2]" />
            <span className="text-[11px] font-semibold mt-0.5 font-body">Home</span>
            {isHomeActive && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-coral animate-ping" />
            )}
          </button>

          {/* Search */}
          <button
            onClick={() => handleTabClick("search")}
            className={`flex flex-col items-center justify-center w-16 h-full transition-all duration-300 relative cursor-pointer ${
              isSearchOpen
                ? "text-coral scale-105 font-bold"
                : "text-coral/70 hover:text-coral"
            }`}
          >
            <Search className="w-[22px] h-[22px] stroke-[2.2]" />
            <span className="text-[11px] font-semibold mt-0.5 font-body">Search</span>
            {isSearchOpen && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-coral" />
            )}
          </button>

          {/* Shop */}
          <button
            onClick={() => handleTabClick("shop")}
            className={`flex flex-col items-center justify-center w-16 h-full transition-all duration-300 relative cursor-pointer ${
              isShopActive
                ? "text-coral scale-105 font-bold"
                : "text-coral/70 hover:text-coral"
            }`}
          >
            <LayoutGrid className="w-[22px] h-[22px] stroke-[2.2]" />
            <span className="text-[11px] font-semibold mt-0.5 font-body">Shop</span>
            {isShopActive && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-coral" />
            )}
          </button>

          {/* Cart */}
          <button
            onClick={() => handleTabClick("cart")}
            className={`flex flex-col items-center justify-center w-16 h-full transition-all duration-300 relative cursor-pointer ${
              isCartOpen
                ? "text-coral scale-105 font-bold"
                : "text-coral/70 hover:text-coral"
            }`}
          >
            <div className="relative">
              <ShoppingCart className="w-[22px] h-[22px] stroke-[2.2]" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-coral text-white text-[9px] font-bold w-4 h-4 rounded-full grid place-items-center border border-white animate-fade-in">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[11px] font-semibold mt-0.5 font-body">cart</span>
            {isCartOpen && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-coral" />
            )}
          </button>

          {/* Account */}
          <button
            onClick={() => handleTabClick("account")}
            className={`flex flex-col items-center justify-center w-16 h-full transition-all duration-300 relative cursor-pointer text-coral/70 hover:text-coral`}
          >
            <User className="w-[22px] h-[22px] stroke-[2.2]" />
            <span className="text-[11px] font-semibold mt-0.5 font-body">account</span>
          </button>
        </div>
      </div>

      {/* --- Search Dialog --- */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="w-[92vw] sm:max-w-[480px] rounded-[2rem] sm:rounded-3xl p-6 bg-cream border-2 border-yellow/30 max-h-[85vh] overflow-y-auto z-[60]">
          <DialogHeader className="pb-2">
            <DialogTitle className="font-display text-2xl text-purple flex items-center gap-2">
              🔍 Search Kawaii Items
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search pens, journals, boxes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-full bg-white border-2 border-purple/20 focus:border-coral outline-none text-foreground font-body text-sm transition-colors"
              />
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-purple/40" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-3 w-5 h-5 rounded-full bg-purple/10 flex items-center justify-center hover:bg-purple/20 transition cursor-pointer"
                >
                  <X className="w-3 h-3 text-purple" />
                </button>
              )}
            </div>

            {/* Popular tags */}
            {!searchQuery && (
              <div>
                <div className="text-xs font-semibold text-purple/60 mb-2 uppercase tracking-wider">
                  Popular Searches
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Journal", "Stickers", "Water Bottle", "Organizer", "Lunch Box"].map(
                    (tag) => (
                      <button
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="px-3.5 py-1.5 rounded-full bg-white border border-purple/15 text-xs text-purple font-semibold hover:bg-coral hover:text-white hover:border-transparent transition cursor-pointer"
                      >
                        {tag}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Search Results */}
            {searchQuery && (
              <div className="space-y-3 pt-2">
                <div className="text-xs font-semibold text-purple/60 uppercase tracking-wider">
                  Search Results ({filteredProducts.length})
                </div>
                {filteredProducts.length > 0 ? (
                  <div className="space-y-2.5">
                    {filteredProducts.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 bg-white rounded-2xl flex items-center justify-between border border-purple/10 hover:border-coral/30 transition-all shadow-sm"
                      >
                        <div className="flex-1 pr-3">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-xs text-foreground line-clamp-1">
                              {p.name}
                            </h4>
                            {p.tag && (
                              <span className="text-[8px] bg-coral text-white font-bold px-1.5 py-0.5 rounded-full uppercase">
                                {p.tag}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                            {p.description}
                          </p>
                          <span className="text-xs font-bold text-purple mt-1 block">
                            {p.price}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            addToCart({
                              id: p.id,
                              name: p.name,
                              price: parseFloat(p.price.replace(/[^\d.]/g, "")),
                              priceString: p.price,
                              img: p.img,
                              weight: p.weight,
                            });
                            setIsSearchOpen(false);
                            openCart();
                          }}
                          className="px-3 py-1.5 rounded-full bg-purple text-white text-xs font-semibold hover:bg-coral transition cursor-pointer shrink-0"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-purple/20">
                    <p className="text-sm text-muted-foreground">
                      No cute items found for "{searchQuery}" 😿
                    </p>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="mt-3 text-xs text-coral font-bold hover:underline"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
