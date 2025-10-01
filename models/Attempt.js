import mongoose from "mongoose";

const AttemptSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  lessonId: { type: String, required: true },
  unitId: { type: String, required: true },
  attemptNumber: { type: Number, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  subject: { type: String, default: "ไม่ระบุ" },
  answers: [
    {
      questionId: String,
      selected: String,
      isCorrect: Boolean,
      answeredAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Attempt || mongoose.model("Attempt", AttemptSchema);
