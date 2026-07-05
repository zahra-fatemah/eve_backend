const generateToken = require("../utils/generateToken");

/**
 * Admin Controller
 * Handles admin login and profile retrieval.
 * Only ONE admin — credentials read from .env (no registration).
 */

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Compare against environment credentials
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (email !== adminEmail || password !== adminPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = generateToken(email);

    res.status(200).json({
      success: true,
      token,
      email: adminEmail,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Protected
const getAdminProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    email: req.admin.email,
  });
};

module.exports = { loginAdmin, getAdminProfile };
