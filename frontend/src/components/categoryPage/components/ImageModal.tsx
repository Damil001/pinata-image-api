import React from "react";
import { Image } from "../types";

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
          width: "min(500px, 90vw)",
          background: "rgba(51, 54, 57, 1)",
          display: "flex",
          flexDirection: "column",
          borderRadius: "0px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "8px 12px",
          }}
        >
          <button
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

        {/* Image */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "10px 20px",
          }}
        >
          <img
            src={image.gatewayUrl}
            alt={image.name}
            style={{
              maxWidth: "100%",
              maxHeight: "400px",
              objectFit: "contain",
            }}
          />
        </div>

        {/* Tags + Download Row */}
        <div
          style={{
            background: "#2a2a2a",
            padding: "20px",
            color: "#fff",
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
            <span style={{ color: "#fff", fontWeight: "500" }}>ARTIST:</span>{" "}
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
