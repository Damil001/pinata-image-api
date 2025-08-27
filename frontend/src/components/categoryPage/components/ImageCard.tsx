import React from "react";
import { Image } from "../types";

interface ImageCardProps {
  image: Image;
  index: number;
  onClick: () => void;
  onDownload?: () => void;
}

const ImageCard: React.FC<ImageCardProps> = ({
  image,
  index,
  onClick,
  onDownload,
}) => {
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
        src={`https://copper-delicate-louse-351.mypinata.cloud/ipfs/${image.ipfsHash}`}
        alt={image.metadata?.keyvalues?.altText || image.name}
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

        {/* Download Button */}
        {onDownload && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click event
              onDownload();
            }}
            style={{
              position: "absolute",
              bottom: "8px",
              right: "8px",
              background: "rgba(0,0,0,0.7)",
              color: "#EBE8E2",
              border: "1px solid #444",
              borderRadius: "4px",
              padding: "4px 8px",
              fontSize: "0.7rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(235, 232, 226, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.7)";
            }}
          >
            ↓ Download
          </button>
        )}
      </div>
    </div>
  );
};

export default ImageCard;
