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

    const lessons = await Lesson.find({
      creator: session.user.email,
      status: { $in: ["draft", "pending", "approved", "published"] },
    }).sort({ createdAt: -1 });

    return NextResponse.json({ lessons });
  } catch (error) {
    console.error("GET myLessons (admin) error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
