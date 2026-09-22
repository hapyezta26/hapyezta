import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Heart, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Header } from "@/components/Header";
import { MarqueeBanner } from "@/components/MarqueeBanner";
import { Footer } from "@/components/Footer";
import { useProducts } from "@/context/ProductContext";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { resolveImage } from "@/lib/image-resolver";

type ProductSearch = {
  category?: string;
};

export const Route = createFileRoute("/products")({
  validateSearch: (search: Record<string, unknown>): ProductSearch => {
    return {
      category: search.category ? String(search.category) : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "All Kawaii Products - Hapyezta" },
      { name: "description", content: "Explore our complete cute collection of kawaii stationery, pencil cases, journals, and bottles." },
    ],
  }),
  component: ProductsList,
});

// Custom Cute Select component that matches the theme of the website
function CuteSelect({
  value,
  onChange,
  options,
  placeholder = "Select Option",
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full md:w-56">
      {/* Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 rounded-full border-2 border-yellow/20 focus:border-orange bg-cream/10 text-sm outline-none transition font-body flex items-center justify-between cursor-pointer select-none text-purple font-semibold"
      >
        <span>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className={`text-[10px] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
          🌸
        </span>
      </div>

      {/* Backdrop for closing */}
      {isOpen && (
        <div
          className="fixed inset-0 z-10 cursor-default"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Options List */}
      {isOpen && (
        <div className="absolute z-20 w-full mt-2 bg-white rounded-2xl border-2 border-yellow/20 shadow-lg max-h-60 overflow-y-auto animate-fade-in p-1">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`px-4 py-2.5 text-sm rounded-xl cursor-pointer hover:bg-cream/40 transition text-left ${
                value === opt.value ? "bg-cream text-purple font-semibold" : "text-foreground/80"
              }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductsList() {
  const search = Route.useSearch();
  const initialCategory = search.category || "All";
  const { products, categories } = useProducts();
  const { openCart, addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("default");

  // Sync category search parameter to state when it changes
  useEffect(() => {
    setSelectedCategory(search.category || "All");
  }, [search.category]);

  // Filtering products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sorting products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = parseFloat(a.price.replace(/[^\d.]/g, ""));
    const priceB = parseFloat(b.price.replace(/[^\d.]/g, ""));
    if (sortBy === "price-asc") return priceA - priceB;
    if (sortBy === "price-desc") return priceB - priceA;
    return 0;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        <MarqueeBanner />
        <Header />

        <main className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-foreground/60 mb-6 sm:mb-8">
            <Link to="/" className="hover:text-coral transition font-semibold">Home</Link>
            <span>/</span>
            <span className="text-purple font-bold">All Products</span>
          </div>

          {/* Heading */}
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-purple font-bold">
              Our Cute Collection
            </h1>
            <p className="mt-3 text-base sm:text-lg text-foreground/70 max-w-md mx-auto">
              Browse through our adorable, handpicked selection to find your perfect kawaii matches!
            </p>
          </div>

          {/* Search, Filter & Sort Controls */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-yellow/20 shadow-[0_12px_40px_rgba(127,88,165,0.04)] mb-8 sm:mb-10 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search input */}
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30" />
                <input
                  type="text"
                  placeholder="Search cute picks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-3.5 rounded-full border-2 border-yellow/20 focus:border-orange bg-cream/10 text-sm outline-none transition font-body text-foreground placeholder:text-foreground/30"
                />
              </div>

              {/* Sort selector */}
              <div className="relative w-full md:w-auto shrink-0 flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-purple" />
                <CuteSelect
                  value={sortBy}
                  onChange={setSortBy}
                  options={[
                    { value: "default", label: "Sort by: Featured" },
                    { value: "price-asc", label: "Price: Low to High" },
                    { value: "price-desc", label: "Price: High to Low" },
                  ]}
                />
              </div>
            </div>

            {/* Category pills */}
            <div className="pt-2">
              <div className="text-xs font-display font-bold text-orange tracking-widest uppercase mb-3 text-left">
                Filter by Category
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory("All")}
                  className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer ${
                    selectedCategory === "All"
                      ? "bg-purple text-white shadow-sm"
                      : "bg-cream/40 border border-yellow/20 text-purple hover:bg-cream/80"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer ${
                      selectedCategory === cat.name
                        ? "bg-purple text-white shadow-sm"
                        : "bg-cream/40 border border-yellow/20 text-purple hover:bg-cream/80"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {sortedProducts.map((p) => {
                const catColor = categories.find((c) => c.name === p.category)?.color || "var(--purple)";
                return (
                  <article 
                    key={p.name} 
                    className="rounded-[2rem] overflow-hidden transition group flex flex-col justify-between p-3 shadow-md hover:scale-[1.02] hover:-rotate-1 duration-300"
                    style={{ backgroundColor: catColor }}
                  >
                    <div className="w-full h-full rounded-2xl overflow-hidden bg-white flex flex-col justify-between">
                      {/* Image container */}
                      <div className="relative aspect-square overflow-hidden bg-white">
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

                      {/* Details container */}
                      <div className="p-4 flex-1 flex flex-col justify-between bg-cream/30 border-t border-purple/5">
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
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16 bg-white rounded-[2rem] border-2 border-yellow/20 p-8">
              <span className="text-5xl">🌸</span>
              <h3 className="font-display text-2xl text-purple mt-4 font-bold">No cute matches found</h3>
              <p className="text-foreground/60 text-sm mt-2 max-w-sm mx-auto">
                We couldn't find any products matching your search criteria. Try using different filters or search terms!
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSortBy("default");
                }}
                className="mt-6 px-6 py-2.5 rounded-full bg-orange hover:bg-coral text-white font-bold transition text-sm cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
