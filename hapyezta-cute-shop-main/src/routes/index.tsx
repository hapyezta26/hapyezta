// Triggering Vercel auto-deployment under Alwin's profile 🌸
import { useState, useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Heart, ShoppingBag, Star, Truck, Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
import { MarqueeBanner } from "@/components/MarqueeBanner";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import hero from "@/assets/hero.jpg";
import heroSlide1 from "@/assets/hero_slide_1.png";
import heroSlide2 from "@/assets/hero_slide_2.png";
import heroSlide3 from "@/assets/hero_slide_3.png";
import { useProducts } from "@/context/ProductContext";
import { resolveImage } from "@/lib/image-resolver";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hapyezta" },
      { name: "description", content: "Shop adorable kawaii stationery, pencil cases, journals, water bottles and gift sets. Pan-India delivery on the cutest collection in town." },
      { property: "og:title", content: "Hapyezta" },
      { property: "og:description", content: "Adorable kawaii stationery, journals & gift sets. Pan-India delivery." },
    ],
  }),
  component: Index,
});

const testimonials = [
  {
    name: "Aarushi K.",
    emoji: "👧",
    stars: 5,
    text: "I ordered the lavender journal kit and it's absolutely the cutest thing I own. Packaging was so thoughtful — felt like unwrapping a present. Will be ordering again very soon!",
  },
  {
    name: "Kabir M.",
    emoji: "👦",
    stars: 5,
    text: "The Kawaii Duck Organizer is perfect for my study desk! It holds all my pastel markers and looks so adorable. Shipping was super fast too. Highly recommended!",
  },
  {
    name: "Ananya S.",
    emoji: "👩",
    stars: 5,
    text: "Absolutely in love with the sticker packs and school bags! The quality of the prints is amazing, and my daughter is so happy with her new puppy lunch bag. 10/10!",
  },
];

function Index() {
  const { products, categories, heroImages = [], dbError } = useProducts();
  const { cartCount, openCart, addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [activeFeaturedTab, setActiveFeaturedTab] = useState<"best" | "new">("best");
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const reviewContainerRef = useRef<HTMLDivElement>(null);

  // If navigated here with #featured hash (from "New In" nav), switch to New In tab
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#featured" || hash === "#newin") {
      setActiveFeaturedTab("new");
      setTimeout(() => {
        document.getElementById("featured")?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }
  }, []);

  // Listen for the custom event dispatched by Header when already on home page
  useEffect(() => {
    const handler = () => {
      setActiveFeaturedTab("new");
    };
    window.addEventListener("switchToNewIn", handler);
    return () => window.removeEventListener("switchToNewIn", handler);
  }, []);

  const handleReviewScroll = () => {
    if (!reviewContainerRef.current) return;
    const scrollLeft = reviewContainerRef.current.scrollLeft;
    const clientWidth = reviewContainerRef.current.clientWidth;
    const index = Math.round(scrollLeft / clientWidth);
    if (index >= 0 && index < testimonials.length) {
      setActiveReviewIndex(index);
    }
  };
  const bannerImages = (heroImages.length > 0 ? heroImages : ["hero", "hero_slide_1", "hero_slide_2", "hero_slide_3"]).map(resolveImage);

  const displayedProducts = products.filter((p) => {
    if (activeFeaturedTab === "best") {
      return (
        p.tag === "Best Sellers" ||
        p.tag === "Sale" ||
        p.tag === "Hot" ||
        p.id === "kawaii-bear-pen-holder" ||
        p.id === "kawaii-water-bottle"
      );
    } else {
      return (
        p.tag === "New In" ||
        p.tag === "New" ||
        p.id === "aesthetic-sticker-pack" ||
        p.id === "girly-hearts-stickers" ||
        p.id === "lavender-journal-kit" ||
        p.id === "plush-bear-backpack"
      );
    }
  });

  const finalProducts = displayedProducts.length > 0 ? displayedProducts : products;

  useEffect(() => {
    if (bannerImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % bannerImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [bannerImages.length]);

  return (
    <div className="min-h-screen bg-background pb-16 lg:pb-0">
      <MarqueeBanner />
      <Header />

      {dbError && (
        <div className="max-w-7xl mx-auto px-4 mt-6">
          <div className="bg-coral/10 border-2 border-coral/20 text-coral px-6 py-4 rounded-3xl text-sm font-body shadow-sm flex flex-col gap-1">
            <span className="font-bold font-display text-base">⚠️ Database Connection/Loading Error:</span>
            <code className="bg-white/50 p-2 rounded-xl text-xs block overflow-x-auto">{dbError}</code>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 pt-10 pb-16 grid lg:grid-cols-2 gap-10 items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-yellow/30 text-purple px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
              <Sparkles className="w-4 h-4" /> Back to School Drop
            </div>
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl leading-[1.1] sm:leading-[0.95] text-purple">
              <span className="block whitespace-nowrap">Where Happy</span>
              <span className="block whitespace-nowrap">
                <span className="text-orange">Creation </span>
                <span className="text-orange">Begin.</span>
              </span>
            </h1>
            <p className="mt-5 text-lg text-foreground/70 max-w-md">
              Kawaii stationery, dreamy journals & gift sets handpicked to make every desk a little happier.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#collection" className="px-7 py-3.5 rounded-full bg-coral text-white font-bold shadow-[0_6px_0_0_#c4513f] hover:translate-y-0.5 hover:shadow-[0_2px_0_0_#c4513f] transition-all">
                Explore Collection
              </a>
              <a href="#featured" className="px-7 py-3.5 rounded-full bg-white border-2 border-purple text-purple font-bold hover:bg-purple hover:text-white transition">
                New arrivals
              </a>
            </div>
            <div className="mt-8 flex gap-6 text-sm">
              <div><div className="font-display text-2xl text-teal">500+</div><div className="text-foreground/60">Cute picks</div></div>
              <div><div className="font-display text-2xl text-orange">10k+</div><div className="text-foreground/60">Happy fans</div></div>
              <div><div className="font-display text-2xl text-purple">4.9★</div><div className="text-foreground/60">Reviews</div></div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-6 -right-6 w-40 h-40 bg-yellow rounded-full -z-0" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-teal rounded-full -z-0" />
            <div className="relative rounded-[2rem] overflow-hidden border-8 border-white shadow-2xl rotate-[-2deg] aspect-square w-full">
              {bannerImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt="Kawaii stationery collection"
                  width={1024}
                  height={1024}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                    index === currentHeroIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                />
              ))}
            </div>
            <div className="absolute top-4 -left-2 bg-white rounded-2xl shadow-xl px-3 py-2 rotate-[-8deg] text-xs font-bold text-coral flex items-center gap-1.5 z-20">
              <Star className="w-3 h-3 fill-coral" /> So cute!
            </div>
            <div className="absolute bottom-6 -right-2 bg-white rounded-2xl shadow-xl px-3 py-2 rotate-[6deg] text-xs font-bold text-teal flex items-center gap-1.5 z-20">
              <Truck className="w-3 h-3" /> Fast shipping
            </div>
          </div>
        </div>
      </section>

      {/* Collection */}
      <section id="collection" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-coral font-semibold tracking-widest text-xs uppercase">Browse</div>
            <h2 className="font-display text-4xl sm:text-5xl text-purple mt-2">Our Collection</h2>
            <div className="flex justify-center gap-1 mt-3">
              <span className="w-2 h-2 rounded-full bg-teal" />
              <span className="w-2 h-2 rounded-full bg-orange" />
              <span className="w-2 h-2 rounded-full bg-yellow" />
              <span className="w-2 h-2 rounded-full bg-purple" />
              <span className="w-2 h-2 rounded-full bg-coral" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {categories.map((c) => (
              <Link key={c.name} to="/products" search={{ category: c.name }} className="group">
                <div className="aspect-square rounded-3xl overflow-hidden shadow-md group-hover:scale-105 group-hover:-rotate-2 transition-transform p-3" style={{ backgroundColor: c.color }}>
                  <div className="w-full h-full rounded-2xl overflow-hidden bg-white">
                    <img src={resolveImage(c.img)} alt={c.name} loading="lazy" width={600} height={600} className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="mt-3 text-center font-semibold text-sm sm:text-base text-foreground group-hover:text-coral transition">
                  {c.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section id="featured" className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4">
            <div>
              <div className="text-teal font-semibold tracking-widest text-xs uppercase">Featured</div>
              <h2 className="font-display text-4xl sm:text-5xl text-purple mt-2">
                {activeFeaturedTab === "best" ? "Best Sellers" : "New In"}
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveFeaturedTab("best")}
                className={`px-5 py-2 rounded-full font-semibold text-sm transition cursor-pointer ${
                  activeFeaturedTab === "best"
                    ? "bg-purple text-white"
                    : "border-2 border-purple/30 text-purple hover:bg-purple/5"
                }`}
              >
                Best Sellers
              </button>
              <button
                onClick={() => setActiveFeaturedTab("new")}
                className={`px-5 py-2 rounded-full font-semibold text-sm transition cursor-pointer ${
                  activeFeaturedTab === "new"
                    ? "bg-purple text-white"
                    : "border-2 border-purple/30 text-purple hover:bg-purple/5"
                }`}
              >
                New In
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {finalProducts.slice(0, 4).map((p) => {
              const catColor = categories.find((c) => c.name === p.category)?.color || "var(--purple)";
              return (
                <article key={p.name} className="bg-cream rounded-3xl overflow-hidden border-2 border-transparent hover:border-coral transition group flex flex-col justify-between shadow-sm">
                  <div className="p-3 animate-fade-in" style={{ backgroundColor: catColor }}>
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-white">
                      {p.tag && (
                        <span className="absolute top-3 left-3 z-10 bg-coral text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {p.tag}
                        </span>
                      )}
                      <button
                        onClick={() => toggleFavorite(p)}
                        className="absolute top-3 right-3 z-10 w-9 h-9 bg-white rounded-full grid place-items-center text-coral hover:bg-coral hover:text-white transition shadow cursor-pointer"
                        aria-label={isFavorite(p.name) ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Heart className={`w-4 h-4 ${isFavorite(p.name) ? "fill-coral text-coral" : ""}`} />
                      </button>
                      <Link to="/product/$productId" params={{ productId: p.id }} className="block w-full h-full">
                        <img src={resolveImage(p.img)} alt={p.name} loading="lazy" width={800} height={800} className="w-full h-full object-cover group-hover:scale-105 transition" />
                      </Link>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <Link to="/product/$productId" params={{ productId: p.id }} className="hover:text-coral transition">
                        <h3 className="font-semibold text-sm sm:text-base text-foreground line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
                      </Link>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="font-display text-lg text-purple">{p.price}</span>
                        {p.oldPrice && <span className="text-xs text-foreground/40 line-through">{p.oldPrice}</span>}
                      </div>
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
                        openCart();
                      }}
                      className="mt-3 w-full py-2 rounded-full bg-purple text-white text-sm font-semibold hover:bg-coral transition cursor-pointer"
                    >
                      Add to cart
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link to="/products" className="inline-block px-8 py-3 rounded-full border-2 border-purple text-purple font-bold hover:bg-purple hover:text-white transition cursor-pointer">
              View all →
            </Link>
          </div>
        </div>
      </section>

      {/* Banner strip */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-3 gap-4">
          {[
            { c: "var(--teal)", t: "Fast Shipping", s: "Ships within 24-48 hours", icon: <Truck className="w-6 h-6" /> },
            { c: "var(--orange)", t: "Delivery All Over India", s: "Available across India", icon: <ShoppingBag className="w-6 h-6" /> },
            { c: "var(--coral)", t: "Loved by 10k+", s: "5-star kawaii fans", icon: <Heart className="w-6 h-6" /> },
          ].map((b) => (
            <div key={b.t} className="rounded-3xl p-6 text-white flex items-center gap-4" style={{ backgroundColor: b.c }}>
              <div className="w-12 h-12 bg-white/25 rounded-2xl grid place-items-center">{b.icon}</div>
              <div>
                <div className="font-display text-xl">{b.t}</div>
                <div className="text-sm opacity-90">{b.s}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" className="py-16 px-4 bg-yellow/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-orange font-semibold tracking-widest text-xs uppercase">Love Notes</div>
            <h2 className="font-display text-4xl sm:text-5xl text-purple mt-2">What our clients say</h2>
            
            {/* Desktop colored dots decoration */}
            <div className="hidden md:flex justify-center gap-1 mt-3">
              <span className="w-2.5 h-2.5 rounded-full bg-teal" />
              <span className="w-2.5 h-2.5 rounded-full bg-orange" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow" />
            </div>

            {/* Mobile Carousel Indicators */}
            <div className="flex md:hidden justify-center gap-2 mt-3">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (reviewContainerRef.current) {
                      const container = reviewContainerRef.current;
                      const cardWidth = container.scrollWidth / testimonials.length;
                      container.scrollTo({
                        left: cardWidth * idx,
                        behavior: "smooth"
                      });
                      setActiveReviewIndex(idx);
                    }
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 border-none outline-none p-0 cursor-pointer ${
                    activeReviewIndex === idx ? "bg-teal w-6" : "bg-orange/40"
                  }`}
                  aria-label={`Go to review ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          <div
            ref={reviewContainerRef}
            onScroll={handleReviewScroll}
            className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 no-scrollbar md:grid md:grid-cols-3 md:overflow-x-visible md:pb-0"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition duration-300 border-2 border-transparent hover:border-yellow/30 snap-center shrink-0 w-[85vw] sm:w-[320px] md:w-auto md:shrink"
              >
                <div>
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-coral to-purple grid place-items-center text-2xl mb-4 select-none">
                    {t.emoji}
                  </div>
                  <div className="font-display text-lg text-purple text-center font-semibold">{t.name}</div>
                  <div className="flex justify-center gap-0.5 my-2.5 text-yellow">
                    {[...Array(t.stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow text-yellow" />
                    ))}
                  </div>
                  <p className="text-foreground/75 italic text-sm leading-relaxed text-center mt-2 font-body">
                    "{t.text}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      <Footer />
    </div>
  );
}
