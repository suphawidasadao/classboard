import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import User from "../../../../models/user";
import crypto from "crypto";

export async function POST(req) {
  try {
    const { email } = await req.json();
    await connectMongoDB();

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (!existingUser) {
      return NextResponse.json({ message: "Email doesn't exist." }, { status: 400 });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const passwordResetExpires = Date.now() + 3600000; // 1 ชั่วโมง

    existingUser.resetToken = passwordResetToken;
    existingUser.resetTokenExpiry = passwordResetExpires;
    await existingUser.save();

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    console.log("🔗 Reset URL:", resetUrl);

    return NextResponse.json(
      { message: "Reset link generated", resetUrl },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
