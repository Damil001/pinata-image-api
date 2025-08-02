"use client";
import React from "react";

export interface LoadingSkeletonProps {
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 6,
  className = "",
}) => {
  return (
    <div
      className={`loading-skeleton-grid ${className}`}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 0,
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="skeleton-item"
          style={{
            position: "relative",
            overflow: "hidden",
            background: "#2a2a2a",
            height: "130px",
            border: "1px solid #333",
          }}
        >
          {/* Main skeleton shimmer */}
          <div
            className="skeleton-shimmer"
            style={{
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
            }}
          />

          {/* Download count skeleton */}
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "rgba(0,0,0,0.7)",
              borderRadius: "4px",
              padding: "4px 8px",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "12px",
                background: "#444",
                borderRadius: "2px",
                animation: "pulse 1.5s infinite",
              }}
            />
          </div>

          {/* Download button skeleton */}
          <div
            style={{
              position: "absolute",
              bottom: 16,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(0,0,0,0.7)",
              borderRadius: "4px",
              padding: "8px 16px",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "16px",
                background: "#444",
                borderRadius: "2px",
                animation: "pulse 1.5s infinite",
              }}
            />
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.8;
          }
        }

        @media (max-width: 768px) {
          .loading-skeleton-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 480px) {
          .loading-skeleton-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSkeleton;
