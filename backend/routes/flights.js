const express = require("express");
const router = express.Router();

// Sample flights data (replace with database logic later)
const flights = [
    { id: 1, airline: "Air India", from: "Delhi", to: "Mumbai", price: 5000 },
    { id: 2, airline: "IndiGo", from: "Bangalore", to: "Chennai", price: 3000 },
];

// GET /api/flights
router.get("/", (req, res) => {
    res.json({ message: "Flights retrieved successfully", data: flights });
});

module.exports = router;
