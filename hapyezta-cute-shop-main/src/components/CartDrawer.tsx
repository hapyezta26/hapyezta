import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductContext";
import { calculateShippingCost } from "@/lib/products";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { resolveImage } from "@/lib/image-resolver";

export function CartDrawer() {
  const navigate = useNavigate();
  const {
    cartItems,
    cartTotal,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
  } = useCart();
  const { products } = useProducts();

  const totalWeightGrams = cartItems.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.id);
    const weight = product?.weight ?? 500;
    return sum + (weight * item.quantity);
  }, 0);

  const SHIPPING_COST = calculateShippingCost(totalWeightGrams);
  const finalShippingCost = SHIPPING_COST;
  const grandTotal = cartTotal + finalShippingCost;

  return (
    <Sheet open={isCartOpen} onOpenChange={closeCart}>
      <SheetContent
        side="right"
        className="w-[90vw] sm:max-w-md p-6 bg-cream border-l-2 border-yellow/30 flex flex-col h-full z-50 focus:outline-none"
      >
        <SheetHeader className="pb-4 border-b border-purple/10">
          <SheetTitle className="font-display text-2xl text-purple flex items-center gap-2">
            🛍️ Your Kawaii Cart
          </SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-5">
            <div className="w-24 h-24 rounded-full bg-coral/10 grid place-items-center text-4xl select-none animate-bounce">
              😿
            </div>
            <div>
              <h3 className="font-display text-xl text-purple font-bold">Your cart is empty!</h3>
              <p className="text-sm text-foreground/60 mt-2 font-body leading-relaxed max-w-[280px] mx-auto">
                Fill it with cute journals, stationery, and other lovely creations! 🌸
              </p>
            </div>
            <button
              onClick={closeCart}
              className="px-6 py-3 rounded-full bg-purple text-white text-xs font-bold shadow-[0_4px_0_0_#492275] hover:translate-y-0.5 hover:shadow-[0_1px_0_0_#492275] transition-all cursor-pointer"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          /* Cart Items & Footer */
          <>
            {/* Scrollable Items List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">


              {/* Items */}
              <div className="space-y-3.5">
                {cartItems.map((item) => (
                  <div
                    key={`${item.id}-${item.color}`}
                    className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-purple/10 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Item Image */}
                    <div className="w-16 h-16 rounded-xl border border-purple/10 overflow-hidden shrink-0 bg-cream/10">
                      <img src={resolveImage(item.img)} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-semibold text-xs text-foreground truncate" title={item.name}>
                        {item.name}
                      </h4>
                      {item.color && (
                        <span className="inline-block text-[9px] px-2 py-0.5 rounded-full bg-purple/5 text-purple font-semibold">
                          Color: {item.color}
                        </span>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-bold text-purple">{item.priceString}</span>

                        {/* Quantity controls */}
                        <div className="flex items-center border border-purple/15 rounded-full overflow-hidden bg-cream/5">
                          <button
                            onClick={() => updateQuantity(item.id, item.color, item.quantity - 1)}
                            className="p-1 px-2 hover:bg-cream transition text-purple/60 hover:text-purple cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-1 text-[11px] font-bold text-purple select-none min-w-[1.25rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.color, item.quantity + 1)}
                            className="p-1 px-2 hover:bg-cream transition text-purple/60 hover:text-purple cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeFromCart(item.id, item.color)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition cursor-pointer shrink-0"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Footer / Checkout details */}
            <div className="pt-4 border-t border-purple/10 space-y-4 bg-cream">
              <div className="space-y-1.5 font-body">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Shipping</span>
                  <span>₹{SHIPPING_COST}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-purple pt-1.5 border-t border-purple/5">
                  <span>Total</span>
                  <span>₹{grandTotal}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  closeCart();
                  navigate({ to: "/checkout" });
                }}
                className="w-full py-3.5 rounded-full bg-coral hover:bg-coral/95 text-white font-bold shadow-[0_4px_0_0_#c4513f] hover:translate-y-0.5 hover:shadow-[0_1px_0_0_#c4513f] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                Checkout Now <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
