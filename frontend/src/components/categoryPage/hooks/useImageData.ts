import { useState, useEffect } from "react";
import { Image, Pagination } from "../types";

export const useImageData = (category: string) => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    hasMore: true,
  });

  // Helper function to remove duplicates based on ipfsHash
  const removeDuplicates = (imageArray: Image[]): Image[] => {
    const seen = new Set<string>();
    return imageArray.filter((img) => {
      if (seen.has(img.ipfsHash)) {
        return false;
      }
      seen.add(img.ipfsHash);
      return true;
    });
  };

  // Fetch images with download counts and pagination
  const fetchImages = async (
    page: number = 1,
    append: boolean = false,
    retryCount: number = 0
  ) => {
    if (!append) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const API_BASE_URL =
        process.env.NODE_ENV === "development"
          ? "http://localhost:3001"
          : "https://pinata-image-api.onrender.com";

      const res = await fetch(
        `${API_BASE_URL}/api/images?page=${page}&limit=10`,
        {
          // Add timeout for Render free tier
          signal: AbortSignal.timeout(30000), // 30 second timeout
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data: {
        success: boolean;
        images: Image[];
        pagination: { page: number; limit: number; total: number };
      } = await res.json();

      console.log(`Category ${category} - Fetching page ${page}:`, data);

      if (data.success && Array.isArray(data.images)) {
        // Fetch download counts for each image
        const imagesWithDownloads = await Promise.all(
          data.images.map(async (img) => {
            try {
              const downloadRes = await fetch(
                `${API_BASE_URL}/api/images/${img.ipfsHash}/downloads`,
                { signal: AbortSignal.timeout(10000) } // 10 second timeout for individual downloads
              );
              if (downloadRes.ok) {
                const downloadData = await downloadRes.json();
                if (downloadData.success) {
                  const totalDownloads =
                    downloadData.downloads?.total || downloadData.total || 0;
                  const uniqueDownloads =
                    downloadData.downloads?.unique || downloadData.unique || 0;
                  return {
                    ...img,
                    totalDownloads,
                    uniqueDownloads,
                  };
                }
              }
              return { ...img, totalDownloads: 0, uniqueDownloads: 0 };
            } catch (e) {
              console.warn(`Failed to fetch downloads for ${img.ipfsHash}:`, e);
              return { ...img, totalDownloads: 0, uniqueDownloads: 0 };
            }
          })
        );

        // Filter by category
        const filtered = imagesWithDownloads.filter(
          (img) =>
            img.metadata?.keyvalues?.category?.toLowerCase() ===
            String(category).toLowerCase()
        );

        console.log(
          `Category ${category} - Filtered ${filtered.length} images from ${imagesWithDownloads.length} total on page ${page}`
        );

        if (append) {
          setImages((prev) => {
            const combined = [...prev, ...filtered];
            const uniqueImages = removeDuplicates(combined);
            console.log(
              `Category ${category} - Total images after append: ${uniqueImages.length}`
            );
            return uniqueImages;
          });
        } else {
          const uniqueImages = removeDuplicates(filtered);
          setImages(uniqueImages);
          console.log(
            `Category ${category} - Set initial images: ${uniqueImages.length}`
          );
        }

        // FIXED PAGINATION LOGIC:
        const hasMorePages =
          data.pagination.page * data.pagination.limit < data.pagination.total;

        // If we found images on this page OR we haven't checked enough pages yet, keep hasMore true
        // This allows us to continue searching through pages even if some pages have no matching category images
        const shouldKeepSearching =
          hasMorePages &&
          (filtered.length > 0 || // Found images on this page
            data.pagination.page <= 5 || // Haven't searched enough pages yet (search at least 5 pages)
            (append && images.length < 6)); // If we're appending and still don't have many images, keep searching

        setPagination({
          page: data.pagination.page,
          limit: data.pagination.limit,
          total: data.pagination.total,
          hasMore: shouldKeepSearching,
        });

        console.log(
          `Category ${category} - Pagination updated: page=${
            data.pagination.page
          }, hasMorePages=${hasMorePages}, shouldKeepSearching=${shouldKeepSearching}, totalAPIPages=${Math.ceil(
            data.pagination.total / data.pagination.limit
          )}`
        );

        // If this is initial load and we got no images, automatically try next page
        if (!append && filtered.length === 0 && shouldKeepSearching) {
          console.log(
            `Category ${category} - No images on page ${page}, auto-loading next page...`
          );
          // DON'T set loading to false here - keep it true while auto-retrying
          setTimeout(() => {
            fetchImages(page + 1, false, 0); // Try next page as initial load
          }, 1000);
          return; // Early return - don't set loading to false
        }
      } else {
        throw new Error("Invalid response format from API");
      }
    } catch (e: unknown) {
      console.error(`Category ${category} - Fetch error on page ${page}:`, e);

      // Type guard to safely access error properties
      const getErrorMessage = (error: unknown): string => {
        if (error instanceof Error) {
          return error.message;
        }
        if (typeof error === "string") {
          return error;
        }
        return "Unknown error occurred";
      };

      const getErrorName = (error: unknown): string => {
        if (error instanceof Error) {
          return error.name;
        }
        return "";
      };

      const errorMessage = getErrorMessage(e);
      const errorName = getErrorName(e);

      // Retry logic for Render free tier issues
      if (
        retryCount < 2 &&
        (errorName === "AbortError" ||
          errorMessage.includes("timeout") ||
          errorMessage.includes("500") ||
          errorMessage.includes("502") ||
          errorMessage.includes("503"))
      ) {
        console.log(
          `Category ${category} - Retrying page ${page} (attempt ${
            retryCount + 1
          }/3)...`
        );
        setTimeout(() => {
          fetchImages(page, append, retryCount + 1);
        }, (retryCount + 1) * 2000); // 2s, 4s delay
        return; // Early return - don't set loading to false
      }

      setError(`Failed to load images: ${errorMessage}`);

      // Don't clear existing images on append error
      if (!append) {
        setImages([]);
        setPagination((prev) => ({ ...prev, hasMore: false }));
      }
    }

    // Only set loading to false if we're not auto-retrying
    if (!append) {
      setLoading(false);
    } else {
      setLoadingMore(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    console.log(`Category ${category} - Starting initial fetch...`);
    // Reset state when category changes
    setImages([]);
    setError(null);
    setPagination({
      page: 1,
      limit: 10,
      total: 0,
      hasMore: true,
    });
    fetchImages(1, false);
  }, [category]);

  // Load more images
  const loadMoreImages = async () => {
    if (loadingMore || !pagination.hasMore) {
      console.log(
        `Category ${category} - Cannot load more: loadingMore=${loadingMore}, hasMore=${pagination.hasMore}`
      );
      return;
    }

    console.log(
      `Category ${category} - Loading more images, current page: ${pagination.page}, hasMore: ${pagination.hasMore}`
    );
    await fetchImages(pagination.page + 1, true);
  };

  // Refresh images list
  const refreshImages = async () => {
    console.log(`Category ${category} - Refreshing images...`);
    setImages([]);
    setError(null);
    setPagination({
      page: 1,
      limit: 10,
      total: 0,
      hasMore: true,
    });
    await fetchImages(1, false);
  };

  return {
    images,
    loading,
    loadingMore,
    error,
    pagination,
    loadMoreImages,
    refreshImages,
  };
};
