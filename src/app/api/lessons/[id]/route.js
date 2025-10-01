import mongoose from 'mongoose';
import { connectMongoDB } from '../../../../../lib/mongodb';
import Lesson from '../../../../../models/Lesson';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export const config = { api: { bodyParser: false } };

// =================== PUT ===================
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const lessonId = params.id;
    if (!lessonId || !mongoose.Types.ObjectId.isValid(lessonId)) {
      return NextResponse.json({ error: 'Invalid Lesson ID' }, { status: 400 });
    }

    await connectMongoDB();
    const existingLesson = await Lesson.findById(lessonId);
    if (!existingLesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });

    const formData = await req.formData();
    const lessonsJSON = formData.get('lessons');
    const subject = formData.get('subject') || existingLesson.subject;
    const status = formData.get('status') || existingLesson.status;
    const reason = formData.get('reason') || '';

    if (!lessonsJSON) return NextResponse.json({ error: 'No lessons data' }, { status: 400 });

    const lessonsData = JSON.parse(lessonsJSON);
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    for (let lIdx = 0; lIdx < lessonsData.length; lIdx++) {
      const lesson = lessonsData[lIdx];

      // =================== coverImage ===================
      const coverFile = formData.get(`lessons[${lIdx}][coverImage]`);
      if (coverFile && coverFile.size > 0) {
        const buffer = Buffer.from(await coverFile.arrayBuffer());
        const fileName = `${Date.now()}-${coverFile.name.replace(/\s+/g, '-')}`;
        fs.writeFileSync(path.join(uploadDir, fileName), buffer);
        lesson.coverImage = `/uploads/${fileName}`;
      } else {
        lesson.coverImage = lesson.coverImage || '';
      }

      // =================== questions ===================
      for (let uIdx = 0; uIdx < lesson.units.length; uIdx++) {
        const unit = lesson.units[uIdx];
        for (let qIdx = 0; qIdx < unit.questions.length; qIdx++) {
          const question = unit.questions[qIdx];

          // check questionImage
          const qFile = formData.get(`lessons[${lIdx}][units][${uIdx}][questions][${qIdx}][questionImage]`);
          if (qFile && qFile.size > 0) {
            const buffer = Buffer.from(await qFile.arrayBuffer());
            const fileName = `${Date.now()}-${qFile.name.replace(/\s+/g, '-')}`;
            fs.writeFileSync(path.join(uploadDir, fileName), buffer);
            question.questionImage = `/uploads/${fileName}`;
          } else {
            question.questionImage = question.questionImage || '';
          }
        }
      }
    }

    const updatedLesson = await Lesson.findByIdAndUpdate(
      lessonId,
      { subject, lessons: lessonsData, status, reason, creator: session.user.email, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedLesson, { status: 200 });
  } catch (err) {
    console.error('PUT lesson error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update lesson' }, { status: 500 });
  }
}

// =================== GET ===================
export async function GET(req, { params }) {
  try {
    await connectMongoDB();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid Lesson ID' }, { status: 400 });
    }

    const lesson = await Lesson.findById(id);
    if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });

    return NextResponse.json({ lesson }); // ✅ frontend ต้องใช้ field lesson
  } catch (err) {
    console.error('GET lesson error:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch lesson' }, { status: 500 });
  }
}

// =================== DELETE ===================
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const lessonId = params.id;
    if (!lessonId || !mongoose.Types.ObjectId.isValid(lessonId)) {
      return NextResponse.json({ error: 'Invalid Lesson ID' }, { status: 400 });
    }

    await connectMongoDB();

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });

    // ตรวจสอบว่า session.user.email เป็น creator ของบทเรียนก่อนลบ
    if (lesson.creator !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden: ไม่สามารถลบบทเรียนของผู้อื่น' }, { status: 403 });
    }

    await Lesson.findByIdAndDelete(lessonId);

    return NextResponse.json({ message: 'ลบบทเรียนสำเร็จ' }, { status: 200 });
  } catch (err) {
    console.error('DELETE lesson error:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete lesson' }, { status: 500 });
  }
}
