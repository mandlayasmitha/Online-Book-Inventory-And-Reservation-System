
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const reservationRoutes = require("./routes/reservationRoutes");

const authMiddleware = require("./middleware/authMiddleware");
const adminMiddleware = require("./middleware/adminMiddleware");
const adminRoutes = require("./routes/adminRoutes");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);

// User reservation routes
app.use("/api/reservations", reservationRoutes);

// Home route
app.get("/", (req, res) => {
  res.send("Book Inventory Backend is running!");
});

// Profile route
app.get("/api/auth/profile", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "Authentication successful",
    user: req.user,
  });
});

// Admin routes
app.use("/api/admin", authMiddleware, adminMiddleware, adminRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
