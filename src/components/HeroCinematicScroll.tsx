"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CardKeyframe {
  image: string;
  alt: string;
  progressStops: number[];
  desktopX: string[];
  desktopY: string[];
  desktopRotate: number[];
  desktopScale: number[];
  mobileX: string[];
  mobileY: string[];
  mobileRotate: number[];
  mobileScale: number[];
  opacityStops: number[];
  zIndex: number;
  widthClass: string;
}

// 5 Curated Editorial Cards with sequential choreographed trajectories
const EDITORIAL_CARDS: CardKeyframe[] = [
  // CARD 1: Enters from bottom-left, travels diagonally upward behind typography (Phase 0.00 -> 0.38)
  {
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=900&auto=format&fit=crop",
    alt: "Editorial Look 01 - Ochre Casual",
    progressStops: [0.0, 0.08, 0.20, 0.32, 0.42],
    desktopX: ["-38vw", "-22vw", "-12vw", "-6vw", "-20vw"],
    desktopY: ["48vh", "22vh", "2vh", "-22vh", "-55vh"],
    desktopRotate: [-9, -7, -5, -3, -1],
    desktopScale: [0.92, 0.98, 1.0, 0.98, 0.94],
    mobileX: ["-32vw", "-18vw", "-8vw", "-4vw", "-18vw"],
    mobileY: ["40vh", "18vh", "2vh", "-18vh", "-45vh"],
    mobileRotate: [-5, -4, -3, -2, -1],
    mobileScale: [0.85, 0.9, 0.95, 0.9, 0.85],
    opacityStops: [0, 1, 1, 0.9, 0],
    zIndex: 20, // Behind headline
    widthClass: "w-[190px] h-[250px] sm:w-[240px] sm:h-[320px] md:w-[320px] md:h-[430px] lg:w-[360px] lg:h-[480px]",
  },

  // CARD 2: Enters from the right side, sweeps across right/center, overlaps headline (Phase 0.18 -> 0.58)
  {
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=900&auto=format&fit=crop",
    alt: "Editorial Look 02 - Winter Coat",
    progressStops: [0.18, 0.28, 0.40, 0.50, 0.62],
    desktopX: ["42vw", "26vw", "10vw", "-2vw", "-26vw"],
    desktopY: ["42vh", "18vh", "-2vh", "-24vh", "-52vh"],
    desktopRotate: [8, 6, 4, 1, -2],
    desktopScale: [0.94, 1.0, 1.02, 0.98, 0.92],
    mobileX: ["34vw", "20vw", "6vw", "-4vw", "-20vw"],
    mobileY: ["36vh", "16vh", "-2vh", "-20vh", "-44vh"],
    mobileRotate: [5, 4, 2, 0, -2],
    mobileScale: [0.85, 0.92, 0.95, 0.9, 0.85],
    opacityStops: [0, 1, 1, 0.95, 0],
    zIndex: 35, // In front of headline (layered depth)
    widthClass: "w-[180px] h-[240px] sm:w-[230px] sm:h-[310px] md:w-[300px] md:h-[410px] lg:w-[340px] lg:h-[460px]",
  },

  // CARD 3: Enters from lower-center-left, floats across middle (Phase 0.38 -> 0.74)
  {
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=900&auto=format&fit=crop",
    alt: "Editorial Look 03 - Spring Pastels",
    progressStops: [0.38, 0.48, 0.58, 0.68, 0.78],
    desktopX: ["-36vw", "-18vw", "-2vw", "14vw", "32vw"],
    desktopY: ["46vh", "20vh", "-6vh", "-28vh", "-56vh"],
    desktopRotate: [-7, -4, -1, 3, 6],
    desktopScale: [0.92, 0.98, 1.0, 0.98, 0.92],
    mobileX: ["-30vw", "-14vw", "-2vw", "10vw", "24vw"],
    mobileY: ["38vh", "16vh", "-4vh", "-22vh", "-46vh"],
    mobileRotate: [-4, -2, 0, 2, 4],
    mobileScale: [0.85, 0.9, 0.95, 0.9, 0.85],
    opacityStops: [0, 1, 1, 0.95, 0],
    zIndex: 22, // Behind headline
    widthClass: "w-[190px] h-[250px] sm:w-[240px] sm:h-[320px] md:w-[310px] md:h-[420px] lg:w-[350px] lg:h-[470px]",
  },

  // CARD 4: Enters from bottom-right, glides across right top overlapping typography (Phase 0.54 -> 0.88)
  {
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=900&auto=format&fit=crop",
    alt: "Editorial Look 04 - Modern Tailored",
    progressStops: [0.54, 0.64, 0.74, 0.82, 0.92],
    desktopX: ["38vw", "22vw", "6vw", "-8vw", "-28vw"],
    desktopY: ["48vh", "22vh", "0vh", "-22vh", "-52vh"],
    desktopRotate: [7, 5, 2, -1, -4],
    desktopScale: [0.94, 1.0, 1.02, 0.98, 0.92],
    mobileX: ["30vw", "16vw", "4vw", "-6vw", "-22vw"],
    mobileY: ["40vh", "18vh", "0vh", "-18vh", "-42vh"],
    mobileRotate: [4, 3, 1, 0, -2],
    mobileScale: [0.85, 0.92, 0.95, 0.9, 0.85],
    opacityStops: [0, 1, 1, 0.95, 0],
    zIndex: 36, // In front of headline
    widthClass: "w-[180px] h-[240px] sm:w-[230px] sm:h-[310px] md:w-[300px] md:h-[400px] lg:w-[340px] lg:h-[450px]",
  },

  // CARD 5: Final sweep from bottom-left (Phase 0.70 -> 1.00)
  {
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=900&auto=format&fit=crop",
    alt: "Editorial Look 05 - Footwear Statement",
    progressStops: [0.70, 0.78, 0.88, 0.95, 1.0],
    desktopX: ["-32vw", "-14vw", "0vw", "16vw", "34vw"],
    desktopY: ["45vh", "18vh", "-8vh", "-28vh", "-55vh"],
    desktopRotate: [-6, -3, 1, 4, 7],
    desktopScale: [0.92, 0.98, 1.0, 0.96, 0.90],
    mobileX: ["-26vw", "-10vw", "0vw", "12vw", "26vw"],
    mobileY: ["36vh", "14vh", "-6vh", "-22vh", "-45vh"],
    mobileRotate: [-3, -1, 1, 3, 5],
    mobileScale: [0.85, 0.9, 0.95, 0.9, 0.85],
    opacityStops: [0, 1, 1, 0.85, 0],
    zIndex: 24, // Behind headline
    widthClass: "w-[190px] h-[250px] sm:w-[240px] sm:h-[320px] md:w-[320px] md:h-[420px] lg:w-[360px] lg:h-[470px]",
  },
];

function FloatingEditorialCard({
  scrollYProgress,
  config,
  isMobile,
}: {
  scrollYProgress: MotionValue<number>;
  config: CardKeyframe;
  isMobile: boolean;
}) {
  const {
    progressStops,
    desktopX,
    desktopY,
    desktopRotate,
    desktopScale,
    mobileX,
    mobileY,
    mobileRotate,
    mobileScale,
    opacityStops,
    zIndex,
    widthClass,
  } = config;

  const x = useTransform(scrollYProgress, progressStops, isMobile ? mobileX : desktopX);
  const y = useTransform(scrollYProgress, progressStops, isMobile ? mobileY : desktopY);
  const rotate = useTransform(scrollYProgress, progressStops, isMobile ? mobileRotate : desktopRotate);
  const scale = useTransform(scrollYProgress, progressStops, isMobile ? mobileScale : desktopScale);
  const opacity = useTransform(scrollYProgress, progressStops, opacityStops);

  return (
    <motion.div
      style={{
        x,
        y,
        rotate,
        scale,
        opacity,
        zIndex,
      }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform pointer-events-none"
    >
      {/* Physical editorial photograph frame: crisp white border, subtle shadow */}
      <div className={`relative ${widthClass} bg-white p-2.5 sm:p-3 md:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.1),0_8px_20px_rgba(0,0,0,0.06)] border border-neutral-100/80 rounded-[1px] transition-shadow duration-300`}>
        <div className="relative w-full h-full overflow-hidden bg-neutral-100">
          <Image
            src={config.image}
            alt={config.alt}
            fill
            className="object-cover select-none"
            sizes="(max-width: 640px) 190px, (max-width: 768px) 240px, (max-width: 1024px) 320px, 360px"
            priority={false}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function HeroCinematicScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleMotionChange);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      mediaQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  // Hook scroll progress to the 300vh scroll container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Typography Subtle Transformations
  const eyebrowY = useTransform(scrollYProgress, [0, 0.35, 0.6], ["0px", "-12px", "-35px"]);
  const eyebrowOpacity = useTransform(scrollYProgress, [0, 0.35, 0.6], [1, 0.8, 0]);

  const headlineY = useTransform(scrollYProgress, [0, 0.5, 1], ["0vh", "-2vh", "-7vh"]);
  const headlineScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 0.97]);

  const ctaY = useTransform(scrollYProgress, [0, 0.5, 0.8, 1], ["0px", "-8px", "-24px", "-40px"]);
  const ctaOpacity = useTransform(scrollYProgress, [0, 0.65, 0.88, 1], [1, 1, 0.7, 0]);

  // Scroll Down Indicator - fades rapidly on initial scroll
  const chevronOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
  const chevronY = useTransform(scrollYProgress, [0, 0.12], ["0px", "15px"]);

  // Fallback layout for reduced motion preferences
  if (prefersReducedMotion) {
    return (
      <section className="relative py-24 md:py-36 bg-[#fbf9f6] w-full overflow-hidden flex flex-col items-center justify-center border-y border-neutral-200/40">
        <div className="relative z-30 flex flex-col items-center justify-center w-full px-6 text-center max-w-4xl mx-auto">
          <p className="text-xs md:text-sm font-semibold tracking-[0.25em] uppercase text-neutral-500 mb-4 md:mb-6">
            Discover the best deal
          </p>
          <h2 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal text-[#161616] leading-[1.05] tracking-tight uppercase">
            FLAT 15% FOR ALL<br />COLLECTIONS
          </h2>
          <div className="mt-8 md:mt-12">
            <Link href="/products?minDiscount=15">
              <Button className="bg-white hover:bg-neutral-900 text-neutral-900 hover:text-white border border-neutral-300 rounded-[2px] px-8 py-6 text-xs md:text-sm font-medium tracking-[0.2em] uppercase shadow-sm transition-all duration-300 cursor-pointer">
                Check Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    // Dedicated 300vh Scroll Timeline Wrapper
    <section ref={containerRef} className="relative h-[300vh] w-full bg-[#fbf9f6]">
      {/* Pinned 100vh Sticky Viewport with complete overflow clipping */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center select-none">
        
        {/* Subtle Warm Editorial Texture / Base Layer */}
        <div className="absolute inset-0 bg-[#fbf9f6] z-0 pointer-events-none" />

        {/* ── FLOATING MEDIA CARDS (Choreographed sequentially along scroll timeline) ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {EDITORIAL_CARDS.map((card, idx) => (
            <FloatingEditorialCard
              key={idx}
              scrollYProgress={scrollYProgress}
              config={card}
              isMobile={isMobile}
            />
          ))}
        </div>

        {/* ── MAIN TYPOGRAPHY LAYER (Centered anchor, layered at z-30) ── */}
        <div className="relative z-30 flex flex-col items-center justify-center w-full px-4 sm:px-6 text-center max-w-5xl mx-auto pointer-events-none">
          {/* Eyebrow text */}
          <motion.p
            style={{ y: eyebrowY, opacity: eyebrowOpacity }}
            className="text-[11px] sm:text-xs md:text-sm font-semibold tracking-[0.28em] uppercase text-neutral-500 mb-4 sm:mb-6"
          >
            Discover the best deal
          </motion.p>

          {/* Large Editorial Headline */}
          <motion.h2
            style={{ y: headlineY, scale: headlineScale }}
            className="font-heading text-[#141414] leading-[1.04] tracking-[-0.02em] uppercase text-center"
          >
            <span className="block text-[34px] sm:text-[54px] md:text-[76px] lg:text-[96px] xl:text-[108px] font-normal">
              FLAT 15% FOR ALL
            </span>
            <span className="block text-[34px] sm:text-[54px] md:text-[76px] lg:text-[96px] xl:text-[108px] font-normal mt-1 sm:mt-2">
              COLLECTIONS
            </span>
          </motion.h2>

          {/* White Rectangular Editorial CTA Button */}
          <motion.div
            style={{ y: ctaY, opacity: ctaOpacity }}
            className="mt-8 sm:mt-10 md:mt-14 pointer-events-auto"
          >
            <Link href="/products?minDiscount=15">
              <Button
                variant="outline"
                className="bg-white hover:bg-neutral-900 text-neutral-900 hover:text-white border border-neutral-300/90 rounded-[2px] px-8 sm:px-10 py-6 sm:py-7 text-xs sm:text-sm font-medium tracking-[0.22em] uppercase shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              >
                Check Now
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* ── SCROLL DOWN INDICATOR (Bottom Center, fades out on scroll) ── */}
        <motion.div
          style={{ opacity: chevronOpacity, y: chevronY }}
          className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-1.5 pointer-events-none text-neutral-400"
        >
          <span className="text-[9px] font-mono tracking-[0.3em] uppercase text-neutral-400/80">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-4 h-4 text-neutral-500" />
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
