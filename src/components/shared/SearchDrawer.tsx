"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, Tag, Sparkles, Loader2, ShoppingBag } from "lucide-react";
import { useSearchStore } from "@/store/useSearchStore";
import { productService } from "@/services/productService";
import { Product } from "@/types";
import { getCloudinaryUrl } from "@/lib/utils";

// Fallback curated catalog representing Dhanya Factory Outlet items
const CATALOG_FALLBACK: Partial<Product>[] = [
  { id: 101, name: "Ivory Chikankari Kurti", price: 1299, discountPercentage: 50, category: { id: 1, name: "Apparel", description: "", imageUrl: "", active: true }, imageUrls: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop"] },
  { id: 102, name: "Court Rider Sneakers", price: 2799, discountPercentage: 38, category: { id: 2, name: "Footwear", description: "", imageUrl: "", active: true }, imageUrls: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop"] },
  { id: 103, name: "Slim Fit Casual Shirt", price: 999, discountPercentage: 50, category: { id: 1, name: "Shirts", description: "", imageUrl: "", active: true }, imageUrls: ["https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop"] },
  { id: 104, name: "Rose Anarkali Set", price: 1899, discountPercentage: 52, category: { id: 1, name: "Apparel", description: "", imageUrl: "", active: true }, imageUrls: ["https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop"] },
  { id: 105, name: "Runfalcon 3.0 Running Shoes", price: 3499, discountPercentage: 34, category: { id: 2, name: "Footwear", description: "", imageUrl: "", active: true }, imageUrls: ["https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800&auto=format&fit=crop"] },
  { id: 106, name: "Checked Formal Blazer", price: 3299, discountPercentage: 52, category: { id: 1, name: "Apparel", description: "", imageUrl: "", active: true }, imageUrls: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop"] },
  { id: 201, name: "Grey Hunting Jacket", price: 1480, discountPercentage: 14, category: { id: 1, name: "Jackets", description: "", imageUrl: "", active: true }, imageUrls: ["https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop"] },
  { id: 202, name: "Brown Designer Shirt", price: 1080, discountPercentage: 15, category: { id: 1, name: "Shirts", description: "", imageUrl: "", active: true }, imageUrls: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop"] },
  { id: 203, name: "Black Embroidery Shirt", price: 1180, discountPercentage: 14, category: { id: 1, name: "Shirts", description: "", imageUrl: "", active: true }, imageUrls: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop"] },
  { id: 204, name: "Black Printed Shirt", price: 980, discountPercentage: 15, category: { id: 1, name: "Shirts", description: "", imageUrl: "", active: true }, imageUrls: ["https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop"] },
  { id: 205, name: "Maroon Linen Shirt", price: 1380, discountPercentage: 15, category: { id: 1, name: "Shirts", description: "", imageUrl: "", active: true }, imageUrls: ["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=800&auto=format&fit=crop"] },
  { id: 206, name: "Classic Denim Jacket", price: 1880, discountPercentage: 15, category: { id: 1, name: "Jackets", description: "", imageUrl: "", active: true }, imageUrls: ["https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=800&auto=format&fit=crop"] },
  { id: 207, name: "Olive Utility Shirt", price: 1120, discountPercentage: 15, category: { id: 1, name: "Shirts", description: "", imageUrl: "", active: true }, imageUrls: ["https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?q=80&w=800&auto=format&fit=crop"] },
  { id: 208, name: "Off-White Knit Polo", price: 1280, discountPercentage: 15, category: { id: 1, name: "T-Shirts", description: "", imageUrl: "", active: true }, imageUrls: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop"] },
];

export default function SearchDrawer() {
  const router = useRouter();
  const { isOpen, closeSearch, query, setQuery, clearQuery } = useSearchStore();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [allProducts, setAllProducts] = useState<Partial<Product>[]>(CATALOG_FALLBACK);
  const [isLoadingApi, setIsLoadingApi] = useState(false);

  // Fetch live products from backend
  const fetchLiveProducts = () => {
    setIsLoadingApi(true);
    productService
      .getAllProducts(0, 100)
      .then((res) => {
        if (res?.content && res.content.length > 0) {
          // Prepend latest products from DB
          const map = new Map<number, Partial<Product>>();
          res.content.forEach((p) => p.id && map.set(p.id, p));
          CATALOG_FALLBACK.forEach((p) => p.id && !map.has(p.id) && map.set(p.id, p));
          setAllProducts(Array.from(map.values()));
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingApi(false));
  };

  // Initial mount load + reload whenever drawer opens
  useEffect(() => {
    fetchLiveProducts();
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 150);
      fetchLiveProducts();
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Keyboard shortcut listener (ESC to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeSearch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeSearch]);

  // Live filter based on Brand, Product Name, Product ID, Category, Description
  const filteredProducts = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return [];

    return allProducts.filter((p) => {
      const idMatch = p.id ? String(p.id).includes(cleanQuery) || `#${p.id}`.includes(cleanQuery) : false;
      const nameMatch = p.name ? p.name.toLowerCase().includes(cleanQuery) : false;
      const categoryMatch = p.category?.name ? p.category.name.toLowerCase().includes(cleanQuery) : false;
      const descriptionMatch = p.description ? p.description.toLowerCase().includes(cleanQuery) : false;
      const brandMatch = "dhanya dfo puma".includes(cleanQuery);

      return idMatch || nameMatch || categoryMatch || descriptionMatch || brandMatch;
    });
  }, [query, allProducts]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    closeSearch();
    router.push(`/products?search=${encodeURIComponent(query.trim())}`);
  };

  const handleSelectProduct = (productId?: number) => {
    closeSearch();
    if (productId) {
      router.push(`/products/${productId}`);
    }
  };

  const handleSelectProductName = (name: string) => {
    setQuery(name);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={closeSearch}
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
          />

          {/* Slide-out Drawer Panel (Desktop right drawer, mobile full screen) */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute top-0 right-0 h-full w-full sm:w-[440px] md:w-[480px] bg-white shadow-2xl flex flex-col z-50"
          >
            {/* Top Search Input Bar */}
            <div className="p-4 sm:p-6 border-b border-gray-150 bg-white shrink-0">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-3">
                <Search className="w-5 h-5 text-gray-400 shrink-0 stroke-[1.75]" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What are you looking for?"
                  className="w-full bg-transparent text-base sm:text-lg text-gray-900 placeholder:text-gray-400 focus:outline-none font-medium tracking-tight"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={clearQuery}
                    className="p-1 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={closeSearch}
                    className="p-1 text-gray-500 hover:text-black transition-colors rounded-full hover:bg-gray-100 cursor-pointer"
                  >
                    <X className="w-5 h-5 stroke-[1.75]" />
                  </button>
                )}
              </form>
            </div>

            {/* Content Area: Highly Searched vs Live Product Suggestions */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* STATE 1: Empty Query -> SHOWS ACTUAL PRODUCTS ADDED IN DHANYA FACTORY OUTLET */}
              {!query.trim() ? (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-900">
                      HIGHLY SEARCHED PRODUCTS
                    </h3>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                      DHANYA FACTORY OUTLET
                    </span>
                  </div>

                  <div className="flex flex-col space-y-3">
                    {allProducts.map((product, idx) => (
                      <button
                        key={product.id || idx}
                        onClick={() => handleSelectProductName(product.name || "")}
                        className="text-left text-sm font-semibold text-gray-800 hover:text-[#C9A84C] transition-colors py-1 tracking-tight group flex items-center justify-between border-b border-gray-50 pb-2 last:border-0"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="truncate">{product.name}</span>
                          {product.id && (
                            <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded shrink-0">
                              #{product.id}
                            </span>
                          )}
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#C9A84C] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* STATE 2: Query Typed -> LIVE SUGGESTIONS BY BRAND, NAME, ID */
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-gray-900">
                      Product Suggestions ({filteredProducts.length})
                    </span>
                    {isLoadingApi && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />
                    )}
                  </div>

                  {filteredProducts.length > 0 ? (
                    <div className="space-y-4">
                      {filteredProducts.slice(0, 10).map((product) => {
                        const img = getCloudinaryUrl(product.imageUrls?.[0]) || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800";
                        const discount = product.discountPercentage || 0;
                        const originalPrice = discount > 0 ? Math.round((product.price || 0) / (1 - discount / 100)) : product.price;

                        return (
                          <div
                            key={product.id}
                            onClick={() => handleSelectProduct(product.id)}
                            className="group flex items-center gap-4 p-2.5 rounded-sm hover:bg-gray-50 border border-transparent hover:border-gray-150 transition-all cursor-pointer"
                          >
                            {/* Product Thumbnail */}
                            <div className="relative w-16 h-20 bg-gray-100 overflow-hidden shrink-0 rounded-sm">
                              <Image
                                src={img}
                                alt={product.name || "Product"}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                sizes="64px"
                              />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 truncate">
                                  {product.category?.name || "Dhanya"}
                                </span>
                                {product.id && (
                                  <span className="text-[9px] font-mono font-medium px-1.5 py-0.2 bg-gray-100 text-gray-600 rounded">
                                    #{product.id}
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-semibold text-gray-900 group-hover:text-[#8B6914] transition-colors truncate">
                                {product.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-bold font-mono text-gray-900">
                                  ₹{product.price}
                                </span>
                                {discount > 0 && (
                                  <>
                                    <span className="text-xs font-mono text-gray-400 line-through">
                                      ₹{originalPrice}
                                    </span>
                                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                                      {discount}% OFF
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* View all results button */}
                      <button
                        onClick={handleSearchSubmit}
                        className="w-full mt-4 py-3.5 bg-black hover:bg-neutral-800 text-white font-medium text-xs tracking-widest uppercase transition-colors flex items-center justify-center gap-2 shadow-sm rounded-none cursor-pointer"
                      >
                        <span>View All Results for "{query}"</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    /* No results found state */
                    <div className="py-12 text-center">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        No results found for "{query}"
                      </p>
                      <p className="text-xs text-gray-500 mb-6">
                        Try searching by brand (e.g. Dhanya, DFO), product name, or product ID.
                      </p>
                      <button
                        onClick={clearQuery}
                        className="text-xs font-semibold uppercase tracking-wider text-[#8B6914] hover:underline"
                      >
                        Clear search and view all Dhanya products
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
