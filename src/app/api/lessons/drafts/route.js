import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectMongoDB } from "../../../../../lib/mongodb";
import Lesson from "../../../../../models/Lesson";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();

    // ดึง draft ของผู้ใช้ที่ล็อกอิน (ใช้ email แทน id)
    const drafts = await Lesson.find({
      creator: session.user.email,
      status: "draft",
    }).sort({ updatedAt: -1 });

    return NextResponse.json(drafts);
  } catch (error) {
    console.error("GET /api/lessons/drafts error:", error);
    return NextResponse.json({ error: "Failed to fetch drafts" }, { status: 500 });
  }
}
