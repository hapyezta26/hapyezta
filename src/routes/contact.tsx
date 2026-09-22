import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Send, Phone, Mail } from "lucide-react";
import { Header } from "@/components/Header";
import { MarqueeBanner } from "@/components/MarqueeBanner";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us - Hapyezta" },
      { name: "description", content: "Get in touch with Hapyezta. We would love to hear your dreamy thoughts, questions, or feedback!" },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      alert("Please fill in all fields 🌸");
      return;
    }
    alert(`Thank you for your dreamy thoughts, ${name}! 💌 We'll get back to you soon!`);
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        <MarqueeBanner />

        <Header />

        {/* Contact Content */}
        <main className="max-w-3xl mx-auto px-4 py-16">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-foreground/60 mb-10 justify-center">
            <Link to="/" className="hover:text-coral transition font-semibold">Home</Link>
            <span>/</span>
            <span className="text-purple font-bold">Contact Us</span>
          </div>

          <div className="text-center mb-10">
            <h1 className="font-display text-5xl sm:text-6xl text-orange font-bold mb-3 tracking-normal">
              Contact Us
            </h1>
            <p className="text-foreground/75 font-body text-base sm:text-lg">
              Have questions? We'd love to hear from you!
            </p>
          </div>

          {/* Form Card */}
          <div className="w-full bg-white rounded-[2rem] p-6 sm:p-10 border-2 border-yellow/20 shadow-[0_12px_40px_rgba(127,88,165,0.06)] max-w-xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-orange font-display font-bold text-xs tracking-widest mb-2 uppercase">
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-6 py-4 rounded-full border-2 border-yellow/20 focus:border-orange bg-cream/10 text-sm outline-none transition font-body text-foreground placeholder:text-foreground/30"
                />
              </div>

              <div>
                <label className="block text-orange font-display font-bold text-xs tracking-widest mb-2 uppercase">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 rounded-full border-2 border-yellow/20 focus:border-orange bg-cream/10 text-sm outline-none transition font-body text-foreground placeholder:text-foreground/30"
                />
              </div>

              <div>
                <label className="block text-orange font-display font-bold text-xs tracking-widest mb-2 uppercase">
                  Message
                </label>
                <textarea
                  placeholder="Write your dreamy thoughts here..."
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-6 py-4 rounded-[2rem] border-2 border-yellow/20 focus:border-orange bg-cream/10 text-sm outline-none transition font-body text-foreground resize-none placeholder:text-foreground/30"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-full bg-orange hover:bg-orange/95 text-white font-bold shadow-[0_5px_0_0_#c4513f] hover:translate-y-0.5 hover:shadow-[0_2px_0_0_#c4513f] transition-all flex items-center justify-center gap-2.5 cursor-pointer text-sm font-display uppercase tracking-widest"
              >
                <Send className="w-4 h-4" /> Send Message
              </button>
            </form>
          </div>

          {/* Store Information Card */}
          <div className="w-full bg-white rounded-[2rem] p-8 border-2 border-yellow/20 shadow-[0_12px_40px_rgba(127,88,165,0.06)] max-w-xl mx-auto mt-8">
            <h2 className="font-display text-xl sm:text-2xl text-orange font-bold mb-6 text-left">
              Store Information
            </h2>
            <div className="space-y-5">
              {/* Phone item */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-cream border border-orange/20 flex items-center justify-center text-orange shrink-0 shadow-sm">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="block font-display text-base text-orange font-bold">
                    Phone
                  </span>
                  <a href="tel:+918281251299" className="text-sm text-foreground/75 hover:text-coral transition font-body">
                    +91 82812 51299
                  </a>
                </div>
              </div>

              {/* Email item */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-cream border border-orange/20 flex items-center justify-center text-orange shrink-0 shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="block font-display text-base text-orange font-bold">
                    Email
                  </span>
                  <a href="mailto:hapyezta@gmail.com" className="text-sm text-foreground/75 hover:text-coral transition font-body">
                    hapyezta@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
