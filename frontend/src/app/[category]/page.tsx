"use client";
import { useParams } from "next/navigation";
import { Orbitron } from "next/font/google";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { UploadModal, useModalAnimation, Image } from "@/components/upload";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Helper function to programmatically download an image and record download in backend
async function downloadImage(
  image: Image,
  deviceId: string,
  refreshImages: () => Promise<void>
) {
  try {
    // Call backend to record download
    const response = await fetch(
      "https://pinata-image-api.onrender.com/api/download",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageId: image.ipfsHash, // Use ipfsHash as imageId
          deviceId: deviceId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to record download: ${response.statusText}`);
    }

    // Download the file
    const blobResponse = await fetch(image.gatewayUrl);
    const blob = await blobResponse.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = image.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 200);

    // Refresh images to update download counts
    await refreshImages();
  } catch (error) {
    console.error("Download error:", error);
    alert("Failed to download image or record download.");
  }
}

export default function CategoryPage() {
  const params = useParams();
  const { category } = params;

  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"recent" | "downloaded">("recent");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deviceId, setDeviceId] = useState<string>("");

  const modalAnimation = useModalAnimation();

  // Get or generate deviceId from localStorage
  useEffect(() => {
    let id = localStorage.getItem("deviceId");
    if (!id) {
      id = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem("deviceId", id);
    }
    setDeviceId(id);
  }, []);

  // Fetch images and their download counts
  useEffect(() => {
    async function fetchImages() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          "https://pinata-image-api.onrender.com/api/images"
        );
        console.log(res);
        const data: { success: boolean; images: Image[] } = await res.json();
        if (data.success) {
          // Fetch download counts for each image
          const imagesWithDownloads = await Promise.all(
            data.images.map(async (img) => {
              try {
                const downloadRes = await fetch(
                  `https://pinata-image-api.onrender.com/api/images/${img.ipfsHash}/downloads`
                );
                const downloadData = await downloadRes.json();
                if (downloadData.success) {
                  return {
                    ...img,
                    totalDownloads: downloadData.downloads.total,
                    uniqueDownloads: downloadData.downloads.unique,
                  };
                }
                return { ...img, totalDownloads: 0, uniqueDownloads: 0 };
              } catch (e) {
                console.error(
                  `Failed to fetch downloads for ${img.ipfsHash}:`,
                  e
                );
                return { ...img, totalDownloads: 0, uniqueDownloads: 0 };
              }
            })
          );
          const filtered = imagesWithDownloads.filter(
            (img) =>
              img.metadata?.keyvalues?.category?.toLowerCase() ===
              String(category).toLowerCase()
          );
          setImages(filtered);
        } else {
          setError("Failed to fetch images");
        }
      } catch (e) {
        setError("Failed to fetch images");
      }
      setLoading(false);
    }
    fetchImages();
  }, [category]);

  // Function to refresh images list
  const refreshImages = async () => {
    try {
      const res = await fetch(
        "https://pinata-image-api.onrender.com/api/images"
      );
      const data: { success: boolean; images: Image[] } = await res.json();
      if (data.success) {
        const imagesWithDownloads = await Promise.all(
          data.images.map(async (img) => {
            try {
              const downloadRes = await fetch(
                `https://pinata-image-api.onrender.com/api/images/${img.ipfsHash}/downloads`
              );
              const downloadData = await downloadRes.json();
              if (downloadData.success) {
                return {
                  ...img,
                  totalDownloads: downloadData.downloads.total,
                  uniqueDownloads: downloadData.downloads.unique,
                };
              }
              return { ...img, totalDownloads: 0, uniqueDownloads: 0 };
            } catch (e) {
              console.error(
                `Failed to fetch downloads for ${img.ipfsHash}:`,
                e
              );
              return { ...img, totalDownloads: 0, uniqueDownloads: 0 };
            }
          })
        );
        const filtered = imagesWithDownloads.filter(
          (img) =>
            img.metadata?.keyvalues?.category?.toLowerCase() ===
            String(category).toLowerCase()
        );
        setImages(filtered);
      }
    } catch (e) {
      console.error("Failed to refresh images:", e);
    }
  };

  // Sort images based on filter
  const sortedImages = [...images].sort((a, b) => {
    if (filter === "recent") {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    } else {
      return (b.totalDownloads || 0) - (a.totalDownloads || 0);
    }
  });

  const handleCloseModal = () => {
    modalAnimation.closeModal();
    setTimeout(() => {
      setShowUploadModal(false);
    }, 300);
  };

  return (
    <div>
      <h1
        className={orbitron.className}
        style={{
          fontSize: "2rem",
          fontWeight: "700",
          color: "#EBE8E2",
          textAlign: "right",
          lineHeight: "1",
        }}
      >
        {category}
      </h1>

      {/* Filter Dropdown */}
      <div
        style={{
          margin: "16px 0",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <label
          style={{ color: "#EBE8E2", fontWeight: 600, marginRight: 8 }}
          htmlFor="filter-select"
        >
          Filter:
        </label>
        <select
          id="filter-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value as "recent" | "downloaded")}
          style={{
            padding: "6px 12px",
            border: "1px solid #ccc",
            borderRadius: 4,
            fontSize: "1rem",
            background: "#222",
            color: "#EBE8E2",
            outline: "none",
          }}
        >
          <option value="recent">Most Recent</option>
          <option value="downloaded">Most Downloaded</option>
        </select>
      </div>

      <div
        style={{
          marginTop: 0,
        }}
      >
        {loading && <p>Loading images...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 0,
          }}
        >
          {sortedImages.map((img: Image) => (
            <div
              key={img.id}
              className="image-container"
              style={{
                position: "relative",
                overflow: "hidden",
                background: "#222",
              }}
            >
              <img
                src={img.gatewayUrl}
                alt={img.name}
                style={{
                  width: "100%",
                  height: "130px",
                  maxHeight: "130px",
                  objectFit: "cover",
                  display: "block",
                  transition: "filter 0.2s",
                }}
              />
              <button
                onClick={() => downloadImage(img, deviceId, refreshImages)}
                className="download-btn"
                style={{
                  position: "absolute",
                  bottom: 16,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(0,0,0,0.7)",
                  color: "#fff",
                  border: "none",
                  padding: "8px 16px",
                  opacity: 0,
                  transition: "opacity 0.2s",
                  cursor: "pointer",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "1rem",
                  pointerEvents: "none",
                }}
              >
                Download
              </button>
              {/* Display download count */}
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  background: "rgba(0,0,0,0.7)",
                  color: "#fff",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
              >
                Downloads: {img.totalDownloads || 0}
              </div>
            </div>
          ))}
        </div>
        {!loading && images.length === 0 && (
          <p>No images found for this category.</p>
        )}
      </div>

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

      {/* Fixed CSS for hover effect */}
      <style jsx>{`
        .image-container:hover .download-btn {
          opacity: 1 !important;
          pointer-events: auto !important;
        }
      `}</style>
    </div>
  );
}
