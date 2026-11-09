require("dotenv").config({ override: true });

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const authorRoutes = require("./routes/authorRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Allow Express to read JSON request bodies
app.use(express.json());
app.use("/authors", authorRoutes);

// Health-check endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    message: "ReadMore API is running",
    status: "ok",
  });
});

// Connect to MongoDB before starting the server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB Atlas");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
