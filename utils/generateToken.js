const jwt = require("jsonwebtoken");

/**
 * Generate a JWT token for the admin.
 * Expires in 24 hours.
 */
const generateToken = (email) => {
  return jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

module.exports = generateToken;
