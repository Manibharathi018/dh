"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import pumaRunner from "@/assets/puma-runner.png";

export default function PumaHeroSection() {
  return (
    <section className="my-16 md:my-28 w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8">
      {/* ── Main Hero Container (Soft Rounded, Warm Off-White, Thin Border) ── */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-[#fbf9f6] rounded-[24px] sm:rounded-[30px] md:rounded-[34px] border border-[#e7e5e1] p-7 sm:p-10 md:p-14 lg:p-18 xl:p-20 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] overflow-hidden"
      >
        {/* Subtle Watermark Decorative Background Typography */}
        <span 
          aria-hidden="true"
          className="absolute -bottom-8 -left-8 text-[120px] sm:text-[160px] md:text-[200px] font-black tracking-tighter text-[#111111]/[0.02] select-none pointer-events-none uppercase font-sans leading-none"
        >
          PERFORMANCE
        </span>

        {/* Top-Right Editorial Metadata Tag */}
        <div className="hidden sm:flex absolute top-8 right-10 items-center gap-2 text-[10px] font-mono tracking-[0.25em] text-[#888888] uppercase select-none pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#004B93]/60"></span>
          <span>EST. 1998 · SOUTH INDIA DIRECT LINE</span>
        </div>

        {/* ── Two-Column Layout (55% Content / 45% Visual Panel) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-16 items-center relative z-10">
          
          {/* ── LEFT CONTENT COLUMN ── */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6 sm:space-y-7">
            
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2.5">
              <span className="w-5 h-[1.5px] bg-[#004B93]"></span>
              <p className="text-[11px] sm:text-[12px] font-bold tracking-[0.28em] text-[#004B93] uppercase">
                PERFORMANCE / FACTORY DIRECT
              </p>
            </div>

            {/* Main Heading */}
            <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-[66px] xl:text-[72px] text-[#111111] leading-[0.98] tracking-[-0.025em] max-w-[650px] font-normal">
              Athletic excellence,<br />
              <span className="italic text-[#C83E28] font-normal">
                factory-direct.
              </span>
            </h2>

            {/* Supporting Paragraph */}
            <p className="text-[#555555] text-base sm:text-[17px] md:text-[18px] leading-[1.62] max-w-[580px] font-sans font-normal pt-1">
              Curated performance and lifestyle silhouettes, sourced closer to the factory and designed for everyday movement.
            </p>

            {/* Promotional Offer Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-[580px] pt-1">
              {/* Card 1 */}
              <div className="bg-white border border-[#e7e5e1] rounded-[14px] sm:rounded-[16px] p-3.5 sm:p-4 flex items-center gap-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] hover:border-[#111111]/20 transition-all duration-300 cursor-default">
                <div className="w-11 h-11 rounded-full bg-[#111111] text-white flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 font-mono tracking-tight shadow-xs">
                  40%
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#111111] leading-snug">Flat 40% Off</h4>
                  <p className="text-[11px] text-[#666666] leading-snug mt-0.5">Performance & Running</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white border border-[#e7e5e1] rounded-[14px] sm:rounded-[16px] p-3.5 sm:p-4 flex items-center gap-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] hover:border-[#111111]/20 transition-all duration-300 cursor-default">
                <div className="w-11 h-11 rounded-full bg-[#111111] text-white flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 font-mono tracking-tight shadow-xs">
                  2+1
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#111111] leading-snug">Buy 2 Get 1 Free</h4>
                  <p className="text-[11px] text-[#666666] leading-snug mt-0.5">Lifestyle & Heritage</p>
                </div>
              </div>
            </div>

            {/* CTA Area */}
            <div className="pt-3 flex flex-wrap items-center gap-5 sm:gap-7">
              <Link 
                href="/footwear?brand=Puma" 
                className="h-[52px] sm:h-[56px] px-8 sm:px-10 rounded-[12px] bg-[#111111] hover:bg-[#262626] text-white uppercase text-xs sm:text-[13px] font-semibold tracking-[0.2em] inline-flex items-center justify-center gap-3 transition-all duration-300 group shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)] cursor-pointer"
              >
                <span>SHOP NOW</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
              </Link>

              <Link 
                href="/footwear?brand=Puma" 
                className="text-xs sm:text-[13px] font-bold tracking-[0.22em] uppercase text-[#666666] hover:text-[#111111] transition-colors inline-flex items-center gap-1.5 group py-2"
              >
                <span>240+ STYLES</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>

          </div>

          {/* ── RIGHT VISUAL PANEL (Editorial Photographic Frame) ── */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <Link
              href="/footwear?brand=Puma"
              className="relative w-full max-w-[380px] sm:max-w-[420px] lg:max-w-[450px] bg-white p-2.5 sm:p-3 rounded-[20px] sm:rounded-[24px] border border-[#e7e5e1] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] overflow-hidden group block cursor-pointer transition-shadow duration-500 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.12)]"
            >
              {/* Inner Image Container */}
              <div className="relative aspect-[4/5] rounded-[14px] sm:rounded-[18px] overflow-hidden bg-neutral-100">
                <Image
                  src={pumaRunner}
                  alt="PUMA athlete in motion wearing athletic running gear"
                  fill
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.025]"
                  placeholder="blur"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 420px, 450px"
                />

                {/* Subtle Floating Label Upper-Left */}
                <div className="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-[7px] text-[10px] font-bold tracking-[0.22em] uppercase text-[#111111] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-neutral-200/70 select-none">
                  PUMA AUTHENTIC
                </div>

                {/* Bottom Gradient Overlay + White Link */}
                <div className="absolute inset-x-0 bottom-0 pt-16 pb-5 px-5 bg-gradient-to-t from-black/75 via-black/30 to-transparent flex items-center justify-between text-white">
                  <span className="text-[11px] sm:text-xs font-semibold tracking-[0.22em] uppercase flex items-center gap-2">
                    VIEW COLLECTION
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </span>
                </div>
              </div>
            </Link>
          </div>

        </div>
      </motion.div>
    </section>
  );
}
