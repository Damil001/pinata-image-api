import React from "react";
import { Image } from "../types";
import ImageCard from "./ImageCard";
import LoadingSkeleton from "@/components/LoadingSkeleton";

interface ImageGridProps {
  loading: boolean;
  images: Image[];
  onImageClick: (image: Image) => void;
  onClearFilters: () => void;
  onDownload?: (image: Image) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({
  loading,
  images,
  onImageClick,
  onClearFilters,
  onDownload,
}) => {
  console.log(images);
  if (loading) {
    return <LoadingSkeleton count={9} />;
  }

  if (images.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px 16px",
          color: "#888",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
        <h3 style={{ color: "#EBE8E2", marginBottom: "8px" }}>
          No matches found
        </h3>
        <p>Try adjusting your search or filter criteria.</p>
        <button
          onClick={onClearFilters}
          style={{
            marginTop: "16px",
            padding: "8px 16px",
            background: "rgba(235, 232, 226, 0.1)",
            color: "#EBE8E2",
            border: "1px solid #444",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(235, 232, 226, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(235, 232, 226, 0.1)";
          }}
        >
          Clear All Filters
        </button>
      </div>
    );
  }

  return (
    <div
      role="grid"
      aria-label={`${images.length} images in grid layout`}
      aria-rowcount={Math.ceil(images.length / 3)}
      aria-colcount={3}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 0,
      }}
    >
      {images.map((img, index) => (
        <ImageCard
          key={img.id}
          image={img}
          index={index}
          onClick={() => onImageClick(img)}
          aria-rowindex={Math.floor(index / 3) + 1}
          aria-colindex={(index % 3) + 1}
        />
      ))}
    </div>
  );
};

export default ImageGrid;
