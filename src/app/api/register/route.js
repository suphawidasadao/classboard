import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import User from "../../../../models/user";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    console.log("📦 Received Data:", { email });

    if (typeof email !== "string" || typeof password !== "string") {
      throw new Error("❌ email และ password ต้องเป็น String");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await connectMongoDB();

    const newUser = new User({
      email,
      password: hashedPassword,
      role: email === "admin@gmail.com" ? "admin" : "user"
    });

    console.log("✅ Saving User:", newUser);
    await newUser.save();

    return NextResponse.json({ message: "User registered." }, { status: 201 });

  } catch (error) {
    console.error("❌ Registration Error:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการลงทะเบียน", error: error.message },
      { status: 500 }
    );
  }
}
