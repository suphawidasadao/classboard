import { connectMongoDB } from "../../../../../../../../lib/mongodb";
import Attempt from "../../../../../../../../models/Attempt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req, { params }) {
  await connectMongoDB();

  const session = await getServerSession(authOptions);
  if (!session)
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const { id: lessonId, unitId } = params;

  try {
    // ดึง attempts ของ user สำหรับ unit และ lesson ที่กำหนด
    const attempts = await Attempt.find({
      userId: session.user.id,
      lessonId,
      unitId,
    })
      .sort({ attemptNumber: 1 }) // เรียงตาม attemptNumber
      .select("attemptNumber score totalQuestions subject answers createdAt"); // ✅ เลือก field ที่ต้องการ

    return new Response(JSON.stringify({ success: true, attempts }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
