"use client";
import React from "react";
import { Image } from "@/components/upload";

interface ImageGridProps {
  images: Image[];
  loading: boolean;
  onImageClick: (image: Image) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  loading,
  onImageClick,
}) => {
  if (loading) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 0,
        }}
      >
        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            style={{
              position: "relative",
              overflow: "hidden",
              background: "#2a2a2a",
              height: "130px",
              border: "1px solid #333",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                background:
                  "linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite",
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 0,
        }}
      >
        {images.map((img: Image, index) => (
          <div
            key={img.id}
            className="image-container"
            style={{
              position: "relative",
              overflow: "hidden",
              background: "#222",
              opacity: 0,
              animation: "fadeInUp 0.5s ease-out forwards",
              animationDelay: `${Math.min(index * 0.1, 1)}s`,
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              cursor: "pointer",
            }}
            onClick={() => onImageClick(img)}
          >
            <img
              src={img.gatewayUrl}
              alt={img.metadata?.keyvalues?.altText || img.name}
              style={{
                width: "100%",
                height: "clamp(100px, 20vw, 130px)",
                maxHeight: "130px",
                objectFit: "cover",
                display: "block",
                transition: "filter 0.2s, transform 0.3s ease",
              }}
              loading="lazy"
            />

            {/* Image Info Overlay */}
            <div
              className="image-info"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)",
                padding: "8px",
                opacity: 0,
                transition: "opacity 0.2s",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  color: "#fff",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {img.name}
              </div>
              {img.size && (
                <div
                  style={{
                    color: "#ccc",
                    fontSize: "0.7rem",
                    textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                  }}
                >
                  {(img.size / 1024 / 1024).toFixed(1)} MB
                </div>
              )}
              {(img.totalDownloads || 0) > 0 && (
                <div
                  style={{
                    color: "#4CAF50",
                    fontSize: "0.7rem",
                    textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                    fontWeight: "bold",
                  }}
                >
                  ↓ {img.totalDownloads} downloads
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CSS Styles */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .image-container:hover .image-info {
          opacity: 1 !important;
        }

        .image-container:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3) !important;
        }

        .image-container:hover img {
          transform: scale(1.02) !important;
        }

        /* Tablet styles */
        @media (max-width: 1024px) {
          .image-container {
            animation-delay: 0s !important;
          }
        }

        /* Mobile styles */
        @media (max-width: 768px) {
          .image-container {
            animation-delay: 0s !important;
          }

          .image-container:hover {
            transform: none !important;
            box-shadow: none !important;
          }

          .image-container:hover img {
            transform: none !important;
          }

          /* Ensure minimum 2 columns on mobile */
          div[style*="gridTemplateColumns"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        /* Small mobile styles */
        @media (max-width: 480px) {
          /* Single column on very small screens */
          div[style*="gridTemplateColumns"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        /* Very small screens */
        @media (max-width: 360px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        /* Desktop: Keep 3 columns */
        @media (min-width: 769px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
      `}</style>
    </>
  );
};

export default ImageGrid;
