import React from "react";
import { Image } from "../types";
import FileWithFallback from "@/components/atoms/FileWithFallback";

interface ImageCardProps {
  image: Image;
  index: number;
  onClick: () => void;
  onDownload?: () => void;
  "aria-rowindex"?: number;
  "aria-colindex"?: number;
}

const ImageCard: React.FC<ImageCardProps> = ({
  image,
  index,
  onClick,
  onDownload,
  "aria-rowindex": ariaRowIndex,
  "aria-colindex": ariaColIndex,
}) => {
  console.log(image);
  return (
    <div
      className="image-container"
      role="gridcell"
      tabIndex={0}
      aria-label={`Image ${index + 1}: ${image.name}`}
      aria-describedby={`image-desc-${image.id}`}
      aria-rowindex={ariaRowIndex}
      aria-colindex={ariaColIndex}
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
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <FileWithFallback
        hash={image.ipfsHash}
        fileName={image.name}
        alt={image.metadata?.keyvalues?.altText || image.name}
        thumbnailHash={image.metadata?.keyvalues?.thumbnailIpfsHash}
        thumbnailGatewayUrl={image.thumbnail?.gatewayUrl}
        className="w-full h-auto"
        style={{
          height: "clamp(100px, 20vw, 130px)",
          maxHeight: "130px",
          objectFit: "cover",
          display: "block",
          transition: "filter 0.2s, transform 0.3s ease",
        }}
      />

      {/* Hidden description for screen readers */}
      <div id={`image-desc-${image.id}`} className="sr-only" aria-hidden="true">
        {image.metadata?.keyvalues?.altText || image.name}

        {image.metadata?.keyvalues?.artist &&
          ` by ${image.metadata.keyvalues.artist}`}
        {image.metadata?.keyvalues?.location &&
          ` from ${image.metadata.keyvalues.location}`}
        {image.tags &&
          image.tags.length > 0 &&
          ` - Tags: ${image.tags.join(", ")}`}
        {image.totalDownloads && ` - Downloaded ${image.totalDownloads} times`}
      </div>

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
            aria-label={`Download ${image.name}`}
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
