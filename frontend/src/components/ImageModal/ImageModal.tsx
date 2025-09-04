"use client";
import React, { useState, useEffect } from "react";
import { Image } from "@/components/upload";
import FileWithFallback from "@/components/atoms/FileWithFallback";
import { isPDFFile } from "@/utils/fileUtils";

// Helper function to get artist name based on visibility and availability
function getDisplayArtist(metadata?: Image["metadata"]): string {
  const { artist, visibility } = metadata?.keyvalues || {};
  const isVisible = visibility === "true";
  const hasArtist = artist?.trim();

  return isVisible && hasArtist ? hasArtist : "Anonymous";
}

// Helper function to programmatically download an image and record download in backend
async function downloadImage(
  image: Image,
  deviceId: string,
  refreshImages: () => Promise<void>
) {
  try {
    // Call backend to record download
    const response = await fetch(
      "https://pinata-image-api.onrender.com/api/download",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageId: image.ipfsHash, // Use ipfsHash as imageId
          deviceId: deviceId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to record download: ${response.statusText}`);
    }

    // Download the file
    const blobResponse = await fetch(image.gatewayUrl);
    const blob = await blobResponse.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = image.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 200);

    // Refresh images to update download counts
    await refreshImages();
  } catch (error) {
    console.error("Download error:", error);
    alert("Failed to download image or record download.");
  }
}

interface ImageModalProps {
  image: Image | null;
  isOpen: boolean;
  onClose: () => void;
  deviceId: string;
  refreshImages: () => Promise<void>;
}

const ImageModal: React.FC<ImageModalProps> = ({
  image,
  isOpen,
  onClose,
  deviceId,
  refreshImages,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

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

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.9)",
        display: "flex",
        alignItems: "start",
        justifyContent: "center",
        zIndex: 2000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: isMobile ? "100vw" : "min(500px, 90vw)",
          height: isMobile ? "100vh" : "auto",
          background: "rgba(51, 54, 57, 1)",
          display: "flex",
          flexDirection: "column",
          borderRadius: "0px",
          maxHeight: isMobile ? "100vh" : "calc(100vh - 120px)",
          overflow: "hidden",
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

        {/* Image or PDF - Restructured for better mobile handling */}
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
          }}
        >
          {isPDF ? (
            <>
              <style jsx>{`
                iframe::-webkit-scrollbar {
                  display: none !important;
                }
                .pdf-iframe {
                  width: 100%;
                  height: 100%;
                  border: none;
                  border-radius: 4px;
                  overflow: hidden;
                  scrollbar-width: none;
                  -ms-overflow-style: none;
                  -webkit-overflow-scrolling: touch;
                  touch-action: manipulation;
                }
                .pdf-iframe::-webkit-scrollbar {
                  display: none;
                }
                @media (max-width: 768px) {
                  .pdf-iframe {
                    height: 100%;
                    width: 100%;
                  }
                }
              `}</style>
              {!iframeLoaded && (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    color: "white",
                    fontSize: "16px",
                    zIndex: 5,
                  }}
                >
                  Loading PDF...
                </div>
              )}
              <iframe
                src={`${image.gatewayUrl}#toolbar=${
                  isMobile ? "0" : "1"
                }&navpanes=${isMobile ? "0" : "1"}&scrollbar=0&view=FitH&zoom=${
                  isMobile ? "page-fit" : "auto"
                }`}
                className="pdf-iframe hide-scrollbar"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  borderRadius: "4px",
                  overflow: "hidden",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  WebkitOverflowScrolling: "touch",
                  touchAction: "manipulation",
                }}
                title={`PDF: ${image.name}`}
                scrolling="yes"
                allowFullScreen={true}
                onLoad={() => setIframeLoaded(true)}
                onError={() => setIframeLoaded(true)}
              />
            </>
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
              <img
                src={image.gatewayUrl}
                alt={image.metadata?.keyvalues?.altText || image.name}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            </div>
          )}
        </div>

        {/* Bottom Info Section - Only show on mobile if not PDF */}
        {(!isPDF || !isMobile) && (
          <div
            style={{
              background: "#2a2a2a",
              padding: isMobile ? "16px" : "20px",
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {/* Tags + Download Row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              {/* Tags */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {(
                  image.tags ||
                  image.metadata?.keyvalues?.tags?.split(",") ||
                  []
                )
                  .slice(0, 2)
                  .map((tag, index) => (
                    <span
                      key={index}
                      style={{
                        background: "#555",
                        color: "#fff",
                        padding: "6px 16px",
                        borderRadius: "20px",
                        fontSize: "0.9rem",
                        fontWeight: "400",
                      }}
                    >
                      {typeof tag === "string" ? tag.trim() : tag}
                    </span>
                  ))}
              </div>

              {/* Download Button */}
              <button
                onClick={() => downloadImage(image, deviceId, refreshImages)}
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

            {/* Origin and Artist */}
            <div
              style={{
                fontSize: "0.9rem",
                marginBottom: "4px",
                color: "#ccc",
              }}
            >
              <span style={{ color: "#fff", fontWeight: "500" }}>ORIGIN:</span>{" "}
              {image.metadata?.keyvalues?.location || "Unknown"}
            </div>
            <div
              style={{
                fontSize: "0.9rem",
                marginBottom: "16px",
                color: "#ccc",
              }}
            >
              <span style={{ color: "#fff", fontWeight: "500" }}>NODE:</span>{" "}
              {getDisplayArtist(image.metadata)}
            </div>

            {/* Category */}
            <div
              style={{
                fontSize: "1.8rem",
                fontWeight: "bold",
                letterSpacing: "0.1em",
                color: "#fff",
                fontFamily: "monospace",
              }}
            >
              {image.metadata?.keyvalues?.category?.toUpperCase() || "POSTER"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageModal;
