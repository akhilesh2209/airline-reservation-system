const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const router = require("./routes/auth");
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON data
app.use("/api/auth", authRoutes);
// ✅ Connect to MongoDB
mongoose
  .connect("mongodb+srv://akhileshwuna22:akhi220904@cluster0.fpsbp.mongodb.net/bookingsDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Booking Schema & Model
const bookingSchema = new mongoose.Schema({
  flight: {
    departure: String,
    destination: String,
    date: String,
    timing: String,
  },
  passengers: [
    {
      fullName: String,
      seat: String,
    },
  ],
});

const Booking = mongoose.model("Booking", bookingSchema);

// ✅ Fetch All Bookings (GET)
// 📌 API to Fetch All Bookings (GET)
app.get("/bookings", async (req, res) => {
  try {
      console.log("📢 Fetching all bookings..."); // Debugging log

      const bookings = await Booking.find();  // Fetch data from MongoDB
      console.log("✅ Bookings found:", bookings); // Log fetched data

      res.json(bookings);
  } catch (error) {
      console.error("❌ Error fetching bookings:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});



// ✅ Save a New Booking (POST)
// 📌 API to Save a New Booking (POST)
app.post("/bookings", async (req, res) => {
  try {
      console.log("📢 Received booking data:", req.body); // Debugging log

      const { flight, passengers } = req.body;

      // Check if required fields are missing
      if (!flight || !passengers || passengers.length === 0) {
          console.error("❌ Missing required fields!");
          return res.status(400).json({ error: "Missing required fields" });
      }

      const newBooking = new Booking({ flight, passengers });
      await newBooking.save();

      console.log("✅ Booking saved successfully:", newBooking);
      res.status(201).json({ message: "Booking saved successfully!" });
  } catch (error) {
      console.error("❌ Error saving booking:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/auth/register", async (req, res) => {

  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    // Your user registration logic here...
    res.json({ message: "User registered successfully" });
} catch (error) {
    console.error("Error in /register:", error);
    res.status(500).json({ message: "Server error" });
}
});

app.post("/api/auth/login", async (req, res) => {
  try {
      const { email, password } = req.body;
      if (!email || !password) {
          return res.status(400).json({ message: "All fields are required" });
      }

      const user = await User.findOne({ email });
      if (!user) {
          return res.status(401).json({ message: "Invalid credentials" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
          return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ message: "Login successful" });
  } catch (error) {
      console.error("Error in /login:", error);
      res.status(500).json({ message: "Server error" });
  }
});


// ✅ Cancel (Delete) a Booking (DELETE)
app.delete("/bookings/:bookingId", async (req, res) => {
  try {
      const { bookingId } = req.params;
      console.log(`📢 Deleting booking with ID: ${bookingId}`);

      const deletedBooking = await Booking.findByIdAndDelete(bookingId);

      if (!deletedBooking) {
          console.error("❌ Booking not found!");
          return res.status(404).json({ error: "Booking not found" });
      }

      console.log("✅ Booking deleted successfully:", deletedBooking);
      res.json({ message: "Booking cancelled successfully!" });
  } catch (error) {
      console.error("❌ Error deleting booking:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});



// ✅ Start the Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
