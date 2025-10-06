import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false,
      default: "",
    },
    name: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },
    teacherName: {
      type: String,
      default: "",
    },
    school: {
      type: String,
      default: "",
    },
    teacherDetails: {
      type: String,
      default: "",
    },
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpiry: {
      type: Date,
      default: null,
    },
    profileImage: {
      type: String,
      default: "/default-profile.png",
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
