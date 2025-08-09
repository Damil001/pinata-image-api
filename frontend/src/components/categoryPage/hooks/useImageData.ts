import { useState, useEffect, useMemo } from "react";
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

  // Fetch images with download counts and pagination
  const fetchImages = async (page: number = 1, append: boolean = false) => {
    if (!append) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const res = await fetch(
        `https://pinata-image-api.onrender.com/api/images?page=${page}&limit=10`
      );
      const data: {
        success: boolean;
        images: Image[];
        pagination: { page: number; limit: number; total: number };
      } = await res.json();

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
              return { ...img, totalDownloads: 0, uniqueDownloads: 0 };
            } catch (e) {
              return { ...img, totalDownloads: 0, uniqueDownloads: 0 };
            }
          })
        );

        const filtered = imagesWithDownloads.filter(
          (img) =>
            img.metadata?.keyvalues?.category?.toLowerCase() ===
            String(category).toLowerCase()
        );

        if (append) {
          setImages((prev) => [...prev, ...filtered]);
        } else {
          setImages(filtered);
        }

        const hasMorePages =
          data.pagination.page * data.pagination.limit < data.pagination.total;
        const hasMatchingImages = filtered.length > 0;

        setPagination({
          page: data.pagination.page,
          limit: data.pagination.limit,
          total: data.pagination.total,
          hasMore:
            hasMorePages && (hasMatchingImages || data.pagination.page <= 3),
        });
      } else {
        setError("Failed to fetch images");
      }
    } catch (e) {
      setError("Failed to fetch images");
    }

    if (!append) {
      setLoading(false);
    } else {
      setLoadingMore(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchImages(1, false);
  }, [category]);

  // Load more images
  const loadMoreImages = async () => {
    if (!loadingMore && pagination.hasMore) {
      await fetchImages(pagination.page + 1, true);
    }
  };

  // Refresh images list
  const refreshImages = async () => {
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
