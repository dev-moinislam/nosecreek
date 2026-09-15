"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";

export interface OptimizedImageProps extends Omit<ImageProps, "src" | "alt"> {
  src: string | null | undefined;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  style?: React.CSSProperties;
}

// Known domains configured in next.config.ts remotePatterns
const CONFIGURED_REMOTE_HOSTS = [
  "vrhrqljixrsckdkstier.supabase.co",
  "assets.thereviewsplace.com",
  "images.unsplash.com",
  "lh3.googleusercontent.com",
  "nosecreekphysiotherapy.com",
  "www.nosecreekphysiotherapy.com"
];

function shouldBypassOptimization(src: string): boolean {
  if (!src) return true;
  // SVGs, data URIs, and blob URIs should not be processed by Next.js optimizer
  if (src.endsWith(".svg") || src.includes(".svg?") || src.startsWith("data:") || src.startsWith("blob:")) {
    return true;
  }

  // Check if it's an external URL
  if (src.startsWith("http://") || src.startsWith("https://")) {
    try {
      const url = new URL(src);
      const hostname = url.hostname.toLowerCase();
      // If it ends with supabase.co or is in our configured list, it can be optimized
      const isConfigured =
        hostname.endsWith(".supabase.co") ||
        CONFIGURED_REMOTE_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));

      return !isConfigured;
    } catch {
      return true;
    }
  }

  // Local images (/images/..., /uploads/...) can be safely optimized
  return false;
}

export default function OptimizedImage({
  src,
  alt,
  fallbackSrc = "/images/clinic/reception-desktop.jpg",
  width,
  height,
  fill,
  sizes,
  priority = false,
  quality = 80,
  className,
  style,
  unoptimized: explicitUnoptimized,
  onError,
  ...rest
}: OptimizedImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(src || fallbackSrc);
  const [hasError, setHasError] = useState<boolean>(false);

  // Synchronize when src prop changes
  React.useEffect(() => {
    if (src) {
      setCurrentSrc(src);
      setHasError(false);
    } else {
      setCurrentSrc(fallbackSrc);
    }
  }, [src, fallbackSrc]);

  if (!currentSrc) {
    return null;
  }

  const isBypassed = explicitUnoptimized ?? shouldBypassOptimization(currentSrc);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError && fallbackSrc && currentSrc !== fallbackSrc) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    }
    if (onError) {
      onError(e);
    }
  };

  // When fill is used, parent must have position relative/absolute
  if (fill) {
    return (
      <Image
        src={currentSrc}
        alt={alt || "Nose Creek Physiotherapy"}
        fill
        sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
        priority={priority}
        quality={quality}
        unoptimized={isBypassed}
        onError={handleError}
        className={className}
        style={style}
        {...rest}
      />
    );
  }

  // When width and height are provided
  if (width !== undefined && height !== undefined) {
    return (
      <Image
        src={currentSrc}
        alt={alt || "Nose Creek Physiotherapy"}
        width={Number(width)}
        height={Number(height)}
        sizes={sizes}
        priority={priority}
        quality={quality}
        unoptimized={isBypassed}
        onError={handleError}
        className={className}
        style={style}
        {...rest}
      />
    );
  }

  // Default fallback if neither fill nor dimensions are provided:
  // Use responsive default dimension with styling preserved
  return (
    <Image
      src={currentSrc}
      alt={alt || "Nose Creek Physiotherapy"}
      width={Number(width || 800)}
      height={Number(height || 600)}
      sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"}
      priority={priority}
      quality={quality}
      unoptimized={isBypassed}
      onError={handleError}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        ...style
      }}
      {...rest}
    />
  );
}
