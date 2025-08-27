import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Feedback from "./models/feedback.js";

dotenv.config();
const app = express();

// ✅ CORS setup
const allowedOrigins = [
  "http://localhost:5173",              // local dev frontend
  "https://interview-gpt-6alf.vercel.app" // deployed frontend
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  }
}));

app.use(express.json());

const PORT = process.env.PORT || 5000;

// ✅ MongoDB connection
mongoose.connect(process.env.VITE_MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Save feedback
app.post("/api/feedbacks", async (req, res) => {
  try {
    const feedback = new Feedback(req.body);
    await feedback.save();
    res.status(201).json({ message: "Feedback saved successfully!" });
  } catch (err) {
    console.error("❌ Error saving feedback:", err);
    res.status(500).json({ error: "Error saving feedback" });
  }
});

// ✅ Get all feedbacks
app.get("/api/feedbacks", async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.status(200).json(feedbacks);
  } catch (err) {
    console.error("❌ Error fetching feedback:", err);
    res.status(500).json({ error: "Error fetching feedback" });
  }
});

// ✅ Delete feedbacks by username
app.delete("/api/feedbacks/:username", async (req, res) => {
  const { username } = req.params;
  try {
    await Feedback.deleteMany({ name: username });
    res.status(200).json({ message: "Feedbacks cleared successfully" });
  } catch (err) {
    console.error("❌ Error clearing feedback:", err);
    res.status(500).json({ error: "Error clearing feedback" });
  }
});

// ✅ Start server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
