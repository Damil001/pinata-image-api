"use client";
import React, { useState, useEffect } from "react";
import PDFThumbnail from "../PDFThumbnail";
import { isPDFFile, isValidIPFSHash } from "@/utils/fileUtils";

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
  // For PDFs, this will contain the thumbnail information from backend
  thumbnailHash?: string;
  thumbnailGatewayUrl?: string;
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
  thumbnailHash,
  thumbnailGatewayUrl,
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
    "https://cf-ipfs.com/ipfs",
    "https://ipfs.fleek.co/ipfs",
    "https://nftstorage.link/ipfs",
  ];

  useEffect(() => {
    if (!hash) return;

    // Determine if file is PDF based on filename
    const isPDF = isPDFFile(fileName);
    console.log(
      `FileWithFallback useEffect: hash="${hash}", fileName="${fileName}", isPDF=${isPDF}, thumbnailHash="${thumbnailHash}"`
    );

    // For PDFs with backend-generated thumbnails, use the thumbnail directly
    if (isPDF && thumbnailHash && thumbnailGatewayUrl) {
      console.log(`Using backend-generated thumbnail: ${thumbnailGatewayUrl}`);
      setCurrentSrc(thumbnailGatewayUrl);
      setIsLoading(false);
      onLoad?.();
      return;
    }

    // Validate IPFS hash
    if (!isValidIPFSHash(hash)) {
      console.error(`Invalid IPFS hash: ${hash}`);
      setHasError(true);
      setIsLoading(false);
      onError?.();
      return;
    }

    const loadFile = async (gatewayUrl: string) => {
      setIsLoading(true);
      setHasError(false);

      try {
        if (isPDF) {
          // For PDFs, just check if the URL is accessible
          console.log(`Checking PDF accessibility: ${gatewayUrl}`);
          const response = await fetch(gatewayUrl, { method: "HEAD" });
          if (response.ok) {
            console.log(`PDF is accessible: ${gatewayUrl}`);
            setCurrentSrc(gatewayUrl);
            setIsLoading(false);
            onLoad?.();
          } else {
            throw new Error(`PDF not accessible: ${response.status}`);
          }
        } else {
          // For images, use the existing image loading logic
          console.log(`Loading image: ${gatewayUrl}`);
          const img = new Image();

          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Image load timeout")), 15000);
          });

          const loadPromise = new Promise((resolve, reject) => {
            img.onload = () => {
              console.log(`Successfully loaded image from ${gatewayUrl}`);
              resolve(true);
            };
            img.onerror = (error) => {
              console.warn(`Image load error from ${gatewayUrl}:`, error);
              reject(new Error("Image load failed"));
            };
            img.src = gatewayUrl;
          });

          await Promise.race([loadPromise, timeoutPromise]);

          setCurrentSrc(gatewayUrl);
          setIsLoading(false);
          onLoad?.();
        }
      } catch (error) {
        console.warn(`Failed to load file from ${gatewayUrl}:`, error);
        console.log(
          `Trying next gateway... (${gatewayIndex + 1}/${gateways.length})`
        );

        // Try next gateway immediately instead of waiting
        if (gatewayIndex < gateways.length - 1) {
          setGatewayIndex((prev) => prev + 1);
        } else {
          console.error(`All gateways failed for hash: ${hash}`);
          setHasError(true);
          setIsLoading(false);
          onError?.();
        }
      }
    };

    const currentGateway = gateways[gatewayIndex];
    const fileUrl = `${currentGateway}/${hash}`;
    loadFile(fileUrl);
  }, [
    hash,
    gatewayIndex,
    fileName,
    thumbnailHash,
    thumbnailGatewayUrl,
    onLoad,
    onError,
  ]);

  // Reset when hash changes
  useEffect(() => {
    setGatewayIndex(0);
    setCurrentSrc("");
    setIsLoading(true);
    setHasError(false);
  }, [hash]);

  // Calculate isPDF for rendering
  const isPDF = isPDFFile(fileName);

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
          <div className="text-gray-400 text-xs text-center mt-1 break-all">
            Hash: {hash.substring(0, 20)}...
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
    // If we have a backend-generated thumbnail, display it as an image
    if (
      thumbnailHash &&
      thumbnailGatewayUrl &&
      currentSrc === thumbnailGatewayUrl
    ) {
      return (
        <div className={className} style={{ width, height, ...style }}>
          <img
            src={currentSrc}
            alt={alt}
            style={{ objectFit: "contain", width: "100%", height: "100%" }}
            onLoad={onLoad}
            onError={onError}
          />
          {/* PDF overlay indicator */}
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              background: "rgba(0,0,0,0.7)",
              color: "white",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            PDF
          </div>
        </div>
      );
    }

    // Otherwise, use the PDFThumbnail component for client-side generation
    return (
      <PDFThumbnail
        pdfUrl={currentSrc}
        fileName={fileName}
        className={className}
        width={width}
        height={height}
        style={style}
        onLoad={onLoad}
        onError={onError}
      />
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
