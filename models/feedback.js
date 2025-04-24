import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  name: String,
  question: String,
  answer: String,
  feedback: String,
  correctness: Number,
  completeness: Number,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Feedback", feedbackSchema);
