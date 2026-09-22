import React, { useState, useEffect } from "react";
import { useAccount } from "@/context/AccountContext";
import { useCart } from "@/context/CartContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, Package, Settings, LogOut, ArrowLeft, Award, Sparkles, Heart, Image as ImageIcon } from "lucide-react";
import { getUserOrdersFn, getOrdersFn } from "@/lib/api/db.functions";

export function AccountDialogs() {
  const {
    isAccountOpen,
    openAccount,
    closeAccount,
    isLoggedIn,
    profileName,
    profileEmoji,
    profileEmail,
    profilePhone,
    loginWithPhone,
    saveProfile,
    logout,
  } = useAccount();

  // Desktop active tab: 'overview' | 'track' | 'settings'
  const [activeTab, setActiveTab] = useState<"overview" | "track" | "settings">("overview");

  // Mobile active sub-view: 'menu' | 'track' | 'settings'
  const [mobileView, setMobileView] = useState<"menu" | "track" | "settings">("menu");

  const [trackOrderId, setTrackOrderId] = useState("");
  const [trackingResult, setTrackingResult] = useState<any | null>(null);
  const [trackError, setTrackError] = useState("");

  const [editName, setEditName] = useState(profileName);
  const [editEmoji, setEditEmoji] = useState(profileEmoji);
  const [editEmail, setEditEmail] = useState(profileEmail);
  const [editPhone, setEditPhone] = useState(profilePhone);

  // Login flow states: 'phone-input' | 'register'
  const [loginStep, setLoginStep] = useState<"phone-input" | "register">("phone-input");
  const [inputPhone, setInputPhone] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerEmoji, setRegisterEmoji] = useState("🌸");
  const [loginError, setLoginError] = useState("");

  // Customer statistics calculations
  const [ordersCount, setOrdersCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [userOrders, setUserOrders] = useState<any[]>([]);

  useEffect(() => {
    async function loadUserOrders() {
      if (isLoggedIn && profilePhone) {
        try {
          const dbOrders = await getUserOrdersFn({ data: { phone: profilePhone } });
          setUserOrders(dbOrders);
          setOrdersCount(dbOrders.length);
          const total = dbOrders.reduce((sum: number, o: any) => sum + (o.grandTotal || 0), 0);
          setTotalSpent(total);
        } catch (e) {
          console.error("Failed to load user orders from db:", e);
          try {
            const stored = localStorage.getItem("hapyezta-orders");
            if (stored) {
              const orders = JSON.parse(stored);
              const cleanPhone = profilePhone.replace(/\D/g, "");
              const matchedOrders = orders.filter(
                (o: any) => o.customerPhone && o.customerPhone.replace(/\D/g, "") === cleanPhone
              );
              setUserOrders(matchedOrders);
              setOrdersCount(matchedOrders.length);
              const total = matchedOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
              setTotalSpent(total);
            }
          } catch (localErr) {
            console.error(localErr);
          }
        }
      } else {
        setUserOrders([]);
        setOrdersCount(0);
        setTotalSpent(0);
      }
    }
    loadUserOrders();
  }, [isLoggedIn, profilePhone, isAccountOpen]);

  // Sync edits when profile values change
  useEffect(() => {
    setEditName(profileName);
    setEditEmoji(profileEmoji);
    setEditEmail(profileEmail);
    setEditPhone(profilePhone);
  }, [profileName, profileEmoji, profileEmail, profilePhone, isAccountOpen]);

  // Reset tabs/views on modal open
  useEffect(() => {
    if (isAccountOpen) {
      setActiveTab("overview");
      setMobileView("menu");
      setTrackOrderId("");
      setTrackingResult(null);
      setTrackError("");
      
      setLoginStep("phone-input");
      setInputPhone("");
      setRegisterName("");
      setRegisterEmail("");
      setLoginError("");
    }
  }, [isAccountOpen]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const clean = inputPhone.replace(/\D/g, "");
    if (!clean || clean.length < 10) {
      setLoginError("Please enter a valid 10-digit number! 🌸");
      return;
    }

    const success = loginWithPhone(clean);
    if (success) {
      setInputPhone("");
    } else {
      setLoginStep("register");
      setRegisterEmoji("🌸");
      setRegisterName("");
      setRegisterEmail("");
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!registerName.trim()) {
      setLoginError("Please enter your name! 🌸");
      return;
    }
    const clean = inputPhone.replace(/\D/g, "");
    if (!clean) return;
    
    saveProfile(registerName.trim(), registerEmoji, registerEmail.trim(), clean);
    setLoginStep("phone-input");
    setInputPhone("");
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile(editName, editEmoji, editEmail, editPhone);
    alert("Profile settings saved successfully! 🌸");
    if (mobileView === "settings") {
      setMobileView("menu");
    }
  };

  const performTracking = async (orderIdToTrack: string) => {
    setTrackError("");
    setTrackingResult(null);

    if (!orderIdToTrack.trim()) {
      setTrackError("Please enter a valid Order ID! 🌸");
      return;
    }

    try {
      const dbOrders = await getOrdersFn();
      const matched = dbOrders.find(
        (o: any) => o.id.trim().toLowerCase() === orderIdToTrack.trim().toLowerCase()
      );
      if (matched) {
        setTrackingResult(matched);
      } else {
        setTrackError("No order found with this ID. 😿 Please check spelling!");
      }
    } catch (err) {
      console.error(err);
      try {
        const stored = localStorage.getItem("hapyezta-orders");
        if (stored) {
          const orders = JSON.parse(stored);
          const matched = orders.find(
            (o: any) => o.id.trim().toLowerCase() === orderIdToTrack.trim().toLowerCase()
          );
          if (matched) {
            setTrackingResult(matched);
            return;
          }
        }
        setTrackError("Something went wrong. Please try again!");
      } catch (localErr) {
        setTrackError("Something went wrong. Please try again!");
      }
    }
  };

  const handleSwitchToTrack = (orderId?: string) => {
    setActiveTab("track");
    setMobileView("track");
    const targetId = orderId || (trackOrderId ? trackOrderId : (userOrders.length > 0 ? userOrders[0].id : ""));
    if (targetId) {
      setTrackOrderId(targetId);
      performTracking(targetId);
    }
  };

  const handleTrackOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performTracking(trackOrderId);
  };

  // URL ?track=ORDER_ID parameter check to auto-open tracking
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const trackId = params.get("track");
      if (trackId) {
        openAccount();
        setActiveTab("track");
        setMobileView("track");
        setTrackOrderId(trackId);
        performTracking(trackId);

        // Clean up URL parameter
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, []);

  const handleLogout = () => {
    logout();
    alert("Logged out successfully. See you soon! 🌸");
    closeAccount();
  };

  const renderTrackForm = () => {
    return (
      <div className="space-y-4 font-body">
      <form onSubmit={handleTrackOrderSubmit} className="space-y-3">
        <label className="block text-xs font-bold text-purple uppercase tracking-wider text-left">
          Enter Order ID
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g., HAP-2026-8921"
            value={trackOrderId}
            onChange={(e) => setTrackOrderId(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-full border-2 border-yellow/20 focus:border-coral bg-cream/10 outline-none transition text-foreground uppercase tracking-wide font-mono placeholder:tracking-normal placeholder:font-sans text-sm"
          />
          <button
            type="submit"
            className="px-6 py-2.5 rounded-full bg-orange hover:bg-orange/95 text-white font-bold transition-all shadow-[0_3px_0_0_#c4513f] hover:translate-y-0.5 hover:shadow-[0_1px_0_0_#c4513f] cursor-pointer text-xs font-display uppercase tracking-wider"
          >
            Track
          </button>
        </div>

        {trackError && (
          <div className="p-3 bg-coral/10 text-coral rounded-2xl text-xs font-bold text-center animate-fade-in">
            🌸 {trackError}
          </div>
        )}
      </form>

      {trackingResult ? (
        <div className="bg-cream/45 border border-yellow/20 rounded-2xl p-4 space-y-3.5 animate-fade-in text-sm text-left">
          <div className="flex items-center justify-between border-b border-purple/5 pb-2.5">
            <span className="font-bold text-purple font-mono">{trackingResult.id}</span>
            <div>
              {trackingResult.status === "pending" && (
                <span className="bg-orange/10 text-orange px-2.5 py-0.5 rounded-full text-xs font-bold border border-orange/20">
                  ⏳ Pending
                </span>
              )}
              {trackingResult.status === "shipped" && (
                <span className="bg-purple/10 text-purple px-2.5 py-0.5 rounded-full text-xs font-bold border border-purple/20">
                  🚚 Shipped
                </span>
              )}
              {trackingResult.status === "delivered" && (
                <span className="bg-teal/10 text-teal px-2.5 py-0.5 rounded-full text-xs font-bold border border-teal/20">
                  ✓ Delivered
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-foreground/75">
            <p>Customer: <span className="font-semibold text-purple">{trackingResult.customerName}</span></p>
            <p>Estimate: <span className="font-semibold text-teal">{trackingResult.deliveryEstimate || "3-5 days"}</span></p>
            <p className="col-span-2">Total Amount: <span className="font-bold text-coral">₹{trackingResult.totalAmount}</span></p>
          </div>

          <div className="border-t border-purple/5 pt-2.5">
            <h4 className="font-display font-semibold text-xs text-purple mb-2">Order Items:</h4>
            <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1">
              {trackingResult.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-xs text-foreground/80">
                  <span className="truncate max-w-[160px] md:max-w-[200px]" title={item.name}>{item.name}</span>
                  <span className="text-foreground/50 shrink-0 font-mono">₹{item.price} x {item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground/60 border border-dashed border-purple/10 rounded-2xl">
          <Package className="w-8 h-8 mx-auto mb-2 opacity-30 text-purple" />
          <p className="text-xs">No active order results. Submit an ID above to view details!</p>
        </div>
      )}
    </div>
    );
  };

  const renderSettingsForm = () => {
    return (
      <form onSubmit={handleSaveSettings} className="space-y-4 font-body">
      <div>
        <label className="block text-xs font-bold text-purple uppercase tracking-wider mb-1.5 text-left">
          Choose Avatar Icon
        </label>
        <div className="grid grid-cols-5 gap-1.5 p-2 bg-white rounded-2xl border border-purple/10">
          {["🌸", "👧", "🐱", "🦊", "🌈", "🦄", "🐼", "🧸", "🍦", "✨"].map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setEditEmoji(emoji)}
              className={`text-xl p-1.5 rounded-xl hover:bg-cream transition cursor-pointer flex items-center justify-center border-2 ${
                editEmoji === emoji ? "border-coral bg-cream/50" : "border-transparent"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1 text-left">
          <label className="block text-xs font-bold text-purple uppercase tracking-wider">
            Full Name
          </label>
          <input
            type="text"
            required
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full px-4 py-2 rounded-full bg-white border-2 border-purple/10 focus:border-coral outline-none text-foreground font-body text-sm transition"
          />
        </div>

        <div className="space-y-1 text-left">
          <label className="block text-xs font-bold text-purple uppercase tracking-wider">
            Email Address
          </label>
          <input
            type="email"
            required
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-full bg-white border-2 border-purple/10 focus:border-coral outline-none text-foreground font-body text-sm transition"
          />
        </div>

        <div className="space-y-1 text-left">
          <label className="block text-xs font-bold text-purple uppercase tracking-wider">
            Phone Number
          </label>
          <input
            type="text"
            required
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
            className="w-full px-4 py-2 rounded-full bg-white border-2 border-purple/10 focus:border-coral outline-none text-foreground font-body text-sm transition"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-2.5 rounded-full bg-orange hover:bg-orange/95 text-white font-bold transition-all shadow-[0_3px_0_0_#c4513f] hover:translate-y-0.5 hover:shadow-[0_1px_0_0_#c4513f] cursor-pointer text-xs font-display uppercase tracking-wider"
      >
        Save Changes
      </button>
    </form>
    );
  };

  const renderOrdersList = () => {
    if (userOrders.length === 0) {
      return (
        <div className="text-center py-6 bg-cream/20 rounded-2xl border border-purple/5">
          <p className="text-xs text-purple/60">No orders placed yet! 🛒</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h5 className="font-display font-bold text-xs text-purple uppercase tracking-wider text-left">
          🛍️ Order History & Tracking
        </h5>
        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
          {userOrders.map((order: any) => {
            const itemCount = order.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
            const status = order.status || "pending";
            return (
              <div
                key={order.id}
                onClick={() => handleSwitchToTrack(order.id)}
                className="p-3.5 bg-white rounded-2xl border border-purple/10 space-y-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] text-left cursor-pointer hover:border-coral/50 hover:shadow-md transition-all duration-200"
                title="Click to track this order 🌸"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="block font-bold text-purple text-xs">{order.id}</span>
                    <span className="block text-[9px] text-foreground/40 font-body">
                      {new Date(order.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })} • {itemCount} {itemCount === 1 ? "item" : "items"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-coral text-xs">₹{order.totalAmount}</span>
                    <span className="inline-block mt-0.5 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider capitalize bg-purple/10 text-purple">
                      {status}
                    </span>
                  </div>
                </div>

                {/* Timeline Progress Bar */}
                <div className="space-y-1">
                  <div className="relative flex justify-between text-[8px] font-semibold text-purple/70">
                    <span className="z-10 bg-white px-1">Placed</span>
                    <span className={`z-10 bg-white px-1 ${status !== "pending" ? "text-purple" : "text-foreground/30"}`}>Shipped</span>
                    <span className={`z-10 bg-white px-1 ${status === "delivered" ? "text-purple" : "text-foreground/30"}`}>Delivered</span>
                    <div className="absolute top-[5px] left-2 right-2 h-0.5 bg-purple/10 -z-10" />
                    <div
                      className="absolute top-[5px] left-2 h-0.5 bg-coral transition-all -z-10"
                      style={{
                        width: status === "delivered" ? "95%" : status === "shipped" ? "50%" : "5%"
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderLoginView = () => (
    <div className="p-4 space-y-6 text-center max-w-sm mx-auto animate-fade-in font-body">
      {loginStep === "phone-input" ? (
        <form onSubmit={handleLoginSubmit} className="space-y-5">
          <div className="space-y-2">
            <div className="text-4xl select-none animate-bounce">✨</div>
            <h3 className="font-display text-2xl text-purple font-bold">Hapyezta Login</h3>
            <p className="text-xs text-foreground/50 leading-relaxed">
              Enter your mobile number to view orders, track packages, and collect sparkles! 🌸
            </p>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-bold text-purple uppercase tracking-wider">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. 9876543210"
              value={inputPhone}
              onChange={(e) => setInputPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-purple/10 focus:border-coral outline-none text-purple font-semibold text-sm transition animate-fade-in"
            />
          </div>

          {loginError && (
            <p className="text-xs text-coral font-semibold bg-coral/10 py-2 px-3 rounded-xl">
              🌸 {loginError}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-full bg-purple hover:bg-purple/95 text-white font-bold transition-all shadow-[0_4px_0_0_#654388] hover:translate-y-0.5 hover:shadow-[0_2px_0_0_#654388] cursor-pointer text-xs font-display uppercase tracking-wider"
          >
            Continue
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegisterSubmit} className="space-y-5">
          <div className="space-y-2">
            <div className="text-4xl select-none animate-pulse">🎁</div>
            <h3 className="font-display text-2xl text-purple font-bold">Join Hapyezta</h3>
            <p className="text-xs text-foreground/50 leading-relaxed">
              Create your profile to start saving and tracking! 💖
            </p>
          </div>

          {/* Emoji picker row */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-bold text-purple uppercase tracking-wider">
              Choose Avatar Emoji *
            </label>
            <div className="flex justify-between p-2.5 bg-white rounded-2xl border-2 border-purple/10">
              {["🌸", "🎀", "🧸", "🐱", "🐰", "🐼", "✨"].map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setRegisterEmoji(em)}
                  className={`text-2xl p-1 hover:scale-110 transition cursor-pointer rounded-lg ${
                    registerEmoji === em ? "bg-cream border border-purple/20 shadow-sm scale-110" : ""
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-bold text-purple uppercase tracking-wider">
              Your Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ananya Sharma"
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-purple/10 focus:border-coral outline-none text-sm transition"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-bold text-purple uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. ananya@kawaii.com"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-purple/10 focus:border-coral outline-none text-sm transition"
            />
          </div>

          {/* Phone (pre-filled, disabled style) */}
          <div className="space-y-1.5 text-left opacity-70">
            <label className="block text-xs font-bold text-purple uppercase tracking-wider">
              Phone Number
            </label>
            <input
              type="text"
              disabled
              value={inputPhone}
              className="w-full px-4 py-3 rounded-2xl bg-cream/35 border-2 border-purple/5 outline-none text-sm cursor-not-allowed"
            />
          </div>

          {loginError && (
            <p className="text-xs text-coral font-semibold bg-coral/10 py-2 px-3 rounded-xl">
              🌸 {loginError}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setLoginStep("phone-input")}
              className="flex-1 py-3 rounded-full border-2 border-purple/10 text-purple font-bold hover:bg-cream transition cursor-pointer text-xs font-display uppercase tracking-wider"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-full bg-purple hover:bg-purple/95 text-white font-bold shadow-[0_4px_0_0_#654388] hover:translate-y-0.5 hover:shadow-[0_2px_0_0_#654388] transition-all cursor-pointer text-xs font-display uppercase tracking-wider"
            >
              Sign Up
            </button>
          </div>
        </form>
      )}
    </div>
  );

  return (
    <Dialog open={isAccountOpen} onOpenChange={(open) => !open && closeAccount()}>
      <DialogContent className={`w-[95vw] rounded-[2.2rem] overflow-hidden bg-cream border-2 border-yellow/20 z-[60] shadow-2xl transition-all duration-300 ${
        isLoggedIn ? "md:max-w-[800px] p-0" : "max-w-[450px] p-6"
      }`}>
        <DialogHeader className="sr-only">
          <DialogTitle>Hapyezta Profile Dashboard</DialogTitle>
        </DialogHeader>

        {!isLoggedIn ? (
          renderLoginView()
        ) : (
          <>
            {/* ========================================================================= */}
            {/* DESKTOP SPLIT DASHBOARD LAYOUT (hidden on mobile, visible md+) */}
            {/* ========================================================================= */}
            <div className="hidden md:grid grid-cols-12 min-h-[480px]">
              {/* LEFT PANEL: Profile Summary & Stats */}
              <div className="col-span-5 bg-gradient-to-b from-yellow/20 via-coral/5 to-purple/5 p-8 flex flex-col justify-between border-r border-purple/5 text-center relative">
                <div className="space-y-5">
                  <div className="relative w-28 h-28 mx-auto mt-4">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-coral to-purple opacity-20 animate-pulse scale-110" />
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-coral to-purple grid place-items-center text-4xl border-4 border-white shadow-lg select-none relative z-10 animate-bounce">
                      {profileEmoji}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display text-xl text-purple font-bold tracking-wide">
                      {profileName}
                    </h3>
                    <p className="text-[11px] text-purple/60 font-body">Member since May 2026</p>
                  </div>

                  <div className="inline-flex items-center gap-1.5 bg-yellow/30 text-purple text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mx-auto">
                    👑 Sparkle VIP Member
                  </div>
                </div>

                {/* Hapyezta Stats Grid */}
                <div className="grid grid-cols-2 gap-2 mt-6 bg-white/70 backdrop-blur-sm p-4 rounded-3xl border border-purple/5 shadow-sm">
                  <div className="text-center">
                    <span className="block font-display text-base text-coral font-bold">₹{totalSpent}</span>
                    <span className="text-[9px] font-bold text-purple/50 uppercase font-body">Spent</span>
                  </div>
                  <div className="text-center border-l border-purple/5">
                    <span className="block font-display text-base text-teal font-bold">{ordersCount}</span>
                    <span className="text-[9px] font-bold text-purple/50 uppercase font-body">Orders</span>
                  </div>
                </div>

                <div className="text-[10px] text-muted-foreground/60 font-body">
                  🌸 Handcrafted with love by Hapyezta
                </div>
              </div>

              {/* RIGHT PANEL: Workspace Pane */}
              <div className="col-span-7 p-8 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-purple/5 pb-3">
                    <h4 className="font-display text-2xl text-purple font-bold flex items-center gap-2">
                      {activeTab === "overview" && "🏠 Welcome Back!"}
                      {activeTab === "track" && "📦 Track Order"}
                      {activeTab === "settings" && "⚙️ Profile Settings"}
                    </h4>
                  </div>

                  {/* Tab Navigation Menu */}
                  <div className="flex gap-1.5 bg-cream/80 p-1 rounded-full border border-purple/5 text-xs font-semibold text-purple">
                    <button
                      onClick={() => setActiveTab("overview")}
                      className={`flex-1 py-2 px-3 rounded-full transition flex items-center justify-center gap-1 cursor-pointer border-none bg-transparent ${
                        activeTab === "overview" ? "bg-white text-coral shadow-sm font-bold" : "hover:text-coral"
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      Overview
                    </button>
                    <button
                      onClick={() => handleSwitchToTrack()}
                      className={`flex-1 py-2 px-3 rounded-full transition flex items-center justify-center gap-1 cursor-pointer border-none bg-transparent ${
                        activeTab === "track" ? "bg-white text-coral shadow-sm font-bold" : "hover:text-coral"
                      }`}
                    >
                      <Package className="w-3.5 h-3.5" />
                      Track Order
                    </button>
                    <button
                      onClick={() => setActiveTab("settings")}
                      className={`flex-1 py-2 px-3 rounded-full transition flex items-center justify-center gap-1 cursor-pointer border-none bg-transparent ${
                        activeTab === "settings" ? "bg-white text-coral shadow-sm font-bold" : "hover:text-coral"
                      }`}
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Settings
                    </button>
                  </div>

                  {/* Workspace Content Display */}
                  <div className="pt-2 min-h-[260px]">
                    {activeTab === "overview" && (
                      <div className="space-y-4 text-left font-body animate-fade-in">
                        <p className="text-sm text-foreground/80 leading-relaxed">
                          Hi <span className="font-bold text-purple">{profileName}</span>! Welcome back to your kawaii clubhouse. 🌸 We've added fresh stickers and stationery treasures since your last visit.
                        </p>

                        <div className="flex gap-2">
                          <div className="flex-1 p-3 bg-teal/5 border border-teal/10 rounded-2xl flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-teal" />
                            <span className="text-xs text-purple/90">Free shipping tier active</span>
                          </div>
                          <div className="flex-1 p-3 bg-coral/5 border border-coral/10 rounded-2xl flex items-center gap-2">
                            <Heart className="w-4 h-4 text-coral fill-coral/10" />
                            <span className="text-xs text-purple/90">Curated kawaii picks</span>
                          </div>
                        </div>

                        {renderOrdersList()}
                      </div>
                    )}

                    {activeTab === "track" && renderTrackForm()}

                    {activeTab === "settings" && renderSettingsForm()}
                  </div>
                </div>

                {/* Logout button footer */}
                <div className="border-t border-purple/5 pt-4 flex justify-end">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-red-500 hover:bg-red-50 transition text-xs font-bold cursor-pointer border-none bg-transparent"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Log Out
                  </button>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* MOBILE PORTRAIT DASHBOARD LAYOUT (hidden on desktop, visible mobile/tablet) */}
            {/* ========================================================================= */}
            <div className="block md:hidden p-6 max-h-[85vh] overflow-y-auto">
              {mobileView === "menu" && (
                <div className="space-y-5">
                  <div className="pb-2 border-b border-purple/5">
                    <h4 className="font-display text-2xl text-purple text-center font-bold">
                      ✨ Hapyezta Profile
                    </h4>
                  </div>

                  {/* Mobile Profile Card */}
                  <div className="bg-white rounded-3xl p-5 border border-purple/10 shadow-sm text-center">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-coral to-purple grid place-items-center text-3xl mb-3 border-4 border-cream shadow-md select-none animate-bounce">
                      {profileEmoji}
                    </div>
                    <h3 className="font-display text-lg text-purple font-bold text-center">
                      {profileName}
                    </h3>
                    <p className="text-[10px] text-muted-foreground text-center">Member since May 2026</p>

                    {/* VIP badge */}
                    <div className="flex justify-center mt-3">
                      <div className="inline-flex items-center gap-1.5 bg-yellow/30 text-purple text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mx-auto">
                        👑 Sparkle VIP Member
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-purple/5">
                      <div>
                        <span className="block font-display text-base text-coral font-bold">₹{totalSpent}</span>
                        <span className="text-[10px] text-purple/50 uppercase font-bold font-body">Spent</span>
                      </div>
                      <div>
                        <span className="block font-display text-base text-teal font-bold">{ordersCount} Orders</span>
                        <span className="text-[10px] text-purple/50 uppercase font-bold font-body">Placed</span>
                      </div>
                    </div>
                  </div>

                  {renderOrdersList()}

                  {/* Mobile Menu Action List */}
                  <div className="bg-white rounded-2xl p-2 border border-purple/10 shadow-sm space-y-1 text-sm font-body">
                    <button
                      onClick={() => handleSwitchToTrack()}
                      className="w-full text-left px-4 py-3 rounded-xl hover:bg-cream hover:text-coral transition font-semibold text-purple cursor-pointer border-none bg-transparent flex items-center gap-2"
                    >
                      <Package className="w-4 h-4 text-purple" />
                      📦 Track My Orders
                    </button>

                    <button
                      onClick={() => setMobileView("settings")}
                      className="w-full text-left px-4 py-3 rounded-xl hover:bg-cream hover:text-coral transition font-semibold text-purple cursor-pointer border-none bg-transparent flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4 text-purple" />
                      ⚙️ Account Settings
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 hover:text-red-500 transition font-semibold text-red-400 cursor-pointer border-none bg-transparent flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      🚪 Log Out
                    </button>
                  </div>
                </div>
              )}

              {/* Mobile Track Order view */}
              {mobileView === "track" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-purple/5 pb-3">
                    <button
                      onClick={() => setMobileView("menu")}
                      className="p-1.5 hover:bg-cream rounded-full transition text-purple cursor-pointer border-none bg-transparent"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h4 className="font-display text-xl text-purple font-bold">Track Order</h4>
                  </div>
                  {renderTrackForm()}
                </div>
              )}

              {/* Mobile Settings view */}
              {mobileView === "settings" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-purple/5 pb-3">
                    <button
                      onClick={() => setMobileView("menu")}
                      className="p-1.5 hover:bg-cream rounded-full transition text-purple cursor-pointer border-none bg-transparent"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h4 className="font-display text-xl text-purple font-bold">Edit Profile</h4>
                  </div>
                  {renderSettingsForm()}
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
