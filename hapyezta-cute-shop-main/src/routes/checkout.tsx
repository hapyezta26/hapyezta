import React, { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCart } from "@/context/CartContext";
import { useAccount } from "@/context/AccountContext";
import { useProducts } from "@/context/ProductContext";
import { calculateShippingCost } from "@/lib/products";
import { createOrderFn } from "@/lib/api/db.functions";
import { resolveImage } from "@/lib/image-resolver";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { ArrowLeft, ShoppingBag, CheckCircle, CreditCard, Landmark, Truck, Image as ImageIcon } from "lucide-react";


export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Secure Checkout - Hapyezta" },
      { name: "description", content: "Complete your order with Hapyezta. Adorable kawaii items are just one step away!" },
    ],
  }),
  component: Checkout,
});

const INDIAN_STATES = [
  "Kerala", "Tamil Nadu", "Karnataka",
  "Andhra Pradesh", "Telangana", "Puducherry", "Lakshadweep",
  "Andaman and Nicobar Islands", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Ladakh", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const getStateFromPincode = (pin: string): string => {
  if (pin.length < 2) return "";
  const prefix = parseInt(pin.slice(0, 2), 10);
  
  if (prefix === 11) return "Delhi";
  if (prefix >= 12 && prefix <= 13) return "Haryana";
  if (prefix >= 14 && prefix <= 15) return "Punjab";
  if (prefix === 16) return "Punjab";
  if (prefix === 17) return "Himachal Pradesh";
  if (prefix >= 18 && prefix <= 19) return "Jammu and Kashmir";
  if (prefix >= 20 && prefix <= 28) return "Uttar Pradesh";
  if (prefix >= 30 && prefix <= 34) return "Rajasthan";
  if (prefix >= 36 && prefix <= 39) return "Gujarat";
  if (prefix >= 40 && prefix <= 44) return "Maharashtra";
  if (prefix >= 45 && prefix <= 48) return "Madhya Pradesh";
  if (prefix === 49) return "Chhattisgarh";
  if (prefix >= 50 && prefix <= 53) {
    if (prefix === 50) return "Telangana";
    return "Andhra Pradesh";
  }
  if (prefix >= 56 && prefix <= 59) return "Karnataka";
  if (prefix >= 60 && prefix <= 64) return "Tamil Nadu";
  if (prefix >= 67 && prefix <= 69) return "Kerala";
  if (prefix >= 70 && prefix <= 74) return "West Bengal";
  if (prefix >= 75 && prefix <= 77) return "Odisha";
  if (prefix === 78) return "Assam";
  if (prefix >= 80 && prefix <= 85) return "Bihar";
  
  return "";
};

function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { products } = useProducts();
  const { saveProfile, isLoggedIn, profileName, profileEmail, profilePhone } = useAccount();
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [pincode, setPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("online"); // "online"
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [uploadedImageBase64, setUploadedImageBase64] = useState("");

  const handleUploadedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const max_size = 400;
          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.7);
          setUploadedImageBase64(compressed);
        };
        if (event.target?.result) {
          img.src = event.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submission states
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [deliveryDateRange, setDeliveryDateRange] = useState("");

  // Prefill details from active profile session
  useEffect(() => {
    if (isLoggedIn) {
      if (profileName) setName(profileName);
      if (profileEmail) setEmail(profileEmail);
      if (profilePhone) setPhone(profilePhone);
    }
  }, [isLoggedIn, profileName, profileEmail, profilePhone]);

  const totalWeightGrams = cartItems.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.id);
    const weight = item.weight ?? product?.weight ?? 500;
    return sum + (weight * item.quantity);
  }, 0);

  const shippingCost = calculateShippingCost(totalWeightGrams);
  const finalShippingCost = shippingCost;
  const grandTotal = cartTotal + finalShippingCost;

  // Generate order success details on submit
  const generateOrderDetails = () => {
    // Generate a random ID: HAP-2026-XXXX
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setOrderId(`HAP-2026-${randomNum}`);

    // Generate expected delivery date range (3 to 5 business days from now)
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    const today = new Date();
    
    const minDelivery = new Date(today);
    minDelivery.setDate(today.getDate() + 3);
    
    const maxDelivery = new Date(today);
    maxDelivery.setDate(today.getDate() + 5);

    const minStr = minDelivery.toLocaleDateString("en-IN", options);
    const maxStr = maxDelivery.toLocaleDateString("en-IN", options);
    const year = maxDelivery.getFullYear();
    setDeliveryDateRange(`${minStr} – ${maxStr}, ${year}`);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate cart
    if (cartItems.length === 0) {
      alert("Your cart is empty! Add some cute items first 🌸");
      return;
    }

    // Validation
    if (!name || !email || !phone || !street || !city || !selectedState || !pincode) {
      alert("Please fill in all the shipping and personal details 🌸");
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      alert("Please enter a valid 6-digit PIN code 🌸");
      return;
    }

    if (!/^\+?\d{10,12}$/.test(phone.replace(/\s+/g, ""))) {
      alert("Please enter a valid phone number 🌸");
      return;
    }

    // Generate details
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newOrderId = `HAP-2026-${randomNum}`;

    const dateOptions: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    const today = new Date();
    const minDelivery = new Date(today);
    minDelivery.setDate(today.getDate() + 3);
    const maxDelivery = new Date(today);
    maxDelivery.setDate(today.getDate() + 5);
    const minStr = minDelivery.toLocaleDateString("en-IN", dateOptions);
    const maxStr = maxDelivery.toLocaleDateString("en-IN", dateOptions);
    const year = maxDelivery.getFullYear();
    const newDateRange = `${minStr} – ${maxStr}, ${year}`;

    setOrderId(newOrderId);
    setDeliveryDateRange(newDateRange);

    // Create Order Object
    const orderData = {
      id: newOrderId,
      date: new Date().toISOString(),
      deliveryEstimate: newDateRange,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      shippingAddress: { street, city, state: selectedState, pincode },
      paymentMethod,
      items: cartItems,
      shippingCost,
      totalAmount: grandTotal,
      status: "pending",
      customerImage: uploadedImageBase64 || undefined
    };

    const finalizedOrder = {
      ...orderData,
      razorpayPaymentId: "manual_pending",
      paymentStatus: "pending"
    };

    // Save/register profile automatically from checkout data
    try {
      saveProfile(name, "🌸", email, phone);
    } catch (e) {
      console.error("Failed to auto-create profile:", e);
    }

    // Save to localStorage
    try {
      const existingOrders = JSON.parse(localStorage.getItem("hapyezta-orders") || "[]");
      localStorage.setItem("hapyezta-orders", JSON.stringify([finalizedOrder, ...existingOrders]));
    } catch (error) {
      console.error("Failed to save order to localStorage:", error);
    }

    // Save to database
    try {
      await createOrderFn({
        data: {
          id: finalizedOrder.id,
          customerName: finalizedOrder.customerName,
          customerEmail: finalizedOrder.customerEmail,
          customerPhone: finalizedOrder.customerPhone,
          items: finalizedOrder.items,
          cartTotal: Math.round(finalizedOrder.totalAmount - finalizedOrder.shippingCost),
          shippingAddress: finalizedOrder.shippingAddress,
          shippingCost: finalizedOrder.shippingCost,
          grandTotal: finalizedOrder.totalAmount,
          paymentMethod: finalizedOrder.paymentMethod,
          screenshot: finalizedOrder.customerImage || undefined,
          status: finalizedOrder.status,
          createdAt: finalizedOrder.date,
          deliveryEstimate: finalizedOrder.deliveryEstimate || undefined
        }
      });
    } catch (err) {
      console.error("Failed to save order to database:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      alert(`Something went wrong saving the order: ${errMsg}\n\nPlease try again! 🌸`);
      return;
    }

    // Clear cart
    clearCart();

    // Mark as submitted
    setIsSubmitted(true);
  };

  // Scroll to top on submit/success
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (isSubmitted) {
      // Clear cart context
      clearCart();
    }
  }, [isSubmitted]);

  // If order is placed successfully, display Success screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <div>
          {/* Simple header */}
          <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b-2 border-yellow/30 py-4 px-4">
            <div className="max-w-7xl mx-auto flex justify-center">
              <Link to="/">
                <Logo size="sm" withSlogan={false} className="items-center" />
              </Link>
            </div>
          </header>

          <main className="max-w-xl mx-auto px-4 py-16">
            <div className="bg-white rounded-[2rem] p-8 sm:p-10 border-2 border-yellow/20 shadow-xl text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-teal/10 grid place-items-center text-teal animate-bounce">
                <CheckCircle className="w-12 h-12" />
              </div>

              <div className="space-y-2">
                <h1 className="font-display text-4xl text-purple font-bold">Yay! Order Placed!</h1>
                <p className="text-foreground/75 font-body text-sm">
                  Thank you for shopping with us! Adorable packages are heading your way soon. 🌸✨
                </p>
              </div>

              <div className="p-5 bg-cream/35 rounded-2xl border border-purple/5 text-left space-y-3 font-body text-sm">
                <div className="flex justify-between border-b border-purple/10 pb-2">
                  <span className="text-purple/60 font-semibold uppercase text-xs tracking-wider">Order ID</span>
                  <span className="font-bold text-purple">{orderId}</span>
                </div>
                <div className="flex justify-between border-b border-purple/10 pb-2">
                  <span className="text-purple/60 font-semibold uppercase text-xs tracking-wider">Delivery estimate</span>
                  <span className="font-bold text-teal">{deliveryDateRange}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-purple/60 font-semibold uppercase text-[10px] tracking-wider block">Deliver To</span>
                  <span className="font-bold text-purple">{name}</span>
                  <p className="text-xs text-foreground/70 leading-relaxed">
                    {street}, {city}, {selectedState} – {pincode}
                  </p>
                  <p className="text-xs text-foreground/60">Phone: {phone}</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/"
                  className="inline-flex px-8 py-3.5 rounded-full bg-coral hover:bg-coral/95 text-white font-bold shadow-[0_4px_0_0_#c4513f] hover:translate-y-0.5 hover:shadow-[0_1px_0_0_#c4513f] transition-all text-sm cursor-pointer"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        {/* Simple checkout header */}
        <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b-2 border-yellow/30 py-4 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-1 text-purple hover:text-coral transition font-bold text-xs"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Shop
            </Link>
            <Link to="/">
              <Logo size="sm" withSlogan={false} className="items-center" />
            </Link>
            <div className="w-24" />
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-10">
          {cartItems.length === 0 ? (
            /* Empty Cart Warning state */
            <div className="text-center py-20 max-w-md mx-auto space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-coral/10 grid place-items-center text-4xl select-none">
                😿
              </div>
              <h2 className="font-display text-2xl text-purple">Your checkout is empty</h2>
              <p className="text-foreground/75 font-body text-sm leading-relaxed">
                Add some dreamy items to your cart before proceeding to checkout!
              </p>
              <Link
                to="/"
                className="inline-block px-7 py-3 rounded-full bg-purple text-white font-bold shadow-[0_4px_0_0_#492275] hover:translate-y-0.5 hover:shadow-[0_1px_0_0_#492275] transition-all"
              >
                Go Shop Adorable Things
              </Link>
            </div>
          ) : (
            /* Checkout Form and Summary split columns */
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Form */}
              <div className="lg:col-span-7 bg-white rounded-[2rem] p-6 sm:p-8 border-2 border-yellow/20 shadow-md space-y-8">
                <h2 className="font-display text-2xl text-purple border-b border-purple/5 pb-3">
                  Shipping & Personal Details
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6 font-body">
                  {/* Step 1: Personal Details */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-orange uppercase tracking-wider">
                      1. Contact Information
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-purple/80 text-xs font-bold mb-1.5 pl-2">Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-5 py-3 rounded-full border-2 border-yellow/10 focus:border-orange bg-cream/10 text-xs outline-none transition placeholder:text-foreground/30 text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-purple/80 text-xs font-bold mb-1.5 pl-2">Email Address</label>
                        <input
                          type="email"
                          required
                          placeholder="you@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-5 py-3 rounded-full border-2 border-yellow/10 focus:border-orange bg-cream/10 text-xs outline-none transition placeholder:text-foreground/30 text-foreground"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-purple/80 text-xs font-bold mb-1.5 pl-2">Phone Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-5 py-3 rounded-full border-2 border-yellow/10 focus:border-orange bg-cream/10 text-xs outline-none transition placeholder:text-foreground/30 text-foreground"
                      />
                    </div>
                  </div>

                  {/* Step 2: Shipping details */}
                  <div className="space-y-4 pt-4 border-t border-purple/5">
                    <h3 className="text-xs font-bold text-orange uppercase tracking-wider">
                      2. Delivery Address
                    </h3>
                    <div>
                      <label className="block text-purple/80 text-xs font-bold mb-1.5 pl-2">Street Address</label>
                      <input
                        type="text"
                        required
                        placeholder="House no., street name, apartment name"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full px-5 py-3 rounded-full border-2 border-yellow/10 focus:border-orange bg-cream/10 text-xs outline-none transition placeholder:text-foreground/30 text-foreground"
                      />
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-purple/80 text-xs font-bold mb-1.5 pl-2">City</label>
                        <input
                          type="text"
                          required
                          placeholder="City"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-5 py-3 rounded-full border-2 border-yellow/10 focus:border-orange bg-cream/10 text-xs outline-none transition placeholder:text-foreground/30 text-foreground"
                        />
                      </div>
                      <div className="relative">
                        <label className="block text-purple/80 text-xs font-bold mb-1.5 pl-2">State</label>
                        <button
                          type="button"
                          onClick={() => setIsDropdownOpen((o) => !o)}
                          className="w-full flex items-center justify-between px-5 py-3 rounded-full border-2 border-yellow/10 focus:border-orange bg-cream/10 text-xs text-foreground outline-none transition text-left cursor-pointer animate-none"
                        >
                          <span>{selectedState || "Select State"}</span>
                          <span className="text-purple/50 text-[10px] select-none">▼</span>
                        </button>
                        
                        {isDropdownOpen && (
                          <>
                            {/* Backdrop to close dropdown on click outside */}
                            <div 
                              className="fixed inset-0 z-40" 
                              onClick={() => setIsDropdownOpen(false)}
                            />
                            <div className="absolute left-0 right-0 mt-1.5 z-50 max-h-[250px] overflow-y-auto bg-white border-2 border-yellow/20 rounded-2xl shadow-xl p-1.5 space-y-0.5">
                              {INDIAN_STATES.map((st) => (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => {
                                    setSelectedState(st);
                                    setIsDropdownOpen(false);
                                  }}
                                  className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-cream text-xs text-purple font-semibold hover:text-orange transition-colors cursor-pointer border-none bg-transparent"
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                      <div>
                        <label className="block text-purple/80 text-xs font-bold mb-1.5 pl-2">PIN Code</label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="6 digits"
                          value={pincode}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                            setPincode(val);
                            const detectedState = getStateFromPincode(val);
                            if (detectedState) {
                              setSelectedState(detectedState);
                            }
                          }}
                          className="w-full px-5 py-3 rounded-full border-2 border-yellow/10 focus:border-orange bg-cream/10 text-xs outline-none transition placeholder:text-foreground/30 text-foreground"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Reference Image (Optional) */}
                  <div className="space-y-4 pt-4 border-t border-purple/5">
                    <h3 className="text-xs font-bold text-orange uppercase tracking-wider flex items-center gap-1.5">
                      <span>3. Reference Image / Note (Optional)</span>
                    </h3>
                    <p className="text-[11px] text-foreground/60 leading-relaxed pl-1 font-body">
                      Upload a payment screenshot, customization reference, or gift note! 🌸
                    </p>
                    <div className="border-2 border-dashed border-purple/10 rounded-2xl p-4 text-center bg-cream/5 hover:bg-cream/15 transition relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadedImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {uploadedImageBase64 ? (
                        <div className="space-y-2">
                          <img
                            src={uploadedImageBase64}
                            alt="Reference preview"
                            className="w-16 h-16 object-cover mx-auto rounded-xl border border-purple/10"
                          />
                          <p className="text-[10px] text-teal font-semibold font-display">✓ Image uploaded successfully</p>
                        </div>
                      ) : (
                        <div className="space-y-1 text-purple/50">
                          <ImageIcon className="w-5 h-5 mx-auto" />
                          <p className="text-[10px] font-semibold font-display">Click to upload image</p>
                          <p className="text-[8px] text-foreground/40 font-body">PNG, JPG, JPEG (compressed locally)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 4: Payment */}
                  <div className="space-y-4 pt-4 border-t border-purple/5">
                    <h3 className="text-xs font-bold text-orange uppercase tracking-wider">
                      4. Payment Method
                    </h3>
                    <div className="p-4 rounded-2xl border-2 border-coral bg-coral/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-coral shrink-0" />
                        <div>
                          <span className="block font-bold text-xs text-purple">Pay Online (UPI, Card, NetBanking)</span>
                          <span className="block text-[10px] text-foreground/60 leading-tight">Fast, secure, and fully encrypted transaction</span>
                        </div>
                      </div>
                      <div className="text-xs text-teal font-bold bg-teal/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Secure
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      type="submit"
                      className="w-full py-4 rounded-full bg-coral hover:bg-coral/95 text-white font-bold shadow-[0_4px_0_0_#c4513f] hover:translate-y-0.5 hover:shadow-[0_1px_0_0_#c4513f] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                    >
                      Place Order 🌸 (₹{grandTotal})
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Order Summary */}
              <div className="lg:col-span-5 bg-white rounded-[2rem] p-6 sm:p-8 border-2 border-yellow/20 shadow-md space-y-6">
                <h2 className="font-display text-xl text-purple border-b border-purple/5 pb-3 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" /> Order Summary
                </h2>

                {/* Items */}
                <div className="divide-y divide-purple/5 max-h-[300px] overflow-y-auto pr-1 space-y-3.5 pb-2">
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.color}`} className="flex items-center gap-3 pt-3.5 first:pt-0">
                      <div className="w-14 h-14 rounded-xl border border-purple/10 overflow-hidden shrink-0 bg-cream/10">
                        <img src={resolveImage(item.img)} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-xs text-foreground truncate" title={item.name}>
                          {item.name}
                        </h4>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-0.5">
                          <span>
                            Qty: {item.quantity}
                            {item.quantity > 1 && (
                              <span className="text-[9px] text-foreground/45 ml-1.5 bg-purple/5 px-1.5 py-0.5 rounded-md font-mono">
                                {item.quantity} × {item.price} = {item.price * item.quantity}
                              </span>
                            )}
                          </span>
                          {item.color && <span>Color: {item.color}</span>}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-purple shrink-0 pl-2">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-purple/10 pt-4 space-y-2 font-body text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-purple">₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-bold text-purple">₹{shippingCost}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-purple pt-2 border-t border-purple/5">
                    <span>Grand Total</span>
                    <span>₹{grandTotal}</span>
                  </div>
                </div>


              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
