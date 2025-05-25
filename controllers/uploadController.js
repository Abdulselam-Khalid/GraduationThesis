const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const crypto = require("crypto");
const path = require("path");

// Create mongo connection
const conn = mongoose.createConnection(process.env.MONGO_URI);

let bucket;

conn.once("open", () => {
  // Initialize GridFS bucket
  bucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads",
  });
});

// Upload a single file
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Generate unique filename
    const filename =
      crypto.randomBytes(16).toString("hex") +
      path.extname(req.file.originalname);

    // Create upload stream
    const uploadStream = bucket.openUploadStream(filename, {
        contentType: req.file.mimetype,
        metadata: {
            originalName: req.file.originalname,
            uploadDate: new Date(),
            userId: req.userID,
      },
    });

    // Write file to GridFS
    uploadStream.write(req.file.buffer);
    uploadStream.end();

    // Wait for upload to complete
    await new Promise((resolve, reject) => {
      uploadStream.on("finish", resolve);
      uploadStream.on("error", reject);
    });

    res.json({
      file: {
        filename: filename,
        contentType: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Error uploading file" });
  }
};

// Get file by filename
const getFile = async (req, res) => {
  try {
    const files = await bucket
      .find({ "metadata.userId": req.userID })
      .toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ error: "File not found" });
    }

    const file = files[0];

    // Check if image
    if (!file.contentType.startsWith("image/")) {
      return res.status(400).json({ error: "Not an image file" });
    }

    // Set appropriate headers
    res.set("Content-Type", file.contentType);
    res.set("Content-Length", file.length);

    // Create download stream
    const downloadStream = bucket.openDownloadStream(file._id);
    downloadStream.pipe(res);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ error: "Error downloading file" });
  }
};

module.exports = {
  uploadFile,
  getFile,
};
