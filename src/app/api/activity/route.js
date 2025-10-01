import Attempt from "../../../../models/Attempt";
import Lesson from "../../../../models/Lesson";
import User from "../../../../models/user";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectMongoDB } from "../../../../lib/mongodb";

export async function GET(req) {
  await connectMongoDB();
  const session = await getServerSession(authOptions);

  if (!session) return new Response("Unauthorized", { status: 401 });

  const isAdmin = session.user.role === 'admin'; // ต้องมี role admin ใน session
  let filter = {};

  // ถ้าไม่ใช่ admin ให้ filter ด้วย userId ของตัวเอง
  if (!isAdmin) {
    filter.userId = session.user.id;
  }

  const attempts = await Attempt.find(filter).sort({ createdAt: -1 }).lean();

  if (!attempts.length) {
    return new Response(
      JSON.stringify({ totalUnits: 0, completedUnits: 0, averageScore: 0, attempts: [] }),
      { status: 200 }
    );
  }

  // ดึงอีเมลผู้ใช้
  const userIds = [...new Set(attempts.map(a => a.userId))];
  const users = await User.find({ _id: { $in: userIds } }).lean();
  const userMap = {};
  users.forEach(u => {
    userMap[u._id] = u.email || '';
  });

  const lessonIds = [...new Set(attempts.map(a => a.lessonId))];
  const lessons = await Lesson.find({ _id: { $in: lessonIds } }).lean();

  const lessonMap = {};
  lessons.forEach((lesson) => {
    lessonMap[lesson._id] = {
      subject: lesson.subject || "ไม่ระบุวิชา",
      creator: lesson.creator || "ไม่ระบุผู้สร้าง",
      lessons: lesson.lessons.map(li => ({
        lessonId: lesson._id,
        title: li.title || "ไม่ระบุชื่อบท",
        bookName: li.bookName || "",
        coverImage: li.coverImage || "",
        units: li.units || [],
      })),
    };
  });

  const attemptsWithLesson = attempts.map((a) => {
    const lessonData = lessonMap[a.lessonId];
    if (!lessonData) return { ...a, userEmail: userMap[a.userId] || '' };

    const lessonItem = lessonData.lessons.find((li) =>
      li.units.some((u) => String(u._id) === String(a.unitId))
    );

    const unit = lessonItem?.units.find((u) => String(u._id) === String(a.unitId));

    return {
      ...a,
      userEmail: userMap[a.userId] || '',
      subject: lessonData.subject,
      creator: lessonData.creator, 
      lessonTitle: lessonItem?.title || "ไม่ระบุชื่อบท",
      bookName: lessonItem?.bookName || "",
      coverImage: lessonItem?.coverImage || "",
      unitTitle: unit?.title || "",
      chapter: unit?.chapter || "ไม่ระบุบท",
    };
  });

  return new Response(JSON.stringify({
    totalUnits: new Set(attempts.map(a => a.unitId)).size,
    completedUnits: attempts.filter(a => a.score === a.totalQuestions).length,
    averageScore: attempts.length ? attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length : 0,
    attempts: attemptsWithLesson,
  }), { status: 200 });
}
