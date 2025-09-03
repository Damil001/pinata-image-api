"use client";
import React from "react";

interface PDFThumbnailFallbackProps {
  pdfUrl: string;
  fileName: string;
  className?: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

const PDFThumbnailFallback: React.FC<PDFThumbnailFallbackProps> = ({
  pdfUrl,
  fileName,
  className,
  width,
  height,
  style,
  onLoad,
  onError,
}) => {
  React.useEffect(() => {
    onLoad?.();
  }, [onLoad]);

  return (
    <div className={className} style={{ width, height, ...style }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          cursor: "pointer",
          borderRadius: "8px",
          overflow: "hidden",
        }}
        onClick={() => window.open(pdfUrl, "_blank")}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#f5f5f5",
            border: "2px solid #ddd",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#e5e5e5";
            e.currentTarget.style.borderColor = "#bbb";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#f5f5f5";
            e.currentTarget.style.borderColor = "#ddd";
          }}
        >
          <div style={{ fontSize: "48px", color: "#666" }}>📄</div>
          <div
            style={{
              fontSize: "14px",
              color: "#666",
              textAlign: "center",
              padding: "0 8px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
              fontWeight: "500",
            }}
          >
            {fileName}
          </div>
          <div style={{ fontSize: "12px", color: "#999", textAlign: "center" }}>
            Click to view PDF
          </div>
        </div>

        {/* PDF overlay indicator */}
        <div
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            background: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          PDF
        </div>
      </div>
    </div>
  );
};

export default PDFThumbnailFallback;
