import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectMongoDB } from "../../../../../lib/mongodb";
import Lesson from "../../../../../models/Lesson";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();

    // ดึงเฉพาะบทเรียนที่สร้างโดย user และถูกอนุมัติ
    const lessons = await Lesson.find({
      status: "approved",
      creator: session.user.email,
    }).sort({ createdAt: 1 }); // เรียงตามลำดับส่งมาก่อน → หลัง

    return NextResponse.json({ lessons });
  } catch (error) {
    console.error("GET myPublished error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
