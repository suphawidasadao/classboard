import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import User from "../../../../models/user";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { email, password, role, teacherName, school, teacherDetails } = await req.json();
    console.log("📦 Received Data:", { email, role });

    if (typeof email !== "string" || typeof password !== "string") {
      throw new Error("❌ email และ password ต้องเป็น String");
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" },
        { status: 400 }
      );
    }

    if (role === "teacher") {
      const schoolEmailPattern = /.+@.+\.(ac\.th|school\.go\.th)$/i; // ตัวอย่าง pattern ของอีเมลโรงเรียนไทย
      if (!schoolEmailPattern.test(email)) {
        return NextResponse.json(
          { message: "สำหรับอาจารย์ กรุณาใช้อีเมลของโรงเรียน" },
          { status: 400 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await connectMongoDB();

    const newUser = new User({
      email,
      password: hashedPassword,
      role: role || "student",
      name: role === "teacher" ? (teacherName || "") : "",
      teacherName: role === "teacher" ? (teacherName || "") : "",
      school: role === "teacher" ? (school || "") : "",
      teacherDetails: role === "teacher" ? (teacherDetails || "") : "",
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
