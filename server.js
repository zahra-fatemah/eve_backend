const dotenv = require("dotenv");

// Load environment variables first
dotenv.config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

/**
 * Start the server:
 * 1. Connect to MongoDB Atlas
 * 2. Start Express on configured port
 */
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🌹 Eve Beauty Care API running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
  });
};

startServer();
