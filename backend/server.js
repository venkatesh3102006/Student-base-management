const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/students");
const malpracticeRoutes = require("./routes/malpractice");
const userRoutes = require("./routes/users");
const statsRoutes = require("./routes/stats");

const app = express();

/* =========================
   MIDDLEWARE
========================= */

// CORS (allows Vercel frontend)
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://newproject-six-tau.vercel.app",
    "https://newproject-git-main-venkatesh3102006s-projects.vercel.app"
  ],
  methods: ["GET","POST","PUT","DELETE","PATCH","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =========================
   ROUTES
========================= */

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/malpractice", malpracticeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stats", statsRoutes);

/* =========================
   HEALTH CHECK
========================= */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API running",
    time: new Date()
  });
});

/* =========================
   ERROR HANDLING
========================= */

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

/* =========================
   404 HANDLER
========================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

/* =========================
   DATABASE + SERVER START
========================= */

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });

module.exports = app;
