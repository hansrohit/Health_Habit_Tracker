const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

connectDB();

const allowedOrigin = "http://localhost:5173";
app.use(express.json());

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

const userRoutes = require("./Routes/userRoutes");
const habitRoutes = require("./Routes/habitRoutes");
const reminderRoutes = require("./Routes/remainderRoutes");
app.use("/api/users", userRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/reminder", reminderRoutes);
// require("./remainderJob");

app.get("/test", (req, res) => {
  res.json({ message: "API is working" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
