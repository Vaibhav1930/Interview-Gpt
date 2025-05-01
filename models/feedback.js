import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  name: String,
  question: String,
  answer: String,
  feedback: String,
  correctness: Number,
  completeness: Number,
  correct_answere:String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Feedback", feedbackSchema);
