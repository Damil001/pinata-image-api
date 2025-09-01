import React, { useEffect, useRef } from "react";
import { Pagination } from "../types";

interface LoadingAndPaginationProps {
  loading: boolean;
  loadingMore: boolean;
  pagination: Pagination;
  imagesCount: number;
  category: string;
  onLoadMore: () => void;
  minImagesToLoad?: number;
  autoLoadInitial?: boolean;
}

const LoadingAndPagination: React.FC<LoadingAndPaginationProps> = ({
  loading,
  loadingMore,
  pagination,
  imagesCount,
  category,
  onLoadMore,
  minImagesToLoad = 3,
  autoLoadInitial = true,
}) => {
  const hasAutoLoaded = useRef<boolean>(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastLoadAttempt = useRef<number>(0);

  // Auto-load images if we have fewer than the minimum required
  useEffect(() => {
    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    // Only auto-load if enabled and we haven't already auto-loaded
    if (!autoLoadInitial || hasAutoLoaded.current) {
      return;
    }

    // Prevent too frequent load attempts (debounce)
    const now = Date.now();
    if (now - lastLoadAttempt.current < 500) {
      return;
    }

    // Auto-load if we have fewer images than required and more pages are available
    if (
      !loading &&
      !loadingMore &&
      imagesCount < minImagesToLoad &&
      pagination.hasMore
    ) {
      // Use a small delay to prevent rapid successive calls
      loadingTimeoutRef.current = setTimeout(() => {
        console.log(
          `Auto-loading more images (${imagesCount}/${minImagesToLoad})`
        );
        lastLoadAttempt.current = Date.now();
        onLoadMore();
      }, 200);
    } else if (imagesCount >= minImagesToLoad || !pagination.hasMore) {
      // Mark as auto-loaded once we reach the minimum or no more pages
      hasAutoLoaded.current = true;
    }

    // Cleanup timeout on unmount
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [
    loading,
    loadingMore,
    imagesCount,
    pagination.hasMore,
    onLoadMore,
    minImagesToLoad,
    autoLoadInitial,
  ]);

  // Reset auto-load flag when category changes
  useEffect(() => {
    hasAutoLoaded.current = false;
    lastLoadAttempt.current = 0;
  }, [category]);

  // Debounced load more handler to prevent multiple rapid clicks
  const handleLoadMore = () => {
    const now = Date.now();

    // Prevent rapid clicks
    if (now - lastLoadAttempt.current < 500) {
      console.log("Load more clicked too quickly, ignoring");
      return;
    }

    if (loadingMore || !pagination.hasMore) {
      return;
    }

    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    lastLoadAttempt.current = now;
    onLoadMore();
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

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
            onClick={handleLoadMore}
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
              opacity: loadingMore ? 0.7 : 1,
            }}
            onMouseOver={(e) => {
              if (!loadingMore) {
                (e.target as HTMLButtonElement).style.background = "#ddd9d3";
              }
            }}
            onMouseOut={(e) => {
              if (!loadingMore) {
                (e.target as HTMLButtonElement).style.background = "#EBE8E2";
              }
            }}
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {/* Loading indicator */}
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
          {imagesCount < minImagesToLoad &&
            pagination.hasMore &&
            ` • Auto-loading to reach ${minImagesToLoad} images...`}
        </div>
      )}
    </>
  );
};

export default LoadingAndPagination;
