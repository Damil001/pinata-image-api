import React, { useState, useEffect } from "react";
import { Image } from "../types";
import FileWithFallback from "@/components/atoms/FileWithFallback";
import SimplePDFDisplay from "@/components/atoms/PDFViewer/SimplePDFDisplay";

interface ImageModalProps {
  image: Image | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (image: Image) => void;
}

const getDisplayArtist = (metadata?: Image["metadata"]): string => {
  const { artist, visibility } = metadata?.keyvalues || {};
  const isVisible = visibility === "true";
  const hasArtist = artist?.trim();
  return isVisible && hasArtist ? hasArtist : "Anonymous";
};

const ImageModal: React.FC<ImageModalProps> = ({
  image,
  isOpen,
  onClose,
  onDownload,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth <= 768 ||
          /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          )
      );
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!isOpen || !image) return null;

  // Check if the file is a PDF
  const isPDF =
    image.name.toLowerCase().endsWith(".pdf") ||
    image.metadata?.keyvalues?.fileType === "pdf";

  console.log("ImageModal - Image:", image.name);
  console.log("ImageModal - Is PDF:", isPDF);
  console.log(
    "ImageModal - File type metadata:",
    image.metadata?.keyvalues?.fileType
  );
  console.log("ImageModal - Gateway URL:", image.gatewayUrl);
  console.log("ImageModal - IPFS Hash:", image.ipfsHash);
  console.log("damil");
  // Construct PDF URL with fallback
  const pdfUrl =
    image.gatewayUrl ||
    `https://copper-delicate-louse-351.mypinata.cloud/ipfs/${image.ipfsHash}`;

  console.log("ImageModal rendered with image:", image);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.9)",
        zIndex: 2000,
        padding: "20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start", // Top aligned
        paddingTop: "60px", // Add some top spacing
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: isMobile ? "100vw" : "min(500px, 90vw)",
          background: "rgba(51, 54, 57, 1)",
          display: "flex",
          flexDirection: "column",
          borderRadius: "0px",
          maxHeight: isMobile ? "100vh" : "calc(100vh - 120px)",
          overflow: isMobile && isPDF ? "hidden" : "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: isMobile ? "12px 16px" : "8px 12px",
            flexShrink: 0,
            position: "relative",
            zIndex: 10,
          }}
        >
          <button
            aria-label="Close image modal"
            onClick={onClose}
            style={{
              background: "rgba(0, 0, 0, 0.5)",
              border: "none",
              color: "#fff",
              fontSize: isMobile ? "24px" : "18px",
              cursor: "pointer",
              borderRadius: "50%",
              width: isMobile ? "40px" : "30px",
              height: isMobile ? "40px" : "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Title - Hidden but accessible to screen readers */}
        <h2 id="modal-title" className="sr-only">
          {image.name} - Image Details
        </h2>

        {/* Modal Description - Hidden but accessible to screen readers */}
        <div id="modal-description" className="sr-only">
          {image.metadata?.keyvalues?.altText || image.name}
          {image.metadata?.keyvalues?.artist &&
            ` by ${image.metadata.keyvalues.artist}`}
          {image.metadata?.keyvalues?.location &&
            ` from ${image.metadata.keyvalues.location}`}
          {image.tags &&
            image.tags.length > 0 &&
            ` - Tags: ${image.tags.join(", ")}`}
        </div>

        {/* File Content - Restructured for better mobile handling */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: isMobile ? "0px" : "10px 20px",
            minHeight: 0,
            position: "relative",
            overflow: "hidden",
            height: isMobile ? "calc(100vh - 200px)" : "100%",
          }}
        >
          {isPDF ? (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: isMobile ? "10px" : "20px",
              }}
            >
              <SimplePDFDisplay
                pdfUrl={pdfUrl}
                fileName={image.name}
                height={
                  isMobile ? "calc(100vh - 200px)" : "calc(100vh - 120px)"
                }
                width="100%"
              />
            </div>
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: isMobile ? "10px" : "20px",
              }}
            >
              <FileWithFallback
                hash={image.ipfsHash}
                fileName={image.name}
                alt={image.metadata?.keyvalues?.altText || image.name}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
                onClick={() => {}} // No action needed in modal
              />
            </div>
          )}
        </div>

        {/* Tags + Download Row - Show for all files, but compact on mobile PDF */}
        <div
          style={{
            background: "#2a2a2a",
            padding: isMobile && isPDF ? "4px 8px" : isMobile ? "12px" : "20px",
            color: "#fff",
            flexShrink: 0,
            overflow: "auto",
            fontSize:
              isMobile && isPDF ? "0.7rem" : isMobile ? "0.9rem" : "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: isMobile && isPDF ? "4px" : "16px",
            }}
          >
            {/* Left side - Tags */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {(image.tags || image.metadata?.keyvalues?.tags?.split(",") || [])
                .slice(0, 2)
                .map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      background: "#555",
                      color: "#fff",
                      padding: isMobile && isPDF ? "4px 12px" : "6px 16px",
                      borderRadius: "20px",
                      fontSize: isMobile && isPDF ? "0.7rem" : "0.9rem",
                    }}
                  >
                    {typeof tag === "string" ? tag.trim() : tag}
                  </span>
                ))}
            </div>

            {/* Right side - Download Button */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <button
                onClick={() => onDownload(image)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
                title={`Download ${isPDF ? "PDF" : "Image"}`}
              >
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: "12px solid transparent",
                    borderRight: "12px solid transparent",
                    borderTop: "16px solid rgba(255, 0, 0, 1)",
                  }}
                />
              </button>
            </div>
          </div>

          {/* Origin and Artist */}
          <div
            style={{
              fontSize: isMobile && isPDF ? "0.65rem" : "0.9rem",
              marginBottom: isMobile && isPDF ? "1px" : "4px",
              color: "#ccc",
            }}
          >
            <span style={{ color: "#fff", fontWeight: "500" }}>ORIGIN:</span>{" "}
            {image.metadata?.keyvalues?.location || "Unknown"}
          </div>
          <div
            style={{
              fontSize: isMobile && isPDF ? "0.65rem" : "0.9rem",
              marginBottom: isMobile && isPDF ? "4px" : "16px",
              color: "#ccc",
            }}
          >
            <span style={{ color: "#fff", fontWeight: "500" }}>NODE:</span>{" "}
            {getDisplayArtist(image.metadata)}
          </div>

          {/* Category */}
          <div
            style={{
              fontSize:
                isMobile && isPDF ? "0.9rem" : isMobile ? "1.4rem" : "1.8rem",
              fontWeight: "bold",
              letterSpacing: "0.1em",
              fontFamily: "monospace",
            }}
          >
            {image.metadata?.keyvalues?.category?.toUpperCase() || "POSTER"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
