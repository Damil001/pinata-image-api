"use client";
import React, { useState } from "react";
import { isPDFFile, isImageFile, getFileType } from "@/utils/fileUtils";

const FileTypeTester: React.FC = () => {
  const [testFileName, setTestFileName] = useState("test.pdf");

  const testFiles = [
    "document.pdf",
    "image.jpg",
    "photo.png",
    "file.gif",
    "document.PDF",
    "IMAGE.JPG",
    "test.txt",
    "archive.zip",
  ];

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        left: "10px",
        background: "white",
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "16px",
        maxWidth: "300px",
        zIndex: 9999,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      <h3 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>
        File Type Tester
      </h3>

      <div style={{ marginBottom: "12px" }}>
        <input
          type="text"
          value={testFileName}
          onChange={(e) => setTestFileName(e.target.value)}
          placeholder="Enter filename"
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "12px",
          }}
        />
      </div>

      <div style={{ fontSize: "12px", marginBottom: "12px" }}>
        <div>
          <strong>isPDFFile:</strong> {isPDFFile(testFileName) ? "✅" : "❌"}
        </div>
        <div>
          <strong>isImageFile:</strong>{" "}
          {isImageFile(testFileName) ? "✅" : "❌"}
        </div>
        <div>
          <strong>getFileType:</strong> {getFileType(testFileName)}
        </div>
      </div>

      <div style={{ fontSize: "11px" }}>
        <h4 style={{ margin: "0 0 8px 0" }}>Test Files:</h4>
        {testFiles.map((file, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "2px 0",
              borderBottom: "1px solid #eee",
            }}
          >
            <span>{file}</span>
            <span>{getFileType(file)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileTypeTester;
