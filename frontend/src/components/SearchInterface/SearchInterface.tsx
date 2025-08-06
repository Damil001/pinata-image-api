"use client";
import React from "react";
import CustomDropdown, {
  type DropdownOption,
} from "@/components/CustomDropdown";

interface SearchInterfaceProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTags: string[];
  availableTags: string[];
  onTagToggle: (tag: string) => void;
  onTagRemove: (tag: string) => void;
  sortBy: "recent" | "name" | "size" | "downloaded";
  onSortChange: (sortBy: "recent" | "name" | "size" | "downloaded") => void;
}

const SearchInterface: React.FC<SearchInterfaceProps> = ({
  searchQuery,
  onSearchChange,
  selectedTags,
  availableTags,
  onTagToggle,
  onTagRemove,
  sortBy,
  onSortChange,
}) => {
  const sortOptions: DropdownOption[] = [
    { value: "recent", label: "Most Recent", icon: "⌛" },
    { value: "downloaded", label: "Most Downloaded", icon: "🔻" },
  ];

  return (
    <div
      style={{
        background: "rgba(235, 232, 226, 1)",
        borderRadius: "20px",
        padding: "24px",
        marginBottom: "32px",
      }}
    >
      {/* Search Bar */}
      <div
        style={{
          position: "relative",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          placeholder="Search for anything"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: "100%",
            padding: "16px 20px",
            background: "rgba(235, 232, 226, 1)",
            color: "#666",
            border: "none",
            borderRadius: "12px",
            fontSize: "1.1rem",
            outline: "none",
            fontWeight: "400",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
          }}
        />
      </div>

      {/* Selected Tags with X buttons */}
      {selectedTags.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "20px",
          }}
        >
          {selectedTags.map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                alignItems: "center",
                background: "rgba(200, 200, 200, 1)",
                borderRadius: "20px",
                padding: "8px 16px",
                fontSize: "0.9rem",
                fontWeight: "500",
                color: "#333",
                textTransform: "uppercase",
              }}
            >
              <button
                onClick={() => onTagRemove(tag)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#333",
                  fontSize: "14px",
                  cursor: "pointer",
                  marginRight: "8px",
                  padding: "0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
              {tag}
            </div>
          ))}
        </div>
      )}

      {/* Available Tags for Selection */}
      {availableTags.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "20px",
          }}
        >
          {availableTags
            .filter((tag) => !selectedTags.includes(tag))
            .slice(0, 10)
            .map((tag) => (
              <button
                key={tag}
                onClick={() => onTagToggle(tag)}
                style={{
                  background: "rgba(180, 180, 180, 1)",
                  border: "none",
                  borderRadius: "20px",
                  padding: "8px 16px",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  color: "#333",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(160, 160, 160, 1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(180, 180, 180, 1)";
                }}
              >
                {tag}
              </button>
            ))}
        </div>
      )}

      {/* Sort Dropdown with Red Triangle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: "12px solid rgba(255, 0, 0, 1)",
          }}
        />
        <div style={{ flex: 1 }}>
          <CustomDropdown
            id="sort-dropdown"
            options={sortOptions}
            value={sortBy}
            onChange={(value) =>
              onSortChange(value as "recent" | "name" | "size" | "downloaded")
            }
            aria-label="Sort images by"
            placeholder="Most Downloaded"
          />
        </div>
      </div>
    </div>
  );
};

export default SearchInterface;
