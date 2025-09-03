import React from "react";
import CustomDropdown, {
  type DropdownOption,
} from "@/components/CustomDropdown";

interface SearchAndFilterProps {
  sortBy: string;
  onSortChange: (value: string) => void;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearchKeyPress: (e: React.KeyboardEvent) => void;
  selectedTags: string[];
  filteredAvailableTags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onClearAllTags: () => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  sortBy,
  onSortChange,
  searchInput,
  onSearchInputChange,
  onSearchKeyPress,
  selectedTags,
  filteredAvailableTags,
  onAddTag,
  onRemoveTag,
  onClearAllTags,
}) => {
  const sortOptions: DropdownOption[] = [
    { value: "recent", label: "Most Recent", icon: "⌛" },
    { value: "downloaded", label: "Most Downloaded", icon: "🔻" },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {/* Sort Dropdown */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          paddingLeft: "1rem",
          paddingRight: "1rem",
          width: "100%",
        }}
      >
        <CustomDropdown
          id="sort-dropdown"
          options={sortOptions}
          value={sortBy}
          onChange={onSortChange}
          aria-label="Sort images by"
          placeholder="Most Recent"
        />
      </div>

      {/* Search Section */}
      <div
        style={{
          marginBottom: "16px",
          paddingLeft: "1rem",
          paddingRight: "1rem",
        }}
      >
        {/* Search Input */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "12px",
              fontSize: "1.2rem",
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            <img src="./search-icon.svg" alt="Search" width={20} height={20} />
          </div>
          <input
            type="text"
            id="search-input"
            aria-label="Search images by tags, names, descriptions, and locations"
            placeholder="Search tags, names, descriptions, locations..."
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            onKeyPress={onSearchKeyPress}
            style={{
              width: "100%",
              padding: "12px 12px 12px 48px",
              background: "rgba(235, 232, 226, 1)",
              color: "#333",
              border: "none",
              borderRadius: "24px",
              fontSize: "1rem",
              outline: "none",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => {
              e.target.style.background = "#F0F0F0";
            }}
            onBlur={(e) => {
              e.target.style.background = "rgba(235, 232, 226, 1)";
            }}
          />
        </div>

        {/* Tag Suggestions */}
        {searchInput && filteredAvailableTags.length > 0 && (
          <div
            role="listbox"
            aria-label="Available tags"
            aria-expanded={filteredAvailableTags.length > 0}
            style={{
              position: "relative",
              background: "rgba(235, 232, 226, 0.95)",
              borderRadius: "12px",
              maxHeight: "200px",
              overflowY: "auto",
              border: "1px solid rgba(235, 232, 226, 0.3)",
              backdropFilter: "blur(10px)",
            }}
          >
            {filteredAvailableTags.slice(0, 8).map((tag, index) => (
              <div
                key={tag}
                role="option"
                aria-selected={false}
                tabIndex={0}
                onClick={() => onAddTag(tag)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onAddTag(tag);
                  }
                }}
                style={{
                  padding: "12px 16px",
                  cursor: "pointer",
                  borderBottom:
                    index < Math.min(filteredAvailableTags.length - 1, 7)
                      ? "1px solid rgba(0,0,0,0.1)"
                      : "none",
                  transition: "background-color 0.2s ease",
                  color: "#333",
                  fontSize: "0.95rem",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(255, 255, 255, 0.7)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        )}

        {/* Selected Tag Chips */}
        {selectedTags.length > 0 && (
          <>
            <div
              role="group"
              aria-label="Selected tags"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginTop: "16px",
              }}
            >
              {selectedTags.map((tag) => (
                <div
                  key={tag}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: "rgba(115, 115, 115, 0.9)",
                    color: "#FFFFFF",
                    padding: "8px 12px",
                    borderRadius: "20px",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    gap: "8px",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => onRemoveTag(tag)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#FFFFFF",
                      cursor: "pointer",
                      fontSize: "1rem",
                      padding: "0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(255, 255, 255, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                    aria-label={`Remove ${tag} tag`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchAndFilter;
