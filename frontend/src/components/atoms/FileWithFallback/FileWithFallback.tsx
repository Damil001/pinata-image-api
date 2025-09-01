"use client";
import React, { useState, useEffect } from "react";

interface FileWithFallbackProps {
  hash: string;
  fileName: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
  fallbackDelay?: number;
}

const FileWithFallback: React.FC<FileWithFallbackProps> = ({
  hash,
  fileName,
  alt,
  className,
  width,
  height,
  style,
  onLoad,
  onError,
  fallbackDelay = 5000,
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

  // Determine if file is PDF based on filename or metadata
  const isPDF = fileName.toLowerCase().endsWith(".pdf");

  useEffect(() => {
    if (!hash) return;

    const loadFile = async (gatewayUrl: string) => {
      setIsLoading(true);
      setHasError(false);

      try {
        if (isPDF) {
          // For PDFs, just check if the URL is accessible
          const response = await fetch(gatewayUrl, { method: "HEAD" });
          if (response.ok) {
            setCurrentSrc(gatewayUrl);
            setIsLoading(false);
            onLoad?.();
          } else {
            throw new Error("PDF not accessible");
          }
        } else {
          // For images, use the existing image loading logic
          const img = new Image();

          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Image load timeout")), 10000);
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
        }
      } catch (error) {
        console.warn(`Failed to load file from ${gatewayUrl}:`, error);

        setTimeout(() => {
          if (gatewayIndex < gateways.length - 1) {
            setGatewayIndex((prev) => prev + 1);
          } else {
            setHasError(true);
            setIsLoading(false);
            onError?.();
          }
        }, fallbackDelay);
      }
    };

    const currentGateway = gateways[gatewayIndex];
    const fileUrl = `${currentGateway}/${hash}`;
    loadFile(fileUrl);
  }, [hash, gatewayIndex, fallbackDelay, onLoad, onError, isPDF]);

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
          <div className="text-gray-400 text-4xl mb-2">
            {isPDF ? "📄" : "🖼️"}
          </div>
          <div className="text-gray-500 text-sm text-center">
            Failed to load {isPDF ? "PDF" : "image"}
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

  if (isPDF) {
    return (
      <div className={className} style={{ width, height, ...style }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#f5f5f5",
            border: "2px solid #ddd",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            cursor: "pointer",
          }}
          onClick={() => window.open(currentSrc, "_blank")}
        >
          <div style={{ fontSize: "48px", color: "#666" }}>📄</div>
          <div
            style={{
              fontSize: "14px",
              color: "#666",
              textAlign: "center",
              padding: "0 8px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
            }}
          >
            {fileName}
          </div>
          <div style={{ fontSize: "12px", color: "#999" }}>
            Click to view PDF
          </div>
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

export default FileWithFallback;
