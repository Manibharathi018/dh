"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import { getCloudinaryUrl } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export default function CategoryPage({ params }: { params: Promise<{ name: string }> }) {
  const resolvedParams = use(params);
  const categoryName = decodeURIComponent(resolvedParams.name).toLowerCase();
  const [page, setPage] = useState(0);

  // Fetch products by category name
  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products-category", categoryName, page],
    queryFn: () => productService.getProductsByCategory(categoryName, page, 12),
  });

  const products = productsData?.content || [];

  return (
    <div className="bg-white min-h-screen pt-12 pb-24">
      <div className="container mx-auto px-6">
        {/* Breadcrumb / Back Link */}
        <Link href="/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to all collections
        </Link>

        {/* Editorial Heading */}
        <div className="border-b border-gray-100 pb-8 mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-medium tracking-tight mb-4 capitalize">
            {categoryName} Collection
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Explore our premium selection of {categoryName} apparel. Sourced directly, tailored to perfection.
          </p>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-[400px] w-full rounded-none" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-gray-50/50 border border-dashed border-gray-200">
            <p className="text-muted-foreground mb-4 font-heading text-lg">No products available in this category.</p>
            <Link href="/products" className="inline-flex items-center text-sm font-medium hover:text-[var(--color-destructive)] border-b border-black pb-0.5">
              Browse all products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-8 sm:gap-y-16">
            {products.map((product, index) => (
              <Link
                key={product.id || `cat-prod-${index}`}
                href={`/products/${product.id}`}
                className="group flex flex-col h-full"
              >
                {/* Image frame */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 mb-6">
                  <Image
                    src={getCloudinaryUrl(product.imageUrls?.[0]) || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1620&auto=format&fit=crop"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                  {product.discountPercentage > 0 && (
                    <span className="absolute top-4 left-4 bg-[var(--color-destructive)] text-white text-xs uppercase tracking-widest font-semibold px-3 py-1">
                      -{product.discountPercentage}% Off
                    </span>
                  )}
                </div>

                {/* Metadata */}
                <div className="flex flex-col flex-grow">
                  <h3 className="font-heading font-medium text-lg text-foreground mb-2 line-clamp-1 group-hover:text-[var(--color-destructive)] transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-auto font-mono text-sm">
                    <span className="text-foreground font-medium">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                    {product.originalPrice && product.originalPrice > 0 && (
                      <span className="text-muted-foreground line-through text-xs">
                        ₹{product.originalPrice.toLocaleString("en-IN")}
                      </span>
                    )}
                    {product.discountPercentage > 0 && (
                      <span className="text-xs text-sale font-bold bg-sale/10 px-1.5 py-0.5 rounded">
                        {product.discountPercentage}% Off
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
