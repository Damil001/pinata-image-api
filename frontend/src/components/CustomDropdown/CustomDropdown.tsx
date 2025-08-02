"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: string;
}

export interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  disabled = false,
  id,
  "aria-label": ariaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Find the selected option
  const selectedOption = options.find((option) => option.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) return;

      switch (event.key) {
        case "Enter":
        case " ":
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setFocusedIndex(0);
          } else if (focusedIndex >= 0) {
            onChange(options[focusedIndex].value);
            setIsOpen(false);
            setFocusedIndex(-1);
            buttonRef.current?.focus();
          }
          break;
        case "Escape":
          event.preventDefault();
          setIsOpen(false);
          setFocusedIndex(-1);
          buttonRef.current?.focus();
          break;
        case "ArrowDown":
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setFocusedIndex(0);
          } else {
            setFocusedIndex((prev) =>
              prev < options.length - 1 ? prev + 1 : 0
            );
          }
          break;
        case "ArrowUp":
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setFocusedIndex(options.length - 1);
          } else {
            setFocusedIndex((prev) =>
              prev > 0 ? prev - 1 : options.length - 1
            );
          }
          break;
        case "Tab":
          if (isOpen) {
            setIsOpen(false);
            setFocusedIndex(-1);
          }
          break;
      }
    },
    [disabled, isOpen, focusedIndex, options, onChange]
  );

  // Handle option click
  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setFocusedIndex(-1);
    buttonRef.current?.focus();
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setFocusedIndex(0);
    } else {
      setFocusedIndex(-1);
    }
  };

  return (
    <div
      ref={dropdownRef}
      className={`custom-dropdown ${className}`}
      style={{ position: "relative", display: "inline-block", width: "100%" }}
    >
      <button
        ref={buttonRef}
        id={id}
        type="button"
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-describedby={id ? `${id}-description` : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          minWidth: "200px",
          padding: "8px 12px",
          background: "#222",
          color: "#EBE8E2",
          border: "1px solid #444",
          borderRadius: "8px",
          fontSize: "1rem",
          fontWeight: "500",
          cursor: disabled ? "not-allowed" : "pointer",
          outline: "none",
          transition: "all 0.2s ease",
          opacity: disabled ? 0.6 : 1,
        }}
        className="dropdown-button"
      >
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {selectedOption?.icon && (
            <span style={{ fontSize: "16px" }}>{selectedOption.icon}</span>
          )}
          <span>{selectedOption?.label || placeholder}</span>
        </span>
        <svg
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            marginLeft: "8px",
          }}
        >
          <path
            d="M1 1.5L6 6.5L11 1.5"
            stroke="#EBE8E2"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          aria-labelledby={id}
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 1000,
            background: "#222",
            border: "1px solid #444",
            borderRadius: "8px",
            marginTop: "4px",
            padding: "4px 0",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
            maxHeight: "200px",
            overflowY: "auto",
            animation: "dropdownSlideIn 0.2s ease-out",
          }}
          className="dropdown-list"
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              onClick={() => handleOptionClick(option.value)}
              onMouseEnter={() => setFocusedIndex(index)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 12px",
                color: "#EBE8E2",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "500",
                background:
                  index === focusedIndex
                    ? "rgba(235, 232, 226, 0.1)"
                    : option.value === value
                    ? "rgba(235, 232, 226, 0.05)"
                    : "transparent",
                transition: "background-color 0.15s ease",
              }}
              className="dropdown-option"
            >
              {option.icon && (
                <span style={{ fontSize: "16px" }}>{option.icon}</span>
              )}
              <span>{option.label}</span>
            </li>
          ))}
        </ul>
      )}

      <style jsx>{`
        @keyframes dropdownSlideIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-button:hover:not(:disabled) {
          border-color: #666 !important;
          background: #2a2a2a !important;
        }

        .dropdown-button:focus {
          border-color: #ebe8e2 !important;
          box-shadow: 0 0 0 2px rgba(235, 232, 226, 0.2) !important;
        }

        .dropdown-option:hover {
          background: rgba(235, 232, 226, 0.15) !important;
        }

        .dropdown-list::-webkit-scrollbar {
          width: 6px;
        }

        .dropdown-list::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 3px;
        }

        .dropdown-list::-webkit-scrollbar-thumb {
          background: #444;
          border-radius: 3px;
        }

        .dropdown-list::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        @media (max-width: 768px) {
          .custom-dropdown .dropdown-button {
            min-width: 160px !important;
            font-size: 0.9rem !important;
            padding: 6px 10px !important;
          }

          .custom-dropdown .dropdown-option {
            font-size: 0.9rem !important;
            padding: 8px 10px !important;
          }
        }

        @media (max-width: 480px) {
          .custom-dropdown .dropdown-button {
            min-width: 140px !important;
            font-size: 0.85rem !important;
          }

          .custom-dropdown .dropdown-option {
            font-size: 0.85rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomDropdown;
