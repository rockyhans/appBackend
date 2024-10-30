const express = require("express");
const router = express.Router();
const fetchUser = require("../middleware/fetchUser");
const FileModel = require("../models/File");

// Route 1: Fetch files for the logged-in user
router.get("/files", fetchUser, async (req, res) => {
  try {
    const files = await FileModel.find({ userId: req.user.id });
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create a new file
router.post("/files", fetchUser, async (req, res) => {
  const { name, content } = req.body;

  if (!name || !content) {
    return res.status(400).json({ error: "File Name and codes are required" });
  }

  try {
    const newFile = new FileModel({ name, content, userId: req.user.id });
    await newFile.save();
    res.status(201).json(newFile);
  } catch (error) {
    console.error("Error creating file:", error); // Log the actual error for debugging
    res.status(500).json({ error: "Server error" });
  }
});

// Delete file by ID
router.delete("/delete/:id", fetchUser, async (req, res) => {
  try {
    const file = await FileModel.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Ensure user owns the file
    if (file.userId.toString() !== req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await FileModel.findByIdAndDelete(req.params.id);
    res.json({ message: "File deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update file content
router.put("/update/:id", fetchUser, async (req, res) => {
  const { content } = req.body;
  try {
    let file = await FileModel.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Ensure user owns the file
    if (file.userId.toString() !== req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    file = await FileModel.findByIdAndUpdate(
      req.params.id,
      { content },
      { new: true }
    );
    res.json(file);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
