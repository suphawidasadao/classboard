import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../../lib/mongodb";
import Lesson from "../../../../../../models/Lesson";

export async function PUT(req, context) {
  const { params } = context;
  await connectMongoDB();

  const id = params.id;
  if (!id) {
    return NextResponse.json({ error: "Lesson ID is required" }, { status: 400 });
  }

  let body = {};
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { status, reason } = body;
  if (!["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    // เตรียมข้อมูลอัปเดต
    let updateData = { status };

    if (status === "rejected") {
      if (!reason || reason.trim() === "") {
        return NextResponse.json(
          { error: "Reason is required when rejecting a lesson" },
          { status: 400 }
        );
      }
      updateData.reason = reason;
    } else if (status === "approved") {
      updateData.reason = ""; // ✅ reset reason เมื่ออนุมัติ
    }

    console.log("🔍 Update lesson:", { id, updateData }); // Debug log

    const lesson = await Lesson.findByIdAndUpdate(
      id,
      { $set: updateData },  // ✅ ใช้ $set เพื่อบังคับอัปเดต reason
      { new: true, runValidators: true }
    );

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    return NextResponse.json({ lesson }, { status: 200 });
  } catch (err) {
    console.error("❌ Failed to update lesson:", err);
    return NextResponse.json({ error: "Failed to update lesson" }, { status: 500 });
  }
}
