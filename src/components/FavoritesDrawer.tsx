import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useFavorites } from "@/context/FavoritesContext";
import { useCart } from "@/context/CartContext";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { resolveImage } from "@/lib/image-resolver";

export function FavoritesDrawer() {
  const navigate = useNavigate();
  const {
    favoriteItems,
    isFavoritesOpen,
    closeFavorites,
    toggleFavorite,
  } = useFavorites();

  const { addToCart, openCart } = useCart();

  const handleAddToCart = (product: any) => {
    // Parse numeric price
    const numericPrice = parseFloat(product.price.replace(/[^\d.]/g, "")) || 0;
    addToCart({
      id: product.id || product.name,
      name: product.name,
      price: numericPrice,
      priceString: product.price,
      img: product.img,
      weight: product.weight,
      quantity: 1,
    });
    closeFavorites();
    openCart();
  };

  const handleProductClick = (productName: string) => {
    closeFavorites();
    navigate({ to: "/product/$productId", params: { productId: productName } });
  };

  return (
    <Sheet open={isFavoritesOpen} onOpenChange={closeFavorites}>
      <SheetContent
        side="right"
        className="w-[90vw] sm:max-w-md p-6 bg-cream border-l-2 border-yellow/30 flex flex-col h-full z-50 focus:outline-none"
      >
        <SheetHeader className="pb-4 border-b border-purple/10">
          <SheetTitle className="font-display text-2xl text-purple flex items-center gap-2">
            💖 Your Wishlist
          </SheetTitle>
        </SheetHeader>

        {favoriteItems.length === 0 ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-5">
            <div className="w-24 h-24 rounded-full bg-coral/10 grid place-items-center text-4xl select-none animate-bounce">
              🌸
            </div>
            <div>
              <h3 className="font-display text-xl text-purple font-bold">Your wishlist is empty!</h3>
              <p className="text-sm text-foreground/60 mt-2 font-body leading-relaxed max-w-[280px] mx-auto">
                Tap the heart on any product to save it here for later! 💕
              </p>
            </div>
            <button
              onClick={closeFavorites}
              className="px-6 py-3 rounded-full bg-purple text-white text-xs font-bold shadow-[0_4px_0_0_#492275] hover:translate-y-0.5 hover:shadow-[0_1px_0_0_#492275] transition-all cursor-pointer"
            >
              Browse Products
            </button>
          </div>
        ) : (
          /* Items List */
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              <div className="space-y-3.5">
                {favoriteItems.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-purple/10 shadow-sm hover:shadow-md transition-all group"
                  >
                    {/* Item Image */}
                    <div
                      onClick={() => handleProductClick(item.name)}
                      className="w-16 h-16 rounded-xl border border-purple/10 overflow-hidden shrink-0 bg-cream/10 cursor-pointer hover:opacity-95 transition"
                    >
                      <img src={resolveImage(item.img)} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4
                        onClick={() => handleProductClick(item.name)}
                        className="font-semibold text-xs text-foreground truncate cursor-pointer hover:text-coral transition"
                        title={item.name}
                      >
                        {item.name}
                      </h4>
                      <div className="text-xs font-bold text-purple">{item.price}</div>

                      <div className="flex items-center justify-between pt-1 gap-2">
                        {/* Quick Add to Cart */}
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange/10 hover:bg-orange text-orange hover:text-white transition-all text-[10px] font-bold cursor-pointer"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          Add to Cart
                        </button>

                        {/* Remove from wishlist */}
                        <button
                          onClick={() => toggleFavorite(item)}
                          className="p-1.5 rounded-full text-foreground/40 hover:text-coral hover:bg-coral/5 transition-colors cursor-pointer"
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer with a cute note */}
            <div className="pt-4 border-t border-purple/10 space-y-4">
              <div className="bg-orange/5 border border-orange/10 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-orange font-medium leading-relaxed font-body">
                <span>🎀</span>
                <p>
                  Wishlist items are saved on this device so you can view them anytime! Happy creating! 🌸
                </p>
              </div>

              <button
                onClick={closeFavorites}
                className="w-full py-4 rounded-full bg-purple hover:bg-purple/95 text-white font-bold shadow-[0_5px_0_0_#492275] hover:translate-y-0.5 hover:shadow-[0_2px_0_0_#492275] transition-all cursor-pointer text-xs font-display flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                Continue Browsing
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
