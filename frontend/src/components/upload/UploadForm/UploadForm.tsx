"use client";
import React from "react";
import { UploadFormProps, CATEGORY_OPTIONS } from "../types/upload.types";
import CountryCityInput from "../CountryCityInput";
import Autocomplete from "react-google-autocomplete";

const UploadForm: React.FC<UploadFormProps> = ({
  formData,
  onFormDataChange,
  uploadError,
}) => {
  const handleInputChange =
    (field: keyof typeof formData) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      onFormDataChange({ [field]: e.target.value });
    };

  const handleCheckboxChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFormDataChange({ [field]: e.target.checked });
    };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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

      {/* City, Country Input */}
      <div>
        <label
          style={{
            display: "block",
            color: "#333",
            marginBottom: "4px",
            fontSize: "14px",
          }}
        >
          City, Country, Damil (optional): ℹ️
        </label>
        {/* <Autocomplete
          apiKey={"AIzaSyDsBGsKouTzO3_OJQHabcSZEk35InyYdFQ"}
          onPlaceSelected={(place) => {
            console.log(place);
          }}
        /> */}
        <CountryCityInput
          value={formData.cityCountry}
          onChange={(value) => onFormDataChange({ cityCountry: value })}
          placeholder="Type city or country name"
        />
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
          Artist Name/Alias (optional): ℹ️
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
          I agree to the Terms and Conditions
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
