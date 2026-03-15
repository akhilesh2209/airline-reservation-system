const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
require("dotenv").config(); // Ensure environment variables are loaded

// Register User
router.post("/register", async (req, res) => {
    try {
        console.log("📢 Received request:", req.body); // ✅ Log request body

        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            console.log("❌ Missing fields:", { username, email, password }); // ✅ Log missing fields
            return res.status(400).json({ message: "All fields are required" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("❌ Error in /register:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Login User
router.post("/login", async (req, res) => {
    try {
        console.log("📢 Received login request:", req.body); // Debugging log

        const { email, password } = req.body;
        if (!email || !password) {
            console.error("❌ Missing email or password!");
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            console.error("❌ User not found!");
            return res.status(400).json({ message: "Invalid credentials" });
        }

        console.log("✅ User found:", user.email); // Debugging log

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.error("❌ Incorrect password!");
            return res.status(400).json({ message: "Invalid credentials" });
        }

        console.log("🔑 Password matched! Generating token...");

        const token = jwt.sign({ userId: user._id }, "your_jwt_secret", { expiresIn: "1h" });

        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error("❌ Error in /login:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
