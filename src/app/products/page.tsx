"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { productService, ProductFilter } from "@/services/productService";
import { FilterSortBar } from "@/components/shared/FilterSortBar";
import { Skeleton } from "@/components/ui/skeleton";
import { getCloudinaryUrl } from "@/lib/utils";
import { Check, Heart, X, Sparkles } from "lucide-react";
import { api } from "@/lib/axios";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { Product } from "@/types";

// Curated fallback products for instant availability
const PRODUCTS_FALLBACK: Partial<Product>[] = [
  { id: 101, name: "Ivory Chikankari Kurti", price: 1299, discountPercentage: 50, category: { id: 1, name: "Apparel", description: "", imageUrl: "", active: true }, imageUrls: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop"] },
  { id: 102, name: "Court Rider 2.0 Sneakers", price: 2799, discountPercentage: 38, category: { id: 2, name: "Footwear", description: "", imageUrl: "", active: true }, imageUrls: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop"] },
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
  { id: 209, name: "Relaxed Fit Cargo Pants", price: 1599, discountPercentage: 20, category: { id: 3, name: "Cargo pants", description: "", imageUrl: "", active: true }, imageUrls: ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop"] },
  { id: 210, name: "Classic Slim Chinos", price: 1499, discountPercentage: 25, category: { id: 3, name: "Chinos", description: "", imageUrl: "", active: true }, imageUrls: ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=800&auto=format&fit=crop"] },
  { id: 211, name: "Raw Selvedge Denim Jeans", price: 2199, discountPercentage: 30, category: { id: 3, name: "Jeans", description: "", imageUrl: "", active: true }, imageUrls: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop"] },
  { id: 212, name: "Breathable Linen Pants", price: 1799, discountPercentage: 20, category: { id: 3, name: "Linen Pants", description: "", imageUrl: "", active: true }, imageUrls: ["https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?q=80&w=800&auto=format&fit=crop"] },
];

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || undefined;
  const initialCategory = searchParams.get("category") || undefined;
  const minDiscountParam = searchParams.get("minDiscount") ? Number(searchParams.get("minDiscount")) : null;

  const [filter, setFilter] = useState<ProductFilter>({
    keyword: initialSearch,
    category: initialCategory,
  });
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState<string>("name,asc");
  const [page, setPage] = useState(0);
  const [addedIds, setAddedIds] = useState<number[]>([]);

  // Update filter when search query parameter changes
  useEffect(() => {
    const s = searchParams.get("search") || undefined;
    const c = searchParams.get("category") || undefined;
    setFilter((prev) => ({
      ...prev,
      keyword: s,
      category: c || prev.category,
    }));
  }, [searchParams]);
  
  const addToCart = useCartStore((state) => state.addToCart);
  const { isAuthenticated, user } = useAuthStore();
  const userId = isAuthenticated ? String(user?.id) : "guest";
  const { toggleLike, isLiked } = useWishlistStore();

  // Fetch categories for filtering
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const response = await api.get("/categories");
        return response.data;
      } catch (error) {
        return [];
      }
    },
  });

  // Fetch products based on filter DTO
  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", filter, page, sortBy],
    queryFn: () => productService.filterProducts({
      ...filter,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
    }, page, 24),
  });

  const categories = categoriesData || [];
  const baseProducts = productsData?.content || [];

  // Apply Discount and Search / Category Filters
  let productsToDisplay = baseProducts;

  if (minDiscountParam !== null) {
    productsToDisplay = productsToDisplay.filter((p) => (p.discountPercentage || 0) >= minDiscountParam);
  }

  if (filter.keyword) {
    const q = filter.keyword.toLowerCase();
    productsToDisplay = productsToDisplay.filter((p) =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.category?.name && p.category.name.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      String(p.id).includes(q)
    );
  }

  // Apply Sort
  productsToDisplay = [...productsToDisplay].sort((a, b) => {
    if (sortBy === "name,asc") return (a.name || "").localeCompare(b.name || "");
    if (sortBy === "name,desc") return (b.name || "").localeCompare(a.name || "");
    if (sortBy === "price,asc") return a.price - b.price;
    if (sortBy === "price,desc") return b.price - a.price;
    return 0;
  });

  return (
    <div className="bg-white min-h-screen pt-12 pb-24">
      <div className="container mx-auto px-6">
        {/* Editorial Heading */}
        <div className="border-b border-gray-100 pb-8 mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-medium tracking-tight mb-4">
            {minDiscountParam !== null ? `Special Offers (≥ ${minDiscountParam}% OFF)` : "All Collections"}
          </h1>
          <p className="text-muted-foreground max-w-xl">
            {minDiscountParam !== null
              ? `Showing all curated fashion and footwear products discounted at ${minDiscountParam}% or more.`
              : "Explore curated design patterns, premium fabrics, and tailored silhouettes crafted for everyday ease and luxury."}
          </p>

          {/* Active Discount Filter Pill */}
          {minDiscountParam !== null && (
            <div className="mt-4 inline-flex items-center gap-2 bg-neutral-100 px-3.5 py-1.5 rounded-full text-xs font-medium text-neutral-800">
              <Sparkles className="w-3.5 h-3.5 text-[#C83E28]" />
              <span>Discount Filter: <strong>≥ {minDiscountParam}% OFF</strong></span>
              <button 
                onClick={() => router.push("/products")}
                className="hover:text-red-600 transition-colors ml-1 cursor-pointer"
                title="Clear discount filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <FilterSortBar 
          productsCount={productsToDisplay.length}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          inStockOnly={filter.inStock || false}
          setInStockOnly={(val) => setFilter(prev => ({ ...prev, inStock: val ? true : undefined }))}
          onClearFilters={() => {
            setFilter({});
            setPriceRange([0, 10000]);
            if (minDiscountParam !== null) router.push("/products");
          }}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        <div className="w-full">
          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-[400px] w-full rounded-none" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ))}
            </div>
          ) : productsToDisplay.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="mb-4">No products found matching your filters.</p>
              {minDiscountParam !== null && (
                <button
                  onClick={() => router.push("/products")}
                  className="text-xs uppercase font-bold tracking-widest underline text-ink cursor-pointer"
                >
                  View All Collections
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-16">
                {productsToDisplay.map((product, index) => {
                  const discount = product.discountPercentage || 0;
                  const liked = product.id ? isLiked(userId, product.id) : false;
                  const isAdded = product.id ? addedIds.includes(product.id) : false;

                  return (
                    <Link
                      key={product.id || `prod-${index}`}
                      href={`/products/${product.id}`}
                      className="group flex flex-col h-full"
                    >
                      {/* Image frame */}
                      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 mb-4 rounded-sm shadow-sm">
                        <Image
                          src={getCloudinaryUrl(product.imageUrls?.[0]) || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop"}
                          alt={product.name || "Product"}
                          fill
                          className="object-cover transition-transform duration-750 group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                        {discount > 0 && (
                          <span className="absolute top-2 left-2 md:top-4 md:left-4 bg-[var(--color-destructive)] text-white text-[10px] md:text-xs uppercase tracking-widest font-semibold px-2 py-1 md:px-3 md:py-1">
                            {discount}% off
                          </span>
                        )}
                        <button
                          aria-label="Wishlist"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (product.id) toggleLike(userId, product);
                          }}
                          className={`absolute top-2 right-2 md:top-4 md:right-4 w-8 h-8 md:w-10 md:h-10 grid place-items-center bg-white/90 backdrop-blur rounded-full transition-opacity hover:text-[var(--color-destructive)] z-10 shadow-sm ${
                            liked ? "opacity-100 text-[var(--color-destructive)]" : "opacity-0 group-hover:opacity-100 text-gray-500"
                          }`}
                        >
                          <Heart
                            className={`w-3.5 h-3.5 md:w-4 md:h-4 ${liked ? "fill-[var(--color-destructive)] text-[var(--color-destructive)]" : ""}`}
                            strokeWidth={1.5}
                          />
                        </button>
                      </div>

                      {/* Info */}
                      <div className="flex flex-col flex-grow">
                        <span className="text-[10px] tracking-widest text-amber-600 uppercase font-semibold mb-1">
                          {product.brand || "DFO"}
                        </span>
                        <h3 className="font-heading font-medium text-base text-foreground mb-1 group-hover:text-[var(--color-destructive)] transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-auto font-mono text-sm">
                          <span className="text-foreground font-medium">
                            ₹{Math.round(product.price).toLocaleString("en-IN")}
                          </span>
                          {discount > 0 && (
                            <>
                              <span className="text-xs text-sale font-bold bg-sale/10 px-1.5 py-0.5 rounded">
                                {discount}% off
                              </span>
                              <span className="text-muted-foreground line-through text-xs font-normal">
                                ₹{Math.round(product.price / (1 - Math.min(99.9, discount) / 100)).toLocaleString("en-IN")}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-6 py-32 text-center text-muted-foreground">Loading Products...</div>}>
      <ProductsPageContent />
    </Suspense>
  );
}
