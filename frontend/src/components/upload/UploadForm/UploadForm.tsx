"use client";
import React, { useRef, useEffect, useState } from "react";
import { UploadFormProps, CATEGORY_OPTIONS } from "../types/upload.types";

// Define types for Mapbox API responses
interface MapboxFeature {
  id: string;
  text: string;
  place_name: string;
  properties: Record<string, unknown>;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
}

interface MapboxResponse {
  features: MapboxFeature[];
  type: string;
  query: string[];
}

const UploadForm: React.FC<UploadFormProps> = ({
  formData,
  onFormDataChange,
  uploadError,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Replace with your Mapbox access token
  const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;

  const debounce = <T extends unknown[]>(
    func: (...args: T) => void,
    delay: number
  ) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: T) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const searchPlaces = async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${MAPBOX_ACCESS_TOKEN}&types=place,locality,postcode&limit=5`
      );

      if (response.ok) {
        const data: MapboxResponse = await response.json();
        setSuggestions(data.features || []);
        setShowSuggestions(true);
      } else {
        console.error("Failed to fetch suggestions");
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = debounce(searchPlaces, 300);

  const handleInputChange =
    (field: keyof typeof formData) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const value = e.target.value;
      onFormDataChange({ [field]: value });

      if (field === "cityCountry") {
        debouncedSearch(value);
      }
    };

  const handleSuggestionClick = (suggestion: MapboxFeature) => {
    onFormDataChange({ cityCountry: suggestion.place_name });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleCheckboxChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFormDataChange({ [field]: e.target.checked });
    };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <style jsx>{`
        .tooltip {
          position: relative;
          display: inline-block;
          cursor: help;
        }

        .tooltip .tooltiptext {
          visibility: hidden;
          width: 300px;
          background-color: #333;
          color: #fff;
          text-align: left;
          border-radius: 6px;
          padding: 8px 12px;
          position: absolute;
          z-index: 1001;
          bottom: 125%;
          left: 50%;
          margin-left: -150px;
          opacity: 0;
          transition: opacity 0.3s;
          font-size: 12px;
          line-height: 1.4;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .tooltip .tooltiptext::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          margin-left: -5px;
          border-width: 5px;
          border-style: solid;
          border-color: #333 transparent transparent transparent;
        }

        .tooltip:hover .tooltiptext {
          visibility: visible;
          opacity: 1;
        }
      `}</style>
      <div>
        <select
          value={formData.selectedCategory}
          onChange={handleInputChange("selectedCategory")}
          style={{
            width: "100%",
            padding: "12px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "1rem",
            backgroundColor: "#666",
            color: "#fff",
          }}
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* City, Country Input with Mapbox Autocomplete */}
      <div style={{ position: "relative" }}>
        <label
          style={{
            display: "block",
            color: "#333",
            marginBottom: "4px",
            fontSize: "14px",
          }}
        >
          City, Country (optional):{" "}
          <span className="tooltip">
            ℹ️
            <span className="tooltiptext">
              We will introduce a feature that lets you adapt the languages of
              files. This is for you to see both the origin of eg a poster, as
              well as in which places its been adapted.
            </span>
          </span>
        </label>
        <input
          ref={inputRef}
          type="text"
          value={formData.cityCountry}
          onChange={handleInputChange("cityCountry")}
          placeholder="Type city or country name"
          style={{
            width: "100%",
            padding: "12px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "1rem",
            boxSizing: "border-box",
            color: "#333",
            backgroundColor: "#fff",
          }}
        />

        {/* Loading indicator */}
        {isLoading && (
          <div
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "12px",
              color: "#666",
            }}
          >
            Loading...
          </div>
        )}

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            style={{
              position: "absolute",
              top: "100%",
              left: "0",
              right: "0",
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderTop: "none",
              borderRadius: "0 0 4px 4px",
              maxHeight: "200px",
              overflowY: "auto",
              zIndex: 1000,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.id}-${index}`}
                onClick={() => handleSuggestionClick(suggestion)}
                style={{
                  padding: "12px",
                  cursor: "pointer",
                  borderBottom:
                    index < suggestions.length - 1 ? "1px solid #eee" : "none",
                  backgroundColor: "#fff",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#fff";
                }}
              >
                <div style={{ fontWeight: "500", color: "#333" }}>
                  {suggestion.text}
                </div>
                <div
                  style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}
                >
                  {suggestion.place_name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Artist Name Input */}
      <div>
        <label
          style={{
            display: "block",
            color: "#333",
            marginBottom: "4px",
            fontSize: "14px",
          }}
        >
          Node Name (optional):{" "}
          <span className="tooltip">
            ℹ️
            <span className="tooltiptext">
              What? Nodes are what keeps the archive alive, you and your fellow
              contributors, explorers, wanderers, and If you’d like your chosen
              name connected to your upload, you can choose between two options:
              Visible: your chosen name is visible for others, meaning if
              someone likes your art, they’d have the chance to find your work
              elsewhere. Hidden: your alias is hidden and only visible
              internally. What for? We’ll be curating a selection of the most
              downloaded 🔻 contributions to the archive on a quarterly basis.
              We’ll print them as part of WPR pillar 4 (to be revealed) and want
              to give a share of the earnings to those who‘s contribution has
              been selected. *if you prefer, just type in a secure email address
              like proton mail for us to contact you.
            </span>
          </span>
        </label>
        <input
          type="text"
          value={formData.artistName}
          onChange={handleInputChange("artistName")}
          style={{
            width: "100%",
            padding: "12px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "1rem",
            boxSizing: "border-box",
            color: "#333",
            backgroundColor: "#fff",
          }}
        />
      </div>

      {/* Visibility Radio Buttons */}
      <div>
        <div style={{ display: "flex", gap: "16px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              color: "#333",
            }}
          >
            <input
              type="radio"
              value="visible"
              checked={formData.visibility === "visible"}
              onChange={handleInputChange("visibility")}
              style={{ marginRight: "8px" }}
            />
            Visible
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              color: "#333",
            }}
          >
            <input
              type="radio"
              value="hidden"
              checked={formData.visibility === "hidden"}
              onChange={handleInputChange("visibility")}
              style={{ marginRight: "8px" }}
            />
            Hidden
          </label>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            color: "#333",
            fontSize: "14px",
          }}
        >
          <input
            type="checkbox"
            checked={formData.agreedToTerms}
            onChange={handleCheckboxChange("agreedToTerms")}
            style={{ marginRight: "8px" }}
          />
          By uploading this file, I confirm that it is open for collective
          downloading, printing, and distribution.
        </label>
      </div>

      {/* Upload Error */}
      {uploadError && (
        <div
          style={{
            color: "#d32f2f",
            backgroundColor: "#ffebee",
            padding: "12px",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        >
          {uploadError}
        </div>
      )}
    </div>
  );
};

export default UploadForm;
