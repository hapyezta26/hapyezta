import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Mail, Phone, MapPin, Calendar, Trash2 } from "lucide-react";
import { getOrdersFn } from "@/lib/api/db.functions";

interface AccordionItemProps {
  title: string;
  to?: string;          // if set, the title navigates instead of toggling
  children: React.ReactNode;
}

function AccordionItem({ title, to, children }: AccordionItemProps) {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((o) => !o);

  if (to) {
    return (
      <div className="border-b border-[#E8DDF8]/20">
        <Link
          to={to}
          className="w-full flex items-center justify-between py-4 text-left font-display text-lg font-bold text-orange hover:text-orange/80 transition cursor-pointer"
        >
          <span>{title}</span>
          <span className="font-display font-bold text-orange text-2xl leading-none pl-4 select-none">
            +
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="border-b border-[#E8DDF8]/20">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between py-4 text-left font-display text-lg font-bold text-orange hover:text-orange/80 transition cursor-pointer border-none bg-transparent outline-none focus:outline-none"
      >
        <span>{title}</span>
        {/* + toggle always available */}
        <span
          className="text-orange text-2xl leading-none transition-transform duration-300 pl-4 select-none"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          +
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? "400px" : "0px" }}
      >
        <div className="pb-4 text-sm text-[#E8DDF8] space-y-2">{children}</div>
      </div>
    </div>
  );
}

function SocialIcons({ hoverBgClass }: { hoverBgClass: string }) {
  return (
    <div className="mt-5 flex items-center gap-4">
      {/* Instagram Logo */}
      <a
        href="https://www.instagram.com/hapyezta?igsh=ZDN6ZGNhMXZpdmpt"
        target="_blank"
        rel="noopener noreferrer"
        className={`group relative flex items-center justify-center p-1 rounded-xl transition-all duration-300 ${hoverBgClass}`}
        title="Follow us on Instagram"
      >
        <svg
          viewBox="0 0 32 32"
          className="w-10 h-10 transition-transform duration-300 group-hover:scale-110"
          fill="none"
          stroke="url(#ig-footer-grad)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="5" y="5" width="22" height="22" rx="6" />
          <circle cx="16" cy="16" r="5" />
          <circle cx="22" cy="10" r="1.2" />
        </svg>
      </a>

      {/* WhatsApp Logo */}
      <a
        href="https://wa.me/918281251299?text=Hello!%20I%20need%20help."
        target="_blank"
        rel="noopener noreferrer"
        className={`group relative flex items-center justify-center p-1 rounded-xl transition-all duration-300 ${hoverBgClass}`}
        title="Chat with us on WhatsApp"
      >
        <svg
          viewBox="0 0 16 16"
          className="w-10 h-10 p-[3px] transition-transform duration-300 group-hover:scale-110"
          fill="#25D366"
        >
          <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
        </svg>
      </a>
    </div>
  );
}

export function Footer() {
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [trackOrderId, setTrackOrderId] = useState("");
  const [trackingResult, setTrackingResult] = useState<any | null>(null);
  const [trackError, setTrackError] = useState("");

  const [isShippingOpen, setIsShippingOpen] = useState(false);
  const [isReturnsOpen, setIsReturnsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for staying linked! 🌸");
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError("");
    setTrackingResult(null);

    if (!trackOrderId.trim()) {
      setTrackError("Please enter a valid Order ID! 🌸");
      return;
    }

    try {
      const dbOrders = await getOrdersFn();
      const matched = dbOrders.find(
        (o: any) => o.id.trim().toLowerCase() === trackOrderId.trim().toLowerCase()
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
            (o: any) => o.id.trim().toLowerCase() === trackOrderId.trim().toLowerCase()
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

  return (
    <footer className="bg-cream text-foreground pt-10 pb-6 px-4">
      {/* Global SVG Gradients definitions */}
      <svg style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
        <defs>
          <linearGradient id="ig-footer-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f9ce34" />
            <stop offset="30%" stopColor="#ee2a7b" />
            <stop offset="60%" stopColor="#d82b7a" />
            <stop offset="100%" stopColor="#6228d7" />
          </linearGradient>
        </defs>
      </svg>
      {/* ── Mobile accordion (hidden on lg+) ── */}
      <div className="lg:hidden max-w-xl mx-auto">
        <AccordionItem title="About Us">
          <div className="flex flex-col items-start mb-3">
            <Logo size="sm" withSlogan={true} className="items-start text-left" />
          </div>
          <p className="text-foreground/70">
            Spreading kawaii joy, one cute package at a time. Pan-India delivery.
          </p>
        </AccordionItem>

        <AccordionItem title="Let's stay linked!">
          <div>
            <p className="text-foreground/70 mb-2">Get cute drops in your inbox.</p>
            <form className="flex gap-2" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="you@cute.com"
                className="flex-1 px-4 py-2 rounded-full bg-orange/10 border border-orange/20 placeholder:text-foreground/40 text-sm text-foreground outline-none focus:border-orange/50"
              />
              <button type="submit" className="px-4 py-2 rounded-full bg-orange hover:bg-purple text-white transition font-semibold text-sm">
                Join
              </button>
            </form>
            <SocialIcons hoverBgClass="hover:bg-orange/10" />
          </div>
        </AccordionItem>

        <AccordionItem title="Help & Contact">
          <ul className="space-y-2 text-left">
            <li>
              <Link to="/contact" className="text-foreground/80 hover:text-orange transition block">
                Contact page
              </Link>
            </li>
            <li>
              <button
                onClick={() => setIsTrackOpen(true)}
                className="text-foreground/80 hover:text-orange transition text-left cursor-pointer border-none bg-transparent outline-none p-0 block font-sans"
              >
                Track order
              </button>
            </li>
            <li>
              <button
                onClick={() => setIsShippingOpen(true)}
                className="text-foreground/80 hover:text-orange transition text-left cursor-pointer border-none bg-transparent outline-none p-0 block font-sans"
              >
                Shipping info
              </button>
            </li>
            <li>
              <button
                onClick={() => setIsReturnsOpen(true)}
                className="text-foreground/80 hover:text-orange transition text-left cursor-pointer border-none bg-transparent outline-none p-0 block font-sans"
              >
                Returns
              </button>
            </li>
          </ul>
        </AccordionItem>

        {/* Copyright */}
        <div className="mt-6 text-center text-xs text-foreground/50">
          © {new Date().getFullYear()} Hapyezta · Made by{" "}
          <a
            href="https://codexora.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:text-orange transition"
          >
            Codexora
          </a>
        </div>
      </div>

      {/* ── Desktop grid (hidden on mobile) ── */}
      <div className="hidden lg:block bg-[#5B2D91] text-white rounded-2xl pt-14 pb-8 px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-8">
          <div>
            <div className="flex flex-col items-start">
              <Logo size="md" withSlogan={true} className="items-start text-left" />
            </div>
            <p className="mt-3 text-sm text-[#E8DDF8]">
              Spreading kawaii joy, one cute package at a time. Pan-India delivery.
            </p>
          </div>
          <div>
            <div className="font-display text-lg mb-3 text-white font-semibold">
              <Link to="/products" className="hover:text-[#FFB84D] transition">Shop</Link>
            </div>
            <ul className="space-y-2 text-sm text-[#E8DDF8]">
              <li><Link to="/products" search={{ category: "Cute Stationery" }} className="hover:text-[#FFB84D] transition">Stationery</Link></li>
              <li><Link to="/products" search={{ category: "Journal Supplies" }} className="hover:text-[#FFB84D] transition">Journals</Link></li>
              <li><Link to="/products" search={{ category: "Gift Sets" }} className="hover:text-[#FFB84D] transition">Gift sets</Link></li>
              <li><Link to="/products" search={{ category: "Bottles & Tumblers" }} className="hover:text-[#FFB84D] transition">Bottles</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-display text-lg mb-3 text-white font-semibold">Help</div>
            <ul className="space-y-2 text-sm text-[#E8DDF8]">
              <li>
                <button
                  onClick={() => setIsTrackOpen(true)}
                  className="hover:text-[#FFB84D] transition cursor-pointer border-none bg-transparent outline-none p-0 text-left font-sans block"
                >
                  Track order
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsShippingOpen(true)}
                  className="hover:text-[#FFB84D] transition cursor-pointer border-none bg-transparent outline-none p-0 text-left font-sans block"
                >
                  Shipping
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsReturnsOpen(true)}
                  className="hover:text-[#FFB84D] transition cursor-pointer border-none bg-transparent outline-none p-0 text-left font-sans block"
                >
                  Returns
                </button>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#FFB84D] transition block">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-display text-lg mb-3 text-white font-semibold">Stay in the loop</div>
            <p className="text-sm text-[#E8DDF8] mb-3">Get cute drops in your inbox.</p>
            <form className="flex gap-2" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="you@cute.com"
                className="flex-1 px-4 py-2 rounded-full bg-white/10 border border-[#E8DDF8]/20 placeholder:text-[#E8DDF8]/50 text-sm text-white outline-none focus:border-[#FFB84D]/50"
              />
              <button type="submit" className="px-4 py-2 rounded-full bg-[#FFB84D] hover:bg-white text-[#5B2D91] transition font-semibold text-sm">
                Join
              </button>
            </form>
            <SocialIcons hoverBgClass="hover:bg-white/10" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-[#E8DDF8]/20 text-center text-xs text-[#E8DDF8]/70">
          © {new Date().getFullYear()} Hapyezta · Made by{" "}
          <a
            href="https://codexorastudio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-white hover:text-[#FFB84D] transition"
          >
            Codexora
          </a>
        </div>
      </div>
      {/* Track Order Modal */}
      {isTrackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-lg p-6 sm:p-8 border-2 border-yellow/20 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsTrackOpen(false);
                setTrackOrderId("");
                setTrackingResult(null);
                setTrackError("");
              }}
              className="absolute top-4 right-4 text-foreground/40 hover:text-coral transition cursor-pointer text-xl"
            >
              🌸
            </button>
            <h3 className="font-display text-2xl text-purple font-bold mb-2 flex items-center gap-2">
              📦 Track Your Order
            </h3>
            <p className="text-sm text-foreground/60 mb-6 font-body">
              Enter your Order ID (e.g., HAP-2026-8921) to check its current status.
            </p>

            <form onSubmit={handleTrackSubmit} className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Order ID..."
                  value={trackOrderId}
                  onChange={(e) => setTrackOrderId(e.target.value)}
                  className="flex-1 px-5 py-3 rounded-full border-2 border-yellow/20 focus:border-orange bg-cream/10 outline-none transition text-foreground uppercase tracking-wide font-mono placeholder:tracking-normal placeholder:font-sans text-sm"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-full bg-orange hover:bg-orange/95 text-white font-bold transition-all shadow-[0_4px_0_0_#c4513f] hover:translate-y-0.5 hover:shadow-[0_1px_0_0_#c4513f] cursor-pointer text-xs font-display uppercase tracking-wider"
                >
                  Track
                </button>
              </div>

              {trackError && (
                <div className="p-3 bg-coral/10 text-coral rounded-2xl text-xs font-bold font-body text-center animate-fade-in">
                  🌸 {trackError}
                </div>
              )}

              {trackingResult && (
                <div className="bg-cream/20 border border-yellow/20 rounded-2xl p-5 space-y-4 animate-fade-in font-body text-sm">
                  <div className="flex items-center justify-between border-b border-purple/5 pb-2.5">
                    <span className="font-bold text-purple">{trackingResult.id}</span>
                    <div>
                      {trackingResult.status === "pending" && (
                        <span className="bg-orange/10 text-orange px-3 py-1 rounded-full text-xs font-bold border border-orange/20">
                          ⏳ Pending
                        </span>
                      )}
                      {trackingResult.status === "shipped" && (
                        <span className="bg-purple/10 text-purple px-3 py-1 rounded-full text-xs font-bold border border-purple/20">
                          🚚 Shipped
                        </span>
                      )}
                      {trackingResult.status === "delivered" && (
                        <span className="bg-teal/10 text-teal px-3 py-1 rounded-full text-xs font-bold border border-teal/20">
                          ✓ Delivered
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-foreground/70 text-left">
                    <p>Customer: <span className="font-bold text-purple">{trackingResult.customerName}</span></p>
                    <p>Estimate: <span className="font-bold text-teal">{trackingResult.deliveryEstimate || "3-5 business days"}</span></p>
                    <p>Total Amount: <span className="font-bold text-coral">₹{trackingResult.totalAmount}</span></p>
                  </div>

                  <div className="border-t border-purple/5 pt-3 text-left">
                    <h4 className="font-display font-semibold text-xs text-purple mb-2">Order Items:</h4>
                    <div className="max-h-28 overflow-y-auto space-y-2">
                      {trackingResult.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="truncate max-w-[200px]" title={item.name}>{item.name}</span>
                          <span className="text-foreground/50 shrink-0">{item.priceString} x {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Shipping Policy Modal */}
      {isShippingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-6 sm:p-8 border-2 border-yellow/20 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsShippingOpen(false)}
              className="absolute top-4 right-4 text-foreground/40 hover:text-coral transition cursor-pointer text-xl"
            >
              🌸
            </button>
            <h3 className="font-display text-2xl text-purple font-bold mb-4 flex items-center gap-2">
              🚚 Shipping Policy
            </h3>
            <div className="space-y-4 font-body text-sm text-foreground/75 leading-relaxed text-left">
              <div className="flex gap-3">
                <span className="text-lg">📦</span>
                <div>
                  <h4 className="font-bold text-purple text-xs uppercase tracking-wider mb-1">Standard Processing</h4>
                  <p>Orders are packed with love and processed within 1-2 business days.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-lg">⚡</span>
                <div>
                  <h4 className="font-bold text-purple text-xs uppercase tracking-wider mb-1">Pan-India Delivery</h4>
                  <p>Usually takes 3-7 business days depending on location.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-lg">💌</span>
                <div>
                  <h4 className="font-bold text-purple text-xs uppercase tracking-wider mb-1">Notifications</h4>
                  <p>You will receive a notification with tracking info once your box is shipped.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Returns Policy Modal */}
      {isReturnsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-6 sm:p-8 border-2 border-yellow/20 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsReturnsOpen(false)}
              className="absolute top-4 right-4 text-foreground/40 hover:text-coral transition cursor-pointer text-xl"
            >
              🌸
            </button>
            <h3 className="font-display text-2xl text-purple font-bold mb-4 flex items-center gap-2">
              🎀 Returns & Exchanges
            </h3>
            <div className="space-y-4 font-body text-sm text-foreground/75 leading-relaxed text-left">
              <div className="flex gap-3">
                <span className="text-lg">🌸</span>
                <div>
                  <h4 className="font-bold text-purple text-xs uppercase tracking-wider mb-1">7-Day Return window</h4>
                  <p>We accept returns for damaged, defective, or incorrect products within 7 days of delivery.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-lg">📦</span>
                <div>
                  <h4 className="font-bold text-purple text-xs uppercase tracking-wider mb-1">Safe Packaging</h4>
                  <p>Items must be returned in their original packaging and unused condition to qualify for refund/exchange.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-lg">💌</span>
                <div>
                  <h4 className="font-bold text-purple text-xs uppercase tracking-wider mb-1">Support Contact</h4>
                  <p>Send an unboxing video and your Order ID to our WhatsApp or email to initiate a return request.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}

