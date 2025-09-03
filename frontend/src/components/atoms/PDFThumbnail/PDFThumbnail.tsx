import React from "react";
import dynamic from "next/dynamic";

interface PDFThumbnailProps {
  pdfUrl: string;
  fileName: string;
  className?: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

// Dynamically import the client component to avoid SSR issues
const PDFThumbnailClient = dynamic(() => import("./PDFThumbnailClient"), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-200 animate-pulse flex flex-col items-center justify-center h-full">
      <div className="text-gray-400 text-4xl mb-2">📄</div>
      <div className="text-gray-400 text-sm">Loading PDF...</div>
    </div>
  ),
});

const PDFThumbnail: React.FC<PDFThumbnailProps> = (props) => {
  return <PDFThumbnailClient {...props} />;
};

export default PDFThumbnail;
