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
const sharp = require("sharp");
const pdf2pic = require("pdf2pic");
const pdfParse = require("pdf-parse"); // Added for PDF validation

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
      "https://www.enterthearchive.com",
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
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Configure multer for PDF uploads
const uploadPDF = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for PDFs
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"), false);
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
        altText: altText,
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
      gatewayUrl: `https://copper-delicate-louse-351.mypinata.cloud/ipfs/${response.data.IpfsHash}`,
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

// Upload PDF to Pinata (saves PDF, converts first page to image, uploads image, includes image hash in PDF metadata)
async function uploadPDFHandler(req, res) {
  try {
    console.log("PDF upload request received");
    console.log(
      "File info:",
      req.file
        ? {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
          }
        : "No file"
    );
    console.log("Body:", req.body);

    if (!req.file) {
      return res.status(400).json({ error: "No PDF file provided" });
    }

    console.log(
      `Processing PDF: ${req.file.originalname}, Size: ${req.file.size} bytes`
    );

    // Validate PDF
    try {
      const pdfData = await pdfParse(req.file.buffer);
      console.log("PDF Validation:", {
        numPages: pdfData.numpages,
        info: pdfData.info,
      });
      if (pdfData.numpages < 1) {
        throw new Error("PDF has no pages");
      }
    } catch (validationError) {
      console.error("PDF validation error:", validationError.message);
      return res.status(400).json({
        error: "Invalid or corrupted PDF",
        details: validationError.message,
      });
    }

    // Upload original PDF to Pinata
    const pdfFormData = new FormData();
    pdfFormData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: "application/pdf",
    });

    const pdfMetadata = {
      name: req.body.name || req.file.originalname,
      keyvalues: {
        description: req.body.description || "Uploaded PDF document",
        fileType: "pdf",
        tags: Array.isArray(req.body.tags)
          ? req.body.tags.join(",")
          : req.body.tags || "",
        category: req.body.category || "",
        location: req.body.location || "",
        artist: req.body.artist || "",
        visibility: req.body.visibility || "visible",
      },
    };

    pdfFormData.append("pinataMetadata", JSON.stringify(pdfMetadata));
    const pdfPinataOptions = { cidVersion: 1 };
    pdfFormData.append("pinataOptions", JSON.stringify(pdfPinataOptions));

    console.log("Uploading PDF to Pinata...");
    const pdfResponse = await axios.post(PINATA_PIN_FILE_URL, pdfFormData, {
      headers: {
        ...getPinataHeaders(),
        ...pdfFormData.getHeaders(),
      },
    });

    console.log("PDF Pinata response:", pdfResponse.data);

    const pdfResult = {
      ipfsHash: pdfResponse.data.IpfsHash,
      pinSize: pdfResponse.data.PinSize,
      timestamp: pdfResponse.data.Timestamp,
      gatewayUrl: `https://copper-delicate-louse-351.mypinata.cloud/ipfs/${pdfResponse.data.IpfsHash}`,
    };

    // Convert PDF first page to image
    let imageBuffer;
    try {
      const convert = pdf2pic.fromBuffer(req.file.buffer, {
        density: 150,
        format: "png",
        width: 600,
        height: 800,
        preserveAspectRatio: true,
        compression: "none",
      });

      // Set GraphicsMagick path (adjust if different)
      convert.setGMClass(
        "C:\\Program Files\\GraphicsMagick-1.3.43-Q16\\gm.exe"
      );

      const result = await convert.bulk([1], { responseType: "buffer" });
      imageBuffer = result[0]?.buffer;

      if (!imageBuffer || imageBuffer.length === 0) {
        throw new Error("PDF conversion resulted in an empty image buffer");
      }

      console.log(
        `PDF first page converted to image, size: ${imageBuffer.length} bytes`
      );
    } catch (conversionError) {
      console.error(
        "PDF conversion error:",
        conversionError.message,
        conversionError.stack
      );
      // Proceed with PDF upload result even if image conversion fails
      return res.status(200).json({
        success: true,
        pdf: pdfResult,
        image: null,
        message: "PDF uploaded successfully, but image conversion failed",
        error: conversionError.message,
      });
    }

    // Generate alt text for the converted image
    const altText = await generateAltText(
      imageBuffer,
      req.file.originalname.replace(/\.pdf$/, ".png")
    );
    console.log(`Generated alt text: ${altText}`);

    // Upload image to Pinata
    const imageFormData = new FormData();
    imageFormData.append("file", imageBuffer, {
      filename: req.file.originalname.replace(/\.pdf$/, ".png"),
      contentType: "image/png",
    });

    const imageMetadata = {
      name: req.body.name
        ? `${req.body.name} Thumbnail`
        : `${req.file.originalname.replace(/\.pdf$/, "")} Thumbnail`,
      keyvalues: {
        description: req.body.description || "Thumbnail of uploaded PDF",
        altText: altText,
        fileType: "image",
        originalFileType: "pdf",
        pdfIpfsHash: pdfResponse.data.IpfsHash, // Link to PDF
        tags: Array.isArray(req.body.tags)
          ? req.body.tags.join(",")
          : req.body.tags || "",
        category: req.body.category || "",
        location: req.body.location || "",
        artist: req.body.artist || "",
        visibility: req.body.visibility || "visible",
      },
    };

    imageFormData.append("pinataMetadata", JSON.stringify(imageMetadata));
    const imagePinataOptions = { cidVersion: 1 };
    imageFormData.append("pinataOptions", JSON.stringify(imagePinataOptions));

    console.log("Uploading image to Pinata...");
    const imageResponse = await axios.post(PINATA_PIN_FILE_URL, imageFormData, {
      headers: {
        ...getPinataHeaders(),
        ...imageFormData.getHeaders(),
      },
    });

    console.log("Image Pinata response:", imageResponse.data);

    // Update PDF metadata with image IPFS hash
    pdfMetadata.keyvalues.thumbnailIpfsHash = imageResponse.data.IpfsHash;

    // Note: Pinata does not support updating metadata after upload.
    // The thumbnailIpfsHash is included in the response for frontend use.
    // If metadata update is needed, you must store this externally (e.g., database)
    // or re-upload the PDF with updated metadata (not implemented here to avoid redundancy).

    const resultData = {
      success: true,
      pdf: {
        ipfsHash: pdfResponse.data.IpfsHash,
        pinSize: pdfResponse.data.PinSize,
        timestamp: pdfResponse.data.Timestamp,
        gatewayUrl: `https://copper-delicate-louse-351.mypinata.cloud/ipfs/${pdfResponse.data.IpfsHash}`,
        metadata: pdfMetadata,
      },
      image: {
        ipfsHash: imageResponse.data.IpfsHash,
        pinSize: imageResponse.data.PinSize,
        timestamp: imageResponse.data.Timestamp,
        gatewayUrl: `https://copper-delicate-louse-351.mypinata.cloud/ipfs/${imageResponse.data.IpfsHash}`,
        metadata: imageMetadata,
      },
    };

    res.json(resultData);
  } catch (error) {
    console.error("PDF Upload error details:");
    console.error("Error message:", error.message);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    console.error("Full error:", error);

    res.status(500).json({
      error: "Failed to process PDF and upload image",
      details: error.response?.data?.error || error.message,
      statusCode: error.response?.status,
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
      gatewayUrl: `https://copper-delicate-louse-351.mypinata.cloud/ipfs/${item.ipfs_pin_hash}`,
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
      gatewayUrl: `https://copper-delicate-louse-351.mypinata.cloud/ipfs/${item.ipfs_pin_hash}`,
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
        description: item.metadata?.keyvalues?.description || "",
        tags: image.metadata?.keyvalues?.tags
          ? image.metadata.keyvalues.tags.split(",").map((t) => t.trim())
          : [],
        gatewayUrl: `https://copper-delicate-louse-351.mypinata.cloud/ipfs/${image.ipfs_pin_hash}`,
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

// Generate PDF thumbnail
async function generatePDFThumbnailHandler(req, res) {
  try {
    const { hash } = req.params;

    if (!hash) {
      return res.status(400).json({ error: "PDF hash is required" });
    }

    // Try to fetch PDF from IPFS gateways
    const gateways = [
      "https://copper-delicate-louse-351.mypinata.cloud/ipfs",
      "https://cloudflare-ipfs.com/ipfs",
      "https://gateway.pinata.cloud/ipfs",
      "https://ipfs.io/ipfs",
    ];

    let pdfBuffer = null;
    let lastError = null;

    for (const gateway of gateways) {
      try {
        const pdfUrl = `${gateway}/${hash}`;
        console.log(`Trying to fetch PDF from: ${pdfUrl}`);

        const response = await fetch(pdfUrl, {
          timeout: 10000, // 10 second timeout
        });

        if (response.ok) {
          pdfBuffer = Buffer.from(await response.arrayBuffer());
          console.log(
            `Successfully fetched PDF, size: ${pdfBuffer.length} bytes`
          );
          break;
        }
      } catch (error) {
        console.warn(`Failed to fetch from ${gateway}:`, error.message);
        lastError = error;
        continue;
      }
    }

    if (!pdfBuffer) {
      console.error("Failed to fetch PDF from all gateways:", lastError);
      return res.status(404).json({
        error: "PDF not found or not accessible",
        details: lastError?.message,
      });
    }

    // Convert PDF first page to image
    try {
      const convert = pdf2pic.fromBuffer(pdfBuffer, {
        density: 100, // Output resolution
        saveFilename: "page",
        savePath: "/tmp",
        format: "png",
        width: 300,
        height: 400,
      });

      const result = await convert(1, { responseType: "buffer" });

      if (result && result.buffer) {
        // Set appropriate headers
        res.set({
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400", // Cache for 24 hours
          "Content-Length": result.buffer.length,
        });

        return res.send(result.buffer);
      } else {
        throw new Error("Failed to convert PDF to image");
      }
    } catch (conversionError) {
      console.error("PDF conversion error:", conversionError);
      return res.status(500).json({
        error: "Failed to convert PDF to image",
        details: conversionError.message,
      });
    }
  } catch (error) {
    console.error("PDF thumbnail generation error:", error);
    res.status(500).json({
      error: "Failed to generate PDF thumbnail",
      details: error.message,
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
app.post("/api/upload-pdf", uploadPDF.single("image"), uploadPDFHandler);
app.get("/api/images", getAllImagesHandler);
app.get("/api/images/by-tag", getImagesByTagHandler);
app.get("/api/images/:hash", getImageByHashHandler);
app.get("/api/pdf-thumbnail/:hash", generatePDFThumbnailHandler);
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
  console.error("Error middleware triggered:");
  console.error("Error message:", error.message);
  console.error("Error stack:", error.stack);
  console.error("Request path:", req.path);
  console.error("Request method:", req.method);

  if (error instanceof multer.MulterError) {
    console.error("Multer error code:", error.code);
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File size too large",
        details: error.message,
      });
    }
    return res.status(400).json({
      error: "File upload error",
      details: error.message,
    });
  }

  if (error.message === "Only image files are allowed!") {
    return res.status(400).json({ error: "Only image files are allowed" });
  }

  if (error.message === "Only PDF files are allowed!") {
    return res.status(400).json({ error: "Only PDF files are allowed" });
  }

  res.status(500).json({
    error: "Internal server error",
    details: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Pinata Image API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
