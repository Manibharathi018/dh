"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { productService } from "@/services/productService";
import { categoryService, CategoryDTO } from "@/services/categoryService";
import { mediaService, MediaContent } from "@/services/mediaService";
import { Product } from "@/types";
import { getCloudinaryUrl } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";

// Images & Assets fallback
const FALLBACK_HERO = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=3270&auto=format&fit=crop";

function ProductCard({ p }: { p: Partial<Product> }) {
  const { isAuthenticated, user } = useAuthStore();
  const userId = isAuthenticated ? String(user?.id) : "guest";
  const { toggleLike, isLiked } = useWishlistStore();
  const liked = p.id ? isLiked(userId, p.id) : false;
  const addToCart = useCartStore((state) => state.addToCart);
  const router = useRouter();
  const [isAdded, setIsAdded] = useState(false);

  const mainImg = getCloudinaryUrl(p.imageUrls?.[0]);
  const discount = p.discountPercentage || 0;

  return (
    <Link
      href={`/products/${p.id}`}
      className="group snap-start shrink-0 w-[45vw] sm:w-[42vw] md:w-[28vw] lg:w-[22vw] max-w-[320px] block"
    >
      <article className="relative">
        <div className="relative aspect-[3/4] rounded-sm bg-surface overflow-hidden shadow-sm">
          <Image src={mainImg} alt={p.name || "Product"} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-white text-ink text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-sm shadow-sm z-10">
              -{discount}%
            </span>
          )}
          <button
            aria-label="Wishlist"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleLike(userId, p); }}
            className={`absolute top-3 right-3 w-9 h-9 grid place-items-center bg-white/90 backdrop-blur rounded-full transition-opacity hover:text-sale z-10 shadow-sm ${liked ? "opacity-100 text-rose-500" : "opacity-0 group-hover:opacity-100 text-gray-500"}`}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-rose-500 text-rose-500" : ""}`} strokeWidth={1.5} />
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
                  setIsAdded(true);
                  setTimeout(() => setIsAdded(false), 2000);
                } catch(err) { console.error("Failed to add to cart"); }
              }
            }}
            disabled={p.quantity === 0 || isAdded}
            className="absolute inset-x-3 bottom-3 bg-ink text-white text-[11px] font-medium tracking-widest uppercase py-3 rounded-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 text-center shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
          >
            {p.quantity === 0 ? "Out of Stock" : isAdded ? "Product Added" : "Add to Cart"}
          </button>
        </div>
        <div className="pt-4">
          <p className="text-[10px] tracking-[0.2em] font-bold uppercase text-amber-600">
            {p.brand || "DFO"}
          </p>
          <h4 className="mt-1 font-medium text-sm text-ink truncate group-hover:text-sale transition-colors">{p.name}</h4>
          <div className="mt-1.5 flex items-baseline gap-2 font-mono text-sm">
            <span className="font-semibold text-ink">₹{Math.round(p.price || 0).toLocaleString("en-IN")}</span>
            {discount > 0 && (
              <>
                <span className="text-xs text-sale font-bold bg-sale/10 px-1.5 py-0.5 rounded">
                  {discount}% off
                </span>
                <span className="text-xs text-muted-foreground line-through font-normal">
                  ₹{Math.round((p.price || 0) / (1 - Math.min(99.9, discount) / 100)).toLocaleString("en-IN")}
                </span>
              </>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

function BannerSlider() {
  const [banners, setBanners] = useState<MediaContent[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await mediaService.getBanners();
        setBanners(res || []);
      } catch (err) {
        console.error("Failed to load banners:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  if (loading) {
    return (
      <div className="h-[80vh] w-full bg-neutral-900 flex items-center justify-center">
        <Skeleton className="h-12 w-64 bg-white/20" />
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <section className="relative h-[80vh] w-full overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src={FALLBACK_HERO}
            alt="Dhanya Factory Outlet Hero"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60" />
        </div>
        <div className="relative z-10 text-center text-white px-6">
          <h1 className="font-heading tracking-[0.22em] text-5xl md:text-7xl font-bold uppercase mb-4">DHANYA</h1>
          <p className="tracking-[0.3em] text-xs font-light uppercase">Factory Outlet</p>
          <Link href="/products" className="mt-8 px-8 py-3 bg-[#f6f1ed] text-ink hover:bg-white text-xs tracking-widest uppercase inline-block font-bold">
            Shop New Drops
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[80vh] w-full overflow-hidden">
      {banners.map((b, idx) => (
        <div
          key={b.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === currentIdx ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <Image
            src={getCloudinaryUrl(b.address)}
            alt={`Banner ${idx + 1}`}
            fill
            className="object-cover object-center"
            priority={idx === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60" />
        </div>
      ))}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white px-6">
        <h1 className="font-heading tracking-[0.22em] text-5xl md:text-7xl font-bold uppercase mb-4">DHANYA</h1>
        <p className="tracking-[0.3em] text-xs font-light uppercase">Factory Outlet</p>
        <Link href="/products" className="mt-8 px-8 py-3 bg-[#f6f1ed] text-ink hover:bg-white text-xs tracking-widest uppercase inline-block font-bold">
          Shop New Drops
        </Link>
      </div>
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={`w-2.5 h-2.5 rounded-full ${
                idx === currentIdx ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function FeaturedProducts() {
  const [liveProducts, setLiveProducts] = useState<Partial<Product>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeaturedProducts() {
      try {
        const response = await productService.getFeaturedProducts();
        setLiveProducts(response || []);
      } catch (err) {
        console.error("Failed to load featured products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFeaturedProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-surface">
        <div className="container-editorial">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="flex gap-4 overflow-hidden">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-[3/4] w-64 shrink-0" />)}
          </div>
        </div>
      </section>
    );
  }

  if (liveProducts.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-surface">
      <div className="container-editorial">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="eyebrow mb-3 flex items-center gap-1.5 font-bold text-amber-600">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Editor&apos;s Choice · Featured
            </p>
            <h2 className="font-display text-4xl md:text-5xl">Featured Products</h2>
          </div>
          <Link href="/products" className="text-xs font-bold tracking-widest uppercase hover:text-sale inline-flex items-center gap-2">
            See Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <div className="relative w-full">
        <div className="flex overflow-x-auto scrollbar-none snap-x snap-mandatory gap-4 md:gap-6 px-5 md:px-8 xl:px-12 pb-4 scroll-pl-5 md:scroll-pl-8 xl:scroll-pl-12">
          {liveProducts.map((p, i) => (
            <ProductCard key={`${p.id || i}`} p={p} />
          ))}
          <div className="w-1 shrink-0" />
        </div>
      </div>
    </section>
  );
}

function Departments() {
  const [liveCategories, setLiveCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const catsRes = await categoryService.getActiveCategories();
        const roots = (catsRes || []).filter(c => !c.parentId);
        setLiveCategories(roots);
      } catch (err) {
        console.error("Failed to load active departments:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <section className="py-16 md:py-28 bg-surface">
        <div className="container-editorial">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-72 mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (liveCategories.length === 0) return null;

  return (
    <section className="py-16 md:py-28 bg-surface">
      <div className="container-editorial">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="eyebrow mb-3">The Edit</p>
          <h2 className="font-display text-4xl md:text-6xl">Shop by Department</h2>
          <p className="mt-5 text-muted-foreground">
            Curated worlds from our catalog. Explore every corner of the store.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {liveCategories.map((c, i) => {
            const targetHref = `/category/${encodeURIComponent(c.name)}`;
            const catImg = getCloudinaryUrl(c.address);

            return (
              <Link
                key={c.id ?? c.name}
                href={targetHref}
                className="group block cursor-pointer"
              >
                <div className="relative aspect-[3/4] rounded-sm bg-surface overflow-hidden shadow-sm">
                  <Image
                    src={catImg}
                    alt={c.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center p-4">
                    <h3 className="font-display text-lg md:text-xl tracking-[0.2em] uppercase font-semibold text-white group-hover:text-amber-300 transition-colors text-center">
                      {c.name}
                    </h3>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CategoryProductsSection() {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await categoryService.getActiveCategories();
        const roots = (res || []).filter(c => !c.parentId);
        setCategories(roots);
      } catch (err) {
        console.error("Failed to load categories for product section:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="container-editorial py-16">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-[3/4] w-64 shrink-0" />)}
        </div>
      </div>
    );
  }

  return (
    <>
      {categories.map((cat) => (
        <CategoryProductRow key={cat.id ?? cat.name} categoryName={cat.name} />
      ))}
    </>
  );
}

function CategoryProductRow({ categoryName }: { categoryName: string }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await productService.getProductsByCategory(categoryName, 0, 8);
        setProducts(res?.content || []);
      } catch (err) {
        console.error(`Failed to load products for category ${categoryName}:`, err);
      }
    }
    loadProducts();
  }, [categoryName]);

  if (products.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-background border-b border-gray-100">
      <div className="container-editorial">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="eyebrow mb-3 uppercase text-xs font-bold tracking-widest text-[#C9A84C]">Browse</p>
            <h2 className="font-display text-3xl md:text-4xl capitalize">{categoryName}</h2>
          </div>
          <Link href={`/category/${encodeURIComponent(categoryName)}`} className="text-xs font-bold tracking-widest uppercase hover:text-sale inline-flex items-center gap-2">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <div className="relative w-full">
        <div className="flex overflow-x-auto scrollbar-none snap-x snap-mandatory gap-4 md:gap-6 px-5 md:px-8 xl:px-12 pb-4 scroll-pl-5 md:scroll-pl-8 xl:scroll-pl-12">
          {products.map((p, i) => (
            <ProductCard key={`${p.id || i}`} p={p} />
          ))}
          <div className="w-1 shrink-0" />
        </div>
      </div>
    </section>
  );
}

interface VideoCardProps {
  src: string;
  isActive: boolean;
  onEnded: () => void;
  className?: string;
  allowAudio?: boolean;
}

function ManagedVideo({ src, isActive, onEnded, className, allowAudio }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.currentTime = 0;
      if (allowAudio) {
        video.muted = false;
        video.play().catch((err) => {
          console.log("Unmuted autoplay prevented, falling back to muted:", err);
          video.muted = true;
          video.play().catch((e) => console.log("Muted fallback failed:", e));
        });
      } else {
        video.muted = true;
        video.play().catch((err) => {
          console.log("Autoplay failed:", err);
        });
      }
    } else {
      video.pause();
    }
  }, [isActive, src, allowAudio]);

  return (
    <video
      ref={videoRef}
      src={src}
      muted={!allowAudio}
      playsInline
      preload="auto"
      onEnded={onEnded}
      className={className}
    />
  );
}

function ReviewVideosSection() {
  const [videos, setVideos] = useState<MediaContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [playingIndex, setPlayingIndex] = useState(-1);
  const [transitionEnabled, setTransitionEnabled] = useState(true);

  useEffect(() => {
    async function loadVideos() {
      try {
        const res = await mediaService.getReviewVideos();
        const list = res || [];
        setVideos(list);
        if (list.length > 0) {
          const initial = list.length * 25;
          setActiveIndex(initial);
          setPlayingIndex(initial);
        }
      } catch (err) {
        console.error("Failed to load review videos:", err);
      } finally {
        setLoading(false);
      }
    }
    loadVideos();
  }, []);

  if (loading || videos.length === 0) return null;

  const repeatedVideos = Array.from({ length: 50 }).flatMap(() => videos);

  const handleEnded = () => {
    setPlayingIndex(-1);
    setActiveIndex((prevActive) => {
      const nextActive = prevActive + 1;
      
      setTimeout(() => {
        const len = videos.length;
        const minSafe = len * 15;
        const maxSafe = len * 35;
        if (nextActive < minSafe || nextActive > maxSafe) {
          setTransitionEnabled(false);
          const currentOffset = nextActive % len;
          const newMid = len * 25 + currentOffset;
          setActiveIndex(newMid);
          setPlayingIndex(newMid);
          setTimeout(() => {
            setTransitionEnabled(true);
          }, 50);
        } else {
          setPlayingIndex(nextActive);
        }
      }, 700);

      return nextActive;
    });
  };

  return (
    <section className="py-16 md:py-24 bg-surface border-b border-gray-100 overflow-hidden">
      <div className="container-editorial text-center mb-12">
        <p className="eyebrow mb-3 font-bold text-[#C9A84C]">Customer Voices</p>
        <h2 className="font-display text-3xl md:text-5xl">Reviews from the Community</h2>
      </div>
      <div className="relative w-full overflow-hidden py-4">
        <div
          className="flex gap-6"
          style={{
            transition: transitionEnabled ? "transform 700ms ease-in-out" : "none",
            transform: `translate3d(calc(50vw - (var(--card-width) / 2) - (${activeIndex} * (var(--card-width) + 24px))), 0, 0)`,
          }}
        >
          {repeatedVideos.map((vid, idx) => {
            const isActive = idx === activeIndex;
            const isPlaying = idx === playingIndex;
            const isNearActive = Math.abs(idx - activeIndex) <= 5;

            return (
              <div
                key={`${vid.id}-${idx}`}
                className={`relative review-video-card aspect-[3/4] bg-neutral-900 rounded-lg shadow-md overflow-hidden shrink-0 transition-all duration-500 ${
                  isActive ? "opacity-100 scale-100" : "opacity-40 scale-95"
                }`}
              >
                {isNearActive ? (
                  <ManagedVideo
                    src={getCloudinaryUrl(vid.address)}
                    isActive={isPlaying}
                    onEnded={handleEnded}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-900" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ExperienceCollectionVideosSection() {
  const [videos, setVideos] = useState<MediaContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [playingIndex, setPlayingIndex] = useState(-1);
  const [transitionEnabled, setTransitionEnabled] = useState(true);

  useEffect(() => {
    async function loadVideos() {
      try {
        const res = await mediaService.getExperienceCollection();
        const list = res || [];
        setVideos(list);
        if (list.length > 0) {
          const initial = list.length * 25;
          setActiveIndex(initial);
          setPlayingIndex(initial);
        }
      } catch (err) {
        console.error("Failed to load experience videos:", err);
      } finally {
        setLoading(false);
      }
    }
    loadVideos();
  }, []);

  if (loading || videos.length === 0) return null;

  const repeatedVideos = Array.from({ length: 50 }).flatMap(() => videos);

  const handleEnded = () => {
    setPlayingIndex(-1);
    setActiveIndex((prevActive) => {
      const nextActive = prevActive + 1;
      
      setTimeout(() => {
        const len = videos.length;
        const minSafe = len * 15;
        const maxSafe = len * 35;
        if (nextActive < minSafe || nextActive > maxSafe) {
          setTransitionEnabled(false);
          const currentOffset = nextActive % len;
          const newMid = len * 25 + currentOffset;
          setActiveIndex(newMid);
          setPlayingIndex(newMid);
          setTimeout(() => {
            setTransitionEnabled(true);
          }, 50);
        } else {
          setPlayingIndex(nextActive);
        }
      }, 700);

      return nextActive;
    });
  };

  return (
    <section className="py-16 md:py-24 bg-background overflow-hidden">
      <div className="container-editorial text-center mb-12">
        <p className="eyebrow mb-3 font-bold text-[#C9A84C]">Brand Story</p>
        <h2 className="font-display text-3xl md:text-5xl">Experience Our Collection</h2>
      </div>
      <div className="relative w-full overflow-hidden py-4">
        <div
          className="flex gap-6"
          style={{
            transition: transitionEnabled ? "transform 700ms ease-in-out" : "none",
            transform: `translate3d(calc(50vw - (var(--card-width) / 2) - (${activeIndex} * (var(--card-width) + 24px))), 0, 0)`,
          }}
        >
          {repeatedVideos.map((vid, idx) => {
            const isActive = idx === activeIndex;
            const isPlaying = idx === playingIndex;
            const isNearActive = Math.abs(idx - activeIndex) <= 5;

            return (
              <div
                key={`${vid.id}-${idx}`}
                className={`relative experience-video-card aspect-video bg-neutral-900 rounded-lg shadow-md overflow-hidden shrink-0 transition-all duration-500 ${
                  isActive ? "opacity-100 scale-100" : "opacity-40 scale-95"
                }`}
              >
                {isNearActive ? (
                  <ManagedVideo
                    src={getCloudinaryUrl(vid.address)}
                    isActive={isPlaying}
                    onEnded={handleEnded}
                    allowAudio={true}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-900" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="w-full bg-background min-h-screen">
      <BannerSlider />
      <FeaturedProducts />
      <Departments />
      <CategoryProductsSection />
      <ReviewVideosSection />
      <ExperienceCollectionVideosSection />
    </main>
  );
}
