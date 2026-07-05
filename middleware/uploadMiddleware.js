const multer = require("multer");

/**
 * Upload Middleware
 * Uses memory storage so the file buffer can be streamed directly to Cloudinary.
 * No local file storage required.
 */
const storage = multer.memoryStorage();

// File filter — only allow image uploads
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
});

module.exports = upload;
