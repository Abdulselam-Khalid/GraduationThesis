const express = require("express");
const router = express.Router();
const multer = require("multer");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const crypto = require("crypto");
const path = require("path");
const upload = require("../middleware/upload");
const { uploadFile, getFile } = require("../controllers/uploadController");
const authMiddleware = require("../middleware/auth");
// Mongo URI (make sure your MONGO_URI is set in .env)
const mongoURI = process.env.MONGO_URI;

// Create mongo connection
const conn = mongoose.createConnection(mongoURI);

let bucket;

conn.once("open", () => {
  // Initialize GridFS bucket
  bucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads",
  });
});

// Configure multer for memory storage
const uploadMulter = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});
router.use(authMiddleware)
// @route POST /api/uploads

router.route("/").get(getFile).post(uploadMulter.single("file"), uploadFile)


module.exports = router;
