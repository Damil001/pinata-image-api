"use client";
import React from "react";
import styles from "./SimplePDFDisplay.module.css";

interface SimplePDFDisplayProps {
  pdfUrl: string;
  fileName: string;
  className?: string;
  style?: React.CSSProperties;
  height?: string | number;
  width?: string | number;
}

const SimplePDFDisplay: React.FC<SimplePDFDisplayProps> = ({
  pdfUrl,
  fileName,
  className,
  style,
  height = "100%",
  width = "100%",
}) => {
  const handleClick = () => {
    window.open(pdfUrl, "_blank");
  };

  return (
    <div
      className={`${styles.pdfContainer} ${className}`}
      style={{ width, height, ...style }}
      onClick={handleClick}
    >
      {/* PDF Icon */}
      <div className={styles.pdfIcon}>📄</div>

      {/* File Name */}
      <div className={styles.fileName}>{fileName}</div>

      {/* Click instruction */}
      <div className={styles.instruction}>
        Click on the 🔻 to open and download the pdf
      </div>
    </div>
  );
};

export default SimplePDFDisplay;
