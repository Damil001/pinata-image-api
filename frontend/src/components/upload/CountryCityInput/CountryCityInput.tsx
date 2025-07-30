"use client";
import React, { useState, useEffect, useRef } from "react";

interface OpenDataSoftCity {
  fields: {
    city: string;
    country: string;
    region?: string;
    population?: number;
  };
}

interface OpenDataSoftResponse {
  records: OpenDataSoftCity[];
}

interface RestCountry {
  name: {
    common: string;
  };
}

interface CountryCityInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const CountryCityInput: React.FC<CountryCityInputProps> = ({
  value,
  onChange,
  placeholder = "Type city or country name",
}) => {
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounce function to avoid too many API calls
  const debounce = <T extends unknown[]>(
    func: (...args: T) => void,
    wait: number
  ) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: T) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Fetch cities from OpenDataSoft World Cities API (100% FREE)
  const fetchCities = async (query: string) => {
    if (query.length < 2) {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      // OpenDataSoft World Cities API - completely free, no API key needed
      const response = await fetch(
        `https://public.opendatasoft.com/api/records/1.0/search/?dataset=worldcitiespop&q=${encodeURIComponent(
          query
        )}&rows=10&sort=population&facet=country`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: OpenDataSoftResponse = await response.json();

      if (data.records && data.records.length > 0) {
        const suggestions = data.records.map((record) => {
          const city = record.fields.city;
          const country = record.fields.country;
          const region = record.fields.region;

          // Format: "City, Region, Country" or "City, Country"
          if (region && region !== city && region !== country) {
            return `${city}, ${region}, ${country}`;
          } else {
            return `${city}, ${country}`;
          }
        });

        // Remove duplicates and filter out invalid entries
        const uniqueSuggestions = Array.from(new Set(suggestions))
          .filter(
            (suggestion) => suggestion && !suggestion.includes("undefined")
          )
          .slice(0, 8);

        setFilteredSuggestions(uniqueSuggestions);
        setShowSuggestions(uniqueSuggestions.length > 0);
      } else {
        // If no cities found, try REST Countries API for countries
        await fetchCountries(query);
      }
    } catch (error) {
      console.error("OpenDataSoft API failed:", error);
      // Fallback to REST Countries API
      await fetchCountries(query);
    } finally {
      setLoading(false);
    }
  };

  // Fallback to REST Countries API (also completely free)
  const fetchCountries = async (query: string) => {
    try {
      const response = await fetch(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(
          query
        )}?fields=name`
      );

      if (response.ok) {
        const countries = await response.json();

        if (Array.isArray(countries)) {
          const suggestions = countries
            .map((country: RestCountry) => country.name.common)
            .filter((name: string) =>
              name.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, 5);

          setFilteredSuggestions(suggestions);
          setShowSuggestions(suggestions.length > 0);
        }
      } else {
        // Final fallback - allow manual entry
        setFilteredSuggestions([`${query} (manual entry)`]);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("REST Countries API failed:", error);
      // Allow manual entry as final fallback
      setFilteredSuggestions([`${query} (manual entry)`]);
      setShowSuggestions(true);
    }
  };

  // Debounced search function
  const debouncedFetchCities = debounce(fetchCities, 300);

  // Search for cities when input changes
  useEffect(() => {
    if (value.trim()) {
      debouncedFetchCities(value.trim());
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (filteredSuggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        placeholder={loading ? "Searching cities..." : placeholder}
        disabled={loading}
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

      {showSuggestions && (
        <div
          ref={suggestionsRef}
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderTop: "none",
            borderRadius: "0 0 4px 4px",
            maxHeight: "200px",
            overflowY: "auto",
            zIndex: 1000,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              style={{
                padding: "12px",
                cursor: "pointer",
                borderBottom:
                  index < filteredSuggestions.length - 1
                    ? "1px solid #eee"
                    : "none",
                color: "#333",
                fontSize: "1rem",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f5f5f5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#fff";
              }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CountryCityInput;
