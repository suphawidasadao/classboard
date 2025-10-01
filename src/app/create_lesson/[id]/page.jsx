'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BsCheck2Square, BsFileEarmark } from 'react-icons/bs';
import { BiSend } from 'react-icons/bi';
import { useSession } from "next-auth/react";
import { FiEdit } from "react-icons/fi"

const defaultChoiceColors = ['bg-[#d5e8fa]', 'bg-[#d9f9fc]', 'bg-[#fff2d9]', 'bg-[#ffdbfb]'];

const createDefaultChoices = () =>
  defaultChoiceColors.map((color, idx) => ({
    id: idx + 1,
    text: '',
    isCorrect: false,
    color,
  }));

// 🔹 หน่วยเริ่มต้น
const createDefaultUnit = (unitNumber) => ({
  title: `หน่วยที่ ${unitNumber}`,
  questions: [
    {
      questionText: '',
      choices: createDefaultChoices(),
      questionImageFile: null,
      previewUrl: null,
    },
  ],
});

const createDefaultLesson = (lessonNumber) => ({
  title: ``,
  bookName: '',
  coverImageFile: null,     // สำหรับไฟล์ cover image
  coverPreviewUrl: null,    // สำหรับ preview
  units: [createDefaultUnit(1)],
});


export default function CreateLessonsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [subject, setSubject] = useState('ภาษาอังกฤษ');
  const [lessons, setLessons] = useState([createDefaultLesson(1)]);

  // ➕ เพิ่มหน่วย
  const addNewUnit = (lessonIdx) => {
    const updated = [...lessons];
    const newUnitNumber = updated[lessonIdx].units.length + 1;
    updated[lessonIdx].units.push(createDefaultUnit(newUnitNumber));
    setLessons(updated);
  };

  // ➕ เพิ่มคำถาม
  const addQuestionToUnit = (lessonIdx, unitIdx) => {
    const updated = [...lessons];
    updated[lessonIdx].units[unitIdx].questions.push({
      questionText: '',
      choices: createDefaultChoices(),
      questionImageFile: null,
      previewUrl: null,
    });
    setLessons(updated);
  };

  // ✏️ แก้ไขคำถาม
  const updateQuestionText = (lessonIdx, unitIdx, qIdx, value) => {
    const updated = [...lessons];
    updated[lessonIdx].units[unitIdx].questions[qIdx].questionText = value;
    setLessons(updated);
  };

  // 📷 อัปเดตรูปภาพคำถาม
  const updateQuestionImage = (lessonIdx, unitIdx, qIdx, file) => {
    const updated = [...lessons];
    updated[lessonIdx].units[unitIdx].questions[qIdx].questionImageFile = file;
    updated[lessonIdx].units[unitIdx].questions[qIdx].previewUrl = URL.createObjectURL(file);
    setLessons(updated);
  };

  // ✏️ แก้ไขตัวเลือก
  const updateChoiceText = (lessonIdx, unitIdx, qIdx, choiceIdx, value) => {
    const updated = [...lessons];
    updated[lessonIdx].units[unitIdx].questions[qIdx].choices[choiceIdx].text = value;
    setLessons(updated);
  };

  // ✅ เลือกคำตอบที่ถูกต้อง
  const toggleChoiceCorrect = (lessonIdx, unitIdx, qIdx, choiceIdx) => {
    const updated = [...lessons];
    updated[lessonIdx].units[unitIdx].questions[qIdx].choices =
      updated[lessonIdx].units[unitIdx].questions[qIdx].choices.map((c, i) => ({
        ...c,
        isCorrect: i === choiceIdx,
      }));
    setLessons(updated);
  };

  // 🔍 ตรวจสอบข้อมูลก่อนบันทึก
  const validateLessons = () => {
    for (const lesson of lessons) {
      if (!lesson.title.trim()) {
        alert('กรุณากรอกชื่อบท');
        return false;
      }
      if (lesson.units.length === 0) {
        alert(`${lesson.title} ต้องมีอย่างน้อย 1 หน่วย`);
        return false;
      }
      for (const unit of lesson.units) {
        if (unit.questions.length === 0) {
          alert(`${unit.title} ต้องมีอย่างน้อย 1 คำถาม`);
          return false;
        }
        for (const question of unit.questions) {
          if (!question.questionText.trim()) {
            alert(`พบคำถามว่างใน ${unit.title}`);
            return false;
          }
          if (question.choices.length < 2) {
            alert(`คำถามใน ${unit.title} ต้องมีตัวเลือกอย่างน้อย 2 ตัว`);
            return false;
          }
          if (!question.choices.some((c) => c.isCorrect)) {
            alert(`คำถามใน ${unit.title} ต้องมีคำตอบที่ถูกต้อง`);
            return false;
          }
        }
      }
    }
    return true;
  };

  const saveToBackend = async () => {
    if (!validateLessons()) return;

    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('status', 'pending'); // หรือ draft

    const lessonsWithoutFile = lessons.map((lesson) => ({
      title: lesson.title,
      bookName: lesson.bookName,
      units: lesson.units.map((unit) => ({
        title: unit.title,
        questions: unit.questions.map((q) => ({
          questionText: q.questionText,
          choices: q.choices,
        })),
      })),
    }));

    formData.append("lessons", JSON.stringify(lessonsWithoutFile));

    // แนบไฟล์จริง
    lessons.forEach((lesson, lIdx) => {
      if (lesson.coverImageFile) {
        formData.append(`lessons[${lIdx}][coverImage]`, lesson.coverImageFile);
      }
      lesson.units.forEach((unit, uIdx) => {
        unit.questions.forEach((q, qIdx) => {
          if (q.questionImageFile) {
            formData.append(`lessons[${lIdx}][units][${uIdx}][questions][${qIdx}][questionImage]`, q.questionImageFile);
          }
        });
      });
    });


    try {
      const res = await fetch('/api/lessons', { method: 'POST', body: formData });
      if (res.ok) {
        alert('บันทึกบทเรียนสำเร็จ');
        router.push('/lesson_pending');
      } else {
        const errorData = await res.json();
        alert('เกิดข้อผิดพลาด: ' + (errorData.error || 'ไม่ทราบสาเหตุ'));
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
  };

  const saveDraft = async () => {
    if (!validateLessons()) return;

    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('status', 'draft'); // บอกว่าเป็นฉบับร่าง
    formData.append('creator', session?.user?.email); // บันทึกผู้สร้าง

    const lessonsWithoutFile = lessons.map((lesson) => ({
      title: lesson.title,
      bookName: lesson.bookName,
      units: lesson.units.map((unit) => ({
        title: unit.title,
        questions: unit.questions.map((q) => ({
          questionText: q.questionText,
          choices: q.choices,
        })),
      })),
    }));

    formData.append("lessons", JSON.stringify(lessonsWithoutFile));

    // แนบไฟล์จริง
    lessons.forEach((lesson, lIdx) => {
      if (lesson.coverImageFile) {
        formData.append(`lessons[${lIdx}][coverImage]`, lesson.coverImageFile);
      }
      lesson.units.forEach((unit, uIdx) => {
        unit.questions.forEach((q, qIdx) => {
          if (q.questionImageFile) {
            formData.append(`lessons[${lIdx}][units][${uIdx}][questions][${qIdx}][questionImage]`, q.questionImageFile);
          }
        });
      });
    });

    try {
      // เรียก API เดียวกัน แต่ backend ต้องปรับให้ draft ไม่ไปหาแอดมิน
      const res = await fetch('/api/lessons', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        alert('บันทึกฉบับร่างสำเร็จ');
        router.push('/lesson_drafts'); // หน้าเก็บ draft ของผู้สร้าง
      } else {
        const errorData = await res.json();
        alert('เกิดข้อผิดพลาดในการบันทึกฉบับร่าง: ' + (errorData.error || 'ไม่ทราบสาเหตุ'));
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    }
  };



  return (
    <div className="bg-white min-h-screen">
      {/* NAVBAR */}
      <nav className="bg-white w-full px-6 border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center py-4">
          <div className="relative inline-block w-48">
            <select
              className="w-full border border-gray-300 px-10 py-2 rounded text-sm"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="ภาษาอังกฤษ">ภาษาอังกฤษ</option>
              <option value="ภาษาไทย">วิทยาศาสตร์</option>
              <option value="คณิตศาสตร์">คณิตศาสตร์</option>
            </select>
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
              <BsCheck2Square className="text-lg" />
            </div>
          </div>

          <div className="flex gap-3 text-sm">
            <button
              onClick={saveDraft}
              className="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
            >
              <BsFileEarmark className="text-lg" />
              ฉบับล่าง
            </button>

            <button
              onClick={saveToBackend}
              className="flex items-center gap-2 bg-[#2e003e] text-white px-4 py-2 rounded hover:bg-[#48065e] transition"
            >
              <BiSend className="text-lg" />
              ส่งตรวจ
            </button>
          </div>
        </div>
      </nav>

      {/* 🔹 LOOP แสดงบท */}
      {lessons.map((lesson, lessonIdx) => (
        <div key={lessonIdx} className="max-w-4xl mx-auto mt-8 p-6 bg-gray-100 rounded-xl shadow space-y-8">
          
          {/* แถวบน: รูปหน้าปก */}
          <div className="flex">
            <label className="cursor-pointer relative">
              {lesson.coverPreviewUrl ? (
                <div className="relative">
                  <img
                    src={lesson.coverPreviewUrl}
                    alt={`หน้าปกบทที่ ${lessonIdx + 1}`}
                    className="w-32 h-32 object-cover rounded-xl shadow border"
                  />
                  {/* ไอคอน Edit overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 hover:opacity-100 rounded-xl transition">
                    <FiEdit className="text-white text-4xl" />
                  </div>
                </div>
              ) : (
                <div className="w-32 h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl text-gray-400">
                  เพิ่มรูปหน้าปก
                </div>
              )}

              {/* Input ซ่อนอยู่ */}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files.length > 0) {
                    const updated = [...lessons];
                    updated[lessonIdx].coverImageFile = e.target.files[0];
                    updated[lessonIdx].coverPreviewUrl = URL.createObjectURL(e.target.files[0]);
                    setLessons(updated);
                  }
                }}
              />
            </label>
          </div>

          <h1 className="text-lg font-bold">บทที่ {lessonIdx + 1}</h1>
          
          {/* แถวล่าง: ชื่อบทเรียน + หนังสืออ้างอิง */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อบทเรียน</label>
              <input
                type="text"
                placeholder="กรอกชื่อบทเรียน"
                value={lesson.title}
                onChange={(e) => {
                  const updated = [...lessons];
                  updated[lessonIdx].title = e.target.value;
                  setLessons(updated);
                }}
                className="w-full bg-white p-3 border border-gray-300 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">หนังสืออ้างอิง</label>
              <input
                type="text"
                placeholder="กรอกชื่อหนังสืออ้างอิง"
                value={lesson.bookName}
                onChange={(e) => {
                  const updated = [...lessons];
                  updated[lessonIdx].bookName = e.target.value;
                  setLessons(updated);
                }}
                className="w-full bg-white p-3 border border-gray-300 rounded-xl text-sm"
              />
            </div>
          </div>

          {/* แสดงหน่วย */}
          {lesson.units.map((unit, unitIdx) => (
            <div key={unitIdx} className="bg-gray-200 p-4 rounded-xl space-y-6">
              <h2 className="text-base font-semibold">{unit.title}</h2>

              {/* แสดงคำถาม */}
              {unit.questions.map((q, qIdx) => (
                <div key={qIdx} className="bg-white p-4 rounded-xl shadow space-y-4">
                  {/* คำถาม + รูป */}
                  <div className="flex gap-4">
                    {q.previewUrl && (
                      <img
                        src={q.previewUrl}
                        alt={`รูปคำถามที่ ${qIdx + 1}`}
                        className="w-40 h-40 object-cover rounded border"
                      />
                    )}
                    <textarea
                      placeholder={`คำถามที่ ${qIdx + 1}`}
                      value={q.questionText}
                      onChange={(e) => updateQuestionText(lessonIdx, unitIdx, qIdx, e.target.value)}
                      className="flex-1 h-40 p-3 border border-gray-300 rounded resize-none"
                    />
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files.length > 0) {
                        updateQuestionImage(lessonIdx, unitIdx, qIdx, e.target.files[0]);
                      }
                    }}
                  />

                  {/* ตัวเลือก */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {q.choices.map((choice, choiceIdx) => (
                      <div key={choice.id} className={`${choice.color} p-4 rounded-xl`}>
                        <textarea
                          className="w-full h-16 p-2 rounded resize-none"
                          placeholder="ตัวเลือก"
                          value={choice.text}
                          onChange={(e) =>
                            updateChoiceText(lessonIdx, unitIdx, qIdx, choiceIdx, e.target.value)
                          }
                        />
                        <input
                          type="checkbox"
                          checked={choice.isCorrect}
                          onChange={() => toggleChoiceCorrect(lessonIdx, unitIdx, qIdx, choiceIdx)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={() => addQuestionToUnit(lessonIdx, unitIdx)}
                className="mt-2 w-[10rem] h-12 bg-white border border-gray-400 text-sm px-4 py-2 rounded-xl"
              >
                เพิ่มคำถามในหน่วยนี้
              </button>
            </div>
          ))}

          <div className="flex justify-end mt-6">
            <button
              onClick={() => addNewUnit(lessonIdx)}
              className="w-[10rem] h-12 bg-white border border-gray-300 text-gray-500 rounded-xl transition"
            >
              เพิ่มหน่วยถัดไป
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
