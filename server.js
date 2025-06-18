const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Pinata configuration
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;
const PINATA_JWT = process.env.PINATA_JWT;

// Pinata API endpoints
const PINATA_PIN_FILE_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";
const PINATA_PIN_LIST_URL = "https://api.pinata.cloud/data/pinList";

// Helper function to get Pinata headers
const getPinataHeaders = () => {
  if (PINATA_JWT) {
    return {
      Authorization: `Bearer ${PINATA_JWT}`,
    };
  } else {
    return {
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_API_KEY,
    };
  }
};

// Upload image to Pinata
app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // Create form data for Pinata
    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    // Optional metadata
    const metadata = {
      name: req.body.name || req.file.originalname,
      description: req.body.description || "Image uploaded via API",
      tags: req.body.tags ? req.body.tags.split(",") : ["image"],
    };

    formData.append("pinataMetadata", JSON.stringify(metadata));

    // Optional pinning options
    const pinataOptions = {
      cidVersion: 1,
    };
    formData.append("pinataOptions", JSON.stringify(pinataOptions));

    // Upload to Pinata
    const response = await axios.post(PINATA_PIN_FILE_URL, formData, {
      headers: {
        ...getPinataHeaders(),
        ...formData.getHeaders(),
      },
    });

    const result = {
      success: true,
      ipfsHash: response.data.IpfsHash,
      pinSize: response.data.PinSize,
      timestamp: response.data.Timestamp,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
      metadata: metadata,
    };

    res.json(result);
  } catch (error) {
    console.error("Upload error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to upload image",
      details: error.response?.data?.error || error.message,
    });
  }
});

// Get all images from Pinata
app.get("/api/images", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const params = {
      status: "pinned",
      pageLimit: parseInt(limit),
      pageOffset: (parseInt(page) - 1) * parseInt(limit),
    };

    const response = await axios.get(PINATA_PIN_LIST_URL, {
      headers: getPinataHeaders(),
      params: params,
    });

    // Log the raw response for debugging
    console.log(
      "Pinata pinList response:",
      JSON.stringify(response.data, null, 2)
    );

    const images = response.data.rows.map((item) => ({
      id: item.id,
      ipfsHash: item.ipfs_pin_hash,
      size: item.size,
      timestamp: item.date_pinned,
      name: item.metadata?.name || "Untitled",
      description: item.metadata?.keyvalues?.description || "",
      tags: item.metadata?.keyvalues?.tags
        ? Array.isArray(item.metadata.keyvalues.tags)
          ? item.metadata.keyvalues.tags
          : typeof item.metadata.keyvalues.tags === "string"
          ? item.metadata.keyvalues.tags.split(",")
          : []
        : [],
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${item.ipfs_pin_hash}`,
      pinataUrl: `https://pinata.cloud/ipfs/${item.ipfs_pin_hash}`,
    }));

    res.json({
      success: true,
      images: images,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: response.data.count,
      },
    });
  } catch (error) {
    console.error("Fetch error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to fetch images",
      details: error.response?.data?.error || error.message,
    });
  }
});

// Get specific image details
app.get("/api/images/:hash", async (req, res) => {
  try {
    const { hash } = req.params;

    const params = {
      hashContains: hash,
      status: "pinned",
    };

    const response = await axios.get(PINATA_PIN_LIST_URL, {
      headers: getPinataHeaders(),
      params: params,
    });

    const image = response.data.rows.find(
      (item) => item.ipfs_pin_hash === hash
    );

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    const result = {
      success: true,
      image: {
        id: image.id,
        ipfsHash: image.ipfs_pin_hash,
        size: image.size,
        timestamp: image.date_pinned,
        name: image.metadata?.name || "Untitled",
        description: image.metadata?.description || "",
        tags: image.metadata?.tags || [],
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${image.ipfs_pin_hash}`,
        pinataUrl: `https://pinata.cloud/ipfs/${image.ipfs_pin_hash}`,
      },
    };

    res.json(result);
  } catch (error) {
    console.error("Fetch error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to fetch image",
      details: error.response?.data?.error || error.message,
    });
  }
});

// Delete image from Pinata
app.delete("/api/images/:hash", async (req, res) => {
  try {
    const { hash } = req.params;

    await axios.delete(`https://api.pinata.cloud/pinning/unpin/${hash}`, {
      headers: getPinataHeaders(),
    });

    res.json({
      success: true,
      message: "Image unpinned successfully",
      ipfsHash: hash,
    });
  } catch (error) {
    console.error("Delete error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to delete image",
      details: error.response?.data?.error || error.message,
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Pinata Image API is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File size too large" });
    }
  }

  if (error.message === "Only image files are allowed!") {
    return res.status(400).json({ error: "Only image files are allowed" });
  }

  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Pinata Image API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
