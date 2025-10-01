import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectMongoDB } from "../../../../../../lib/mongodb";
import Lesson from "../../../../../../models/Lesson";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

// =================== GET ===================
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectMongoDB();

    const lessonId = params.id;
    if (!lessonId || !mongoose.Types.ObjectId.isValid(lessonId)) {
      return NextResponse.json({ error: "Invalid Lesson ID" }, { status: 400 });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson)
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

    if (session.user.role !== "admin" && lesson.creator !== session.user.email) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    return NextResponse.json({ lesson }, { status: 200 });
  } catch (err) {
    console.error("GET lesson error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch lesson" },
      { status: 500 }
    );
  }
}

// =================== DELETE ===================
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectMongoDB();

    const lessonId = params.id;
    if (!lessonId || !mongoose.Types.ObjectId.isValid(lessonId)) {
      return NextResponse.json({ error: "Invalid Lesson ID" }, { status: 400 });
    }

    const deletedLesson = await Lesson.findOneAndDelete({
      _id: lessonId,
      creator: session.user.email,
    });

    if (!deletedLesson)
      return NextResponse.json(
        { error: "Lesson not found or permission denied" },
        { status: 404 }
      );

    return NextResponse.json(
      { message: "Deleted successfully", lesson: deletedLesson },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE lesson error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete lesson" },
      { status: 500 }
    );
  }
}

// =================== PUT (Update) ===================
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectMongoDB();

    const lessonId = params.id;
    if (!lessonId || !mongoose.Types.ObjectId.isValid(lessonId)) {
      return NextResponse.json({ error: "Invalid Lesson ID" }, { status: 400 });
    }

    const existingLesson = await Lesson.findById(lessonId);
    if (!existingLesson)
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

    // ตรวจสอบสิทธิ์ผู้ใช้
    if (session.user.role !== "admin" && existingLesson.creator !== session.user.email) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const formData = await req.formData();
    const lessonsJSON = formData.get("lessons");
    const subject = formData.get("subject") || existingLesson.subject;
    const status = formData.get("status") || existingLesson.status;

    if (!lessonsJSON)
      return NextResponse.json({ error: "No lessons data" }, { status: 400 });

    const lessonsData = JSON.parse(lessonsJSON);

    // สร้างโฟลเดอร์สำหรับอัปโหลดถ้ายังไม่มี
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    // อัปโหลดไฟล์ coverImage และ questionImage
    for (let lIdx = 0; lIdx < lessonsData.length; lIdx++) {
      const lesson = lessonsData[lIdx];

      // cover image
      const coverFile = formData.get(`lessons[${lIdx}][coverImage]`);
      if (coverFile && coverFile.size > 0) {
        const buffer = Buffer.from(await coverFile.arrayBuffer());
        const fileName = `${Date.now()}-${coverFile.name.replace(/\s+/g, "-")}`;
        fs.writeFileSync(path.join(uploadDir, fileName), buffer);
        lesson.coverImage = `/uploads/${fileName}`;
      }

      // question images
      for (let uIdx = 0; uIdx < lesson.units.length; uIdx++) {
        const unit = lesson.units[uIdx];
        for (let qIdx = 0; qIdx < unit.questions.length; qIdx++) {
          const question = unit.questions[qIdx];
          const qFile = formData.get(
            `lessons[${lIdx}][units][${uIdx}][questions][${qIdx}][questionImage]`
          );
          if (qFile && qFile.size > 0) {
            const buffer = Buffer.from(await qFile.arrayBuffer());
            const fileName = `${Date.now()}-${qFile.name.replace(/\s+/g, "-")}`;
            fs.writeFileSync(path.join(uploadDir, fileName), buffer);
            question.questionImage = `/uploads/${fileName}`;
          }
        }
      }
    }

    // Merge ข้อมูลเดิมกับข้อมูลใหม่
    const existingLessonObj = existingLesson.toObject();
    const lessonToUpdate = {
      ...existingLessonObj,
      subject,
      status,
      updatedAt: new Date(),
      lessons: lessonsData.map((lesson, lIdx) => {
        const existingLessonItem = existingLessonObj.lessons[lIdx] || {};
        return {
          ...existingLessonItem,
          ...lesson,
          coverImage: lesson.coverImage || existingLessonItem.coverImage || "",
          units: lesson.units.map((unit, uIdx) => {
            const existingUnit = existingLessonItem.units?.[uIdx] || {};
            return {
              ...existingUnit,
              ...unit,
              questions: unit.questions.map((q, qIdx) => {
                const existingQ = existingUnit.questions?.[qIdx] || {};
                return {
                  ...existingQ,
                  ...q,
                  questionImage: q.questionImage || existingQ.questionImage || "",
                  choices: q.choices.length === 4 ? q.choices : existingQ.choices || q.choices,
                };
              }),
            };
          }),
        };
      }),
    };

    // อัปเดตใน MongoDB
    const updatedLesson = await Lesson.findByIdAndUpdate(
      lessonId,
      lessonToUpdate,
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedLesson, { status: 200 });
  } catch (err) {
    console.error("PUT lesson error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update lesson" },
      { status: 500 }
    );
  }
}