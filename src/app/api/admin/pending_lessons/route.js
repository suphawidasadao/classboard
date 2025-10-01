import { connectMongoDB } from "../../../../../lib/mongodb";
import Lesson from "../../../../../models/Lesson";

export async function GET() {
  await connectMongoDB();

  try {
    // ดึงบทเรียนที่ status เป็น approved, rejected, หรือ pending (ยกเว้น draft)
    const lessons = await Lesson.find({
      status: { $in: ["approved", "rejected", "pending"] }
    }).sort({ createdAt: -1 });

    return new Response(JSON.stringify({ lessons }), { status: 200 });
  } catch (error) {
    console.error("Failed to fetch lessons:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch lessons" }), { status: 500 });
  }
}
