"use client";

import { use, useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Minus, ArrowLeft, Shield, Truck, RotateCcw, ChevronLeft, ChevronRight, Heart, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/toast";

/**
 * Injects Cloudinary transformations (f_auto = auto format, q_auto = auto quality)
 * so HEIC/TIFF/etc. images are automatically served as WebP or JPEG by Cloudinary.
 * Safe to call on any URL — non-Cloudinary URLs are returned unchanged.
 */
function getCloudinaryUrl(url: string | undefined): string {
  if (!url) return "";
  const marker = "/upload/";
  if (!url.includes("res.cloudinary.com") || url.includes("f_auto")) return url;
  const idx = url.indexOf(marker);
  if (idx === -1) return url;
  return url.slice(0, idx + marker.length) + "f_auto,q_auto/" + url.slice(idx + marker.length);
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = parseInt(resolvedParams.id);

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [sizeError, setSizeError] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const mainImageRef = useRef<HTMLDivElement>(null);
  const addToCart = useCartStore((state) => state.addToCart);
  const { isAuthenticated, user } = useAuthStore();
  const userId = isAuthenticated ? String(user?.id) : "guest";
  const { toggleLike, isLiked } = useWishlistStore();
  const liked = isLiked(userId, productId);
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);

  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
    if (mainImageRef.current) {
      const width = mainImageRef.current.clientWidth;
      mainImageRef.current.scrollTo({ left: width * index, behavior: 'smooth' });
    }
  };

  // Fetch product detail
  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => productService.getProductById(productId),
  });

  const requiresSize = product ? (product.hasDressSizes || product.hasShoeSizes) : false;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (product) {
      if (requiresSize && !selectedSize) {
        setSizeError(true);
        return;
      }
      try {
        setIsAdding(true);
        await addToCart(product, quantity, requiresSize ? selectedSize : undefined);
        toast.add({
          type: "success",
          title: "Product added to cart successfully!",
          timeout: 2500,
        });
        router.push("/cart");
      } catch (err: any) {
        console.error("Failed to add to cart", err);
        toast.add({
          type: "error",
          title: err?.response?.data?.message || err?.message || "Failed to add item to cart. Please try again.",
          timeout: 3000,
        });
      } finally {
        setIsAdding(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="aspect-[3/4] w-full rounded-none" />
          <div className="space-y-6">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-6 py-32 text-center">
        <h2 className="text-2xl font-heading font-medium mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-8">The product you are looking for might have been removed or is temporarily unavailable.</p>
        <Link href="/products" className="inline-flex items-center text-sm font-medium hover:text-[var(--color-destructive)] border-b border-black pb-0.5">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Products
        </Link>
      </div>
    );
  }

  const sizes = product.hasDressSizes
    ? ["S", "M", "L", "XL", "XXL"]
    : product.hasShoeSizes
    ? ["7", "8", "9", "10", "11", "12", "13"]
    : [];

  const getStockForSize = (size: string): number => {
    if (product.hasDressSizes) {
      if (size === "S") return product.sizeSQuantity || 0;
      if (size === "M") return product.sizeMQuantity || 0;
      if (size === "L") return product.sizeLQuantity || 0;
      if (size === "XL") return product.sizeXLQuantity || 0;
      if (size === "XXL") return product.sizeXXLQuantity || 0;
    }
    if (product.hasShoeSizes) {
      if (size === "7") return product.size7Quantity || 0;
      if (size === "8") return product.size8Quantity || 0;
      if (size === "9") return product.size9Quantity || 0;
      if (size === "10") return product.size10Quantity || 0;
      if (size === "11") return product.size11Quantity || 0;
      if (size === "12") return product.size12Quantity || 0;
      if (size === "13") return product.size13Quantity || 0;
    }
    return 0;
  };

  return (
    <main className="bg-white min-h-screen py-16">
      <div className="container mx-auto px-6">
        {/* Back Link */}
        <Link href="/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to all collections
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Gallery / Image Frame */}
          <div className="space-y-4">
            <div className="relative group">
              <div 
                ref={mainImageRef}
              className="relative aspect-[3/4] bg-gray-50 overflow-x-auto flex snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] rounded-sm shadow-md"
              onScroll={(e) => {
                const scrollLeft = e.currentTarget.scrollLeft;
                const width = e.currentTarget.clientWidth;
                const newIndex = Math.round(scrollLeft / width);
                if (newIndex !== selectedImageIndex) {
                  setSelectedImageIndex(newIndex);
                }
              }}
            >
              {product.imageUrls && product.imageUrls.length > 0 ? (
                product.imageUrls.map((url, index) => (
                  <div key={index} className="relative min-w-full h-full snap-start shrink-0">
                    <Image
                      src={getCloudinaryUrl(url) || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1620&auto=format&fit=crop"}
                      alt={`${product.name} image ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>
                ))
              ) : (
                <div className="relative min-w-full h-full snap-start shrink-0">
                  <Image
                    src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1620&auto=format&fit=crop"
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}
            </div>
              <button
                aria-label="Wishlist"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (product) toggleLike(userId, product); }}
                className={`absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur rounded-full transition-all hover:scale-110 hover:text-rose-500 z-10 shadow-md ${liked ? "opacity-100 text-rose-500" : "opacity-100 text-gray-400"}`}
              >
                <Heart className={`w-5 h-5 ${liked ? "fill-rose-500 text-rose-500" : ""}`} strokeWidth={1.5} />
              </button>
            </div>
            {product.imageUrls && product.imageUrls.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {product.imageUrls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    className={`relative w-24 aspect-[3/4] shrink-0 rounded-sm overflow-hidden border-2 transition-colors snap-start ${
                      selectedImageIndex === index ? "border-black" : "border-transparent border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src={getCloudinaryUrl(url)}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Frame */}
          <div className="space-y-8">
            <div className="border-b border-gray-100 pb-6">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-600">
                {product.brand ? `Brand: ${product.brand}` : "Brand not specified"}
              </span>
              <h1 className="text-3xl md:text-4xl font-heading font-medium tracking-tight mt-2 text-foreground mb-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 mt-4">
                <span className="text-2xl font-bold text-gray-900">
                  ₹{Math.round(product.price).toLocaleString("en-IN")}
                </span>
                {product.discountPercentage > 0 && (
                  <>
                    <span className="bg-[#B91C1C] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-sm">
                      {product.discountPercentage}% off
                    </span>
                    <span className="text-muted-foreground line-through text-sm font-normal">
                      ₹{Math.round(product.price / (1 - Math.min(99.9, product.discountPercentage) / 100)).toLocaleString("en-IN")}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-3">
                Description
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {product.description || "Designed with premium details and materials. This editorial staple fits true to size and makes a perfect, versatile addition to any quality wardrobe."}
              </p>
            </div>

            {/* Size Selector */}
            {requiresSize && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
                    Select Size
                  </h3>
                  <span className="text-xs text-gray-400 border-b border-gray-200 pb-0.5 cursor-pointer hover:text-black transition-colors">Size Guide</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {sizes.map((size) => {
                    const sizeStock = getStockForSize(size);
                    const isOutOfStock = sizeStock <= 0;

                    return (
                      <button
                        key={size}
                        disabled={isOutOfStock}
                        onClick={() => {
                          setSelectedSize(size);
                          setSizeError(false);
                          setQuantity(1); // Reset quantity when size changes
                        }}
                        className={`w-12 h-12 flex items-center justify-center text-sm font-medium border transition-all rounded-full ${
                          isOutOfStock
                            ? "bg-neutral-100 text-neutral-300 border-neutral-100 cursor-not-allowed line-through"
                            : selectedSize === size
                            ? "border-black bg-black text-white"
                            : "border-gray-200 text-gray-600 hover:border-black"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                {selectedSize && (
                  <p className="text-xs text-emerald-700 font-mono mt-2">
                    Size {selectedSize} stock: {getStockForSize(selectedSize)} units available
                  </p>
                )}
                {sizeError && (
                  <p className="text-sm text-red-600 flex items-center gap-1.5 mt-2.5 font-medium">
                    <AlertCircle className="w-4 h-4" />
                    Please select a size to add to cart
                  </p>
                )}
              </div>
            )}

            {/* Quantity Selector & Cart CTA */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-6">
                <div className="flex items-center border border-gray-200 h-14">
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="px-4 text-gray-500 hover:text-black transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-medium select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(prev => {
                      const maxStock = requiresSize ? getStockForSize(selectedSize) : product.quantity;
                      return prev < (maxStock || 0) ? prev + 1 : prev;
                    })}
                    disabled={quantity >= (requiresSize ? getStockForSize(selectedSize) : (product.quantity || 0))}
                    className="px-4 text-gray-500 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <Button
                  onClick={handleAddToCart}
                  disabled={isAdding || (
                    requiresSize
                      ? !selectedSize || getStockForSize(selectedSize) === 0
                      : (product.quantity || 0) === 0
                  )}
                  className="flex-1 h-14 rounded-none bg-foreground text-background hover:bg-[var(--color-destructive)] text-sm tracking-widest uppercase transition-colors disabled:opacity-70 disabled:hover:bg-foreground cursor-pointer"
                >
                  {product.quantity === 0 ? "Out of Stock" : isAdding ? "Adding..." : "Add to Cart"}
                </Button>
              </div>
            </div>

             {/* Info Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-gray-100">
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Truck className="w-5 h-5 shrink-0" />
                <span className="text-xs">Delivery across India</span>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <RotateCcw className="w-5 h-5 shrink-0" />
                <span className="text-xs">Fast Order Processing</span>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Shield className="w-5 h-5 shrink-0" />
                <span className="text-xs">Secure Razorpay Payments</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
