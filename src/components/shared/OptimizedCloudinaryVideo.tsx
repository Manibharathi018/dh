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
  const [useFallbackSrc, setUseFallbackSrc] = useState(false);

  // Optimized Cloudinary URLs
  const videoUrl = getCloudinaryVideoUrl(src, { width });
  const computedPoster = posterSrc || getCloudinaryPosterUrl(src, { width });
  const activeVideoUrl = useFallbackSrc ? src : videoUrl;

  // IntersectionObserver 1: Near Viewport (preload video element 500px before section appears)
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
      { rootMargin: "500px 0px" } // Pre-mount video element 500px before reaching section
    );

    nearObserver.observe(el);
    return () => nearObserver.disconnect();
  }, []);

  // IntersectionObserver 2: In Viewport (trigger instant autoplay as soon as section enters screen)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") return;

    const viewportObserver = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0 } // Instantly trigger as soon as section enters viewport
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
    if (!video || (!isNearViewport && !isSectionVisible)) return;

    const shouldPlay = isActive && (isInViewport || isSectionVisible) && !hasError;

    if (shouldPlay) {
      video.muted = isMuted;
      if (video.ended) {
        video.currentTime = 0;
      }
      if (video.paused) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            if (err.name !== "AbortError") {
              console.log("[OptimizedCloudinaryVideo] Play pending/fallback:", err);
            }
          });
        }
      }
    } else {
      if (!video.paused) {
        video.pause();
      }
    }
  }, [isActive, isInViewport, isSectionVisible, isNearViewport, hasError, activeVideoUrl]);

  const handleLoadedData = () => {
    setIsLoaded(true);
    setHasError(false);
    const video = videoRef.current;
    if (video) {
      video.muted = isMuted;
      const shouldPlay = isActive && (isInViewport || isSectionVisible) && !hasError;
      if (shouldPlay && video.paused) {
        video.play().catch((err) => {
          if (err.name !== "AbortError") {
            console.log("[OptimizedCloudinaryVideo] Play handleLoadedData fallback:", err);
          }
        });
      }
    }
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = videoRef.current;
    if (!video) return;

    // Ignore aborted requests (code 1) or empty src during scroll/unmount cleanup
    if (!video.src || !video.error || video.error.code === 1) {
      return;
    }

    console.warn("[OptimizedCloudinaryVideo] Media error code:", video.error.code, video.error.message);

    // If transformed Cloudinary URL failed, try fallback to original raw URL first!
    if (!useFallbackSrc && src && src !== videoUrl) {
      console.log("[OptimizedCloudinaryVideo] Retrying with raw video source fallback...");
      setUseFallbackSrc(true);
      return;
    }

    setHasError(true);
  };

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

    // Unmuting audio should keep the video playing smoothly with sound
    if (video.paused && isActive && isSectionVisible) {
      video.play().catch(() => {});
    }
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasError(false);
    setIsLoaded(false);
    setUseFallbackSrc(true); // Retry with raw fallback URL
    const video = videoRef.current;
    if (video) {
      video.load();
      video.play().catch(() => {});
    }
  };

  // Determine optimal preload setting (auto for active/near videos to eliminate buffering delay)
  const preloadSetting = isActive || isNearViewport || isSectionVisible ? "auto" : "metadata";

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

      {/* 2. Video Element (Rendered into DOM when near or section visible) */}
      {(isNearViewport || isSectionVisible) && !hasError && (
        <video
          ref={videoRef}
          src={activeVideoUrl}
          poster={computedPoster}
          autoPlay={isActive}
          muted={isMuted}
          playsInline
          preload={preloadSetting}
          onEnded={onEnded}
          onCanPlay={handleLoadedData}
          onLoadedData={handleLoadedData}
          onLoadedMetadata={handleLoadedData}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={handleVideoError}
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


