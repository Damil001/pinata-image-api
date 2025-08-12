"use client";
import React, { useState, useEffect, useRef } from "react";
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
  onTagAdd: (tag: string) => void;
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
  onTagAdd,
  sortBy,
  onSortChange,
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const sortOptions: DropdownOption[] = [
    { value: "recent", label: "Most Recent", icon: "⌛" },
    { value: "downloaded", label: "Most Downloaded", icon: "🔻" },
  ];

  // Filter suggestions based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filteredSuggestions = availableTags
      .filter(
        (tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !selectedTags.includes(tag)
      )
      .slice(0, 8); // Show only top 8 suggestions

    setSuggestions(filteredSuggestions);
    setShowSuggestions(filteredSuggestions.length > 0);
  }, [searchQuery, availableTags, selectedTags]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle key down events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      e.preventDefault();
      // Check if the searched tag exists in available tags
      const exactMatch = availableTags.find(
        (tag) => tag.toLowerCase() === searchQuery.trim().toLowerCase()
      );
      if (exactMatch && !selectedTags.includes(exactMatch)) {
        onTagAdd(exactMatch);
        onSearchChange("");
        setShowSuggestions(false);
      } else if (suggestions.length > 0) {
        // Add first suggestion if no exact match
        onTagAdd(suggestions[0]);
        onSearchChange("");
        setShowSuggestions(false);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (tag: string) => {
    onTagAdd(tag);
    onSearchChange("");
    setShowSuggestions(false);
    // Focus back to input
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Clear all tags function
  const handleClearAllTags = () => {
    selectedTags.forEach((tag) => onTagRemove(tag));
  };

  return (
    <div
      style={{
        background: "rgba(235, 232, 226, 1)",
        borderRadius: "20px",
        padding: "24px",
        position: "relative",
      }}
    >
      {/* Search Bar with Suggestions */}
      <div
        style={{
          position: "relative",
          marginBottom: "20px",
        }}
      >
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search for anything"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchQuery.trim() !== "" && setShowSuggestions(true)}
          style={{
            width: "100%",
            color: "#666",
            border: "none",
            fontSize: "1.1rem",
            outline: "none",
            fontWeight: "400",
            textAlign: "center",
          }}
        />

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "white",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              zIndex: 1000,
              marginTop: "4px",
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {suggestions.map((tag, index) => (
              <div
                key={tag}
                onClick={() => handleSuggestionClick(tag)}
                style={{
                  padding: "12px 20px",
                  cursor: "pointer",
                  borderBottom:
                    index < suggestions.length - 1 ? "1px solid #eee" : "none",
                  color: "#333",
                  fontSize: "1rem",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "white";
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Tags Chips */}
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

          {/* Clear All Tags Button */}
          {selectedTags.length > 1 && (
            <button
              onClick={handleClearAllTags}
              style={{
                background: "rgba(160, 160, 160, 1)",
                border: "none",
                borderRadius: "20px",
                padding: "8px 16px",
                fontSize: "0.8rem",
                fontWeight: "500",
                color: "#333",
                cursor: "pointer",
                textTransform: "uppercase",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(140, 140, 140, 1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(160, 160, 160, 1)";
              }}
            >
              Clear All
            </button>
          )}
        </div>
      )}

      {/* Sort Dropdown */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
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
