import { useState, useRef, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PlusCircle, CheckCircle, Image as ImageIcon, AlertCircle, Trash2, ChevronDown, ChevronUp, Clock, Package, Check, Mail, Phone, MapPin, DollarSign, ListOrdered, Calendar, LogOut, ArrowLeft, BarChart2, Tag, ShoppingBag, Users } from "lucide-react";
import { useProducts } from "@/context/ProductContext";
import { getOrdersFn, updateOrderStatusFn } from "@/lib/api/db.functions";
import { Logo } from "@/components/Logo";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { resolveImage } from "@/lib/image-resolver";

export const Route = createFileRoute("/nexus-control")({
  head: () => ({
    meta: [
      { title: "Control Panel - Hapyezta" },
      { name: "description", content: "Hapyezta Admin Control Panel. Add new products & view orders." },
    ],
  }),
  component: ControlPanel,
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
    <div className="relative">
      {/* Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 rounded-2xl bg-cream/35 border-2 border-purple/10 focus-within:border-coral outline-none text-sm transition font-body flex items-center justify-between cursor-pointer select-none bg-white/50"
      >
        <span className={selectedOption ? "text-foreground font-medium" : "text-foreground/40"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className={`text-xs transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
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
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center justify-between select-none ${
                value === opt.value
                  ? "bg-purple text-white"
                  : "text-purple hover:bg-cream hover:text-coral"
              }`}
            >
              <span>{opt.label}</span>
              {value === opt.value && <span className="text-xs">✨</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminHeader({
  isAuthenticated,
  onLogout,
}: {
  isAuthenticated: boolean;
  onLogout?: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b-2 border-yellow/30 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Left Side: Logo and Admin Console Badge */}
        <div className="flex items-center gap-3">
          <Link to="/" className="hover:opacity-90 transition flex items-center">
            <Logo size="sm" withSlogan={false} />
          </Link>
          <span className="h-5 w-[2px] bg-purple/20 hidden sm:block" />
          <div className="hidden sm:inline-flex items-center gap-1 bg-purple/10 text-purple px-3 py-1 rounded-full text-xs font-bold font-display">
            👑 Admin Console
          </div>
        </div>

        {/* Right Side: Back to Shop / Logout buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-purple/10 text-purple text-xs font-bold hover:bg-purple/5 transition bg-white/50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Go to Shop</span>
          </Link>
          {isAuthenticated && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 sm:px-4 rounded-full bg-coral hover:bg-coral/95 text-white text-xs font-bold shadow-[0_3px_0_0_#c4513f] hover:translate-y-0.5 hover:shadow-[0_1px_0_0_#c4513f] transition-all cursor-pointer"
              title="Exit Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit Admin</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

const PRESET_COLORS = [
  { name: "Pink", hex: "#FFC0CB" },
  { name: "Lavender", hex: "#D1C4E9" },
  { name: "Mint", hex: "#B2DFDB" },
  { name: "Sky Blue", hex: "#B3E5FC" },
  { name: "Yellow", hex: "#FFF9C4" },
  { name: "Peach", hex: "#FFE0B2" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Beige", hex: "#F5F5DC" },
  { name: "Black", hex: "#212121" },
];

function ControlPanel() {
  const { products, categories, addProduct, updateProduct, deleteProduct, addCategory, deleteCategory, updateCategory, heroImages = [], updateHeroImages } = useProducts();
  const [viewMode, setViewMode] = useState<"analytics" | "products" | "track-orders" | "categories" | "customers">("analytics");
  const [productMode, setProductMode] = useState<"list" | "add" | "edit">("list");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [customerProfiles, setCustomerProfiles] = useState<any[]>([]);

  // Check auth in sessionStorage on mount and load customer database
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const auth = sessionStorage.getItem("nexus-authenticated");
      if (auth === "true") {
        setIsAuthenticated(true);
      }

      try {
        const stored = localStorage.getItem("hapyezta-profiles");
        if (stored) {
          setCustomerProfiles(JSON.parse(stored));
        } else {
          const mockProfiles = [
            { name: "Alwin Jose George", emoji: "🌸", email: "alwinjosegeorge2028@cs.sjcetpalai.ac.in", phone: "8281251299" }
          ];
          setCustomerProfiles(mockProfiles);
          localStorage.setItem("hapyezta-profiles", JSON.stringify(mockProfiles));
        }
      } catch (e) {
        console.error("Failed to load customer profiles:", e);
      }
    }
  }, [viewMode]);

  const handleLogout = () => {
    sessionStorage.removeItem("nexus-authenticated");
    setIsAuthenticated(false);
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "5555") {
      sessionStorage.setItem("nexus-authenticated", "true");
      setIsAuthenticated(true);
      setPasscodeError("");
    } else {
      setPasscodeError("Incorrect access code 🌸 Please try again!");
      setPasscode("");
    }
  };

  // Notification state
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Image upload compression helper
  const compressImage = (file: File, callback: (base64: string) => void) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        callback(compressedBase64);
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  // --- Product Form State ---
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodOldPrice, setProdOldPrice] = useState("");
  const [prodCategory, setProdCategory] = useState(categories[0]?.name || "Cute Stationery");
  const [prodTag, setProdTag] = useState("");
  const [prodDescription, setProdDescription] = useState("");
  const [prodStockStatus, setProdStockStatus] = useState<"in_stock" | "low_stock" | "sold_out">("in_stock");
  const [prodColors, setProdColors] = useState("");
  const togglePresetColor = (colorName: string) => {
    const currentList = prodColors.split(",").map(c => c.trim()).filter(Boolean);
    const exists = currentList.some(c => c.toLowerCase() === colorName.toLowerCase());
    
    let newList;
    if (exists) {
      newList = currentList.filter(c => c.toLowerCase() !== colorName.toLowerCase());
    } else {
      newList = [...currentList, colorName];
    }
    setProdColors(newList.join(", "));
  };
  const [prodDetails, setProdDetails] = useState("");
  const [prodWeight, setProdWeight] = useState("500");
  const [prodImageSource, setProdImageSource] = useState<"url" | "upload">("upload");
  const [prodImageUrl, setProdImageUrl] = useState("");
  const [prodImageBase64, setProdImageBase64] = useState("");
  const productFileRef = useRef<HTMLInputElement>(null);

  // --- Category Form State ---
  const [catName, setCatName] = useState("");
  const [catColor, setCatColor] = useState("var(--teal)");
  const [catImageBase64, setCatImageBase64] = useState("");
  const [categoryMode, setCategoryMode] = useState<"add" | "edit">("add");
  const [editingCategoryName, setEditingCategoryName] = useState<string | null>(null);
  const categoryFileRef = useRef<HTMLInputElement>(null);

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      setNotification({ type: "error", message: "Category name is required! 🌸" });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    if (!catImageBase64) {
      setNotification({ type: "error", message: "Please upload a category image! 🌸" });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const trimmedName = catName.trim();

    if (categoryMode === "edit" && editingCategoryName) {
      updateCategory(editingCategoryName, {
        name: trimmedName,
        img: catImageBase64,
        color: catColor,
      });
      setNotification({ type: "success", message: `Category updated successfully! 🌸` });
    } else {
      addCategory({
        name: trimmedName,
        img: catImageBase64,
        color: catColor,
      });
      setNotification({ type: "success", message: `Category "${trimmedName}" added successfully! 🌸` });
    }

    // Reset Category Form
    setCatName("");
    setCatColor("var(--teal)");
    setCatImageBase64("");
    if (categoryFileRef.current) categoryFileRef.current.value = "";
    setCategoryMode("add");
    setEditingCategoryName(null);

    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteCategory = (name: string) => {
    if (categories.length <= 1) {
      setNotification({ type: "error", message: "You must keep at least one category! 🌸" });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (confirm(`Are you sure you want to delete the category "${name}"? any products assigned to it will be reassigned to another category.`)) {
      deleteCategory(name);
      setNotification({ type: "success", message: `Category "${name}" deleted! 🌸` });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleEditCategoryClick = (cat: any) => {
    setCategoryMode("edit");
    setEditingCategoryName(cat.name);
    setCatName(cat.name);
    setCatColor(cat.color);
    setCatImageBase64(cat.img);
  };

  const handleCancelCategoryEdit = () => {
    setCategoryMode("add");
    setEditingCategoryName(null);
    setCatName("");
    setCatColor("var(--teal)");
    setCatImageBase64("");
    if (categoryFileRef.current) categoryFileRef.current.value = "";
  };

  const handleDeleteHeroImage = (indexToDelete: number) => {
    if (heroImages.length <= 1) {
      setNotification({ type: "error", message: "You must keep at least one hero image! 🌸" });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    if (confirm("Are you sure you want to delete this hero banner image?")) {
      const updated = heroImages.filter((_, idx) => idx !== indexToDelete);
      updateHeroImages(updated);
      setNotification({ type: "success", message: "Hero image deleted! 🌸" });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleHeroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, (base64) => {
        updateHeroImages([...heroImages, base64]);
        setNotification({ type: "success", message: "New hero banner image uploaded! 🌸" });
        setTimeout(() => setNotification(null), 3000);
      });
    }
  };

  // --- Order Tracking States ---
  const [orders, setOrders] = useState<any[]>([]);
  const [searchOrderQuery, setSearchOrderQuery] = useState("");
  const [searchProductQuery, setSearchProductQuery] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Load orders from database
  useEffect(() => {
    async function fetchOrders() {
      try {
        const dbOrders = await getOrdersFn();
        setOrders(dbOrders);
      } catch (e) {
        console.error("Failed to load orders from database:", e);
        try {
          const storedOrders = localStorage.getItem("hapyezta-orders");
          if (storedOrders && JSON.parse(storedOrders).length > 0) {
            setOrders(JSON.parse(storedOrders));
          }
        } catch (localErr) {
          console.error("Failed to load orders from localStorage:", localErr);
        }
      }
    }
    if (viewMode === "track-orders" || viewMode === "analytics") {
      fetchOrders();
    }
  }, [viewMode]);

  const handleProductImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      compressImage(e.target.files[0], (base64) => {
        setProdImageBase64(base64);
      });
    }
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !prodDescription) {
      showNotification("error", "Please fill in Product Name, Price, and Description! 🌸");
      return;
    }

    const finalImage = prodImageSource === "upload" ? prodImageBase64 : prodImageUrl;
    if (!finalImage) {
      showNotification("error", "Please upload an image or provide an image URL! 🌸");
      return;
    }

    const priceNum = parseInt(prodPrice.toString().replace(/₹/g, ""), 10);
    if (isNaN(priceNum)) {
      showNotification("error", "Price must be a valid number! 🌸");
      return;
    }

    const weightNum = prodWeight ? parseInt(prodWeight, 10) : 500;
    if (isNaN(weightNum) || weightNum <= 0) {
      showNotification("error", "Weight must be a positive number of grams! 🌸");
      return;
    }

    // Colors list split by comma
    const colorsArray = prodColors
      ? prodColors.split(",").map((c) => c.trim()).filter((c) => c.length > 0)
      : [];

    // Details split by newlines
    const detailsArray = prodDetails
      ? prodDetails.split("\n").map((d) => d.trim()).filter((d) => d.length > 0)
      : ["Premium quality kawaii item", "Handpicked with love"];

    const priceFormatted = `₹${priceNum}`;
    const oldPriceFormatted = prodOldPrice ? `₹${parseInt(prodOldPrice.toString().replace(/₹/g, ""), 10)}` : undefined;

    if (productMode === "edit" && editingProductId) {
      updateProduct({
        id: editingProductId,
        name: prodName,
        price: priceFormatted,
        oldPrice: oldPriceFormatted,
        img: finalImage,
        tag: prodTag || undefined,
        category: prodCategory || categories[0]?.name || "Cute Stationery",
        description: prodDescription,
        stockStatus: prodStockStatus,
        colors: colorsArray,
        details: detailsArray,
        weight: weightNum,
      });
      showNotification("success", "Product updated successfully! 🎉🌸");
    } else {
      addProduct({
        name: prodName,
        price: priceFormatted,
        oldPrice: oldPriceFormatted,
        img: finalImage,
        tag: prodTag || undefined,
        category: prodCategory || categories[0]?.name || "Cute Stationery",
        description: prodDescription,
        stockStatus: prodStockStatus,
        colors: colorsArray,
        details: detailsArray,
        weight: weightNum,
      });
      showNotification("success", "Kawaii product added successfully! 🎉🌸");
    }

    // Reset Form
    setProdName("");
    setProdPrice("");
    setProdOldPrice("");
    setProdTag("");
    setProdDescription("");
    setProdStockStatus("in_stock");
    setProdColors("");
    setProdDetails("");
    setProdWeight("500");
    setProdImageUrl("");
    setProdImageBase64("");
    if (productFileRef.current) productFileRef.current.value = "";

    setProductMode("list");
    setEditingProductId(null);
  };

  const handleEditProductClick = (p: any) => {
    setEditingProductId(p.id);
    setProdName(p.name);
    setProdPrice(p.price ? p.price.replace(/₹/g, "") : "");
    setProdOldPrice(p.oldPrice ? p.oldPrice.replace(/₹/g, "") : "");
    setProdTag(p.tag || "");
    setProdCategory(p.category);
    setProdDescription(p.description || "");
    setProdStockStatus(p.stockStatus || "in_stock");
    setProdColors(p.colors ? p.colors.join(", ") : "");
    setProdDetails(p.details ? p.details.join("\n") : "");
    setProdWeight(p.weight ? p.weight.toString() : "500");
    
    if (p.img && p.img.startsWith("data:")) {
      setProdImageSource("upload");
      setProdImageBase64(p.img);
      setProdImageUrl("");
    } else {
      setProdImageSource("url");
      setProdImageUrl(p.img || "");
      setProdImageBase64("");
    }

    setProductMode("edit");
  };

  const handleDeleteProductClick = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? 🌸`)) {
      deleteProduct(id);
      showNotification("success", `Product "${name}" deleted! 🌸`);
    }
  };

  // --- Order Actions ---
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, status: newStatus } : o
    );
    setOrders(updated);
    try {
      localStorage.setItem("hapyezta-orders", JSON.stringify(updated));
      await updateOrderStatusFn({ data: { id: orderId, status: newStatus } });
      showNotification("success", `Order ${orderId} status updated to ${newStatus}! 🌸`);
    } catch (e) {
      console.error("Failed to update status in database:", e);
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm(`Are you sure you want to delete order ${orderId}? 😿`)) {
      const updated = orders.filter((o) => o.id !== orderId);
      setOrders(updated);
      try {
        localStorage.setItem("hapyezta-orders", JSON.stringify(updated));
        showNotification("success", `Order ${orderId} deleted successfully! 🗑️`);
      } catch (e) {
        console.error("Failed to delete order from localStorage:", e);
      }
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return isoString;
    }
  };

  const filteredOrders = orders.filter((o) =>
    o.id.toLowerCase().includes(searchOrderQuery.toLowerCase()) ||
    o.customerName.toLowerCase().includes(searchOrderQuery.toLowerCase())
  );

  // --- Analytics & Revenue Calculations ---
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const totalOrdersCount = orders.length;
  const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  // Month-wise Revenue calculations
  const getMonthlySales = () => {
    const monthlyMap: { [key: string]: number } = {};
    orders.forEach((order) => {
      try {
        const date = new Date(order.date);
        const monthName = date.toLocaleString("default", { month: "short", year: "numeric" });
        monthlyMap[monthName] = (monthlyMap[monthName] || 0) + (order.totalAmount || 0);
      } catch (e) {
        // Fallback
      }
    });

    // Sort monthly keys chronologically
    return Object.entries(monthlyMap)
      .map(([month, revenue]) => ({
        month,
        revenue,
        // Keep date object for sorting
        dateObj: new Date(month)
      }))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
      .map(({ month, revenue }) => ({ month, revenue }));
  };
  const monthlyData = getMonthlySales();

  // Category sales calculations
  const getCategorySales = () => {
    const catMap: { [key: string]: number } = {};
    orders.forEach((order) => {
      order.items.forEach((item: any) => {
        const matchingProduct = products.find((p) => p.id === item.id);
        const category = matchingProduct?.category || item.category || "Cute Stationery";
        const price = item.price || 0;
        const qty = item.quantity || 1;
        catMap[category] = (catMap[category] || 0) + (price * qty);
      });
    });

    const total = Object.values(catMap).reduce((s, v) => s + v, 0);

    const colorMap: { [key: string]: string } = {
      "Cute Stationery": "var(--teal)",
      "Pencil Cases": "var(--coral)",
      "Journal Supplies": "var(--yellow)",
      "Sling & School Bags": "var(--purple)",
      "Bottles & Tumblers": "var(--orange)",
      "Lunch Box": "var(--coral)",
      "Gift Sets": "var(--teal)",
      "Makeup Pouches": "var(--purple)"
    };

    return Object.entries(catMap).map(([name, value]) => ({
      name,
      value,
      percent: total > 0 ? Math.round((value / total) * 100) : 0,
      color: colorMap[name] || "var(--purple)"
    })).sort((a, b) => b.value - a.value);
  };
  const categorySalesArray = getCategorySales();
  const topCategoryName = categorySalesArray[0]?.name || "N/A";

  // Top Selling Products calculations (Top 5)
  const getTopProducts = () => {
    const prodMap: { [key: string]: { name: string; category: string; img: string; unitsSold: number; revenue: number } } = {};
    orders.forEach((order) => {
      order.items.forEach((item: any) => {
        const matchingProduct = products.find((p) => p.id === item.id);
        const category = matchingProduct?.category || item.category || "Cute Stationery";
        const img = matchingProduct?.img || item.img;
        const price = item.price || 0;
        const qty = item.quantity || 1;

        if (prodMap[item.id]) {
          prodMap[item.id].unitsSold += qty;
          prodMap[item.id].revenue += price * qty;
        } else {
          prodMap[item.id] = {
            name: item.name,
            category,
            img,
            unitsSold: qty,
            revenue: price * qty
          };
        }
      });
    });

    return Object.values(prodMap).sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 5);
  };
  const topProductsArray = getTopProducts();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <div>
          <AdminHeader isAuthenticated={false} />

          <main className="max-w-md mx-auto px-4 py-20">
            <div className="bg-white rounded-[2rem] p-8 border-2 border-yellow/20 shadow-[0_12px_40px_rgba(127,88,165,0.06)] text-center">
              <div className="text-4xl mb-4 select-none animate-bounce">🔒</div>
              <h1 className="font-display text-3xl text-purple font-bold mb-2">Nexus Control</h1>
              <p className="text-sm text-foreground/60 mb-6 font-body">
                Please enter the security access code to open the admin console.
              </p>

              <form onSubmit={handlePasscodeSubmit} className="space-y-5">
                <div>
                  <input
                    type="password"
                    placeholder="Enter security code..."
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full text-center tracking-[0.2em] font-mono text-lg px-6 py-4 rounded-full border-2 border-yellow/20 focus:border-orange bg-cream/10 outline-none transition text-foreground placeholder:text-foreground/30 placeholder:tracking-normal placeholder:font-sans"
                    maxLength={10}
                    autoFocus
                  />
                </div>

                {passcodeError && (
                  <div className="flex items-center justify-center gap-2 text-xs text-coral font-semibold bg-coral/10 py-2.5 px-4 rounded-full animate-fade-in">
                    <span>🌸</span>
                    <span>{passcodeError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-orange hover:bg-orange/95 text-white font-bold shadow-[0_5px_0_0_#c4513f] hover:translate-y-0.5 hover:shadow-[0_2px_0_0_#c4513f] transition-all cursor-pointer text-sm font-display uppercase tracking-widest"
                >
                  Verify Access
                </button>
              </form>
            </div>
          </main>
        </div>
        <footer className="py-6 border-t border-purple/10 text-center text-xs text-foreground/40 font-body">
          © {new Date().getFullYear()} Hapyezta Admin Console. All rights reserved.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between pb-16 lg:pb-0">
      <div>
        <AdminHeader isAuthenticated={true} onLogout={handleLogout} />

        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Breadcrumbs */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-foreground/60 mb-6 justify-center lg:justify-start">
            <Link to="/" className="hover:text-coral transition font-semibold">Home</Link>
            <span>/</span>
            <span className="text-purple font-bold">Admin Control Panel</span>
          </div>

          {/* Heading */}
          <div className="text-center lg:text-left mb-6 lg:mb-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="hidden lg:inline-flex items-center gap-2 bg-yellow/30 text-purple px-4 py-1.5 rounded-full text-xs font-bold mb-3">
                👑 Admin Console
              </div>
              <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl text-purple tracking-tight">
                Control Panel
              </h1>
              <p className="text-foreground/70 font-body mt-1.5 text-xs sm:text-sm lg:text-base">
                {viewMode === "analytics"
                  ? "Analyze store revenue, month-wise sales trends, and top selling items."
                  : viewMode === "products"
                  ? "Manage the online product catalog: view, search, edit, update, or delete kawaii items."
                  : viewMode === "categories"
                  ? "Create and manage store categories for item organization."
                  : viewMode === "customers"
                  ? "View registered customer accounts: names, contact details, emails, and purchase frequencies."
                  : "Track, inspect, and update orders placed by customers."
                }
              </p>
            </div>

            {/* Navigation Pills */}
            <div className="hidden lg:flex gap-3 justify-center lg:justify-end shrink-0">
              <button
                onClick={() => setViewMode("analytics")}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                  viewMode === "analytics"
                    ? "bg-purple text-white shadow-md shadow-purple/15"
                    : "bg-white text-purple border-2 border-purple/10 hover:border-purple/30"
                }`}
              >
                <BarChart2 className="w-4 h-4" /> Revenue & Analytics
              </button>
              <button
                onClick={() => setViewMode("track-orders")}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                  viewMode === "track-orders"
                    ? "bg-purple text-white shadow-md shadow-purple/15"
                    : "text-purple bg-white border-2 border-purple/10 hover:border-purple/30"
                }`}
              >
                <Package className="w-4 h-4" /> Orders
                {orders.filter(o => o.status === "pending").length > 0 && (
                  <span className="bg-coral text-white text-[10px] w-5 h-5 rounded-full grid place-items-center animate-pulse">
                    {orders.filter(o => o.status === "pending").length}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setViewMode("products");
                  setProductMode("list");
                  setEditingProductId(null);
                }}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                  viewMode === "products"
                    ? "bg-purple text-white shadow-md shadow-purple/15"
                    : "bg-white text-purple border-2 border-purple/10 hover:border-purple/30"
                }`}
              >
                <ShoppingBag className="w-4 h-4" /> Products
              </button>
              <button
                onClick={() => setViewMode("categories")}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                  viewMode === "categories"
                    ? "bg-purple text-white shadow-md shadow-purple/15"
                    : "bg-white text-purple border-2 border-purple/10 hover:border-purple/30"
                }`}
              >
                <Tag className="w-4 h-4" /> Categories
              </button>
              <button
                onClick={() => setViewMode("customers")}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                  viewMode === "customers"
                    ? "bg-purple text-white shadow-md shadow-purple/15"
                    : "bg-white text-purple border-2 border-purple/10 hover:border-purple/30"
                }`}
              >
                <Users className="w-4 h-4" /> Customers
              </button>
            </div>
          </div>

          {/* Notification Alert */}
          {notification && (
            <div
              className={`mb-6 p-4 rounded-2xl flex items-center gap-3 border-2 animate-fade-in max-w-3xl mx-auto ${
                notification.type === "success"
                  ? "bg-teal/10 border-teal/20 text-teal"
                  : "bg-coral/10 border-coral/20 text-coral"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle className="w-5 h-5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0" />
              )}
              <span className="font-semibold text-sm">{notification.message}</span>
            </div>
          )}

          {/* Revenue & Analytics View */}
          {viewMode === "analytics" && (
            <div className="space-y-8 animate-fade-in">
              {/* Analytics Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Revenue Card */}
                <div className="bg-gradient-to-br from-[#FEFBEA] to-white p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] border-2 border-yellow/20 shadow-[0_8px_30px_rgba(254,219,57,0.06)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(254,219,57,0.12)] transition-all duration-300 flex flex-col justify-between group">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl sm:text-3xl select-none group-hover:scale-105 transition duration-300">💰</span>
                    <span className="text-[9px] sm:text-[10px] bg-yellow/30 text-purple font-bold px-2 sm:px-2.5 py-0.5 rounded-full font-display tracking-wider uppercase">Revenue</span>
                  </div>
                  <div className="mt-3 sm:mt-4">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-display text-purple font-bold">₹{totalRevenue}</h3>
                    <p className="text-[10px] sm:text-xs text-foreground/50 mt-0.5 sm:mt-1 font-body">Total income earned</p>
                  </div>
                </div>

                {/* Orders Card */}
                <div className="bg-gradient-to-br from-[#E6F8F7] to-white p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] border-2 border-teal/20 shadow-[0_8px_30px_rgba(45,183,181,0.06)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(45,183,181,0.12)] transition-all duration-300 flex flex-col justify-between group">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl sm:text-3xl select-none group-hover:scale-105 transition duration-300">📦</span>
                    <span className="text-[9px] sm:text-[10px] bg-teal/10 text-teal font-bold px-2 sm:px-2.5 py-0.5 rounded-full font-display tracking-wider uppercase">Orders</span>
                  </div>
                  <div className="mt-3 sm:mt-4">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-display text-teal font-bold">{totalOrdersCount}</h3>
                    <p className="text-[10px] sm:text-xs text-foreground/50 mt-0.5 sm:mt-1 font-body">Total orders placed</p>
                  </div>
                </div>

                {/* AOV Card */}
                <div className="bg-gradient-to-br from-[#FFF0ED] to-white p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] border-2 border-coral/20 shadow-[0_8px_30px_rgba(242,108,88,0.06)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(242,108,88,0.12)] transition-all duration-300 flex flex-col justify-between group">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl sm:text-3xl select-none group-hover:scale-105 transition duration-300">🛍️</span>
                    <span className="text-[9px] sm:text-[10px] bg-coral/10 text-coral font-bold px-2 sm:px-2.5 py-0.5 rounded-full font-display tracking-wider uppercase">Avg Value</span>
                  </div>
                  <div className="mt-3 sm:mt-4">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-display text-coral font-bold">₹{averageOrderValue}</h3>
                    <p className="text-[10px] sm:text-xs text-foreground/50 mt-0.5 sm:mt-1 font-body">Average cart size</p>
                  </div>
                </div>

                {/* Best Category Card */}
                <div className="bg-gradient-to-br from-[#F5EEFB] to-white p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] border-2 border-purple/20 shadow-[0_8px_30px_rgba(127,88,165,0.06)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(127,88,165,0.12)] transition-all duration-300 flex flex-col justify-between group">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl sm:text-3xl select-none group-hover:scale-105 transition duration-300">✨</span>
                    <span className="text-[9px] sm:text-[10px] bg-purple/10 text-purple font-bold px-2 sm:px-2.5 py-0.5 rounded-full font-display tracking-wider uppercase">Top Sales</span>
                  </div>
                  <div className="mt-3 sm:mt-4 font-display">
                    <h3 className="text-base sm:text-xl font-bold text-purple truncate leading-tight">{topCategoryName}</h3>
                    <p className="text-[10px] sm:text-xs text-foreground/50 mt-0.5 sm:mt-1 font-body">Highest grossing</p>
                  </div>
                </div>
              </div>

              {/* Chart & Category Distribution */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Month-wise Revenue Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] border-2 border-yellow/10 shadow-[0_10px_35px_rgba(127,88,165,0.03)] space-y-4 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-xl text-purple font-bold">Monthly Sales Trend</h2>
                      <p className="text-xs text-foreground/50 font-body">Month-over-month revenue summary</p>
                    </div>
                    <span className="text-[11px] bg-teal/10 text-teal font-bold px-3 py-1.5 rounded-full font-display flex items-center gap-2 border border-teal/20">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-teal"></span>
                      </span>
                      Live Sync
                    </span>
                  </div>
                  <div className="h-64 sm:h-72 w-full pt-4">
                    {isMounted && monthlyData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--purple)" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="var(--purple)" stopOpacity={0.0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="4 4" stroke="rgba(127,88,165,0.04)" vertical={false} />
                          <XAxis 
                            dataKey="month" 
                            stroke="rgba(127,88,165,0.4)" 
                            fontSize={11} 
                            tickLine={false}
                            axisLine={false}
                            fontFamily="Quicksand"
                            dy={10}
                          />
                          <YAxis 
                            stroke="rgba(127,88,165,0.4)" 
                            fontSize={11} 
                            tickLine={false}
                            axisLine={false}
                            fontFamily="Quicksand"
                            tickFormatter={(value) => `₹${value}`}
                            dx={-5}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#fff', 
                              borderRadius: '16px', 
                              border: '2px solid rgba(254, 219, 57, 0.2)',
                              boxShadow: '0 8px 30px rgba(127,88,165,0.06)',
                              fontFamily: 'Quicksand',
                              fontSize: '13px',
                              fontWeight: 'bold',
                              color: 'var(--purple)'
                            }}
                            formatter={(value: any) => [`₹${value}`, "Revenue"]}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="var(--purple)" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorRevenue)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : monthlyData.length > 0 ? (
                      <div className="h-full flex items-center justify-center text-foreground/40 text-sm font-body">
                        🌸 Loading chart...
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-foreground/40 text-sm font-body">
                        🌸 No revenue data available to chart
                      </div>
                    )}
                  </div>
                </div>

                {/* Sales by Category progress bars */}
                <div className="bg-white p-6 rounded-[2rem] border-2 border-yellow/10 shadow-[0_10px_35px_rgba(127,88,165,0.03)] space-y-5">
                  <div>
                    <h2 className="font-display text-xl text-purple font-bold">Sales by Category</h2>
                    <p className="text-xs text-foreground/50 font-body">Breakdown of gross sales share</p>
                  </div>
                  <div className="space-y-4.5 pt-2">
                    {categorySalesArray.length > 0 ? (
                      categorySalesArray.map((cat, idx) => {
                        const emoji = {
                          "Cute Stationery": "✏️",
                          "Pencil Cases": "👝",
                          "Journal Supplies": "📓",
                          "Sling & School Bags": "🎒",
                          "Bottles & Tumblers": "🍼",
                          "Lunch Box": "🍱",
                          "Gift Sets": "🎁",
                          "Makeup Pouches": "👛"
                        }[cat.name] || "✨";
                        return (
                          <div key={idx} className="space-y-1.5 hover:translate-x-1 transition duration-300">
                            <div className="flex justify-between text-xs font-semibold text-purple">
                              <span className="font-body flex items-center gap-1.5">
                                <span>{emoji}</span>
                                <span>{cat.name}</span>
                              </span>
                              <span className="font-display">₹{cat.value} ({cat.percent}%)</span>
                            </div>
                            <div className="h-3 w-full bg-cream/35 rounded-full overflow-hidden border border-purple/5">
                              <div 
                                className="h-full rounded-full transition-all duration-500 shadow-[0_1px_5px_rgba(0,0,0,0.04)]" 
                                style={{ 
                                  width: `${cat.percent}%`,
                                  backgroundColor: cat.color || "var(--purple)" 
                                }}
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-12 text-center text-sm text-foreground/40 font-body">
                        🌸 No category sales data available
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Top Selling Products list */}
              <div className="bg-white p-6 rounded-[2rem] border-2 border-yellow/10 shadow-[0_10px_35px_rgba(127,88,165,0.03)] space-y-4">
                <div>
                  <h2 className="font-display text-xl text-purple font-bold">Top Selling Products</h2>
                  <p className="text-xs text-foreground/50 font-body font-semibold">Cute items ranking based on checkout sales volume</p>
                </div>

                {/* Desktop View: Table Layout */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-purple/5 text-purple font-display text-xs uppercase tracking-wider">
                        <th className="pb-3 pt-2 font-bold w-16 text-center">Rank</th>
                        <th className="pb-3 pt-2 font-bold">Product Details</th>
                        <th className="pb-3 pt-2 font-bold">Category</th>
                        <th className="pb-3 pt-2 font-bold text-center">Volume Sold</th>
                        <th className="pb-3 pt-2 font-bold text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple/5">
                      {topProductsArray.length > 0 ? (
                        topProductsArray.map((prod, idx) => {
                          const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}`;
                          return (
                            <tr key={idx} className="text-sm font-body hover:bg-cream/10 transition group">
                              <td className="py-4 text-center font-display font-bold text-purple text-base">
                                {medal}
                              </td>
                              <td className="py-4 flex items-center gap-3">
                                <div className="relative rounded-2xl overflow-hidden border-2 border-purple/5 bg-cream/15 group-hover:scale-105 group-hover:border-yellow/20 transition-all duration-300 shadow-sm shrink-0">
                                  <img 
                                    src={resolveImage(prod.img)} 
                                    alt={prod.name} 
                                    className="w-11 h-11 object-cover" 
                                  />
                                </div>
                                <span className="font-bold text-purple line-clamp-1">{prod.name}</span>
                              </td>
                              <td className="py-4 text-xs text-foreground/60">{prod.category}</td>
                              <td className="py-4 text-center">
                                <span className="bg-purple/10 text-purple font-bold px-3 py-1 rounded-full text-xs font-display">
                                  {prod.unitsSold} units
                                </span>
                              </td>
                              <td className="py-4 text-right font-display font-bold text-coral text-base">
                                ₹{prod.revenue}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-foreground/40 font-body">
                            🌸 No sales volumes recorded yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View: Clean Card List Layout */}
                <div className="block sm:hidden space-y-3">
                  {topProductsArray.length > 0 ? (
                    topProductsArray.map((prod, idx) => {
                      const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`;
                      return (
                        <div key={idx} className="flex items-center justify-between p-3.5 bg-cream/10 rounded-2xl border border-purple/5 hover:border-yellow/20 transition-all duration-300">
                          <div className="flex items-center gap-3">
                            {/* Rank Indicator */}
                            <span className="text-xl font-display font-bold text-purple select-none w-6 text-center">
                              {medal}
                            </span>
                            {/* Product Image */}
                            <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-purple/5 bg-white shadow-sm shrink-0">
                              <img src={resolveImage(prod.img)} alt={prod.name} className="w-full h-full object-cover" />
                            </div>
                            {/* Product Info */}
                            <div className="space-y-0.5">
                              <h4 className="font-bold text-purple text-sm line-clamp-1">{prod.name}</h4>
                              <p className="text-[10px] text-foreground/50 font-body font-semibold">{prod.category}</p>
                            </div>
                          </div>
                          
                          {/* Financial Info */}
                          <div className="text-right space-y-1">
                            <p className="font-display font-bold text-coral text-sm">₹{prod.revenue}</p>
                            <span className="inline-block bg-purple/10 text-purple font-bold px-2 py-0.5 rounded-full text-[9px] font-display">
                              {prod.unitsSold} units
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-foreground/40 text-xs font-body">
                      🌸 No sales volumes recorded yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Categories Management View */}
          {viewMode === "categories" && (
            <div className="grid md:grid-cols-3 gap-8 animate-fade-in max-w-5xl mx-auto pb-8">
              {/* Form Section */}
              <div className="md:col-span-1 space-y-6">
                <div className="bg-white rounded-[2rem] p-6 border-2 border-yellow/20 shadow-md space-y-6">
                  <h2 className="font-display text-xl text-purple flex items-center gap-2 border-b border-purple/5 pb-3">
                    {categoryMode === "edit" ? "✏️ Edit Category" : "🏷️ Add Category"}
                  </h2>

                  <form onSubmit={handleAddCategorySubmit} className="space-y-5">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-purple uppercase tracking-wider block">Category Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kawaii Mugs"
                        value={catName}
                        onChange={(e) => setCatName(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-cream/35 border-2 border-purple/10 focus:border-coral outline-none text-sm transition font-body"
                      />
                    </div>

                    {/* Color */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-purple uppercase tracking-wider block">Theme Color</label>
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        {[
                          { val: "var(--teal)", bg: "bg-teal", label: "Teal" },
                          { val: "var(--coral)", bg: "bg-coral", label: "Coral" },
                          { val: "var(--yellow)", bg: "bg-yellow", label: "Yellow" },
                          { val: "var(--purple)", bg: "bg-purple", label: "Purple" },
                          { val: "var(--orange)", bg: "bg-orange", label: "Orange" },
                        ].map((c) => (
                          <button
                            key={c.val}
                            type="button"
                            onClick={() => setCatColor(c.val)}
                            className={`w-7 h-7 rounded-full ${c.bg} cursor-pointer transition-all duration-200 border-2 ${
                              catColor === c.val ? "border-purple scale-110 shadow-sm" : "border-transparent hover:scale-105"
                            }`}
                            title={c.label}
                          />
                        ))}

                        {/* Custom Color Picker Button */}
                        <div className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-purple/20 hover:scale-105 transition cursor-pointer" title="Pick Custom Color">
                          <input
                            type="color"
                            value={catColor.startsWith("#") ? catColor : "#FF8A8A"}
                            onChange={(e) => setCatColor(e.target.value)}
                            className="absolute inset-0 w-full h-full p-0 border-0 outline-none cursor-pointer scale-150"
                          />
                        </div>
                      </div>

                      {/* Text Input for Custom Color */}
                      <div className="mt-2.5">
                        <input
                          type="text"
                          placeholder="Or enter custom color code (e.g. #FFB84D)"
                          value={catColor}
                          onChange={(e) => setCatColor(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-2xl bg-cream/35 border-2 border-purple/10 focus:border-coral outline-none text-xs transition font-body"
                        />
                        <span className="text-[9px] text-foreground/40 pl-2 block mt-1">
                          Current Color: <span className="font-bold font-mono" style={{ color: catColor.startsWith("var") ? "var(--purple)" : catColor }}>{catColor}</span>
                        </span>
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-purple uppercase tracking-wider block">Category Image *</label>
                      <div className="border-2 border-dashed border-purple/10 rounded-2xl p-4 text-center bg-cream/10 hover:bg-cream/20 transition relative">
                        <input
                          type="file"
                          accept="image/*"
                          ref={categoryFileRef}
                          required={categoryMode === "add"}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              compressImage(file, (base64) => setCatImageBase64(base64));
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        {catImageBase64 ? (
                          <div className="space-y-2">
                            <img
                              src={catImageBase64}
                              alt="Category preview"
                              className="w-16 h-16 object-cover mx-auto rounded-xl border border-purple/10"
                            />
                            <p className="text-[10px] text-teal font-semibold">✓ Image uploaded</p>
                          </div>
                        ) : (
                          <div className="space-y-1 text-purple/50">
                            <ImageIcon className="w-6 h-6 mx-auto" />
                            <p className="text-[11px] font-semibold">Click to upload photo</p>
                            <p className="text-[9px] text-foreground/40 font-body">PNG, JPG up to 5MB</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3">
                      {categoryMode === "edit" && (
                        <button
                          type="button"
                          onClick={handleCancelCategoryEdit}
                          className="flex-1 py-3.5 rounded-full bg-purple/10 hover:bg-purple/20 text-purple font-bold transition cursor-pointer text-xs font-display uppercase tracking-wider"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        className="flex-1 py-3.5 rounded-full bg-purple hover:bg-purple/95 text-white font-bold shadow-[0_4px_0_0_#654388] hover:translate-y-0.5 hover:shadow-[0_2px_0_0_#654388] transition-all cursor-pointer text-xs font-display uppercase tracking-wider"
                      >
                        {categoryMode === "edit" ? "Update" : "Save"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Hero Banner Images */}
                <div className="bg-white rounded-[2rem] p-6 border-2 border-purple/10 shadow-md space-y-6">
                  <h2 className="font-display text-xl text-purple flex items-center gap-2 border-b border-purple/5 pb-3">
                    ✨ Homepage Hero Slides
                  </h2>
                  <p className="text-xs text-foreground/50 font-body -mt-4">
                    Upload and manage rotating hero banner images for the home page.
                  </p>

                  <div className="space-y-4">
                    {/* Add Image Upload Area */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-purple uppercase tracking-wider block">Add New Slide</label>
                      <div className="border-2 border-dashed border-purple/10 rounded-2xl p-4 text-center hover:border-coral transition cursor-pointer relative bg-cream/15">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleHeroImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="space-y-1 text-purple/50">
                          <ImageIcon className="w-5 h-5 mx-auto" />
                          <p className="text-[11px] font-bold">Click to upload banner</p>
                          <p className="text-[9px] text-foreground/40">PNG, JPG up to 5MB</p>
                        </div>
                      </div>
                    </div>

                    {/* Banner Images List */}
                    <div className="space-y-3 pt-2">
                      <label className="text-xs font-bold text-purple uppercase tracking-wider block">
                        Current Slides ({heroImages.length})
                      </label>
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {heroImages.map((imgSrc, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2 rounded-xl bg-cream/20 border border-purple/5">
                            <img
                              src={resolveImage(imgSrc)}
                              alt={`Hero banner ${idx + 1}`}
                              className="w-12 h-12 object-cover rounded-lg border border-purple/10"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-purple truncate">Slide #{idx + 1}</p>
                              <p className="text-[9px] text-foreground/40 font-mono truncate">
                                {imgSrc.startsWith("data:") ? "Custom Upload" : "Default Asset"}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteHeroImage(idx)}
                              disabled={heroImages.length <= 1}
                              className={`p-1.5 rounded-full transition ${
                                heroImages.length <= 1
                                  ? "text-foreground/20 cursor-not-allowed"
                                  : "text-red-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                              }`}
                              title="Delete this slide"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Section */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-display text-2xl text-purple font-bold">Store Categories</h2>
                    <p className="text-xs text-foreground/50 font-body">Manage categories displayed on the homepage shop grid</p>
                  </div>
                  <span className="text-xs bg-purple/10 text-purple font-bold px-3 py-1 rounded-full font-display">
                    {categories.length} Total
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {categories.map((cat, idx) => {
                    return (
                      <div
                        key={idx}
                        className="bg-white rounded-[2rem] p-4 border-2 border-purple/5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                      >
                        <div className="space-y-3">
                          <div className="aspect-video w-full rounded-2xl overflow-hidden border border-purple/5 bg-cream/15 relative">
                            <img
                              src={resolveImage(cat.img)}
                              alt={cat.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                            <div
                              className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full shadow-sm border border-white"
                              style={{ backgroundColor: cat.color }}
                              title={`Theme: ${cat.color}`}
                            />
                          </div>
                          <h3 className="font-bold text-purple text-sm font-display line-clamp-1">{cat.name}</h3>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-purple/5">
                          <button
                            onClick={() => handleEditCategoryClick(cat)}
                            className="px-2.5 py-1 rounded-lg bg-yellow/20 hover:bg-yellow/30 text-purple text-xs font-bold transition cursor-pointer"
                            title="Edit Category"
                          >
                            ✏️ Edit
                          </button>

                          <button
                            onClick={() => handleDeleteCategory(cat.name)}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Customers Directory View */}
          {viewMode === "customers" && (
            <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-8">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-display text-2xl text-purple font-bold">Registered Members</h2>
                  <p className="text-xs text-foreground/50 font-body">Browse customer accounts created in the Kawaii Club.</p>
                </div>
                <span className="text-xs bg-purple/10 text-purple font-bold px-3 py-1 rounded-full font-display">
                  {customerProfiles.length} Members
                </span>
              </div>

              {customerProfiles.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-[2rem] border-2 border-dashed border-purple/10">
                  <Users className="w-12 h-12 mx-auto text-purple/35 mb-3" />
                  <p className="text-purple font-semibold">No registered members found yet! 🌸</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customerProfiles.map((c, idx) => {
                    const cleanPhone = c.phone ? c.phone.replace(/\D/g, "") : "";
                    const ordersCount = orders.filter(
                      (o) => o.customerPhone && o.customerPhone.replace(/\D/g, "") === cleanPhone
                    ).length;

                    return (
                      <div
                        key={idx}
                        className="bg-white rounded-[2rem] p-5 border-2 border-purple/5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-coral to-purple flex items-center justify-center text-2xl border-2 border-white shadow-sm shrink-0 select-none">
                            {c.emoji || "🌸"}
                          </div>
                          <div className="space-y-1 min-w-0">
                            <h4 className="font-display font-bold text-purple truncate text-sm">{c.name}</h4>
                            <p className="text-[10px] text-foreground/50 font-mono truncate">{c.email || "No email"}</p>
                            <p className="text-[10px] text-foreground/70 font-semibold font-body">{c.phone || "No phone"}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-purple/5">
                          <span className="text-[10px] text-muted-foreground/60">
                            Kawaii Club Member
                          </span>
                          <span className="text-xs bg-coral/10 text-coral font-bold px-2.5 py-1 rounded-full font-display">
                            {ordersCount} {ordersCount === 1 ? "Order" : "Orders"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {viewMode === "products" && (
            <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-8">
              {productMode === "list" ? (
                <div className="space-y-6">
                  {/* List Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="font-display text-2xl text-purple font-bold">Product Catalog</h2>
                      <p className="text-xs text-foreground/50 font-body">Manage catalog products: add, search, update, or delete store items.</p>
                    </div>
                    <button
                      onClick={() => {
                        // Reset all product states for adding
                        setProdName("");
                        setProdPrice("");
                        setProdOldPrice("");
                        setProdTag("");
                        setProdDescription("");
                        setProdStockStatus("in_stock");
                        setProdColors("");
                        setProdDetails("");
                        setProdImageUrl("");
                        setProdImageBase64("");
                        setProductMode("add");
                        setEditingProductId(null);
                      }}
                      className="px-5 py-2.5 rounded-full bg-purple hover:bg-purple/95 text-white font-bold shadow-[0_4px_0_0_#654388] hover:translate-y-0.5 hover:shadow-[0_2px_0_0_#654388] transition-all cursor-pointer text-xs font-display uppercase tracking-wider flex items-center justify-center gap-1.5 self-start sm:self-center"
                    >
                      <PlusCircle className="w-4 h-4" /> Add Product
                    </button>
                  </div>

                  {/* Search bar */}
                  <div className="bg-white rounded-3xl p-4 border border-purple/5 shadow-sm">
                    <input
                      type="text"
                      placeholder="Search products by name or category... 🔍"
                      value={searchProductQuery}
                      onChange={(e) => setSearchProductQuery(e.target.value)}
                      className="w-full px-5 py-3 rounded-2xl bg-cream/15 border-2 border-purple/10 focus:border-coral outline-none text-sm transition font-body"
                    />
                  </div>

                  {/* List Table / Cards */}
                  {products.filter(p => 
                    p.name.toLowerCase().includes(searchProductQuery.toLowerCase()) ||
                    p.category.toLowerCase().includes(searchProductQuery.toLowerCase())
                  ).length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-[2rem] border-2 border-dashed border-purple/10">
                      <ShoppingBag className="w-12 h-12 mx-auto text-purple/35 mb-3" />
                      <p className="text-purple font-semibold">No products found matching your search! 😿</p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table View */}
                      <div className="hidden md:block bg-white rounded-[2rem] border-2 border-purple/5 shadow-sm overflow-hidden">
                        <table className="w-full border-collapse text-left text-sm font-body">
                          <thead>
                            <tr className="bg-purple/5 text-purple font-bold text-xs uppercase tracking-wider border-b border-purple/10">
                              <th className="p-4 w-20">Image</th>
                              <th className="p-4">Product Name</th>
                              <th className="p-4">Category</th>
                              <th className="p-4 w-24">Weight</th>
                              <th className="p-4 w-28">Price</th>
                              <th className="p-4 w-32">Status</th>
                              <th className="p-4 w-32 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-purple/5">
                            {products.filter(p => 
                              p.name.toLowerCase().includes(searchProductQuery.toLowerCase()) ||
                              p.category.toLowerCase().includes(searchProductQuery.toLowerCase())
                            ).map((p) => (
                              <tr key={p.id} className="hover:bg-cream/10 transition-colors">
                                <td className="p-4">
                                  <img src={resolveImage(p.img)} alt={p.name} className="w-12 h-12 object-cover rounded-xl border border-purple/10 bg-cream/15" />
                                </td>
                                <td className="p-4 font-semibold text-purple">
                                  {p.name}
                                  {p.tag && (
                                    <span className="ml-2 bg-coral/10 text-coral text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                      {p.tag}
                                    </span>
                                  )}
                                </td>
                                <td className="p-4 text-foreground/60">{p.category}</td>
                                <td className="p-4 text-foreground/60 font-mono">{p.weight ? `${p.weight}g` : "500g"}</td>
                                <td className="p-4 font-mono font-bold text-coral">
                                  {p.price}
                                  {p.oldPrice && (
                                    <span className="block text-[10px] text-foreground/40 line-through font-normal">{p.oldPrice}</span>
                                  )}
                                </td>
                                <td className="p-4">
                                  {p.stockStatus === "in_stock" && <span className="text-[10px] font-bold bg-teal/10 text-teal px-2 py-0.5 rounded-full border border-teal/20">In Stock</span>}
                                  {p.stockStatus === "low_stock" && <span className="text-[10px] font-bold bg-orange/10 text-orange px-2 py-0.5 rounded-full border border-orange/20">Low Stock</span>}
                                  {p.stockStatus === "sold_out" && <span className="text-[10px] font-bold bg-red-50 text-red-500 px-2 py-0.5 rounded-full border border-red-200">Sold Out</span>}
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => handleEditProductClick(p)}
                                      className="px-3 py-1.5 rounded-lg bg-yellow/20 hover:bg-yellow/30 text-purple text-xs font-bold transition cursor-pointer"
                                    >
                                      ✏️ Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProductClick(p.id, p.name)}
                                      className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 text-xs font-bold transition cursor-pointer"
                                    >
                                      🗑️ Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Cards View */}
                      <div className="grid md:hidden gap-4">
                        {products.filter(p => 
                          p.name.toLowerCase().includes(searchProductQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchProductQuery.toLowerCase())
                        ).map((p) => (
                          <div key={p.id} className="bg-white rounded-[2rem] p-4 border-2 border-purple/5 shadow-sm space-y-4">
                            <div className="flex gap-4">
                              <img src={resolveImage(p.img)} alt={p.name} className="w-16 h-16 object-cover rounded-2xl border border-purple/10 shrink-0 bg-cream/15" />
                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] uppercase font-bold text-foreground/40 block">{p.category}</span>
                                  <span className="text-[10px] text-foreground/50 font-mono">⚖️ {p.weight ? `${p.weight}g` : "500g"}</span>
                                </div>
                                <h4 className="font-display font-bold text-purple text-sm truncate">{p.name}</h4>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-coral text-sm">{p.price}</span>
                                  {p.oldPrice && <span className="text-[10px] text-foreground/40 line-through font-mono">{p.oldPrice}</span>}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-purple/5 pt-3">
                              <div>
                                {p.stockStatus === "in_stock" && <span className="text-[9px] font-bold bg-teal/10 text-teal px-2.5 py-1 rounded-full border border-teal/20">In Stock</span>}
                                {p.stockStatus === "low_stock" && <span className="text-[9px] font-bold bg-orange/10 text-orange px-2.5 py-1 rounded-full border border-orange/20">Low Stock</span>}
                                {p.stockStatus === "sold_out" && <span className="text-[9px] font-bold bg-red-50 text-red-500 px-2.5 py-1 rounded-full border border-red-200">Sold Out</span>}
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditProductClick(p)}
                                  className="px-3 py-1.5 rounded-lg bg-yellow/20 hover:bg-yellow/30 text-purple text-[10px] font-bold transition cursor-pointer"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteProductClick(p.id, p.name)}
                                  className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 text-[10px] font-bold transition cursor-pointer"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                // Form view (Add or Edit)
                <div className="max-w-3xl mx-auto space-y-4">
                  <button
                    onClick={() => setProductMode("list")}
                    className="flex items-center gap-1.5 text-purple hover:text-coral transition font-bold text-xs cursor-pointer border-none bg-transparent"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Products List
                  </button>

                  <div className="bg-white rounded-[2rem] p-6 sm:p-8 border-2 border-yellow/20 shadow-md">
                    <h2 className="font-display text-2xl text-purple flex items-center gap-2 mb-6 border-b border-purple/5 pb-4">
                      {productMode === "edit" ? "✏️ Edit Product Details" : "🎁 Add Adorable Product"}
                    </h2>

                    <form onSubmit={handleAddProductSubmit} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        {/* Name */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-purple uppercase tracking-wider block">Product Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Kawaii Bunny Plushie"
                            value={prodName}
                            onChange={(e) => setProdName(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl bg-cream/35 border-2 border-purple/10 focus:border-coral outline-none text-sm transition font-body"
                          />
                        </div>

                        {/* Category */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-purple uppercase tracking-wider block">Category *</label>
                          <CuteSelect
                            value={prodCategory}
                            onChange={(val) => setProdCategory(val)}
                            options={categories.map((c) => ({ value: c.name, label: c.name }))}
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-5">
                        {/* Price */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-purple uppercase tracking-wider block">Price (₹) *</label>
                          <input
                            type="number"
                            required
                            min="1"
                            placeholder="e.g. 499"
                            value={prodPrice}
                            onChange={(e) => setProdPrice(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl bg-cream/35 border-2 border-purple/10 focus:border-coral outline-none text-sm transition font-body"
                          />
                        </div>

                        {/* Old Price */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-purple uppercase tracking-wider block">Old Price (₹, optional)</label>
                          <input
                            type="number"
                            min="1"
                            placeholder="e.g. 799"
                            value={prodOldPrice}
                            onChange={(e) => setProdOldPrice(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl bg-cream/35 border-2 border-purple/10 focus:border-coral outline-none text-sm transition font-body"
                          />
                        </div>

                        {/* Tag */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-purple uppercase tracking-wider block">Product Tag</label>
                          <CuteSelect
                            value={prodTag}
                            onChange={(val) => setProdTag(val)}
                            options={[
                              { value: "", label: "None" },
                              { value: "Best Sellers", label: "Best Sellers" },
                              { value: "New In", label: "New In" },
                              { value: "Sale", label: "Sale" },
                              { value: "New", label: "New" },
                              { value: "Hot", label: "Hot" },
                            ]}
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        {/* Stock Status */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-purple uppercase tracking-wider block">Stock Status *</label>
                          <div className="flex gap-2">
                            {[
                              { value: "in_stock", label: "✓ In Stock", color: "text-teal border-teal/20 bg-teal/5" },
                              { value: "low_stock", label: "⚠️ Low Stock", color: "text-orange border-orange/20 bg-orange/5" },
                              { value: "sold_out", label: "✕ Sold Out", color: "text-red-500 border-red-200 bg-red-50" },
                            ].map((s) => (
                              <button
                                key={s.value}
                                type="button"
                                onClick={() => setProdStockStatus(s.value as any)}
                                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                                  prodStockStatus === s.value
                                    ? "bg-purple text-white border-transparent"
                                    : `${s.color} hover:bg-cream`
                                }`}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Colors */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-purple uppercase tracking-wider block">Product Colors</label>
                          
                          {/* Predefined Colors Grid */}
                          <div className="flex flex-wrap gap-2 p-2.5 bg-cream/20 rounded-2xl border-2 border-purple/5">
                            {PRESET_COLORS.map((color) => {
                              const currentList = prodColors.split(",").map(c => c.trim().toLowerCase()).filter(Boolean);
                              const isSelected = currentList.includes(color.name.toLowerCase());
                              return (
                                <button
                                  key={color.name}
                                  type="button"
                                  onClick={() => togglePresetColor(color.name)}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                                    isSelected 
                                      ? "border-coral bg-white text-coral shadow-sm scale-105" 
                                      : "border-transparent bg-white/60 hover:bg-white text-purple/70 hover:text-purple"
                                  }`}
                                >
                                  <span 
                                    className="w-3 h-3 rounded-full border border-black/10 inline-block shrink-0" 
                                    style={{ backgroundColor: color.hex }}
                                  />
                                  {color.name}
                                </button>
                              );
                            })}
                          </div>

                          {/* Custom Colors input */}
                          <div className="space-y-1">
                            <input
                              type="text"
                              placeholder="Or enter custom colors (comma separated, e.g. Rose Gold, Sakura)"
                              value={prodColors}
                              onChange={(e) => setProdColors(e.target.value)}
                              className="w-full px-4 py-3 rounded-2xl bg-cream/35 border-2 border-purple/10 focus:border-coral outline-none text-sm transition font-body"
                            />
                            <span className="text-[10px] text-foreground/40 pl-2">Selected: {prodColors || "None"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        {/* Weight */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-purple uppercase tracking-wider block">Weight (grams) *</label>
                          <input
                            type="number"
                            required
                            min="1"
                            placeholder="e.g. 500"
                            value={prodWeight}
                            onChange={(e) => setProdWeight(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl bg-cream/35 border-2 border-purple/10 focus:border-coral outline-none text-sm transition font-body"
                          />
                        </div>
                      </div>

                      {/* Image Selector Tab */}
                      <div className="space-y-2 border-t border-purple/5 pt-4">
                        <label className="text-xs font-bold text-purple uppercase tracking-wider block">Product Image *</label>
                        <div className="flex gap-4 mb-3">
                          <button
                            type="button"
                            onClick={() => setProdImageSource("upload")}
                            className={`flex-1 py-2 px-4 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                              prodImageSource === "upload"
                                ? "bg-purple text-white border-transparent"
                                : "border-purple/10 hover:bg-cream text-purple"
                            }`}
                          >
                            <ImageIcon className="w-3.5 h-3.5" /> Upload File
                          </button>
                          <button
                            type="button"
                            onClick={() => setProdImageSource("url")}
                            className={`flex-1 py-2 px-4 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                              prodImageSource === "url"
                                ? "bg-purple text-white border-transparent"
                                : "border-purple/10 hover:bg-cream text-purple"
                            }`}
                          >
                            <ImageIcon className="w-3.5 h-3.5" /> Image URL
                          </button>
                        </div>

                        {prodImageSource === "upload" ? (
                          <div className="p-4 rounded-2xl border-2 border-dashed border-purple/10 bg-cream/20 flex flex-col items-center justify-center gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              ref={productFileRef}
                              onChange={handleProductImageFileChange}
                              className="hidden"
                              id="prod-file-input"
                            />
                            <label
                              htmlFor="prod-file-input"
                              className="px-5 py-2 rounded-xl bg-purple text-white text-xs font-bold hover:bg-coral transition cursor-pointer"
                            >
                              Choose Cute Image
                            </label>
                            {prodImageBase64 ? (
                              <div className="mt-3 flex items-center gap-3">
                                <img src={prodImageBase64} alt="Preview" className="w-14 h-14 object-cover rounded-xl border-2 border-white shadow-md" />
                                <span className="text-xs text-teal font-semibold">✓ Image uploaded & compressed</span>
                              </div>
                            ) : (
                              <span className="text-xs text-foreground/40 font-body">PNG, JPG, JPEG (will be compressed locally)</span>
                            )}
                          </div>
                        ) : (
                          <input
                            type="url"
                            placeholder="https://example.com/cute-product-image.jpg"
                            value={prodImageUrl}
                            onChange={(e) => setProdImageUrl(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl bg-cream/35 border-2 border-purple/10 focus:border-coral outline-none text-sm transition font-body"
                          />
                        )}
                      </div>

                      {/* Description */}
                      <div className="space-y-1.5 border-t border-purple/5 pt-4">
                        <label className="text-xs font-bold text-purple uppercase tracking-wider block">Description *</label>
                        <textarea
                          required
                          rows={3}
                          placeholder="Write a cute description of the product and its features..."
                          value={prodDescription}
                          onChange={(e) => setProdDescription(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl bg-cream/35 border-2 border-purple/10 focus:border-coral outline-none text-sm transition font-body resize-none"
                        />
                      </div>

                      {/* Details / Specs */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-purple uppercase tracking-wider block">Detailed Bullet Points (One per line)</label>
                        <textarea
                          rows={3}
                          placeholder="e.g. Material: Premium polymer clay&#10;Dimensions: 10cm x 10cm&#10;Includes 2 matching pencils"
                          value={prodDetails}
                          onChange={(e) => setProdDetails(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl bg-cream/35 border-2 border-purple/10 focus:border-coral outline-none text-sm transition font-body resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-4 rounded-full bg-coral hover:bg-coral/95 text-white font-bold text-sm shadow-[0_6px_0_0_#c4513f] hover:translate-y-0.5 hover:shadow-[0_2px_0_0_#c4513f] transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        {productMode === "edit" ? (
                          <>✏️ Update Product Details</>
                        ) : (
                          <>
                            <PlusCircle className="w-5 h-5" /> Add Product
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Track Orders Card View */}
          {viewMode === "track-orders" && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Toolbar */}
              <div className="bg-white rounded-3xl p-5 border-2 border-yellow/20 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <h2 className="font-display text-2xl text-purple flex items-center gap-2 shrink-0">
                  📦 Customer Orders ({filteredOrders.length})
                </h2>
                <div className="relative w-full sm:max-w-xs">
                  <input
                    type="text"
                    placeholder="Search by ID or name..."
                    value={searchOrderQuery}
                    onChange={(e) => setSearchOrderQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-full bg-cream/40 border-2 border-purple/10 focus:border-coral outline-none text-xs font-body transition-colors"
                  />
                  <Clock className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-purple/40" />
                </div>
              </div>

              {/* Order List */}
              <div className="space-y-4">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const itemsCount = order.items.reduce((acc: number, item: any) => acc + item.quantity, 0);

                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-[2rem] border-2 border-yellow/20 shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
                      >
                        {/* Summary Header */}
                        <div
                          onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                          className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-purple/5 bg-cream/5 cursor-pointer hover:bg-cream/10 transition-colors"
                        >
                          <div className="space-y-1 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="font-display text-lg text-purple font-bold">{order.id}</span>
                              <span className="text-xs text-foreground/50 flex items-center gap-1 font-body">
                                <Calendar className="w-3.5 h-3.5 text-purple/40" /> {formatDate(order.date)}
                              </span>
                            </div>
                            <div className="text-sm font-body text-foreground/70">
                              Customer: <span className="font-bold text-purple">{order.customerName}</span> • Items: <span className="font-bold">{itemsCount}</span> • Total: <span className="font-bold text-coral">₹{order.totalAmount}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                            {/* Status Badge */}
                            <div>
                              {order.status === "pending" && (
                                <span className="bg-orange/10 text-orange px-3 py-1 rounded-full text-xs font-bold border border-orange/20">
                                  ⏳ Pending
                                </span>
                              )}
                              {order.status === "shipped" && (
                                <span className="bg-purple/10 text-purple px-3 py-1 rounded-full text-xs font-bold border border-purple/20">
                                  🚚 Shipped
                                </span>
                              )}
                              {order.status === "delivered" && (
                                <span className="bg-teal/10 text-teal px-3 py-1 rounded-full text-xs font-bold border border-teal/20">
                                  ✓ Delivered
                                </span>
                              )}
                            </div>

                            {/* Actions & Toggle */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteOrder(order.id);
                                }}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition cursor-pointer"
                                title="Delete Order"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <div className="p-1 text-purple/50">
                                {expandedOrderId === order.id ? (
                                  <ChevronUp className="w-4.5 h-4.5" />
                                ) : (
                                  <ChevronDown className="w-4.5 h-4.5" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Collapsible Details */}
                        {expandedOrderId === order.id && (
                          <div className="p-6 space-y-6 font-body text-sm border-t border-purple/5 animate-fade-in">
                            <div className="grid md:grid-cols-2 gap-6">
                              {/* Customer and Shipping Details */}
                              <div className="bg-white p-5 rounded-2xl border border-purple/5 shadow-sm space-y-4">
                                <h3 className="font-display text-base text-purple flex items-center gap-2 border-b border-purple/5 pb-2">
                                  <MapPin className="w-4 h-4 text-coral" /> Customer & Shipping Info
                                </h3>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-foreground/50 font-semibold w-16 shrink-0">Email:</span>
                                    <span className="text-purple flex items-center gap-1 min-w-0 flex-1">
                                      <Mail className="w-3.5 h-3.5 shrink-0" />
                                      <span className="truncate break-all text-xs" title={order.customerEmail}>
                                        {order.customerEmail}
                                      </span>
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-foreground/50 font-semibold w-16 shrink-0">Phone:</span>
                                    <span className="text-purple flex items-center gap-1 shrink-0"><Phone className="w-3.5 h-3.5" /> {order.customerPhone}</span>
                                    {order.customerPhone && (
                                      <a
                                        href={`https://wa.me/91${order.customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
                                          `Hi ${order.customerName}! 🌸 Thank you for shopping with Hapyezta. Your order ${order.id} status is: ${order.status.toUpperCase()}.\n\nYou can track your package here: ${
                                            typeof window !== "undefined"
                                              ? `${window.location.origin}/?track=${order.id}`
                                              : `https://hapyezta-cute-shop.vercel.app/?track=${order.id}`
                                          }\n\nWe are packing it with love! 💕✨`
                                        )}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-2 inline-flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full transition-colors cursor-pointer select-none font-display"
                                      >
                                        💬 WhatsApp
                                      </a>
                                    )}
                                  </div>
                                  <div className="flex items-start gap-2 pt-2 border-t border-purple/5">
                                    <span className="text-foreground/50 font-semibold w-16 shrink-0 mt-0.5">Address:</span>
                                    <div className="text-foreground/80 leading-relaxed">
                                      <p>{order.shippingAddress.street}</p>
                                      <p>{order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Order & Status Action Card */}
                              <div className="bg-white p-5 rounded-2xl border border-purple/5 shadow-sm space-y-4">
                                <h3 className="font-display text-base text-purple flex items-center gap-2 border-b border-purple/5 pb-2">
                                  ⚡ Update Order Status
                                </h3>
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-foreground/60 font-semibold">Current Status:</span>
                                    <span className="capitalize font-bold text-purple">{order.status}</span>
                                  </div>
                                  <div className="flex gap-2 pt-2">
                                    {[
                                      { statusName: "pending", label: "Pending", style: "border-orange/20 text-orange hover:bg-orange/5 bg-orange/5" },
                                      { statusName: "shipped", label: "Shipped", style: "border-purple/20 text-purple hover:bg-purple/5 bg-purple/5" },
                                      { statusName: "delivered", label: "Delivered", style: "border-teal/20 text-teal hover:bg-teal/5 bg-teal/5" },
                                    ].map((btn) => (
                                      <button
                                        key={btn.statusName}
                                        onClick={() => handleUpdateOrderStatus(order.id, btn.statusName)}
                                        className={`flex-1 py-2 px-1 text-center rounded-xl border text-xs font-bold transition cursor-pointer ${
                                          order.status === btn.statusName
                                            ? "bg-purple text-white border-transparent"
                                            : btn.style
                                        }`}
                                      >
                                        {btn.label}
                                      </button>
                                    ))}
                                  </div>
                                  <div className="flex justify-between border-t border-purple/5 pt-3 text-xs text-foreground/50">
                                    <span>Method: {order.paymentMethod === "online" ? "UPI/Online" : "Cash on Delivery"}</span>
                                    <span>Shipping: ₹{order.shippingCost}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Customer Uploaded Image Reference */}
                              {order.customerImage && (
                                <div className="bg-white p-5 rounded-2xl border border-purple/5 shadow-sm space-y-4 md:col-span-2">
                                  <h3 className="font-display text-base text-purple flex items-center gap-2 border-b border-purple/5 pb-2">
                                    🖼️ Customer Reference Image / Screenshot
                                  </h3>
                                  <div className="flex flex-col sm:flex-row items-start gap-4">
                                    <a href={order.customerImage} target="_blank" rel="noopener noreferrer" className="block shrink-0">
                                      <img
                                        src={order.customerImage}
                                        alt="Customer reference"
                                        className="w-32 h-32 object-cover rounded-xl border border-purple/10 hover:opacity-90 transition cursor-pointer"
                                      />
                                    </a>
                                    <div className="space-y-2 text-xs text-foreground/75 leading-relaxed font-body">
                                      <p className="font-semibold text-purple">Attachment provided by customer during checkout.</p>
                                      <p>This may contain payment screenshots, custom notes, packaging references, or design details.</p>
                                      <a
                                        href={order.customerImage}
                                        download={`reference-${order.id}.jpg`}
                                        className="inline-block mt-2 px-4 py-1.5 bg-purple text-white rounded-full font-bold hover:bg-coral transition text-[10px] uppercase tracking-wider cursor-pointer"
                                      >
                                        💾 Download Image
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Ordered Items List */}
                            <div className="bg-white p-5 rounded-2xl border border-purple/5 shadow-sm space-y-4">
                              <h3 className="font-display text-base text-purple flex items-center gap-2 border-b border-purple/5 pb-2">
                                <ListOrdered className="w-4 h-4 text-teal" /> Placed Items
                              </h3>
                              <div className="space-y-3 divide-y divide-purple/5">
                                {order.items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex items-center justify-between gap-4 pt-3 first:pt-0">
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={resolveImage(item.img)}
                                        alt={item.name}
                                        className="w-12 h-12 object-cover rounded-xl border border-purple/10 bg-cream/10 shrink-0"
                                      />
                                      <div>
                                        <h4 className="font-semibold text-purple line-clamp-1">{item.name}</h4>
                                        {item.color && (
                                          <span className="text-[10px] bg-purple/10 text-purple px-2 py-0.5 rounded-full font-bold">
                                            Color: {item.color}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <span className="text-xs text-foreground/60">{item.priceString} x {item.quantity}</span>
                                      <p className="font-bold text-coral mt-0.5">₹{item.price * item.quantity}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-purple/15">
                    <p className="text-base text-foreground/50">No customer orders found yet! 🌸</p>
                    <p className="text-xs text-foreground/40 mt-1">Orders placed on checkout will be listed here.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Admin Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t-2 border-yellow/20 shadow-[0_-8px_24px_rgba(127,88,165,0.08)] pb-safe">
        <div className="flex items-center justify-around h-16 px-1">
          {/* Analytics Tab */}
          <button
            onClick={() => setViewMode("analytics")}
            className={`flex-1 flex flex-col items-center justify-center h-full transition-all duration-300 relative cursor-pointer ${
              viewMode === "analytics"
                ? "text-purple scale-105 font-bold"
                : "text-purple/50 hover:text-purple"
            }`}
          >
            <BarChart2 className="w-4.5 h-4.5 stroke-[2.2]" />
            <span className="text-[9px] font-semibold mt-0.5 font-body">Revenue</span>
            {viewMode === "analytics" && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-purple animate-ping" />
            )}
          </button>

          {/* Orders Tab */}
          <button
            onClick={() => setViewMode("track-orders")}
            className={`flex-1 flex flex-col items-center justify-center h-full transition-all duration-300 relative cursor-pointer ${
              viewMode === "track-orders"
                ? "text-purple scale-105 font-bold"
                : "text-purple/50 hover:text-purple"
            }`}
          >
            <Package className="w-4.5 h-4.5 stroke-[2.2]" />
            <span className="text-[9px] font-semibold mt-0.5 font-body">Orders</span>
            {viewMode === "track-orders" && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-purple" />
            )}
          </button>

          {/* Products Tab */}
          <button
            onClick={() => {
              setViewMode("products");
              setProductMode("list");
              setEditingProductId(null);
            }}
            className={`flex-1 flex flex-col items-center justify-center h-full transition-all duration-300 relative cursor-pointer ${
              viewMode === "products"
                ? "text-purple scale-105 font-bold"
                : "text-purple/50 hover:text-purple"
            }`}
          >
            <ShoppingBag className="w-4.5 h-4.5 stroke-[2.2]" />
            <span className="text-[9px] font-semibold mt-0.5 font-body">Products</span>
            {viewMode === "products" && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-purple" />
            )}
          </button>

          {/* Categories Tab */}
          <button
            onClick={() => setViewMode("categories")}
            className={`flex-1 flex flex-col items-center justify-center h-full transition-all duration-300 relative cursor-pointer ${
              viewMode === "categories"
                ? "text-purple scale-105 font-bold"
                : "text-purple/50 hover:text-purple"
            }`}
          >
            <Tag className="w-4.5 h-4.5 stroke-[2.2]" />
            <span className="text-[9px] font-semibold mt-0.5 font-body">Categories</span>
            {viewMode === "categories" && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-purple" />
            )}
          </button>

          {/* Customers Tab */}
          <button
            onClick={() => setViewMode("customers")}
            className={`flex-1 flex flex-col items-center justify-center h-full transition-all duration-300 relative cursor-pointer ${
              viewMode === "customers"
                ? "text-purple scale-105 font-bold"
                : "text-purple/50 hover:text-purple"
            }`}
          >
            <Users className="w-4.5 h-4.5 stroke-[2.2]" />
            <span className="text-[9px] font-semibold mt-0.5 font-body">Customers</span>
            {viewMode === "customers" && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-purple" />
            )}
          </button>
        </div>
      </div>

      <footer className="py-6 border-t border-purple/10 text-center text-xs text-foreground/40 font-body mb-16 lg:mb-0">
        © {new Date().getFullYear()} Hapyezta Admin Console. All rights reserved.
      </footer>
    </div>
  );
}
