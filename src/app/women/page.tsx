"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import { categoryService, CategoryDTO } from "@/services/categoryService";
import { getCloudinaryUrl } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { FilterSortBar } from "@/components/shared/FilterSortBar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";
import { Product } from "@/types";

function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-16">
      {products.map((product: Product, index: number) => {
        const finalPrice = product.discountPercentage > 0
          ? product.price - (product.price * (product.discountPercentage / 100))
          : product.price;

        return (
          <Link
            key={product.id || `womens-prod-${index}`}
            href={`/products/${product.id}`}
            className="group flex flex-col h-full"
          >
            {/* Image frame */}
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 mb-4 rounded-sm">
              <Image
                src={getCloudinaryUrl(product.imageUrls?.[0])}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              {product.discountPercentage > 0 && (
                <span className="absolute top-2 left-2 md:top-4 md:left-4 bg-[var(--color-destructive)] text-white text-[10px] md:text-xs uppercase tracking-widest font-semibold px-2 py-1 md:px-3 md:py-1">
                  -{product.discountPercentage}%
                </span>
              )}
            </div>

            {/* Metadata */}
            <div className="flex flex-col flex-grow">
              <p className="text-[10px] tracking-widest text-muted-foreground uppercase mb-1">DFO</p>
              <h3 className="font-heading font-medium text-sm md:text-base text-foreground mb-1 line-clamp-2 group-hover:text-[var(--color-destructive)] transition-colors">
                {product.name}
              </h3>
              <div className="flex flex-col mt-auto font-mono text-sm">
                 {product.discountPercentage > 0 ? (
                   <>
                     <span className="text-muted-foreground line-through text-xs mb-0.5">
                       Rs. {product.price.toFixed(2)}
                     </span>
                     <span className="text-foreground font-medium flex items-center gap-2">
                       Rs. {finalPrice.toFixed(2)}
                       <span className="text-white bg-[var(--color-destructive)] px-1.5 py-0.5 text-[10px] rounded-sm leading-none">-{product.discountPercentage}%</span>
                     </span>
                   </>
                 ) : (
                   <span className="text-foreground font-medium">
                     Rs. {product.price.toFixed(2)}
                   </span>
                 )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function WomensPageContent() {
  const searchParams = useSearchParams();
  const maxPriceParam = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null;
  const minDiscountParam = searchParams.get("minDiscount") ? Number(searchParams.get("minDiscount")) : null;

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPriceParam !== null ? maxPriceParam : 100000]);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("name,asc");

  useEffect(() => {
    if (maxPriceParam !== null) {
      setPriceRange([0, maxPriceParam]);
    }
  }, [maxPriceParam]);

  // Fetch all categories
  const { data: allCategories = [] as CategoryDTO[], isLoading: isCategoriesLoading } = useQuery<CategoryDTO[]>({
    queryKey: ["categories-all"],
    queryFn: categoryService.getAllCategories,
  });

  // Find root category for the current page
  const rootCategory = allCategories.find(c => c.slug?.toLowerCase() === "women");

  // Find all subcategories recursively
  const getSubcategoriesRecursive = (parentCategoryId: number, allCats: CategoryDTO[]): CategoryDTO[] => {
    const direct = allCats.filter(c => c.parentId === parentCategoryId);
    let recursive: CategoryDTO[] = [...direct];
    direct.forEach(d => {
      if (d.id) {
        recursive = [...recursive, ...getSubcategoriesRecursive(d.id, allCats)];
      }
    });
    return recursive;
  };

  const subcategories = rootCategory && allCategories.length > 0
    ? getSubcategoriesRecursive(rootCategory.id!, allCategories)
    : [];

  // Query products based on root and subcategories
  const { data: products = [] as Product[], isLoading: isProductsLoading } = useQuery<Product[]>({
    queryKey: ["products-for-page", rootCategory?.id, activeCategory, allCategories],
    enabled: !!rootCategory,
    queryFn: async (): Promise<Product[]> => {
      if (!rootCategory) return [];

      let targetCats: CategoryDTO[] = [];
      if (activeCategory) {
        const selectedCat = allCategories.find(c => c.name === activeCategory);
        targetCats = selectedCat ? [selectedCat] : [];
      } else {
        targetCats = [rootCategory, ...subcategories];
      }

      if (targetCats.length === 0) return [];

      const promises = targetCats.map(cat => productService.getProductsByCategory(cat.name, 0, 100));
      const responses = await Promise.all(promises);

      const allProducts: Product[] = [];
      const seenIds = new Set<number>();
      responses.forEach(res => {
        (res?.content || []).forEach(prod => {
          if (prod && !seenIds.has(prod.id)) {
            seenIds.add(prod.id);
            allProducts.push(prod);
          }
        });
      });
      return allProducts;
    }
  });

  if (isCategoriesLoading) {
    return (
      <div className="container mx-auto px-6 py-32 text-center text-muted-foreground">
        Loading Women's Collection...
      </div>
    );
  }

  if (!rootCategory) {
    return (
      <div className="container mx-auto px-6 py-32 text-center">
        <h2 className="text-2xl font-heading mb-4">Collection Not Found</h2>
        <p className="text-muted-foreground mb-8">The "Women" collection is currently unavailable.</p>
        <Link href="/products" className="text-sm font-medium hover:text-[var(--color-destructive)] border-b border-black pb-0.5">
          Browse All Products
        </Link>
      </div>
    );
  }

  // Apply filters
  let productsToDisplay = products;
  productsToDisplay = productsToDisplay.filter((p: Product) => {
    const finalPrice = p.discountPercentage > 0 ? p.price - (p.price * (p.discountPercentage / 100)) : p.price;
    const passesPrice = finalPrice >= priceRange[0] && finalPrice <= priceRange[1];
    const passesDiscount = minDiscountParam !== null ? (p.discountPercentage || 0) >= minDiscountParam : true;
    const passesStock = inStockOnly ? p.quantity > 0 : true;
    return passesPrice && passesDiscount && passesStock;
  });

  // Apply sorting
  productsToDisplay = [...productsToDisplay].sort((a: Product, b: Product) => {
    const aPrice = a.discountPercentage > 0 ? a.price - (a.price * (a.discountPercentage / 100)) : a.price;
    const bPrice = b.discountPercentage > 0 ? b.price - (b.price * (b.discountPercentage / 100)) : b.price;

    if (sortBy === "name,asc") return a.name.localeCompare(b.name);
    if (sortBy === "name,desc") return b.name.localeCompare(a.name);
    if (sortBy === "price,asc") return aPrice - bPrice;
    if (sortBy === "price,desc") return bPrice - aPrice;
    return 0;
  });

  return (
    <div className="bg-white min-h-screen pt-8 md:pt-12 pb-24">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-heading font-medium tracking-wide uppercase mb-2">
            WOMENS
          </h1>
          {activeCategory && (
            <button
              onClick={() => setActiveCategory(null)}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mt-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to all Women's Categories
            </button>
          )}
        </div>

        {!activeCategory && subcategories.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-20 max-w-6xl mx-auto">
            {subcategories.map((cat: CategoryDTO) => (
              <div
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className="group relative block aspect-[3/4] md:aspect-[4/5] overflow-hidden rounded-sm w-full cursor-pointer bg-neutral-100"
              >
                {cat.imageUrl ? (
                  <Image
                    src={getCloudinaryUrl(cat.imageUrl)}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-400 uppercase font-mono text-xs tracking-wider">
                    {cat.name}
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent flex justify-center">
                  <span className="text-white font-medium tracking-widest text-sm md:text-base uppercase">
                    {cat.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-gray-100 pt-16">
          <h2 className="text-2xl md:text-3xl font-heading font-medium text-center uppercase tracking-widest mb-10">
            {activeCategory ? activeCategory : "ALL WOMENS PRODUCTS"}
          </h2>

          <FilterSortBar
            productsCount={productsToDisplay.length}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            inStockOnly={inStockOnly}
            setInStockOnly={setInStockOnly}
            onClearFilters={() => {
              setPriceRange([0, 100000]);
              setInStockOnly(false);
            }}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

          {isProductsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-[250px] md:h-[350px] w-full rounded-sm" />
                  <Skeleton className="h-4 w-[80%]" />
                  <Skeleton className="h-4 w-[50%]" />
                </div>
              ))}
            </div>
          ) : productsToDisplay.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              No products match your filters in this category.
            </div>
          ) : (
            <ProductGrid products={productsToDisplay} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function WomensPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-6 py-32 text-center text-muted-foreground">Loading Women's Collection...</div>}>
      <WomensPageContent />
    </Suspense>
  );
}
