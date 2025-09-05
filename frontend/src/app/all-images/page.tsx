"use client";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { UploadModal, useModalAnimation, Image } from "@/components/upload";
import SearchInterface from "@/components/SearchInterface";
import ImageGrid from "@/components/ImageGrid";
import ImageModal from "@/components/categoryPage/components/ImageModal";
import { useAllImages } from "@/hooks/useAllImages";

export default function AllImagesPage() {
  // State for filters and UI
  const [sortBy, setSortBy] = useState<
    "recent" | "name" | "size" | "downloaded"
  >("downloaded");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [fileTypeFilter, setFileTypeFilter] = useState<string>("all");
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deviceId, setDeviceId] = useState<string>("");
  const [pageLoaded, setPageLoaded] = useState(false);

  const modalAnimation = useModalAnimation();

  // Use the custom hook for images data
  const {
    images,
    loading,
    loadingMore,
    error,
    pagination,
    filteredAndSortedImages,
    allTags,
    refreshImages,
    loadMoreImages,
  } = useAllImages({
    searchQuery,
    selectedTags,
    fileTypeFilter,
    sortBy,
  });

  // Page animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Get or generate deviceId from localStorage
  useEffect(() => {
    let id = localStorage.getItem("deviceId");
    if (!id) {
      id = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem("deviceId", id);
    }
    setDeviceId(id);
  }, []);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 1000 && // Load when 1000px from bottom
        !loadingMore &&
        pagination.hasMore
      ) {
        loadMoreImages();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadingMore, pagination.hasMore, pagination.page, loadMoreImages]);

  // Handle tag selection
  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Add tag to selected tags
  const handleTagAdd = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags((prev) => [...prev, tag]);
    }
  };

  // Remove tag from selected tags
  const removeTag = (tagToRemove: string) => {
    setSelectedTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
    setFileTypeFilter("all");
    setSortBy("downloaded");
  };

  // Handle image click
  const handleImageClick = (image: Image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    modalAnimation.closeModal();
    setTimeout(() => {
      setShowUploadModal(false);
    }, 300);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => {
          setShowUploadModal(true);
          modalAnimation.openModal();
        }}
        style={{
          position: "fixed",
          left: "50%",
          bottom: 32,
          transform: "translateX(-50%)",
          background: "#EBE8E2",
          color: "#222",
          border: "none",
          borderRadius: "50%",
          width: 56,
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
          cursor: "pointer",
          zIndex: 1000,
          opacity: pageLoaded ? 1 : 0,
          transition: "opacity 0.5s ease 1s",
        }}
        aria-label="Add Image"
      >
        +
      </button>

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={handleCloseModal}
        onUploadSuccess={refreshImages}
        setToast={(message) => {
          if (message?.type === "success") {
            toast.success(message.message);
          } else if (message?.type === "error") {
            toast.error(message.message);
          }
        }}
        isVisible={modalAnimation.isVisible}
        isAnimating={modalAnimation.isAnimating}
      />

      <div
        className={`page-container ${pageLoaded ? "page-loaded" : ""}`}
        style={{
          minHeight: "100vh",
          background: "rgba(31, 33, 35, 1)",
          fontFamily: "var(--font-ibm-plex-mono), monospace",
          transform: pageLoaded ? "translateY(0)" : "translateY(100vh)",
          transition: "transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          opacity: pageLoaded ? 1 : 0,
        }}
      >
        {/* Search Interface */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            marginTop: "32px",
            marginBottom: "16px",
          }}
        >
          <div style={{ width: "80%", maxWidth: "400px" }}>
            <SearchInterface
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedTags={selectedTags}
              availableTags={allTags}
              onTagToggle={handleTagToggle}
              onTagRemove={removeTag}
              onTagAdd={handleTagAdd}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>
        </div>

        {/* Main Content */}
        <div style={{ marginTop: 0 }}>
          {error && (
            <div
              style={{
                background: "rgba(220, 53, 69, 0.1)",
                border: "1px solid rgba(220, 53, 69, 0.3)",
                borderRadius: "8px",
                padding: "16px",
                margin: "16px 0",
                color: "#ff6b6b",
                textAlign: "center",
              }}
            >
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Image Grid */}
          <ImageGrid
            images={filteredAndSortedImages}
            loading={loading}
            onImageClick={handleImageClick}
          />

          {/* No Results Messages */}
          {filteredAndSortedImages.length === 0 &&
            images.length > 0 &&
            !loading && (
              <div
                style={{
                  textAlign: "center",
                  padding: "16px",
                  color: "#888",
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
                <h3 style={{ color: "#EBE8E2", marginBottom: "8px" }}>
                  No matches found
                </h3>
                <p>Try adjusting your search or filter criteria.</p>
                <button
                  onClick={clearFilters}
                  style={{
                    marginTop: "16px",
                    padding: "8px 16px",
                    background: "rgba(235, 232, 226, 0.1)",
                    color: "#EBE8E2",
                    border: "1px solid #444",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(235, 232, 226, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "rgba(235, 232, 226, 0.1)";
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            )}

          {/* Empty State for No Images Found */}
          {images.length === 0 && !loading && (
            <div
              style={{
                textAlign: "center",
                padding: "48px 16px",
                color: "#888",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📷</div>
              <h3 style={{ color: "#EBE8E2", marginBottom: "8px" }}>
                No images found
              </h3>
              <p>No images available yet.</p>
            </div>
          )}

          {/* Load More Button - Fallback for manual loading */}
          {!loading && pagination.hasMore && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "32px 16px",
              }}
            >
              <button
                onClick={loadMoreImages}
                disabled={loadingMore}
                style={{
                  padding: "12px 24px",
                  background: loadingMore ? "#666" : "#EBE8E2",
                  color: loadingMore ? "#ccc" : "#222",
                  border: "none",
                  borderRadius: "6px",
                  cursor: loadingMore ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                }}
              >
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}

          {/* Loading indicator for infinite scroll */}
          {loadingMore && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "16px",
                color: "#888",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    border: "2px solid #444",
                    borderTop: "2px solid #EBE8E2",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                Loading more images...
              </div>
            </div>
          )}

          {/* Pagination info */}
          {!loading && images.length > 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "16px",
                color: "#888",
                fontSize: "0.9rem",
              }}
            >
              Showing {images.length} images
              {!pagination.hasMore && " • All pages loaded"}
            </div>
          )}
        </div>

        {/* Image Preview Modal */}
        <ImageModal
          image={selectedImage}
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          onDownload={(image) => {
            // Handle download functionality
            const link = document.createElement("a");
            link.href =
              image.gatewayUrl ||
              `https://copper-delicate-louse-351.mypinata.cloud/ipfs/${image.ipfsHash}`;
            link.download = image.name;
            link.click();
          }}
        />

        {/* Enhanced CSS for hover effects and animations */}
        <style jsx>{`
          .page-container {
            will-change: transform, opacity;
          }

          .page-container.page-loaded {
            transform: translateY(0) !important;
            opacity: 1 !important;
          }

          .image-container:hover .image-info {
            opacity: 1 !important;
          }

          .image-container:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3) !important;
          }

          .image-container:hover img {
            transform: scale(1.02) !important;
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }

          /* Responsive Design */
          @media (max-width: 1024px) {
            .image-container {
              animation-delay: 0s !important;
            }
          }

          @media (max-width: 768px) {
            .image-container {
              animation-delay: 0s !important;
            }

            .image-container:hover {
              transform: none !important;
              box-shadow: none !important;
            }

            .image-container:hover img {
              transform: none !important;
            }

            div[style*="gridTemplateColumns"] {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }

          @media (max-width: 480px) {
            input[type="text"] {
              font-size: 0.9rem !important;
              padding: 10px 10px 10px 40px !important;
            }
          }

          @media (min-width: 769px) {
            div[style*="gridTemplateColumns"] {
              grid-template-columns: repeat(3, 1fr) !important;
            }
          }

          * {
            box-sizing: border-box;
          }
        `}</style>
      </div>
    </>
  );
}
