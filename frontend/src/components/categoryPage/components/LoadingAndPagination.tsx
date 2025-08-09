import React from "react";
import { Pagination } from "../types";

interface LoadingAndPaginationProps {
  loading: boolean;
  loadingMore: boolean;
  pagination: Pagination;
  imagesCount: number;
  category: string;
  onLoadMore: () => void;
}

const LoadingAndPagination: React.FC<LoadingAndPaginationProps> = ({
  loading,
  loadingMore,
  pagination,
  imagesCount,
  category,
  onLoadMore,
}) => {
  return (
    <>
      {/* Load More Button */}
      {!loading && pagination.hasMore && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "32px 16px",
          }}
        >
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            style={{
              padding: "12px 24px",
              background: loadingMore ? "#666" : "#EBE8E2",
              color: loadingMore ? "#ccc" : "#222",
              border: "none",
              borderRadius: "6px",
              cursor: loadingMore ? "not-allowed" : "pointer",
              fontSize: "1rem",
              fontWeight: "500",
              transition: "all 0.2s ease",
            }}
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {/* Loading indicator for infinite scroll */}
      {loadingMore && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "16px",
            color: "#888",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                border: "2px solid #444",
                borderTop: "2px solid #EBE8E2",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            Loading more images...
          </div>
        </div>
      )}

      {/* Pagination info */}
      {!loading && imagesCount > 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "16px",
            color: "#888",
            fontSize: "0.9rem",
          }}
        >
          Showing {imagesCount} images for {category.toLowerCase()} category
          {!pagination.hasMore && " • All pages loaded"}
        </div>
      )}
    </>
  );
};

export default LoadingAndPagination;
