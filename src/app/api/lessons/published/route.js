import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../lib/mongodb";
import Lesson from "../../../../../models/Lesson";

export async function GET() {
  try {
    await connectMongoDB();

    const lessons = await Lesson.find({
  $or: [
    { status: "approved" },
    { status: "published" }
  ]
}).sort({ createdAt: -1 });

    return NextResponse.json({ lessons }, { status: 200 });
  } catch (err) {
    console.error("Failed to fetch published lessons:", err);
    return NextResponse.json({ error: "Failed to fetch published lessons" }, { status: 500 });
  }
}
