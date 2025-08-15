const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const cors = require("cors");
require("dotenv").config();
const OpenAI = require("openai");
const {
  addLike,
  getLikesForImage,
  addDownload,
  getDownloadsForImage,
} = require("./db");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://pinata-image-geynx7pkd-damil001s-projects.vercel.app",
      "https://pinata-image-api.vercel.app",
      "https://pinata-image-git-main-damil001s-projects.vercel.app",
      /\.vercel\.app$/,
      "https://thearchive.weprintrevolution.com",
      "https://www.enterthearchive.com", // Allow all Vercel deployment URLs
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Add CORS debugging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

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

// OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

// Generate alt text for an image using OpenAI Vision API
async function generateAltText(imageBuffer, filename) {
  try {
    // Convert image buffer to base64
    const base64Image = imageBuffer.toString("base64");

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Generate a concise, descriptive alt text for this image. Focus on the main subject and key details. Keep it under 125 characters for accessibility.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 100,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Alt text generation error:", error);
    // Return a default alt text if generation fails
    return `Image of ${filename || "uploaded content"}`;
  }
}

// --- Route Handlers ---

// Upload image to Pinata
async function uploadImageHandler(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // Generate alt text using OpenAI Vision API
    const altText = await generateAltText(
      req.file.buffer,
      req.file.originalname
    );
    console.log(`Generated alt text: ${altText}`);

    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    const metadata = {
      name: req.body.name || req.file.originalname,
      keyvalues: {
        description: req.body.description || "Image uploaded via API",
        altText: altText, // Add the generated alt text
        tags: Array.isArray(req.body.tags)
          ? req.body.tags.join(",")
          : req.body.tags || "",
        category: req.body.category || "",
        location: req.body.location || "",
        artist: req.body.artist || "",
        visibility: req.body.visibility || "visible",
      },
    };

    formData.append("pinataMetadata", JSON.stringify(metadata));
    const pinataOptions = { cidVersion: 1 };
    formData.append("pinataOptions", JSON.stringify(pinataOptions));
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
}

// Get all images from Pinata
async function getAllImagesHandler(req, res) {
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
    const images = response.data.rows.map((item) => ({
      id: item.id,
      ipfsHash: item.ipfs_pin_hash,
      size: item.size,
      timestamp: item.date_pinned,
      name: item.metadata?.name || "Untitled",
      description: item.metadata?.keyvalues?.description || "",
      tags: item.metadata?.keyvalues?.tags
        ? item.metadata.keyvalues.tags.split(",").map((t) => t.trim())
        : [],
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${item.ipfs_pin_hash}`,
      pinataUrl: `https://pinata.cloud/ipfs/${item.ipfs_pin_hash}`,
      metadata: item.metadata,
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
}

// Get images by tag
async function getImagesByTagHandler(req, res) {
  try {
    const { tag, page = 1, limit = 10 } = req.query;
    if (!tag) {
      return res.status(400).json({ error: "Tag is required" });
    }
    const response = await axios.get(PINATA_PIN_LIST_URL, {
      headers: getPinataHeaders(),
      params: {
        status: "pinned",
        pageLimit: 1000,
      },
    });
    const filtered = response.data.rows.filter((item) => {
      const tagsString = item.metadata?.keyvalues?.tags || "";
      const tagsArray = tagsString
        .split(",")
        .map((t) => t.trim().toLowerCase());
      return tagsArray.includes(tag.toLowerCase());
    });
    const start = (page - 1) * limit;
    const end = start + parseInt(limit);
    const paginated = filtered.slice(start, end);
    const images = paginated.map((item) => ({
      id: item.id,
      ipfsHash: item.ipfs_pin_hash,
      size: item.size,
      timestamp: item.date_pinned,
      name: item.metadata?.name || "Untitled",
      description: item.metadata?.keyvalues?.description || "",
      tags: item.metadata?.keyvalues?.tags
        ? item.metadata.keyvalues.tags.split(",").map((t) => t.trim())
        : [],
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${item.ipfs_pin_hash}`,
      pinataUrl: `https://pinata.cloud/ipfs/${item.ipfs_pin_hash}`,
    }));
    res.json({
      success: true,
      images,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filtered.length,
      },
    });
  } catch (error) {
    console.error("Fetch error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to fetch images by tag",
      details: error.response?.data?.error || error.message,
    });
  }
}

// Get specific image details
async function getImageByHashHandler(req, res) {
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
}

// Delete image from Pinata
async function deleteImageHandler(req, res) {
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
}

// Like or dislike an image
app.post("/api/like", async (req, res) => {
  const { imageId, deviceId, action } = req.body;
  if (!imageId || !deviceId || !action) {
    return res
      .status(400)
      .json({ error: "imageId, deviceId, and action are required" });
  }
  try {
    await addLike(imageId, deviceId, action);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get like/dislike counts for an image
app.get("/api/images/:imageId/likes", async (req, res) => {
  const { imageId } = req.params;
  try {
    const result = await getLikesForImage(imageId);
    res.json({ success: true, counts: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Record a download
app.post("/api/download", async (req, res) => {
  const { imageId, deviceId } = req.body;
  if (!imageId || !deviceId) {
    return res.status(400).json({ error: "imageId and deviceId are required" });
  }
  try {
    await addDownload(imageId, deviceId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get download counts for an image
app.get("/api/images/:imageId/downloads", async (req, res) => {
  const { imageId } = req.params;
  try {
    const result = await getDownloadsForImage(imageId);
    res.json({
      success: true,
      downloads: {
        total: parseInt(result.rows[0]?.total_downloads || 0),
        unique: parseInt(result.rows[0]?.unique_downloads || 0),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Route Registration ---

app.post("/api/upload", upload.single("image"), uploadImageHandler);
app.get("/api/images", getAllImagesHandler);
app.get("/api/images/by-tag", getImagesByTagHandler); // Place before /api/images/:hash
app.get("/api/images/:hash", getImageByHashHandler);
app.delete("/api/images/:hash", deleteImageHandler);

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
