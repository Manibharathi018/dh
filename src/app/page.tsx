"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import HeroCinematicScroll from "@/components/HeroCinematicScroll";
import PumaHeroSection from "@/components/PumaHeroSection";
import {
  ArrowRight, ArrowUpRight, Star, MapPin, Phone, MessageCircle,
  Clock, ChevronRight, Heart, Volume2, VolumeX, ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { productService, getDeletedProductIds } from "@/services/productService";
import { categoryService, CategoryDTO } from "@/services/categoryService";
import { Product } from "@/types";
import { getCloudinaryUrl } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";

// Images & Assets
import pumaRunner from "@/assets/puma-runner.png";
import shopimage from "@/assets/shopimage.jpg";

function ProductCard({ p }: { p: Partial<Product> }) {
  const { isAuthenticated, user } = useAuthStore();
  const userId = isAuthenticated ? String(user?.id) : "guest";
  const { toggleLike, isLiked } = useWishlistStore();
  const liked = p.id ? isLiked(userId, p.id) : false;
  const addToCart = useCartStore((state) => state.addToCart);
  const router = useRouter();
  const [isAdded, setIsAdded] = useState(false);

  const mainImg = getCloudinaryUrl(p.imageUrls?.[0]) || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop";
  const discount = p.discountPercentage || 0;
  const mrp = discount > 0 ? Math.round((p.price || 0) / (1 - discount / 100)) : (p.price || 0);

  return (
    <Link
      href={`/products/${p.id}`}
      className="group snap-start shrink-0 w-[45vw] sm:w-[42vw] md:w-[28vw] lg:w-[22vw] max-w-[320px] block"
    >
      <article className="relative">
        <div className="relative image-zoom aspect-[3/4] rounded-sm bg-surface overflow-hidden shadow-sm">
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
              if (p.quantity !== 0 && p.id) {
                try { 
                  await addToCart(p as Product, 1); 
                  setIsAdded(true);
                  setTimeout(() => setIsAdded(false), 2000);
                } catch(err) { console.error("Failed to add to cart"); }
              }
            }}
            disabled={p.quantity === 0 || isAdded}
            className="absolute inset-x-3 bottom-3 bg-ink text-white text-[11px] font-medium tracking-widest uppercase py-3 rounded-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 text-center shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {p.quantity === 0 ? "Out of Stock" : isAdded ? "Product Added" : "Add to Cart"}
          </button>
        </div>
        <div className="pt-4">
          <p className="text-[10px] tracking-[0.2em] font-bold uppercase text-amber-600">
            {p.brand || "DFO"}
          </p>
          <h4 className="mt-1 font-medium text-sm text-ink truncate group-hover:text-sale transition-colors">{p.name}</h4>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="font-semibold text-ink">₹{(p.price || 0).toLocaleString("en-IN")}</span>
            {discount > 0 && (
              <>
                <span className="text-xs text-muted-foreground line-through">₹{mrp.toLocaleString("en-IN")}</span>
                <span className="text-xs text-sale font-bold bg-sale/10 px-1.5 py-0.5 rounded">
                  {discount}% off
                </span>
              </>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

function RecentlyAdded() {
  const [recentProducts, setRecentProducts] = useState<Partial<Product>[]>([]);

  useEffect(() => {
    async function loadRecentProducts() {
      try {
        const response = await productService.getRecentProducts(0, 8);
        setRecentProducts(response?.content || []);
      } catch (err) {
        console.error("Failed to load recent products:", err);
      }
    }
    loadRecentProducts();
  }, []);

  if (recentProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-white border-b border-gray-100">
      <div className="container-editorial">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="eyebrow mb-3 flex items-center gap-1.5 font-bold text-emerald-600">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Fresh Drops · Just In
            </p>
            <h2 className="font-display text-4xl md:text-5xl">Recently Added</h2>
          </div>
          <Link href="/products" className="text-xs font-bold tracking-widest uppercase story-link inline-flex items-center gap-2 relative z-10 hover:text-sale transition-colors">
            See All New <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <div className="relative w-full">
        <div className="flex overflow-x-auto scrollbar-none snap-x snap-mandatory gap-4 md:gap-6 px-5 md:px-8 xl:px-12 pb-4 scroll-pl-5 md:scroll-pl-8 xl:scroll-pl-12">
          {recentProducts.map((p, i) => (
            <ProductCard key={`${p.id || i}`} p={p} />
          ))}
          <div className="w-1 shrink-0" />
        </div>
      </div>
    </section>
  );
}

function FeaturedProducts() {
  const [liveProducts, setLiveProducts] = useState<Partial<Product>[]>([]);

  useEffect(() => {
    async function loadFeaturedProducts() {
      try {
        const response = await productService.getFeaturedProducts();
        setLiveProducts(response || []);
      } catch (err) {
        console.error("Failed to load featured products for home page:", err);
        setLiveProducts([]);
      }
    }
    loadFeaturedProducts();
  }, []);

  if (liveProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-surface">
      <div className="container-editorial">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="eyebrow mb-3 flex items-center gap-1.5 font-bold text-amber-600">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Editor&apos;s Choice · Featured
            </p>
            <h2 className="font-display text-4xl md:text-5xl">Featured Products</h2>
          </div>
          <Link href="/products" className="text-xs font-bold tracking-widest uppercase story-link inline-flex items-center gap-2 relative z-10 hover:text-sale transition-colors">
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



/* ══════════════════════════════════════════════════════════════════════
   SHOP BY DEPARTMENT
══════════════════════════════════════════════════════════════════════ */
function Departments() {
  const [liveCategories, setLiveCategories] = useState<CategoryDTO[]>([]);
  const [allCategories, setAllCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const catsRes = await categoryService.getAllCategories();
        const activeCats = (catsRes || []).filter(c => c.active !== false);
        const roots = activeCats.filter(c => !c.parentId);
        setLiveCategories(roots);
        setAllCategories(activeCats);
      } catch (err) {
        console.error("Failed to load departments data:", err);
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (liveCategories.length === 0) {
    return (
      <section className="py-16 md:py-28 bg-surface">
        <div className="container-editorial">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow mb-3">The Edit</p>
            <h2 className="font-display text-4xl md:text-6xl">Shop by Department</h2>
            <p className="mt-5 text-muted-foreground text-sm border border-dashed border-gray-250 py-12 bg-white">
              No departments available yet.
            </p>
          </div>
        </div>
      </section>
    );
  }

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {liveCategories.map((c, i) => {
            const targetHref = `/category/${encodeURIComponent(c.name)}`;

            return (
              <Link
                key={c.id ?? c.name}
                href={targetHref}
                className="group block animate-fade-up cursor-pointer"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex items-center justify-center h-40 bg-white border border-gray-150 hover:border-black transition-all hover:bg-neutral-50 p-6 text-center shadow-xs">
                  <h3 className="font-display text-2xl tracking-[0.2em] uppercase font-medium text-black group-hover:text-amber-600 transition-colors">
                    {c.name}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}


/* ══════════════════════════════════════════════════════════════════════
   PUMA WORLD / PERFORMANCE FACTORY DIRECT SECTION
══════════════════════════════════════════════════════════════════════ */
function PumaFeature() {
  return <PumaHeroSection />;
}

/* ══════════════════════════════════════════════════════════════════════
   VIDEO SHOWCASE (Canvas-driven Fallback and Playback Support)
══════════════════════════════════════════════════════════════════════ */
const DEFAULT_SCENES: { colors: [string, string, string]; label: string; tag: string; poster: string }[] = [
  { colors: ["#1a1a1a", "#2d2d2d", "#404040"], label: "Monochrome Pattern Shirt", tag: "Casuals", poster: "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop" },
  { colors: ["#1c1a2e", "#2e2850", "#4a3f70"], label: "Signature Tailored Black Shirt", tag: "Formals", poster: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop" },
  { colors: ["#1a2420", "#243830", "#385040"], label: "Lavender Cable Knit Polo", tag: "Knits", poster: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop" },
  { colors: ["#2e1a1a", "#502828", "#704040"], label: "Italian Linen Trouser & Shirt", tag: "Menswear", poster: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop" },
  { colors: ["#1a1e2e", "#283050", "#405070"], label: "Autumn Outerwear & Jackets", tag: "Jackets", poster: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=800&auto=format&fit=crop" },
  { colors: ["#2e2210", "#503818", "#704c20"], label: "Festive Embroidered Kurtis", tag: "Ethnic", poster: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop" },
];

function AnimatedCard({ scene, isActive }: { scene: typeof DEFAULT_SCENES[0]; isActive: boolean }) {
  return (
    <div className="absolute inset-0 w-full h-full bg-neutral-900 overflow-hidden">
      <Image
        src={scene.poster}
        alt={scene.label}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 80vw, 450px"
      />
      {!isActive && (
        <div className="absolute inset-0 bg-black/20 backdrop-brightness-95 transition-opacity" />
      )}
    </div>
  );
}

const VIDEO_DATA = DEFAULT_SCENES.map((scene, i) => ({
  id:    i + 1,
  src:   `/videos/video${i + 1}.mp4`,
  label: scene.label,
  tag:   scene.tag,
  poster: scene.poster,
  scene,
}));

const TOTAL = VIDEO_DATA.length;
type Position = "active" | "prev" | "next" | "far-prev" | "far-next" | "hidden";

const CARD_STYLES: Record<Position, React.CSSProperties> = {
  "active": {
    left: "50%",
    top: "0%",
    transform: "translateX(-50%) scale(1)",
    width: "clamp(300px, 31vw, 450px)",
    zIndex: 30,
    opacity: 1,
    borderRadius: 2,
  },
  "prev": {
    left: "50%",
    top: "4.5%",
    transform: "translateX(calc(-50% - clamp(230px, 26vw, 375px))) scale(0.84)",
    width: "clamp(200px, 22vw, 310px)",
    zIndex: 20,
    opacity: 0.88,
    borderRadius: 2,
  },
  "next": {
    left: "50%",
    top: "4.5%",
    transform: "translateX(calc(-50% + clamp(230px, 26vw, 375px))) scale(0.84)",
    width: "clamp(200px, 22vw, 310px)",
    zIndex: 20,
    opacity: 0.88,
    borderRadius: 2,
  },
  "far-prev": {
    left: "50%",
    top: "8%",
    transform: "translateX(calc(-50% - clamp(410px, 47vw, 670px))) scale(0.70)",
    width: "clamp(150px, 17vw, 240px)",
    zIndex: 10,
    opacity: 0.55,
    borderRadius: 2,
  },
  "far-next": {
    left: "50%",
    top: "8%",
    transform: "translateX(calc(-50% + clamp(410px, 47vw, 670px))) scale(0.70)",
    width: "clamp(150px, 17vw, 240px)",
    zIndex: 10,
    opacity: 0.55,
    borderRadius: 2,
  },
  "hidden": {
    left: "50%",
    top: "12%",
    transform: "translateX(-50%) scale(0.55)",
    width: "clamp(130px, 15vw, 200px)",
    zIndex: 1,
    opacity: 0,
    pointerEvents: "none" as const,
    borderRadius: 2,
  },
};

const MOBILE_CARD_STYLES: Record<Position, React.CSSProperties> = {
  "active": {
    left: "50%",
    top: "0%",
    transform: "translateX(-50%) scale(1)",
    width: "82vw",
    zIndex: 30,
    opacity: 1,
    borderRadius: 2,
  },
  "prev": {
    left: "50%",
    top: "3.5%",
    transform: "translateX(calc(-50% - 70vw)) scale(0.84)",
    width: "70vw",
    zIndex: 20,
    opacity: 0.45,
    borderRadius: 2,
  },
  "next": {
    left: "50%",
    top: "3.5%",
    transform: "translateX(calc(-50% + 70vw)) scale(0.84)",
    width: "70vw",
    zIndex: 20,
    opacity: 0.45,
    borderRadius: 2,
  },
  "far-prev": {
    left: "50%",
    top: "7%",
    transform: "translateX(calc(-50% - 126vw)) scale(0.70)",
    width: "60vw",
    zIndex: 10,
    opacity: 0,
    borderRadius: 2,
    pointerEvents: "none",
  },
  "far-next": {
    left: "50%",
    top: "7%",
    transform: "translateX(calc(-50% + 126vw)) scale(0.70)",
    width: "60vw",
    zIndex: 10,
    opacity: 0,
    borderRadius: 2,
    pointerEvents: "none",
  },
  "hidden": {
    left: "50%",
    top: "10%",
    transform: "translateX(-50%) scale(0.55)",
    width: "55vw",
    zIndex: 1,
    opacity: 0,
    borderRadius: 2,
    pointerEvents: "none",
  },
};

function VideoCard({
  item,
  position,
  onClick,
  onEnded,
  isMobile,
}: {
  item:     typeof VIDEO_DATA[0];
  position: Position;
  onClick:  () => void;
  onEnded?: () => void;
  isMobile: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isMuted,  setIsMuted]  = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const isActive  = position === "active";
  const isVisible = position !== "hidden";

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (isActive) {
      if (isPlaying) {
        el.play().catch(() => {});
      } else {
        el.pause();
      }
    } else {
      el.pause();
      el.currentTime = 0;
    }
  }, [isActive, isPlaying]);

  const geo = isMobile ? MOBILE_CARD_STYLES[position] : CARD_STYLES[position];

  return (
    <div
      onClick={!isActive ? onClick : undefined}
      style={{
        position: "absolute",
        aspectRatio: "3/4",
        overflow: "hidden",
        cursor: isActive ? "default" : "pointer",
        boxShadow: isActive
          ? "0 24px 60px -15px rgba(0,0,0,0.32)"
          : "0 8px 24px -6px rgba(0,0,0,0.12)",
        transition: "all 0.55s cubic-bezier(0.25,1,0.5,1)",
        ...geo,
      }}
    >
      {isVisible && <AnimatedCard scene={item.scene} isActive={isActive} />}

      {!hasError && (
        <video
          ref={videoRef}
          src={item.src}
          muted={isMuted}
          playsInline
          preload="none"
          onEnded={onEnded}
          onError={() => setHasError(true)}
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
          }}
        />
      )}

      {isActive && (
        <>
          {/* Pause / Play Button in Top-Left (Curate Reference) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsPlaying((p) => !p);
            }}
            style={{
              position: "absolute", top: 14, left: 14,
              width: 34, height: 34, borderRadius: 2,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#fff", zIndex: 10,
            }}
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            {isPlaying ? (
              <span className="flex gap-[3px] items-center justify-center">
                <span className="w-[3px] h-3 bg-white"></span>
                <span className="w-[3px] h-3 bg-white"></span>
              </span>
            ) : (
              <span className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-white ml-0.5" />
            )}
          </button>

          {/* Sound Mute/Unmute in Bottom-Right (Curate Reference) */}
          <button
            onClick={(e) => { e.stopPropagation(); setIsMuted(m => !m); }}
            style={{
              position: "absolute", bottom: 14, right: 14,
              width: 34, height: 34, borderRadius: 2,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#fff", zIndex: 10,
            }}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </>
      )}

      {!isActive && isVisible && (
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.08)",
          pointerEvents: "none",
        }} />
      )}
    </div>
  );
}

function CuratedGrid() {
  const { isAuthenticated, user } = useAuthStore();
  const userId = isAuthenticated ? String(user?.id) : "guest";
  const { toggleLike, isLiked } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addToCart);
  const router = useRouter();
  const [addedIds, setAddedIds] = useState<number[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState<string>("");

  useEffect(() => {
    async function loadCuratedProducts() {
      try {
        const deleted = getDeletedProductIds();
        const cats = await categoryService.getAllCategories();
        // Get first root category
        const firstRoot = (cats || []).find(c => !c.parentId);
        if (firstRoot) {
          setCategoryName(firstRoot.name);
          const res = await productService.getProductsByCategory(firstRoot.name, 0, 8);
          if (res && res.content) {
            const filtered = res.content.filter(
              p => p && p.isActive !== false && !deleted.includes(p.id)
            );
            setProducts(filtered);
          }
        }
      } catch (err) {
        console.error("Failed to load curated products:", err);
      }
    }
    loadCuratedProducts();
  }, []);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container-editorial">
        <div className="mb-12">
          <p className="eyebrow mb-3">Trending Now</p>
          <h2 className="font-display text-4xl md:text-5xl capitalize">Best of {categoryName}</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {products.map((p) => {
            const liked = p.id ? isLiked(userId, p.id) : false;
            const isAdded = addedIds.includes(p.id);
            const mainImg = getCloudinaryUrl(p.imageUrls?.[0]) || "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop";
            const discount = p.discountPercentage || 0;
            const mrp = discount > 0 ? Math.round((p.price || 0) / (1 - discount / 100)) : (p.price || 0);

            return (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="group block"
              >
                <div className="relative aspect-[3/4] rounded-sm bg-surface overflow-hidden shadow-sm mb-4">
                  <Image
                    src={mainImg}
                    alt={p.name}
                    fill
                    className="object-cover transition-transform duration-750 group-hover:scale-105"
                  />
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
                      if (p.quantity !== 0 && p.id) {
                        try { 
                          await addToCart(p, 1); 
                          setAddedIds(prev => [...prev, p.id]);
                          setTimeout(() => setAddedIds(prev => prev.filter(id => id !== p.id)), 2000);
                        } catch(err) { console.error("Failed to add to cart"); }
                      }
                    }}
                    disabled={p.quantity === 0 || isAdded}
                    className="absolute inset-x-3 bottom-3 bg-ink text-white text-[11px] font-medium tracking-widest uppercase py-3 rounded-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 text-center shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {p.quantity === 0 ? "Out of Stock" : isAdded ? "Product Added" : "Add to Cart"}
                  </button>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] tracking-[0.2em] font-bold uppercase text-amber-600">
                    {p.brand || "DFO"}
                  </p>
                  <h4 className="font-medium text-sm text-ink truncate group-hover:text-sale transition-colors">{p.name}</h4>
                  <div className="flex items-center gap-2 text-xs pt-1">
                    {discount > 0 && (
                      <span className="text-gray-400 line-through font-mono">₹{mrp.toLocaleString("en-IN")}</span>
                    )}
                    <span className="font-semibold text-gray-900 font-mono">₹{(p.price || 0).toLocaleString("en-IN")}</span>
                    {discount > 0 && (
                      <span className="bg-[#B91C1C] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm font-mono">
                        -{discount}%
                      </span>
                    )}
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

function VideoShowcase() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const distance = touchStartX.current - touchEndX.current;
      if (distance > 50) goNext();
      if (distance < -50) goPrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const getPosition = (i: number): Position => {
    const prev2 = (activeIdx - 2 + TOTAL) % TOTAL;
    const prev1 = (activeIdx - 1 + TOTAL) % TOTAL;
    const next1 = (activeIdx + 1) % TOTAL;
    const next2 = (activeIdx + 2) % TOTAL;

    if (i === activeIdx) return "active";
    if (i === prev1)     return "prev";
    if (i === next1)     return "next";
    if (i === prev2)     return "far-prev";
    if (i === next2)     return "far-next";
    return "hidden";
  };

  const goTo = useCallback((idx: number) => {
    setActiveIdx(((idx % TOTAL) + TOTAL) % TOTAL);
  }, []);

  const goPrev = () => goTo(activeIdx - 1);
  const goNext = () => goTo(activeIdx + 1);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        background: "var(--color-background, #fff)",
        padding: "80px 0 72px",
        overflow: "hidden",
        opacity:   isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(28px)",
        transition: "opacity 0.8s ease, transform 0.8s ease",
      }}
    >
      <div className="container-editorial" style={{ textAlign: "center", marginBottom: 48 }}>
        <p className="eyebrow mb-3">Our Stories</p>
        <h2
          className="font-display"
          style={{
            fontSize: "clamp(1.9rem, 4vw, 2.8rem)",
            lineHeight: 1.15,
            color: "var(--color-ink, #1a1a1a)",
            margin: "0 0 14px",
          }}
        >
          Experience Our Collection
        </h2>
        <p style={{
          color: "var(--color-muted-foreground, #666)",
          fontSize: "clamp(0.85rem, 1.8vw, 1rem)",
          maxWidth: 480, margin: "0 auto",
          lineHeight: 1.7, fontFamily: "Inter, sans-serif",
        }}>
          Watch our latest arrivals, customer moments, store highlights, and exclusive collections.
        </p>
      </div>

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: "relative",
          width: "100%",
          height: "clamp(340px, 48vh, 500px)",
          touchAction: "pan-y",
        }}
      >
        <button
          onClick={goPrev}
          aria-label="Previous"
          style={{
            position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)",
            zIndex: 50, width: 44, height: 44, borderRadius: "50%",
            background: "#fff", border: "1px solid var(--color-hairline, #e5e5e5)",
            boxShadow: "0 4px 20px -4px rgba(0,0,0,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "var(--color-ink, #1a1a1a)",
            transition: "box-shadow 0.2s, transform 0.2s",
          }}
        >
          <ChevronLeft size={20} strokeWidth={1.5} />
        </button>

        <button
          onClick={goNext}
          aria-label="Next"
          style={{
            position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)",
            zIndex: 50, width: 44, height: 44, borderRadius: "50%",
            background: "#fff", border: "1px solid var(--color-hairline, #e5e5e5)",
            boxShadow: "0 4px 20px -4px rgba(0,0,0,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "var(--color-ink, #1a1a1a)",
            transition: "box-shadow 0.2s, transform 0.2s",
          }}
        >
          <ChevronRight size={20} strokeWidth={1.5} />
        </button>

        {VIDEO_DATA.map((item, i) => (
          <VideoCard
            key={item.id}
            item={item}
            position={getPosition(i)}
            onClick={() => goTo(i)}
            onEnded={goNext}
            isMobile={isMobile}
          />
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 28 }}>
        {VIDEO_DATA.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to video ${i + 1}`}
            style={{
              width: i === activeIdx ? 24 : 8,
              height: 8, borderRadius: 999,
              border: "none", cursor: "pointer", padding: 0,
              background: i === activeIdx
                ? "var(--color-ink, #1a1a1a)"
                : "var(--color-hairline, #e5e5e5)",
              transition: "width 0.4s cubic-bezier(0.25,1,0.5,1), background 0.3s",
            }}
          />
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   REVIEWS
══════════════════════════════════════════════════════════════════════ */
function Reviews() {
  const reviews = [
    { name: "Priya S.",    city: "Anna Nagar", rating: 5, text: "Genuinely surprised by the quality — got a Puma pair for less than half MRP. The store feels premium, not like a typical outlet." },
    { name: "Karthik R.", city: "T. Nagar",   rating: 5, text: "The kurtis for my wife were beautifully finished. Staff was patient, sizes were plenty. Now our go-to for weekend shopping." },
    { name: "Ananya M.",  city: "Adyar",      rating: 4, text: "Love the curation — feels like walking through a mini Nykaa Fashion but at outlet prices. Wide range for the whole family." },
    { name: "Rahul T.",   city: "Velachery",  rating: 5, text: "Best place for branded shoes at affordable rates. Will definitely come back for more!" },
    { name: "Sneha V.",   city: "OMR",        rating: 5, text: "Incredible selection of party wear. The quality is top-notch and the prices are unbelievable." },
  ];

  // 3 sets to allow seamless infinite scrolling in both directions
  const duplicatedReviews = [...reviews, ...reviews, ...reviews];
  
  const [index, setIndex] = useState(reviews.length); // Start at the second set
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const goNext = useCallback(() => {
    if (!isTransitioning) return;
    setIndex(prev => prev + 1);
  }, [isTransitioning]);

  const goPrev = useCallback(() => {
    if (!isTransitioning) return;
    setIndex(prev => prev - 1);
  }, [isTransitioning]);

  // Auto-scroll
  useEffect(() => {
    const timer = setInterval(goNext, 4000);
    return () => clearInterval(timer);
  }, [goNext]);

  // Seamless loop logic
  useEffect(() => {
    // If we reach the start of the 3rd set
    if (index === reviews.length * 2) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setIndex(reviews.length); // Snap back to the 2nd set
      }, 700); // Match CSS transition duration
      return () => clearTimeout(timeout);
    }
    
    // If we reach the end of the 1st set
    if (index === reviews.length - 1) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setIndex(reviews.length * 2 - 1); // Snap back to the end of the 2nd set
      }, 700);
      return () => clearTimeout(timeout);
    }
    
    // Re-enable transition after snap
    if (!isTransitioning) {
      const timeout = setTimeout(() => setIsTransitioning(true), 50);
      return () => clearTimeout(timeout);
    }
  }, [index, isTransitioning, reviews.length]);

  return (
    <section className="py-16 md:py-24 overflow-hidden">
      <div className="container-editorial">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-warning text-warning" />)}
          </div>
          <p className="eyebrow mb-3">4.8 / 5 · 2,400+ Reviews</p>
          <h2 className="font-display text-4xl md:text-5xl">Loved by Chennai</h2>
        </div>
        
        <div className="relative group px-0 md:px-12">
          {/* Carousel Track */}
          <div className="overflow-hidden">
            <div 
              className={`flex ${isTransitioning ? 'transition-transform duration-700 ease-in-out' : ''}`}
              style={{ transform: `translateX(-${index * (isMobile ? 100 : 33.3333)}%)` }}
            >
              {duplicatedReviews.map((r, i) => (
                <div key={i} className="w-full md:w-[33.3333%] px-3 shrink-0">
                  <blockquote className="border border-hairline rounded-sm p-8 bg-white h-full hover-lift transition-shadow">
                    <div className="flex gap-1 mb-5">
                      {[...Array(r.rating)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-warning text-warning" />)}
                    </div>
                    <p className="font-display text-xl leading-snug">&ldquo;{r.text}&rdquo;</p>
                    <footer className="mt-6 text-sm">
                      <div className="font-medium">{r.name}</div>
                      <div className="text-muted-foreground text-xs mt-0.5">{r.city}, Chennai</div>
                    </footer>
                  </blockquote>
                </div>
              ))}
            </div>
          </div>

          {/* Nav Buttons */}
          <button 
            onClick={goPrev} 
            className="absolute left-2 md:left-0 top-1/2 -translate-y-1/2 bg-white border border-hairline w-10 h-10 flex items-center justify-center rounded-full shadow-md opacity-0 group-hover:opacity-100 hover:bg-gray-50 transition-all z-10"
            aria-label="Previous Review"
          >
            <ChevronLeft className="w-5 h-5" style={{ color: "var(--color-ink, #1a1a1a)" }} />
          </button>
          <button 
            onClick={goNext} 
            className="absolute right-2 md:right-0 top-1/2 -translate-y-1/2 bg-white border border-hairline w-10 h-10 flex items-center justify-center rounded-full shadow-md opacity-0 group-hover:opacity-100 hover:bg-gray-50 transition-all z-10"
            aria-label="Next Review"
          >
            <ChevronRight className="w-5 h-5" style={{ color: "var(--color-ink, #1a1a1a)" }} />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   STORE LOCATION
══════════════════════════════════════════════════════════════════════ */
function StoreLocation() {
  return (
    <section className="py-16 md:py-24 bg-surface">
      <div className="container-editorial grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        <div className="image-zoom rounded-sm overflow-hidden aspect-[4/3] shadow-editorial relative border border-gray-200">
          <Image
            src={shopimage}
            alt="Dhanya Factory Outlet Storefront"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center"
            priority
          />
        </div>
        <div>
          <p className="eyebrow mb-3">Visit The Store</p>
          <h2 className="font-display text-4xl md:text-5xl">Come see it in person.</h2>
          <p className="mt-5 text-muted-foreground leading-relaxed max-w-lg">
            Every piece styled and stocked in one of Chennai's most thoughtfully curated outlet spaces. Try it on. Take it home.
          </p>
          <div className="mt-8 space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 mt-0.5 text-sale shrink-0" />
              <span>Flat No B 52/59, Ground Floor, 70 Feet Road, Siva Elango Salai, Periyar Nagar West, Chennai, Tamil Nadu 600082</span>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 mt-0.5 text-sale shrink-0" />
              <span>Open Daily · 10:00 AM – 10:00 PM</span>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 mt-0.5 text-sale shrink-0" />
              <a href="tel:+919629850010" className="hover:underline font-medium">096298 50010</a>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="https://www.google.co.in/maps/place/DHANYA+FACTORY+OUTLET/@13.1141749,80.2261172,17.18z/data=!4m7!3m6!1s0x3a52656148d441c9:0xaed1d06065540799!4b1!8m2!3d13.1139617!4d80.2275161!16s%2Fg%2F11z5wnssdf?entry=ttu&g_ep=EgoyMDI2MDgyNC4wIKXMDSoASAFQAw%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ink inline-flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" /> Get Directions
            </a>
            <a
              href="https://wa.me/919629850010?text=Hello%20Dhanya%20Factory%20Outlet,%20I%20have%20an%20inquiry%20regarding%20products"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-ink inline-flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   NEWSLETTER
══════════════════════════════════════════════════════════════════════ */
function Newsletter() {
  return (
    <section className="py-20 md:py-28 border-t border-hairline">
      <div className="container-editorial max-w-2xl text-center">
        <p className="eyebrow mb-3">The Insider List</p>
        <h2 className="font-display text-4xl md:text-5xl">First to know. First to shop.</h2>
        <p className="mt-4 text-muted-foreground">Weekly drops, private sales and early access — straight to your inbox.</p>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="mt-10 flex flex-col sm:flex-row items-stretch gap-3 max-w-md mx-auto"
        >
          <input
            type="email"
            required
            placeholder="your@email.com"
            className="flex-1 bg-transparent border-b border-ink text-center sm:text-left px-2 py-3 text-sm focus:outline-none focus:border-sale placeholder:text-muted-foreground/60"
          />
          <button className="btn-ink">Subscribe</button>
        </form>
        <p className="mt-4 text-[11px] text-muted-foreground">We respect your inbox. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════ */
export default function Home() {
  const { scrollY } = useScroll();
  
  // Parallax minimization effect for the hero text
  const brandY = useTransform(scrollY, [0, 350], [0, -120]);
  const brandScale = useTransform(scrollY, [0, 350], [1, 0.65]);
  const brandOpacity = useTransform(scrollY, [0, 350], [1, 0]);

  return (
    <main className="w-full bg-background min-h-screen">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative h-[80svh] min-h-[500px] lg:h-[80vh] lg:min-h-[600px] w-full overflow-hidden flex flex-col items-center justify-center">
        {/* Background with initial scale animation */}
        <motion.div 
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
          style={{ willChange: "transform" }}
        >
          <Image
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=3270&auto=format&fit=crop"
            alt="Dhanya Factory Outlet Hero"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60" />
        </motion.div>

        {/* Content Container */}
        <div className="relative z-10 w-full px-6 flex flex-col items-center text-center mt-12">
          
          {/* Brand Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8 w-full flex flex-col items-center justify-center"
          >
            <motion.div 
              style={{ 
                y: brandY, 
                scale: brandScale, 
                opacity: brandOpacity,
                willChange: "transform, opacity"
              }} 
              className="origin-center"
            >
              <h1 
                className="font-heading leading-none whitespace-nowrap text-[#f6f1ed] text-center"
                style={{
                  fontSize: "clamp(48px, 12vw, 160px)",
                  fontWeight: 200,
                  letterSpacing: "0.05em",
                  textShadow: "0 4px 48px rgba(0,0,0,0.3)",
                }}
              >
                DHANYA
              </h1>
              <div className="w-16 md:w-24 h-px bg-[#f6f1ed]/40 mx-auto mt-2 mb-3 md:mt-4 md:mb-5" />
              <p className="uppercase tracking-[0.3em] text-[9px] md:text-xs text-[#f6f1ed]/80 font-light text-center">
                Factory Outlet
              </p>
            </motion.div>
          </motion.div>

          {/* Taglines */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-8 md:mb-10"
          >
            <p className="uppercase font-medium mb-2 text-[9px] md:text-[11px] tracking-[0.25em] text-[#f6f1ed]/60">
              New Collection 2026
            </p>
            <p className="font-heading leading-tight text-xl md:text-3xl text-[#f6f1ed]/90">
              Premium Fashion. <em className="not-italic text-[#C9A84C]">Factory Prices.</em>
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-row gap-3 md:gap-4 w-full md:w-auto justify-center"
          >
            <Link href="/products" className="flex-1 md:flex-none h-11 md:h-12 px-6 md:px-10 bg-[#f6f1ed]/95 text-ink hover:bg-white text-[10px] md:text-xs tracking-widest uppercase rounded-none shadow-xl font-bold transition-all duration-300 inline-flex items-center justify-center">
              New Drop
            </Link>
            <Link href="/products" className="flex-1 md:flex-none h-11 md:h-12 px-6 md:px-10 border border-[#f6f1ed]/40 text-[#f6f1ed] hover:bg-white/10 hover:border-white/80 text-[10px] md:text-xs tracking-widest uppercase rounded-none backdrop-blur-sm transition-all duration-300 inline-flex items-center justify-center">
              Best Sellers
            </Link>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 z-40 flex flex-col items-center gap-2 pointer-events-none"
        >
          <div className="w-px h-10 bg-[#f6f1ed]/30 animate-pulse" />
          <span className="uppercase" style={{ fontSize: "9px", letterSpacing: "0.25em", color: "rgba(246,241,237,0.5)" }}>Scroll</span>
        </motion.div>
      </section>

      {/* ── SECTIONS ─────────────────────────────────────────── */}
      <Departments />
      <FeaturedProducts />
      <RecentlyAdded />
      <PumaFeature />
      <CuratedGrid />
      <HeroCinematicScroll />
      <VideoShowcase />
      <Reviews />
      <StoreLocation />
      <Newsletter />
    </main>
  );
}
