import { Orbitron } from "next/font/google";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700"],
});

interface UploadPhotoModalProps {
  isModalVisible: boolean;
  isDragOver: boolean;
  selectedFile: File | null;
  imageName: string;
  description: string;
  selectedCategory: string;
  cityCountry: string;
  artistName: string;
  visibility: string;
  onCloseButtonClick: () => void;
  handleDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  handleFileSelect: (
    file: File,
    setSelectedFile: (file: File | null) => void
  ) => void;
  imageNameOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  descriptionOnChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  selectedCategoryOnChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  cityCountryOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  artistNameOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  visibilityOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  newTag: string;
  tags: string[];
  setNewTag: (newTag: string) => void;
  setTags: (tags: string[]) => void;
  addTag: (
    tag: string,
    tags: string[],
    setTags: (tags: string[]) => void
  ) => void;
  removeTag: (
    tag: string,
    tags: string[],
    setTags: (tags: string[]) => void
  ) => void;
  agreedToTerms: boolean;
  setAgreedToTerms: (agreedToTerms: boolean) => void;
}

const UploadPhotoModal = ({
  isModalVisible,
  isDragOver,
  selectedFile,
  imageName,
  description,
  selectedCategory,
  cityCountry,
  artistName,
  visibility,
  onCloseButtonClick,
  handleDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  handleFileSelect,
  imageNameOnChange,
  descriptionOnChange,
  selectedCategoryOnChange,
  cityCountryOnChange,
  artistNameOnChange,
  visibilityOnChange,
  newTag,
  tags,
  setNewTag,
  setTags,
  addTag,
  removeTag,
  agreedToTerms,
  setAgreedToTerms,
}: UploadPhotoModalProps) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#E5E5E0",
        display: "flex",
        flexDirection: "column",
        zIndex: 2000,
        overflow: "auto",
        opacity: isModalVisible ? 1 : 0,
        transform: isModalVisible ? "translateY(0)" : "translateY(100%)",
        transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px",
          borderBottom: "1px solid #ccc",
          opacity: isModalVisible ? 1 : 0,
          transform: isModalVisible ? "translateY(0)" : "translateY(-20px)",
          transition:
            "opacity 0.4s ease-in-out 0.1s, transform 0.4s ease-in-out 0.1s",
        }}
      >
        <h2
          className={orbitron.className}
          style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            color: "#333",
            margin: 0,
          }}
        >
          UPLOAD FILE
        </h2>
        <button
          onClick={onCloseButtonClick}
          style={{
            background: "none",
            border: "none",
            fontSize: "32px",
            cursor: "pointer",
            color: "#333",
            padding: 0,
            lineHeight: 1,
            transition: "transform 0.2s ease, color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.color = "#666";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.color = "#333";
          }}
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          maxWidth: "600px",
          margin: "0 auto",
          width: "100%",
          opacity: isModalVisible ? 1 : 0,
          transform: isModalVisible ? "translateY(0)" : "translateY(20px)",
          transition:
            "opacity 0.5s ease-in-out 0.2s, transform 0.5s ease-in-out 0.2s",
        }}
      >
        {/* File Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                handleFileSelect(file, setSelectedFile);
              }
            };
            input.click();
          }}
          style={{
            border: `2px dashed ${isDragOver ? "#007bff" : "#ccc"}`,
            borderRadius: "8px",
            padding: "60px 40px",
            textAlign: "center",
            backgroundColor: isDragOver ? "#f0f8ff" : "#f9f9f9",
            cursor: "pointer",
            transition: "all 0.3s ease",
            minHeight: "200px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {selectedFile ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Selected file preview"
                style={{
                  maxWidth: "200px",
                  maxHeight: "200px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
              <div style={{ textAlign: "center" }}>
                <p
                  style={{
                    color: "#333",
                    margin: "0 0 8px 0",
                    fontWeight: "600",
                  }}
                >
                  {selectedFile.name}
                </p>
                <p style={{ color: "#666", margin: 0, fontSize: "14px" }}>
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <p
                  style={{
                    color: "#007bff",
                    margin: "8px 0 0 0",
                    fontSize: "14px",
                  }}
                >
                  Click to change file
                </p>
              </div>
            </div>
          ) : (
            <>
              <div
                style={{
                  fontSize: "48px",
                  color: "#999",
                  marginBottom: "16px",
                }}
              >
                📁
              </div>
              <p
                style={{
                  color: "#666",
                  margin: "0 0 8px 0",
                  fontSize: "16px",
                }}
              >
                Click to upload or drag and drop
              </p>
              <p style={{ color: "#999", margin: 0, fontSize: "14px" }}>
                Supports: JPG, PNG, GIF, WebP
              </p>
            </>
          )}
        </div>

        {/* Form Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Image Name Input */}
          <div>
            <label
              style={{
                display: "block",
                color: "#333",
                marginBottom: "4px",
                fontSize: "14px",
              }}
            >
              Image Name (optional):
            </label>
            <input
              type="text"
              value={imageName}
              onChange={imageNameOnChange}
              placeholder="Enter image name"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "1rem",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Description Input */}
          <div>
            <label
              style={{
                display: "block",
                color: "#333",
                marginBottom: "4px",
                fontSize: "14px",
              }}
            >
              Description:
            </label>
            <textarea
              value={description}
              onChange={descriptionOnChange}
              placeholder="Enter image description"
              rows={3}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "1rem",
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={selectedCategoryOnChange}
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
              <option value="">Select a Category</option>
              <option value="posters">Posters</option>
              <option value="stickers">Stickers</option>
              <option value="flyers">Flyers</option>
              <option value="banners">Banners</option>
              <option value="pamphlets">Pamphlets</option>
              <option value="tactics">Tactics</option>
              <option value="techniques">Techniques</option>
              <option value="allmedia">All Media</option>
              <option value="default">Default</option>
              <option value="tbd">TBD</option>
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
              City, Country (optional): ℹ️
            </label>
            <input
              type="text"
              value={cityCountry}
              onChange={cityCountryOnChange}
              placeholder="Type and select"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "1rem",
                boxSizing: "border-box",
              }}
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
              value={artistName}
              onChange={artistNameOnChange}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "1rem",
                boxSizing: "border-box",
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
                  checked={visibility === "visible"}
                  onChange={visibilityOnChange}
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
                  checked={visibility === "hidden"}
                  onChange={visibilityOnChange}
                  style={{ marginRight: "8px" }}
                />
                Hidden
              </label>
            </div>
          </div>

          {/* Tags Section */}
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
              onChange={newTagOnChange}
              placeholder="Search tags"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag(newTag, tags, setTags);
                  setNewTag("");
                }
              }}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "1rem",
                marginBottom: "8px",
                boxSizing: "border-box",
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
                    onClick={() => removeTag(tag, tags, setTags)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: "16px",
                      padding: 0,
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
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
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
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

          {/* Upload Button */}
          <button
            disabled={
              !agreedToTerms || !selectedCategory || !selectedFile || uploading
            }
            onClick={async () => {
              await uploadImage(
                selectedFile!,
                imageName,
                description,
                tags,
                selectedCategory,
                cityCountry,
                artistName,
                visibility,
                setUploading,
                setUploadError,
                async () => {
                  closeModal(
                    setShowUploadModal,
                    setIsModalVisible,
                    setIsModalAnimating,
                    setSelectedFile,
                    setSelectedCategory,
                    setCityCountry,
                    setArtistName,
                    setVisibility,
                    setTags,
                    setNewTag,
                    setAgreedToTerms,
                    setDescription,
                    setImageName
                  );
                  await refreshImages();
                },
                setToast
              );
            }}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor:
                agreedToTerms && selectedCategory && selectedFile && !uploading
                  ? "#666"
                  : "#ccc",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "1rem",
              cursor:
                agreedToTerms && selectedCategory && selectedFile && !uploading
                  ? "pointer"
                  : "not-allowed",
              fontWeight: "600",
            }}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};
