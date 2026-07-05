const express = require("express");
const router = express.Router();
const { loginAdmin, getAdminProfile } = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");

// Public
router.post("/login", loginAdmin);

// Protected
router.get("/profile", protect, getAdminProfile);

module.exports = router;
