import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Feedback from "./models/feedback.js";
import { Fragment } from "react";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.VITE_MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

app.post("/api/feedbacks", async (req, res) => {
  try {
    const feedback = new Feedback(req.body);
    await feedback.save();
    res.status(201).json({ message: "Feedback saved successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error saving feedback" });
  }
});
app.get("/api/feedbacks", async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    console.log(feedbacks); // Log the data
    res.status(200).json(feedbacks);
  } catch (err) {
    console.error("Error fetching feedback:", err);
    res.status(500).json({ error: "Error fetching feedback" });
  }
});

app.delete("/api/feedbacks/:username", async (req, res) => {
  const { username } = req.params;
  try {
    await Feedback.deleteMany({ name: username });
    res.status(200).json({ message: "Feedbacks cleared successfully" });
  } catch (err) {
    console.error("Error clearing feedback:", err);
    res.status(500).json({ error: "Error clearing feedback" });
  }
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

