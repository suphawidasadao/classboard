import Lesson from "../../../../../../../../models/Lesson";
import { connectMongoDB } from "../../../../../../../../lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { id: lessonId, unitId } = params;

  try {
    await connectMongoDB();

    const lessonDoc = await Lesson.findById(lessonId).lean();
    if (!lessonDoc) return NextResponse.json({ error: "ไม่พบบทเรียน" }, { status: 404 });

    // หา unit ตาม unitId
    let unitFound = null;
    for (const lessonItem of lessonDoc.lessons) {
      unitFound = lessonItem.units.find(u => u._id.toString() === unitId);
      if (unitFound) break;
    }

    if (!unitFound) return NextResponse.json({ error: "ไม่พบหน่วย" }, { status: 404 });

    // ส่ง questions กลับในรูปแบบที่ frontend ใช้
    return NextResponse.json({ unit: unitFound });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
