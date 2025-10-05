import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import Lesson from "../../../../models/Lesson";
import Attempt from "../../../../models/Attempt";
import User from "../../../../models/user";
import { connectMongoDB } from "../../../../lib/mongodb";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  await connectMongoDB();

  try {
    // ดึงบทเรียนของ user
    // ดึงเฉพาะบทเรียนที่ publish แล้ว
    const lessons = await Lesson.find({
      creator: session.user.email,
      status: "published"   // ✅ กรองเฉพาะ published
    }).lean();


    if (!lessons || lessons.length === 0) {
      return new Response(JSON.stringify({ lessons: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // เตรียม list ของ lessonItems (บทย่อย)
    const lessonItems = lessons.flatMap(lessonDoc =>
      (lessonDoc.lessons || []).map(lessonItem => ({
        ...lessonItem,
        _id: lessonItem._id.toString(),
        parentLessonId: lessonDoc._id.toString(),
        subject: lessonDoc.subject || "ไม่ระบุ" // ✅ เพิ่ม field subject สำหรับ dropdown
      }))
    );

    const lessonItemIds = lessonItems.map(i => i._id);
    const parentIds = lessons.map(ld => ld._id.toString());
    const lessonIdsToSearch = [...new Set([...lessonItemIds, ...parentIds])];

    // ดึง attempts ทั้งหมดที่เกี่ยวข้อง
    const attempts = await Attempt.find({
      lessonId: { $in: lessonIdsToSearch }
    }).lean();

    // ดึง users ที่เกี่ยวข้อง
    const userIds = [...new Set(attempts.map(a => a.userId))];
    const users = await User.find({ _id: { $in: userIds } }).lean();

    const userMap = {};
    users.forEach(u => {
      userMap[u._id.toString()] = u.email; // map userId → email
    });

    // รวม lessons พร้อมสถิติ
    const lessonsWithStats = lessonItems.map(item => {
      const idStr = item._id.toString();

      // attempts ของบทย่อยนี้
      const lessonAttempts = attempts.filter(a => {
        const aLessonId = a.lessonId ? String(a.lessonId) : "";
        return aLessonId === idStr || aLessonId === item.parentLessonId;
      });

      // map units
      const unitsMap = {};
      (item.units || []).forEach((u, index) => {
        const uIdStr = u._id ? String(u._id) : String(index);
        unitsMap[uIdStr] = {
          unitId: uIdStr,
          unitTitle: u.title, // ✅ เพิ่ม unitTitle สำหรับ dropdown
          attempts: [],
          index
        };
      });

      // ใส่ attempt ลง unit
      lessonAttempts.forEach(a => {
        const unitIdStr = a.unitId ? String(a.unitId) : undefined;
        if (unitIdStr && unitsMap[unitIdStr]) {
          unitsMap[unitIdStr].attempts.push(a);
        } else {
          // fallback → ใส่ unit แรก
          const fallback = Object.values(unitsMap)[0];
          if (fallback) fallback.attempts.push(a);
        }
      });

      // คำนวณสถิติของแต่ละ unit
      const unitsStats = Object.values(unitsMap).map(u => {
        const sorted = u.attempts.sort((a, b) => (a.attemptNumber || 0) - (b.attemptNumber || 0));
        const scores = sorted.map(a => a.score);

        return {
          ...u,
          count: sorted.length,
          latest: sorted.length ? sorted[sorted.length - 1].score : "-",
          min: sorted.length ? Math.min(...scores) : "-",
          max: sorted.length ? Math.max(...scores) : "-",
          isFull: sorted.some(a => a.score === a.totalQuestions),
          attempts: sorted.map(a => ({
            userId: userMap[a.userId] || a.userId,
            score: a.score,
            totalQuestions: a.totalQuestions,
            createdAt: a.createdAt
          }))
        };
      });

      return {
        _id: idStr,
        title: item.title,
        subject: item.subject, // ✅ ส่ง subject กลับไปด้วย
        units: unitsStats
      };
    });

    return new Response(JSON.stringify({ lessons: lessonsWithStats }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to fetch report" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
