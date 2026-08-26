"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Search, ShoppingBag, Menu, X, Heart, User } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useSearchStore } from "@/store/useSearchStore";
import SearchDrawer from "@/components/shared/SearchDrawer";
import { Button } from "@/components/ui/button";

import logoImg from "@/assets/logo.png";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cart, fetchCart, openCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const openSearch = useSearchStore((state) => state.openSearch);
  const userId = isAuthenticated ? String(user?.id) : "guest";
  const wishlists = useWishlistStore((state) => state.wishlists);
  const wishlistCount = wishlists[userId]?.length || 0;
  const profileLink = isAuthenticated ? (user?.role === "ADMIN" ? "/admin" : "/dashboard") : "/login";

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Track raw scroll position to drive logo visibility
  const { scrollY } = useScroll();

  // Logo is always visible — no fade-in delay
  const logoOpacity = useTransform(scrollY, [0, 1], [1, 1]);
  const logoY = useTransform(scrollY, [0, 1], [0, 0]);

  // Navbar background: transparent at top → glass after scrolling
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const unsub = scrollY.on("change", (v) => setIsScrolled(v > 50));
    return () => unsub();
  }, [scrollY]);

  const navLinks: { name: string; href: string; highlight?: boolean }[] = [
    { name: "New Arrivals", href: "/products" },
    { name: "Men", href: "/men" },
    { name: "Women", href: "/women" },
    { name: "Footwear", href: "/footwear" },
    { name: "Accessories", href: "/accessories" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-border/40 shadow-sm"
      >
        <div className="container mx-auto px-4 md:px-8 h-[76px] flex items-center justify-between">

          {/* ── Left: Hamburger Menu (Mobile only) + Brand Logo & Title ── */}
          <div className="flex items-center gap-3 lg:w-[250px]">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 -ml-1.5 text-foreground lg:hidden"
              aria-label="Open mobile menu"
            >
              <Menu className="w-6 h-6 stroke-[1.5]" />
            </button>
            <Link href="/" className="flex items-center gap-2.5 md:gap-3.5 shrink-0">
              <div className="relative w-9 h-9 md:w-12 md:h-12 shrink-0">
                <Image 
                  src={logoImg} 
                  alt="Dhanya Logo" 
                  fill 
                  className="object-contain" 
                  priority 
                />
              </div>
              <div className="flex flex-col leading-none">
                <span 
                  className="font-heading tracking-[0.22em] font-bold text-foreground"
                  style={{ fontSize: "clamp(15px, 1.45vw, 19px)" }}
                >
                  DHANYA
                </span>
                <span 
                  className="font-sans tracking-[0.3em] font-semibold text-muted-foreground uppercase text-[8.5px] md:text-[10px] mt-1"
                >
                  Factory Outlet
                </span>
              </div>
            </Link>
          </div>

          {/* ── Center: Desktop Menu ── */}
          <div className="hidden lg:flex items-center justify-center gap-6 xl:gap-8 flex-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-[11px] xl:text-xs uppercase tracking-[0.1em] font-medium transition-colors hover:text-[#C9A84C] ${
                  link.highlight ? "text-[#8B6914]" : "text-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* ── Right: Action Icons (Search, Heart, User, Cart/Bag) ── */}
          <div className="flex items-center justify-end gap-1.5 md:gap-3 lg:w-[250px] shrink-0">
            <button 
              onClick={openSearch}
              className="p-1.5 text-foreground hover:text-[#C9A84C] transition-colors cursor-pointer"
              aria-label="Open search drawer"
            >
              <Search className="w-5 h-5 md:w-[22px] md:h-[22px] stroke-[1.5]" />
            </button>
            <Link href="/wishlist" className="hidden md:block p-1.5 text-foreground hover:text-[#C9A84C] transition-colors relative">
              <Heart className="w-5 h-5 md:w-[22px] md:h-[22px] stroke-[1.5]" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-[15px] h-[15px] md:w-[17px] md:h-[17px] bg-[#E32636] text-white text-[8px] md:text-[10px] font-bold flex items-center justify-center rounded-full shadow">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link href={profileLink} className="p-1.5 text-foreground hover:text-[#C9A84C] transition-colors relative">
              <User className="w-5 h-5 md:w-[22px] md:h-[22px] stroke-[1.5]" />
            </Link>
            <Link href="/cart" className="p-1.5 text-foreground hover:text-[#C9A84C] transition-colors relative">
              <ShoppingBag className="w-5 h-5 md:w-[22px] md:h-[22px] stroke-[1.5]" />
              {(cart?.items?.length ?? 0) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-[15px] h-[15px] md:w-[17px] md:h-[17px] bg-[#E32636] text-white text-[8px] md:text-[10px] font-bold flex items-center justify-center rounded-full shadow">
                  {cart?.items?.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── Mobile Menu Overlay ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "-100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "-100%" }}
            transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.45 }}
            className="fixed inset-0 z-[60] bg-background flex flex-col md:hidden"
          >
            {/* Header row */}
            <div className="p-5 flex items-center justify-between border-b border-border/40">
              <div className="flex items-center gap-3.5">
                <div className="relative w-9 h-9 shrink-0">
                  <Image src={logoImg} alt="Dhanya Logo" fill className="object-contain" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-heading tracking-[0.22em] font-bold text-foreground text-base">DHANYA</span>
                  <span className="font-sans tracking-[0.3em] font-semibold text-muted-foreground uppercase text-[9px] mt-1">Factory Outlet</span>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-foreground" aria-label="Close menu">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Links */}
            <div className="flex flex-col flex-1 px-8 pt-12 pb-8 overflow-y-auto">
              <div className="flex flex-col gap-6">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
                    className="border-b border-border/30 pb-4"
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block font-sans uppercase tracking-[0.15em] text-sm md:text-base font-medium transition-colors hover:text-[#C9A84C] ${
                        link.highlight ? "text-[#8B6914]" : "text-foreground/90"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
                {/* Wishlist in Mobile Menu */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * navLinks.length, ease: [0.22, 1, 0.36, 1] }}
                  className="border-b border-border/30 pb-4"
                >
                  <Link
                    href="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 font-sans uppercase tracking-[0.15em] text-sm md:text-base font-medium transition-colors text-foreground/90 hover:text-[#C9A84C]"
                  >
                    <div className="relative">
                      <Heart className="w-4 h-4" />
                      {wishlistCount > 0 && (
                        <span className="absolute -top-1 -right-1.5 w-[12px] h-[12px] bg-[#E32636] text-white text-[8px] font-bold flex items-center justify-center rounded-full">
                          {wishlistCount}
                        </span>
                      )}
                    </div>
                    Wishlist
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="p-8 border-t border-border/40">
              <Link 
                href={profileLink} 
                onClick={() => setMobileMenuOpen(false)}
                className="w-full h-13 flex items-center justify-center bg-foreground text-background text-sm tracking-widest uppercase rounded-none hover:bg-foreground/90 transition-colors"
              >
                {isAuthenticated ? "My Account" : "Sign In"}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Search Slide-Over Drawer ── */}
      <SearchDrawer />
    </>
  );
}
