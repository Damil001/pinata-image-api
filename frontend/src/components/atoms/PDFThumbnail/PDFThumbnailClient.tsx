"use client";
import React, { useState, useEffect, useRef } from "react";
import PDFThumbnailFallback from "./PDFThumbnailFallback";

interface PDFThumbnailClientProps {
  pdfUrl: string;
  fileName: string;
  className?: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

const PDFThumbnailClient: React.FC<PDFThumbnailClientProps> = ({
  pdfUrl,
  fileName,
  className,
  width,
  height,
  style,
  onLoad,
  onError,
}) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!pdfUrl) return;

    const generateThumbnail = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        // Check if we're in a browser environment
        if (typeof window === "undefined") {
          setUseFallback(true);
          setIsLoading(false);
          return;
        }

        // Dynamically import PDF.js only on client side
        const pdfjsLib = await import("pdfjs-dist");

        // Set worker source for browser environment
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

        // Load the PDF
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;

        // Get the first page
        const page = await pdf.getPage(1);

        // Set up canvas
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        // Calculate scale to fit within desired dimensions
        const viewport = page.getViewport({ scale: 1 });
        const maxWidth = width || 300;
        const maxHeight = height || 400;
        const scale = Math.min(
          maxWidth / viewport.width,
          maxHeight / viewport.height
        );

        const scaledViewport = page.getViewport({ scale });

        // Set canvas dimensions
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        // Render the page
        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
        };

        await page.render(renderContext).promise;

        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL("image/png");
        setThumbnailUrl(dataUrl);
        setIsLoading(false);
        onLoad?.();
      } catch (error) {
        console.error("PDF thumbnail generation failed:", error);
        setUseFallback(true);
        setIsLoading(false);
        onError?.();
      }
    };

    generateThumbnail();
  }, [pdfUrl, width, height, onLoad, onError]);

  if (isLoading) {
    return (
      <div
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{ width, height, ...style }}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-gray-400 text-4xl mb-2">📄</div>
          <div className="text-gray-400 text-sm">Generating thumbnail...</div>
        </div>
      </div>
    );
  }

  if (useFallback) {
    return (
      <PDFThumbnailFallback
        pdfUrl={pdfUrl}
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
    <div className={className} style={{ width, height, ...style }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          cursor: "pointer",
          borderRadius: "8px",
          overflow: "hidden",
        }}
        onClick={() => window.open(pdfUrl, "_blank")}
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={`PDF thumbnail: ${fileName}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
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
            }}
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
        )}

        {/* PDF overlay indicator */}
        <div
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            background: "rgba(0, 0, 0, 0.7)",
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

      {/* Hidden canvas for PDF rendering */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default PDFThumbnailClient;
