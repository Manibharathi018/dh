"use client";

import React, { useState, useEffect, useRef, memo } from "react";
import { Play, Pause, Volume2, VolumeX, AlertCircle, RefreshCw } from "lucide-react";
import { getCloudinaryVideoUrl, getCloudinaryPosterUrl } from "@/lib/cloudinary";

export interface OptimizedCloudinaryVideoProps {
  src: string;
  posterSrc?: string;
  isActive: boolean;
  onEnded?: () => void;
  className?: string;
  containerClassName?: string;
  isSectionVisible?: boolean;
  width?: number; // Target width e.g. 480 or 720
  aspectRatioClass?: string; // e.g. "aspect-[9/16]"
}

export const OptimizedCloudinaryVideo = memo(function OptimizedCloudinaryVideo({
  src,
  posterSrc,
  isActive,
  onEnded,
  className = "w-full h-full object-cover",
  containerClassName = "",
  isSectionVisible = true,
  width = 480,
  aspectRatioClass = "aspect-[9/16]",
}: OptimizedCloudinaryVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // States
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Optimized Cloudinary URLs
  const videoUrl = getCloudinaryVideoUrl(src, { width });
  const computedPoster = posterSrc || getCloudinaryPosterUrl(src, { width });

  // IntersectionObserver 1: Near Viewport (preload metadata / prepare video element)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsNearViewport(true);
      setIsInViewport(true);
      return;
    }

    const nearObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
        }
      },
      { rootMargin: "200px 0px" } // Prepare video element within 200px of viewport
    );

    nearObserver.observe(el);
    return () => nearObserver.disconnect();
  }, []);

  // IntersectionObserver 2: In Viewport (trigger play/pause)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") return;

    const viewportObserver = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.25 }
    );

    viewportObserver.observe(el);
    return () => viewportObserver.disconnect();
  }, []);

  // Native HTML5 Video cleanup to prevent browser media decoder memory leaks
  useEffect(() => {
    return () => {
      const video = videoRef.current;
      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();
      }
    };
  }, []);

  // Handle Video Play / Pause Lifecycle
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isNearViewport) return;

    const shouldPlay = isActive && isInViewport && isSectionVisible && !hasError;

    if (shouldPlay) {
      video.muted = isMuted;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // Auto-play was prevented or interrupted safely
          if (err.name !== "AbortError") {
            console.log("[OptimizedCloudinaryVideo] Play pending/fallback:", err);
          }
        });
      }
    } else {
      if (!video.paused) {
        video.pause();
      }
    }
  }, [isActive, isInViewport, isSectionVisible, isNearViewport, isMuted, hasError]);

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.muted = isMuted;
      video.play().catch((err) => console.log("Play failed:", err));
    } else {
      video.pause();
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    video.muted = nextMuted;
    if (!nextMuted && video.paused && isActive) {
      video.play().catch(() => {});
    }
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasError(false);
    setIsLoaded(false);
    const video = videoRef.current;
    if (video) {
      video.load();
      video.play().catch(() => {});
    }
  };

  // Determine optimal preload setting
  const preloadSetting = isActive && isInViewport ? "auto" : isNearViewport ? "metadata" : "none";

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full group select-none overflow-hidden ${aspectRatioClass} ${containerClassName}`}
    >
      {/* 1. Static Lightweight Poster Image (Visible first for 0 CLS and instant response) */}
      {computedPoster && (
        <img
          src={computedPoster}
          alt="Video thumbnail poster"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 z-0 ${
            isLoaded && isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          loading="lazy"
        />
      )}

      {/* 2. Video Element (Only rendered into DOM when near viewport) */}
      {isNearViewport && !hasError && (
        <video
          ref={videoRef}
          src={videoUrl}
          poster={computedPoster}
          muted={isMuted}
          playsInline
          preload={preloadSetting}
          onEnded={onEnded}
          onCanPlay={() => setIsLoaded(true)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={() => setHasError(true)}
          className={`relative z-10 ${className} transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {/* 3. Error Fallback UI */}
      {hasError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75 text-white p-4 text-center backdrop-blur-xs">
          <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
          <p className="text-xs text-white/90 mb-3 font-medium">Video playback error</p>
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 rounded text-white border border-white/30 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* 4. Active Video Controls (Pause/Play Center & Mute/Unmute Bottom-Right) */}
      {isActive && isNearViewport && !hasError && (
        <>
          {/* Pause / Play Center Toggle Button */}
          <button
            type="button"
            onClick={handleTogglePlay}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-black/55 hover:bg-black/80 text-white backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-95 z-30 shadow-lg border border-white/25 cursor-pointer"
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-white text-white" />
            ) : (
              <Play className="w-5 h-5 fill-white text-white translate-x-[1px]" />
            )}
          </button>

          {/* Sound Mute / Unmute Bottom-Right Toggle Button */}
          <button
            type="button"
            onClick={handleToggleMute}
            className="absolute bottom-3 right-3 flex items-center justify-center w-10 h-10 rounded-full bg-black/55 hover:bg-black/80 text-white backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-95 z-30 shadow-lg border border-white/25 cursor-pointer"
            aria-label={isMuted ? "Unmute sound" : "Mute sound"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-white/80" />
            ) : (
              <Volume2 className="w-4 h-4 text-amber-400" />
            )}
          </button>
        </>
      )}
    </div>
  );
});

