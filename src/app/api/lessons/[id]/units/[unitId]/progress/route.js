import { connectMongoDB } from "../../../../../../../../lib/mongodb";
import Attempt from "../../../../../../../../models/Attempt";
import Lesson from "../../../../../../../../models/Lesson";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req, { params }) {
  await connectMongoDB();

  const session = await getServerSession(authOptions);
  if (!session)
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const { id: lessonId, unitId } = params;
  const userId = session.user.id || session.user.email;

  try {
    const lessonDoc = await Lesson.findById(lessonId);
    if (!lessonDoc)
      return new Response(JSON.stringify({ error: "ไม่พบบทเรียน" }), { status: 404 });

    const { score, totalQuestions, answers, subject: subjectFromBody } = await req.json();

    const subjectToSave = subjectFromBody || lessonDoc.subject || "ไม่ระบุ";

    // Log ตรวจสอบ
    console.log("subjectFromBody:", subjectFromBody);
    console.log("lessonDoc.subject:", lessonDoc.subject);
    console.log("subjectToSave:", subjectToSave);

    const existingAttempts = await Attempt.find({ userId, lessonId, unitId });

    const attemptData = {
      userId,
      lessonId,
      unitId,
      attemptNumber: existingAttempts.length + 1,
      score,
      totalQuestions,
      answers,
      subject: subjectToSave,
    };

    console.log("Attempt data to save:", attemptData);

    const attempt = await Attempt.create(attemptData);

    console.log("Attempt saved:", attempt);

    return new Response(JSON.stringify({ success: true, attempt }), { status: 201 });
  } catch (err) {
    console.error("Error saving attempt:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
