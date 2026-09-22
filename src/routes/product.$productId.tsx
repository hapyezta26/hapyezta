import { useState, useEffect } from "react";
import { createFileRoute, Link, useRouter, useNavigate } from "@tanstack/react-router";
import {
  Heart,
  ShoppingCart,
  Truck,
  Star,
  ArrowLeft,
  Minus,
  Plus,
  Check,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useProducts } from "@/context/ProductContext";
import { Header } from "@/components/Header";
import { MarqueeBanner } from "@/components/MarqueeBanner";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { resolveImage } from "@/lib/image-resolver";

export const Route = createFileRoute("/product/$productId")({
  component: ProductDetails,
});

function ProductDetails() {
  const { cartCount, openCart, addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { productId } = Route.useParams();
  const { products, categories } = useProducts();
  const product = products.find((p) => p.id === productId);
  const catColor = product ? (categories.find((c) => c.name === product.category)?.color || "var(--purple)") : "var(--purple)";
  const router = useRouter();
  const navigate = useNavigate();

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  // Product states
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(
    product && product.colors.length > 0 ? product.colors[0] : ""
  );
  const [activeTab, setActiveTab] = useState("description"); // "description" | "details"

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center max-w-md mx-auto">
          <div className="w-24 h-24 rounded-full bg-coral/10 grid place-items-center text-4xl mb-6 select-none animate-bounce">
            😿
          </div>
          <h1 className="font-display text-3xl text-purple">Product Not Found</h1>
          <p className="mt-3 text-foreground/75 font-body text-sm leading-relaxed">
            Oops! The cute product you are looking for doesn't exist or has wandered off.
          </p>
          <Link
            to="/"
            className="mt-8 px-7 py-3 rounded-full bg-coral text-white font-bold shadow-[0_6px_0_0_#c4513f] hover:translate-y-0.5 hover:shadow-[0_2px_0_0_#c4513f] transition-all"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleIncreaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price.replace(/[^\d.]/g, "")),
      priceString: product.price,
      img: product.img,
      color: selectedColor || undefined,
      weight: product.weight,
      quantity: quantity,
    });
    openCart();
  };

  const handleNotifyMe = () => {
    alert(`We will notify you when ${product.name} is back in stock! 🌸`);
  };

  return (
    <div className="min-h-screen bg-background pb-16 lg:pb-0">
      <MarqueeBanner />

      <Header />

      {/* Main product area */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumbs & Back link */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 text-sm">
          <div className="flex items-center gap-2 text-foreground/60">
            <Link to="/" className="hover:text-coral transition font-semibold">Home</Link>
            <span>/</span>
            <Link to="/" hash="collection" className="hover:text-coral transition font-semibold">Shop</Link>
            <span>/</span>
            <span className="text-purple font-bold truncate max-w-[200px]">{product.name}</span>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-purple hover:text-coral font-bold transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>
        </div>

        {/* Content columns */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: Product Image */}
          <div className="lg:col-span-7 relative">
            <div 
              className="relative rounded-[2rem] overflow-hidden border-8 shadow-xl aspect-square bg-white rotate-[-1deg] hover:rotate-0 transition-all duration-300"
              style={{ borderColor: catColor }}
            >
              {product.tag && (
                <span className="absolute top-4 left-4 z-10 bg-coral text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow">
                  {product.tag}
                </span>
              )}
              <button
                onClick={() => toggleFavorite(product)}
                className={`absolute top-4 right-4 z-10 w-10 h-10 rounded-full grid place-items-center transition shadow cursor-pointer ${
                  isFavorite(product.name)
                    ? "bg-coral text-white"
                    : "bg-white text-coral hover:bg-coral hover:text-white"
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite(product.name) ? "fill-white" : ""}`} />
              </button>
               <img
                src={resolveImage(product.img)}
                alt={product.name}
                className="w-full h-full object-contain p-2"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-yellow rounded-full -z-10 opacity-60" />
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-teal rounded-full -z-10 opacity-60" />
          </div>

          {/* Right: Product Info */}
          <div className="lg:col-span-5 space-y-6 bg-white/50 backdrop-blur-sm p-6 sm:p-8 rounded-[2rem] border-2 border-yellow/20">
            {/* Category & Rating */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-semibold text-teal uppercase tracking-widest bg-teal/10 px-3 py-1 rounded-full">
                {product.category}
              </span>
              <div className="flex items-center gap-1 text-yellow">
                <Star className="w-4 h-4 fill-yellow" />
                <Star className="w-4 h-4 fill-yellow" />
                <Star className="w-4 h-4 fill-yellow" />
                <Star className="w-4 h-4 fill-yellow" />
                <Star className="w-4 h-4 fill-yellow" />
                <span className="text-xs text-foreground/50 font-bold ml-1">(5.0)</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="font-display text-3xl sm:text-4xl text-purple leading-tight">
              {product.name}
            </h1>

            {/* Price & Stock */}
            <div className="flex items-center justify-between gap-4 flex-wrap border-y border-purple/5 py-4">
              <div className="flex items-baseline gap-2.5">
                <span className="font-display text-3xl text-purple">{product.price}</span>
                {product.oldPrice && (
                  <span className="text-sm text-foreground/40 line-through">
                    {product.oldPrice}
                  </span>
                )}
              </div>

              {/* Stock status tag */}
              <div>
                {product.stockStatus === "in_stock" && (
                  <span className="bg-teal/10 text-teal px-3 py-1 rounded-full text-xs font-bold border border-teal/20">
                    ✓ In Stock
                  </span>
                )}
                {product.stockStatus === "low_stock" && (
                  <span className="bg-orange/10 text-orange px-3 py-1 rounded-full text-xs font-bold border border-orange/20 animate-pulse">
                    ⚠️ Low Stock
                  </span>
                )}
                {product.stockStatus === "sold_out" && (
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
                    ✕ Sold Out
                  </span>
                )}
              </div>
            </div>

            {/* Colors Selection */}
            {product.colors.length > 0 && (
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-purple uppercase tracking-wider">
                  Color: <span className="text-coral">{selectedColor}</span>
                </div>
                <div className="flex gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer border-2 ${
                        selectedColor === color
                          ? "border-coral bg-coral text-white"
                          : "border-purple/10 bg-white text-purple hover:border-purple/30"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector (Hidden if sold out) */}
            {product.stockStatus !== "sold_out" && (
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-purple uppercase tracking-wider block">
                  Quantity
                </span>
                <div className="inline-flex items-center bg-white border-2 border-purple/15 rounded-full overflow-hidden">
                  <button
                    onClick={handleDecreaseQuantity}
                    className="p-3 hover:bg-cream transition text-purple cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-5 font-bold text-sm text-purple select-none min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncreaseQuantity}
                    className="p-3 hover:bg-cream transition text-purple cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="pt-2 space-y-3">
              {product.stockStatus !== "sold_out" ? (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-4 rounded-full bg-purple hover:bg-purple/95 text-white font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <ShoppingCart className="w-4 h-4" /> Add to cart
                  </button>
                  <button
                    onClick={() => {
                      addToCart({
                        id: product.id,
                        name: product.name,
                        price: parseFloat(product.price.replace(/[^\d.]/g, "")),
                        priceString: product.price,
                        img: product.img,
                        color: selectedColor || undefined,
                        weight: product.weight,
                        quantity: quantity,
                      });
                      navigate({ to: "/checkout" });
                    }}
                    className="w-full py-4 rounded-full bg-coral hover:bg-coral/95 text-white font-bold text-sm shadow-[0_4px_0_0_#c4513f] hover:translate-y-0.5 hover:shadow-[0_1px_0_0_#c4513f] transition-all duration-300 cursor-pointer"
                  >
                    Buy it now
                  </button>
                </>
              ) : (
                <>
                  <button
                    disabled
                    className="w-full py-4 rounded-full border-2 border-red-200 text-red-400 bg-white/70 font-bold text-sm cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    <AlertCircle className="w-4 h-4" /> Sold out
                  </button>
                  <button
                    onClick={handleNotifyMe}
                    className="w-full py-4 rounded-full bg-coral hover:bg-coral/95 text-white font-bold text-sm shadow-[0_4px_0_0_#c4513f] hover:translate-y-0.5 hover:shadow-[0_1px_0_0_#c4513f] transition-all duration-300 cursor-pointer"
                  >
                    Notify Me
                  </button>
                </>
              )}
            </div>

            {/* Badges / Guarantees */}
            <div className="pt-4 border-t border-purple/5 grid grid-cols-2 gap-4 text-xs font-semibold text-foreground/70">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-teal" />
                <span>Pan-India Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange" />
                <span>100% Kawaii Quality</span>
              </div>
            </div>

            {/* Tabs for Details / Description */}
            <div className="pt-4 border-t border-purple/5 space-y-4">
              <div className="flex border-b border-purple/10">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`pb-2 pr-4 font-display text-sm font-semibold transition cursor-pointer relative ${
                    activeTab === "description" ? "text-purple" : "text-foreground/40"
                  }`}
                >
                  Description
                  {activeTab === "description" && (
                    <span className="absolute bottom-0 left-0 right-4 h-0.5 bg-purple" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("details")}
                  className={`pb-2 px-4 font-display text-sm font-semibold transition cursor-pointer relative ${
                    activeTab === "details" ? "text-purple" : "text-foreground/40"
                  }`}
                >
                  Product Details
                  {activeTab === "details" && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-purple" />
                  )}
                </button>
              </div>

              <div className="text-sm text-foreground/75 leading-relaxed font-body">
                {activeTab === "description" ? (
                  <p>{product.description}</p>
                ) : (
                  <ul className="space-y-1.5 list-disc pl-5">
                    {product.details.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* You May Also Like Section */}
        <section className="mt-16 pt-12 border-t border-purple/10">
          <h2 className="font-display text-2xl sm:text-3xl text-purple mb-8 text-center">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {products
              .filter((p) => p.id !== product.id)
              .slice(0, 4)
              .map((p) => {
                const catColor = categories.find((c) => c.name === p.category)?.color || "var(--purple)";
                return (
                  <article key={p.name} className="bg-cream rounded-3xl overflow-hidden border-2 border-transparent hover:border-coral transition group flex flex-col justify-between shadow-sm">
                    <div className="p-3" style={{ backgroundColor: catColor }}>
                      <div className="relative aspect-square rounded-2xl overflow-hidden bg-white">
                        {p.tag && (
                          <span className="absolute top-3 left-3 z-10 bg-coral text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                            {p.tag}
                          </span>
                        )}
                        <Link to="/product/$productId" params={{ productId: p.id }} className="block w-full h-full">
                          <img
                            src={p.img}
                            alt={p.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        </Link>
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <Link to="/product/$productId" params={{ productId: p.id }} className="hover:text-coral transition">
                          <h3 className="font-semibold text-sm sm:text-base text-foreground line-clamp-2 min-h-[2.5rem]">
                            {p.name}
                          </h3>
                        </Link>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="font-display text-lg text-purple">{p.price}</span>
                          {p.oldPrice && (
                            <span className="text-xs text-foreground/40 line-through">
                              {p.oldPrice}
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        to="/product/$productId"
                        params={{ productId: p.id }}
                        className="mt-3 w-full py-2 rounded-full bg-purple hover:bg-coral text-white text-sm font-semibold text-center transition block"
                      >
                        View Details
                      </Link>
                    </div>
                  </article>
                );
              })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
