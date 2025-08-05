"use client";
import React from "react";
import { Image } from "@/components/upload";

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
  if (!isOpen || !image) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "relative",
          width: "min(500px, 90vw)",
          height: "min(600px, 80vh)",
          background: "rgba(51, 54, 57, 1)",
          borderRadius: "0px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "12px",
            right: "16px",
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: "18px",
            cursor: "pointer",
            zIndex: 2001,
            width: "20px",
            height: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>

        {/* Image Container */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            width: "80%",
            margin: "0 auto",
          }}
        >
          <img
            src={image.gatewayUrl}
            alt={image.name}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              display: "block",
              margin: "0 auto",
            }}
          />

          {/* Download Button - Red Triangle */}
          <button
            onClick={() => downloadImage(image, deviceId, refreshImages)}
            style={{
              position: "absolute",
              bottom: "20px",
              right: "20px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              zIndex: 2001,
              padding: "0",
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

        {/* Bottom Info Section */}
        <div
          style={{
            background: "#2a2a2a",
            padding: "20px",
            color: "#fff",
          }}
        >
          {/* Tags */}
          <div style={{ marginBottom: "16px" }}>
            {(image.tags || image.metadata?.keyvalues?.tags) && (
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
            )}
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
            <span style={{ color: "#fff", fontWeight: "500" }}>ARTIST:</span>{" "}
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
      </div>
    </div>
  );
};

export default ImageModal;
