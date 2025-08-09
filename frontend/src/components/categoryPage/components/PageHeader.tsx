import React from "react";
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700"],
});

interface PageHeaderProps {
  category: string;
  onBack: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ category, onBack }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "32px",
        padding: "1rem",
        flexWrap: "wrap",
        gap: "1rem",
      }}
    >
      <h1
        className={orbitron.className}
        style={{
          fontSize: "clamp(1.5rem, 5vw, 3rem)",
          fontWeight: "700",
          color: "#FFFFFF",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          margin: 0,
          flex: 1,
          minWidth: "200px",
        }}
      >
        {category.toUpperCase()}
      </h1>

      <button
        onClick={onBack}
        style={{
          background: "transparent",
          border: "none",
          color: "#FFFFFF",
          fontSize: "2rem",
          cursor: "pointer",
          padding: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "opacity 0.2s ease",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "0.7";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
        aria-label="Go back"
      >
        <img src="./button-back.svg" alt="Back" width={24} height={24} />
      </button>
    </div>
  );
};

export default PageHeader;
