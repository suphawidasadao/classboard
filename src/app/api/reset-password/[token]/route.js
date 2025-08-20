import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../lib/mongodb";
import User from "../../../../../models/user";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req, { params }) {
  try {
    const { token } = params;
    const { password } = await req.json();

    await connectMongoDB();

    const passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetToken: passwordResetToken,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Token ไม่ถูกต้องหรือหมดอายุ" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetToken = null;            // ใช้ null แทน undefined
    user.resetTokenExpiry = null;
    await user.save();

    return NextResponse.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" }, { status: 200 });

  } catch (error) {
    console.error("Error in reset-password API:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
