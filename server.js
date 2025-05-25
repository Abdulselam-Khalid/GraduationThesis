const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/Auth");
const taskRoutes = require("./routes/tasks");
const groupRoutes = require("./routes/groups");
const expenseRoutes = require("./routes/expenses");
const notificationRoutes = require("./routes/notifications");
const uploadRoutes = require('./routes/uploads');
const cookieParser = require("cookie-parser");

const connectDB = require("./db/connect");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Default route - serve the main HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/notifications", notificationRoutes);
app.use('/api/uploads', uploadRoutes);
// Handle client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "error404.html"));
});

// Start server *after* DB connects
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("✅ MongoDB connection successful");
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message);
  }
};

start();
