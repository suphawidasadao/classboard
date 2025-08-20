import mongoose, { Schema } from "mongoose";

const verifyTokenSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const VerifyToken = mongoose.models.VerifyToken || mongoose.model("VerifyToken", verifyTokenSchema);
export default VerifyToken;
