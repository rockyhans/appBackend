require('dotenv').config();
const express = require("express");
const connectToMongoDB = require("./db"); // Ensure the path is correct
const cors = require("cors");
const authRoutes = require("./routes/auth");
const fileRoutes = require("./routes/file");

// Connect to MongoDB
connectToMongoDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // For parsing application/json

// Routes for authentication and file management
app.use("/api/auth", authRoutes);
app.use("/api", fileRoutes); // Use fetchUser middleware in file routes if needed

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
