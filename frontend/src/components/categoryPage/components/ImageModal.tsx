import React from "react";
import { Image } from "../types";
import FileWithFallback from "@/components/atoms/FileWithFallback";

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
  if (!isOpen || !image) return null;
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
          width: "min(500px, 90vw)",
          background: "rgba(51, 54, 57, 1)",
          display: "flex",
          flexDirection: "column",
          borderRadius: "0px",
          maxHeight: "calc(100vh - 120px)", // Prevent overflow
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "8px 12px",
            flexShrink: 0, // Don't shrink
          }}
        >
          <button
            aria-label="Close image modal"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: "18px",
              cursor: "pointer",
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

        {/* File Content */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "10px 20px",
            flex: 1, // Take up remaining space
            minHeight: 0, // Allow shrinking
            alignItems: "center",
          }}
        >
          {image.name.toLowerCase().endsWith(".pdf") ? (
            <div style={{ width: "100%", maxWidth: "400px", height: "400px" }}>
              <FileWithFallback
                hash={image.ipfsHash}
                fileName={image.name}
                alt={image.metadata?.keyvalues?.altText || image.name}
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>
          ) : (
            <FileWithFallback
              hash={image.ipfsHash}
              fileName={image.name}
              alt={image.metadata?.keyvalues?.altText || image.name}
              style={{
                width: "100%", // Take full width of container
                maxWidth: "400px", // Maximum width constraint
                height: "400px", // Take full height of container
                objectFit: "contain", // Cover the container
              }}
            />
          )}
        </div>

        {/* Tags + Download Row */}
        <div
          style={{
            background: "#2a2a2a",
            padding: "20px",
            color: "#fff",
            flexShrink: 0, // Don't shrink
            overflow: "auto", // Allow scrolling if content is too long
          }}
        >
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
              {(image.tags || image.metadata?.keyvalues?.tags?.split(",") || [])
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
                    }}
                  >
                    {typeof tag === "string" ? tag.trim() : tag}
                  </span>
                ))}
            </div>

            {/* Download Button */}
            <button
              onClick={() => onDownload(image)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
              title="Download Image"
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
            style={{ fontSize: "0.9rem", marginBottom: "4px", color: "#ccc" }}
          >
            <span style={{ color: "#fff", fontWeight: "500" }}>ORIGIN:</span>{" "}
            {image.metadata?.keyvalues?.location || "Unknown"}
          </div>
          <div
            style={{ fontSize: "0.9rem", marginBottom: "16px", color: "#ccc" }}
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
