"use client";
import React from "react";
import { TagsInputProps } from "../types/upload.types";

const TagsInput: React.FC<TagsInputProps> = ({
  tags,
  onTagsChange,
  placeholder = "Search tags",
  newTag,
  onNewTagChange,
}) => {
  const addTag = (tagText: string) => {
    if (tagText.trim() && !tags.includes(tagText.trim())) {
      onTagsChange([...tags, tagText.trim()]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(newTag);
      onNewTagChange("");
    }
  };

  return (
    <div>
      <label
        style={{
          display: "block",
          color: "#333",
          marginBottom: "8px",
          fontSize: "14px",
        }}
      >
        Tags:
      </label>
      <input
        type="text"
        value={newTag}
        onChange={(e) => onNewTagChange(e.target.value)}
        placeholder={placeholder}
        onKeyPress={handleKeyPress}
        style={{
          width: "100%",
          padding: "12px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          fontSize: "1rem",
          marginBottom: "8px",
          boxSizing: "border-box",
          color: "#333",
          backgroundColor: "#fff",
        }}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {tags.map((tag, index) => (
          <span
            key={index}
            style={{
              backgroundColor: "#666",
              color: "#fff",
              padding: "4px 8px",
              borderRadius: "16px",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontSize: "16px",
                padding: 0,
                lineHeight: 1,
              }}
              aria-label={`Remove ${tag} tag`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default TagsInput;
