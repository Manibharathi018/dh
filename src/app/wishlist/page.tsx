"use client";

import { useWishlistStore } from "@/store/useWishlistStore";
import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { getCloudinaryUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";
import { Product } from "@/types";
import { useState } from "react";

export default function WishlistPage() {
  const { isAuthenticated, user } = useAuthStore();
  const userId = isAuthenticated ? String(user?.id) : "guest";
  const wishlists = useWishlistStore((state) => state.wishlists);
  const toggleLike = useWishlistStore((state) => state.toggleLike);
  const wishlist = wishlists[userId] || [];
  const [addedIds, setAddedIds] = useState<number[]>([]);
  
  const addToCart = useCartStore((state) => state.addToCart);
  const router = useRouter();

  return (
    <main className="bg-white min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-heading font-medium text-foreground tracking-tight mb-3 uppercase">
            My Wishlist
          </h1>
          <p className="text-muted-foreground text-sm tracking-wide">
            {wishlist.length} {wishlist.length === 1 ? "Item" : "Items"} saved
          </p>
        </div>

        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-md border border-gray-100">
            <Heart className="w-12 h-12 text-gray-300 mb-6" strokeWidth={1} />
            <h2 className="text-xl font-medium text-foreground mb-3 uppercase tracking-wider">Your wishlist is empty</h2>
            <p className="text-muted-foreground text-sm max-w-md text-center mb-8">
              Save items you love here to keep track of them and easily add them to your cart later.
            </p>
            <Link href="/products">
              <Button className="rounded-none bg-foreground text-background px-8 hover:bg-[var(--color-destructive)] tracking-widest uppercase text-xs h-12 transition-colors">
                Explore Collections
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
            {wishlist.map((p) => {
              const mainImg = getCloudinaryUrl(p.imageUrls?.[0]) || "https://images.unsplash.com/photo-1610030006630-e6f8b3e8f4d4?auto=format&fit=crop&w=600&q=80";
              const discount = p.discountPercentage || 0;
              const mrp = discount > 0 ? Math.round((p.price || 0) / (1 - discount / 100)) : (p.price || 0);
              const isAdded = p.id ? addedIds.includes(p.id) : false;

              return (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="group block"
                >
                  <div className="relative aspect-[3/4] rounded-sm bg-surface overflow-hidden shadow-sm mb-4">
                    <Image
                      src={mainImg}
                      alt={p.name || "Product"}
                      fill
                      className="object-cover transition-transform duration-750 group-hover:scale-105"
                    />
                    <button
                      aria-label="Remove from wishlist"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleLike(userId, p); }}
                      className="absolute top-3 right-3 w-9 h-9 grid place-items-center bg-white/90 backdrop-blur rounded-full opacity-100 transition-all hover:scale-110 hover:text-gray-900 z-10 shadow-sm text-rose-500"
                    >
                      <Heart className="w-4 h-4 fill-rose-500 text-rose-500" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={async (e) => { 
                        e.preventDefault(); 
                        e.stopPropagation(); 
                        if (!isAuthenticated) { router.push("/login"); return; }
                        if (p.hasDressSizes || p.hasShoeSizes) {
                          router.push(`/products/${p.id}`);
                          return;
                        }
                        if (p.quantity !== 0 && p.id) {
                          try { 
                            await addToCart(p as Product, 1); 
                            setAddedIds(prev => [...prev, p.id!]);
                            setTimeout(() => setAddedIds(prev => prev.filter(id => id !== p.id)), 2000);
                          } catch(err) { console.error("Failed to add to cart"); }
                        }
                      }}
                      disabled={p.quantity === 0 || isAdded}
                      className="absolute inset-x-3 bottom-3 bg-ink text-white text-[11px] font-medium tracking-widest uppercase py-3 rounded-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 text-center shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed z-10"
                    >
                      {p.quantity === 0 ? "Out of Stock" : isAdded ? "Product Added" : "Add to Cart"}
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] tracking-[0.2em] font-bold uppercase text-muted-foreground">{p.brand || p.category?.name || "DFO"}</p>
                    <h4 className="font-medium text-sm text-ink truncate group-hover:text-sale transition-colors">{p.name}</h4>
                    <div className="flex items-center gap-2 text-xs pt-1 font-mono">
                      <span className="font-semibold text-gray-900">₹{Math.round(p.price || 0).toLocaleString("en-IN")}</span>
                      {discount > 0 ? (
                        <>
                          <span className="bg-[#B91C1C] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                            {discount}% off
                          </span>
                          <span className="text-gray-400 line-through font-normal">
                            ₹{Math.round((p.price || 0) / (1 - Math.min(99.9, discount) / 100)).toLocaleString("en-IN")}
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
