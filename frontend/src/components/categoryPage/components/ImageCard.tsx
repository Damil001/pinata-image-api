import React from "react";
import { Image } from "../types";

interface ImageCardProps {
  image: Image;
  index: number;
  onClick: () => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, index, onClick }) => {
  return (
    <div
      className="image-container"
      style={{
        position: "relative",
        overflow: "hidden",
        background: "#222",
        opacity: 0,
        animation: `fadeInUp 0.5s ease-out forwards`,
        animationDelay: `${Math.min(index * 0.1 + 0.5, 1.5)}s`,
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      <img
        src={image.gatewayUrl}
        alt={image.name}
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
          {image.name}
        </div>
        {image.size && (
          <div
            style={{
              color: "#ccc",
              fontSize: "0.7rem",
              textShadow: "0 1px 2px rgba(0,0,0,0.8)",
            }}
          >
            {(image.size / 1024 / 1024).toFixed(1)} MB
          </div>
        )}
        {(image.totalDownloads || 0) > 0 && (
          <div
            style={{
              color: "#4CAF50",
              fontSize: "0.7rem",
              textShadow: "0 1px 2px rgba(0,0,0,0.8)",
              fontWeight: "bold",
            }}
          >
            ↓ {image.totalDownloads} downloads
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCard;
