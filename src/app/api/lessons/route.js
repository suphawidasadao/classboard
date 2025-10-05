import { connectMongoDB } from '../../../../lib/mongodb';
import Lesson from '../../../../models/Lesson';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const role = session.user.role || "user";

    // ✅ จำกัดสิทธิ์เฉพาะครู/แอดมินเท่านั้น
    if (role !== "teacher" && role !== "admin") {
      return new Response(JSON.stringify({ error: 'Permission denied: only teachers can create lessons' }), { status: 403 });
    }

    await connectMongoDB();

    const formData = await req.formData();
    const lessonsJSON = formData.get('lessons');
    const subject = formData.get('subject')?.toString().trim() || '';

    let status = formData.get('status')?.toString().trim().toLowerCase() || 'draft';

    if (role === "admin") {
      // 🔹 Admin สามารถ publish ได้เลย
      if (!['draft', 'published'].includes(status)) status = 'published';
    } else if (role === "teacher") {
      if (!['draft', 'published'].includes(status)) status = 'draft';
    }

    if (!lessonsJSON) {
      return new Response(JSON.stringify({ error: 'No lessons data' }), { status: 400 });
    }

    const lessonsData = JSON.parse(lessonsJSON);

    // 🔹 อัปโหลดไฟล์ cover/question image เหมือนที่คุณทำไว้
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    for (let lIdx = 0; lIdx < lessonsData.length; lIdx++) {
      const lesson = lessonsData[lIdx];

      // ✅ Cover Image
      const coverFile = formData.get(`lessons[${lIdx}][coverImage]`);
      if (coverFile && coverFile.size > 0) {
        const buffer = Buffer.from(await coverFile.arrayBuffer());
        const fileName = `${Date.now()}-${uuidv4()}-${coverFile.name.replace(/\s+/g, '-')}`;
        fs.writeFileSync(path.join(uploadDir, fileName), buffer);
        lesson.coverImage = `/uploads/${fileName}`;
      } else {
        lesson.coverImage = lesson.coverImage || '';
      }

      // ✅ Question Images
      for (let uIdx = 0; uIdx < lesson.units.length; uIdx++) {
        const unit = lesson.units[uIdx];
        for (let qIdx = 0; qIdx < unit.questions.length; qIdx++) {
          const question = unit.questions[qIdx];
          question.questionText = question.questionText?.trim() || `คำถามว่าง ${qIdx + 1}`;

          question.choices = (question.choices || []).map((c, idx) => ({
            text: c.text?.trim() || `ตัวเลือกว่าง ${idx + 1}`,
            isCorrect: !!c.isCorrect,
          }));
          while (question.choices.length < 4) {
            question.choices.push({ text: `ตัวเลือกว่าง ${question.choices.length + 1}`, isCorrect: false });
          }

          const qFile = formData.get(`lessons[${lIdx}][units][${uIdx}][questions][${qIdx}][questionImage]`);
          if (qFile && qFile.size > 0) {
            const buffer = Buffer.from(await qFile.arrayBuffer());
            const fileName = `${Date.now()}-${uuidv4()}-${qFile.name.replace(/\s+/g, '-')}`;
            fs.writeFileSync(path.join(uploadDir, fileName), buffer);
            question.questionImage = `/uploads/${fileName}`;
          } else {
            question.questionImage = question.previewUrl || question.questionImage || '';
          }
        }
      }
    }

    // 🔹 บันทึกลง DB
    const lessonDoc = {
      subject,
      lessons: lessonsData,
      status,
      creator: session.user.email,
    };

    const createdLesson = await Lesson.create(lessonDoc);

    if (role === "teacher" && status === "pending") {
      await notifyAdmin(createdLesson);
    }

    return new Response(JSON.stringify(createdLesson), { status: 201 });

  } catch (err) {
    console.error('POST lesson error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Failed to create lesson' }), { status: 500 });
  }
}

