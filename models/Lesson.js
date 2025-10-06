import mongoose from "mongoose";

const ChoiceSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
});

const QuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  questionImage: { type: String, default: "" },
  choices: {
    type: [ChoiceSchema],
    validate: {
      validator: (arr) => arr.length === 4,
      message: "ต้องมีตัวเลือก 4 ตัวเท่านั้น",
    },
    required: true,
  },
});

const UnitSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: {
    type: [QuestionSchema],
    validate: {
      validator: (arr) => arr.length <= 15,
      message: "คำถามต้องไม่เกิน 15 ข้อ",
    },
    required: true,
  },
});

const LessonItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  coverImage: { type: String, default: "/default_cover.svg" },
  units: {
    type: [UnitSchema],
    required: true,
    validate: {
      validator: (arr) => arr.length > 0,
      message: "ต้องมีหน่วยอย่างน้อย 1 หน่วย",
    },
  },
});

const LessonSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    lessons: {
      type: [LessonItemSchema], // ✅ array ของบท
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "ต้องมีบทอย่างน้อย 1 บท",
      },
    },
    status: {
      type: String,
      enum: ["draft", "published", "pending", "approved", "rejected"],
      default: "draft",
    },
    creator: { type: String, required: true },
    reason: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.models.Lesson || mongoose.model("Lesson", LessonSchema);
