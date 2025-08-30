"use client";
import React, { useState, useEffect } from "react";
import { getIpfsUrl } from "@/utils/ipfsConfig";

interface ImageWithFallbackProps {
  hash: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
  fallbackDelay?: number; // Delay before trying fallback gateways
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  hash,
  alt,
  className,
  width,
  height,
  style,
  onLoad,
  onError,
  fallbackDelay = 5000, // 5 seconds default
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [gatewayIndex, setGatewayIndex] = useState(0);

  const gateways = [
    "https://copper-delicate-louse-351.mypinata.cloud/ipfs",
    "https://cloudflare-ipfs.com/ipfs",
    "https://gateway.pinata.cloud/ipfs",
    "https://ipfs.io/ipfs",
    "https://dweb.link/ipfs",
  ];

  useEffect(() => {
    if (!hash) return;

    const loadImage = async (gatewayUrl: string) => {
      setIsLoading(true);
      setHasError(false);

      try {
        const img = new Image();

        // Set a timeout for the image load
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Image load timeout")), 10000); // 10 second timeout
        });

        const loadPromise = new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = gatewayUrl;
        });

        await Promise.race([loadPromise, timeoutPromise]);

        setCurrentSrc(gatewayUrl);
        setIsLoading(false);
        onLoad?.();
      } catch (error) {
        console.warn(`Failed to load image from ${gatewayUrl}:`, error);

        // Try next gateway after delay
        setTimeout(() => {
          if (gatewayIndex < gateways.length - 1) {
            setGatewayIndex((prev) => prev + 1);
          } else {
            // All gateways failed
            setHasError(true);
            setIsLoading(false);
            onError?.();
          }
        }, fallbackDelay);
      }
    };

    const currentGateway = gateways[gatewayIndex];
    const imageUrl = `${currentGateway}/${hash}`;
    loadImage(imageUrl);
  }, [hash, gatewayIndex, fallbackDelay, onLoad, onError]);

  // Reset when hash changes
  useEffect(() => {
    setGatewayIndex(0);
    setCurrentSrc("");
    setIsLoading(true);
    setHasError(false);
  }, [hash]);

  if (isLoading) {
    return (
      <div
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{ width, height, ...style }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div
        className={`bg-gray-100 border border-gray-300 ${className}`}
        style={{ width, height, ...style }}
      >
        <div className="flex flex-col items-center justify-center h-full p-4">
          <div className="text-gray-400 text-4xl mb-2">🖼️</div>
          <div className="text-gray-500 text-sm text-center">
            Failed to load image
          </div>
          <button
            onClick={() => {
              setGatewayIndex(0);
              setHasError(false);
              setIsLoading(true);
            }}
            className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      style={style}
      onLoad={() => {
        setIsLoading(false);
        onLoad?.();
      }}
      onError={() => {
        setHasError(true);
        setIsLoading(false);
        onError?.();
      }}
    />
  );
};

export default ImageWithFallback;
