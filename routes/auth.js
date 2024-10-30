const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const router = express.Router();
const fetchUser = require("../middleware/fetchUser"); // Middleware to fetch user from token

const JWT_SECRET = "your_jwt_secret";

// SIGNUP ROUTE
router.post(
  "/signup",
  [
    body("name", "Name must be at least 5 characters long").isLength({
      min: 5,
    }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be at least 5 characters long").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ error: "User with this email already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      user = new User({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      await user.save();

      const data = {
        user: {
          id: user.id,
        },
      };

      const authToken = jwt.sign(data, JWT_SECRET);
      res.json({ authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// LOGIN ROUTE
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      // JWT token with user ID
      const data = {
        user: {
          id: user.id,
          username: user.username, // Include the username in the response
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);

      // Return both the authToken and the user's information (like username and email)
      res.json({ authToken, user: { username: user.username } });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// DELETE ACCOUNT ROUTE
router.delete("/delete", fetchUser, async (req, res) => {
  const { username, password } = req.body; // Get username and password from the request body

  try {
    // Find the user by username
    const user = await User.findOne({ name: username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify the provided password
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // Delete the user account
    await User.deleteOne({ name: username });
    res.json({ message: "User account deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
