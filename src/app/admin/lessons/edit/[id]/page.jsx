'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { BsCheck2Square, BsFileEarmark } from 'react-icons/bs';
import { BiSend } from 'react-icons/bi';
import { useSession } from "next-auth/react";
import { FiEdit } from "react-icons/fi";

const defaultChoiceColors = ['bg-[#d5e8fa]', 'bg-[#d9f9fc]', 'bg-[#fff2d9]', 'bg-[#ffdbfb]'];
const createDefaultChoices = () =>
  defaultChoiceColors.map((color, idx) => ({
    id: idx + 1,
    text: '',
    isCorrect: false,
    color,
  }));

export default function EditLessonsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const lessonId = params?.id;

  const [subject, setSubject] = useState('ภาษาอังกฤษ');
  const [lessonTitle, setLessonTitle] = useState('');
  const [bookName, setBookName] = useState('');
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState(null);

  const [units, setUnits] = useState([
    {
      title: 'หน่วยที่ 1',
      questions: [
        {
          questionText: '',
          choices: createDefaultChoices(),
          questionImageFile: null,
          previewUrl: null,
        },
      ],
    },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lessonId) return;

    async function fetchLesson() {
      try {
        const res = await fetch(`/api/admin/lessons/${lessonId}`);
        if (!res.ok) throw new Error('ไม่สามารถโหลดข้อมูลบทเรียนได้');
        const data = await res.json();
        const lessonData = data.lesson || data;

        setSubject(lessonData.subject || 'ภาษาอังกฤษ');

        const firstLesson = (lessonData.lessons && lessonData.lessons[0]) || {};
        setLessonTitle(firstLesson.title || '');
        setBookName(firstLesson.bookName || '');
        setCoverPreviewUrl(firstLesson.coverImage || null);

        const loadedUnits = (firstLesson.units || []).map(unit => ({
          title: unit.title || '',
          questions: (unit.questions || []).map(q => ({
            questionText: q.questionText || '',
            choices: (q.choices || []).map((c, idx) => ({
              id: idx + 1,
              text: c.text || '',
              isCorrect: c.isCorrect || false,
              color: defaultChoiceColors[idx] || 'bg-gray-200',
            })),
            questionImageFile: null,
            previewUrl: q.questionImage || null,
          })),
        }));

        setUnits(loadedUnits.length > 0 ? loadedUnits : units);
        setLoading(false);
      } catch (error) {
        alert(error.message);
        setLoading(false);
      }
    }

    fetchLesson();
  }, [lessonId]);

  // ====== ฟังก์ชันจัดการคำถาม หน่วย ตัวเลือก ======
  const addQuestionToUnit = (unitIdx) => {
    const updated = [...units];
    updated[unitIdx].questions.push({
      questionText: '',
      choices: createDefaultChoices(),
      questionImageFile: null,
      previewUrl: null,
    });
    setUnits(updated);
  };

  const addNewUnit = () => {
    const newUnitNumber = units.length + 1;
    const newUnit = {
      title: `หน่วยที่ ${newUnitNumber}`,
      questions: [
        {
          questionText: '',
          choices: createDefaultChoices(),
          questionImageFile: null,
          previewUrl: null,
        },
      ],
    };
    setUnits([...units, newUnit]);
  };

  const updateQuestionText = (unitIdx, qIdx, value) => {
    const updated = [...units];
    updated[unitIdx].questions[qIdx].questionText = value;
    setUnits(updated);
  };

  const updateQuestionImage = (unitIdx, qIdx, file) => {
    const updated = [...units];
    updated[unitIdx].questions[qIdx].questionImageFile = file;
    updated[unitIdx].questions[qIdx].previewUrl = URL.createObjectURL(file);
    setUnits(updated);
  };

  const updateChoiceText = (unitIdx, qIdx, choiceIdx, value) => {
    const updated = [...units];
    updated[unitIdx].questions[qIdx].choices[choiceIdx].text = value;
    setUnits(updated);
  };

  const toggleChoiceCorrect = (unitIdx, qIdx, choiceIdx) => {
    const updated = [...units];
    updated[unitIdx].questions[qIdx].choices = updated[unitIdx].questions[qIdx].choices.map((c, i) => ({
      ...c,
      isCorrect: i === choiceIdx,
    }));
    setUnits(updated);
  };

  // ====== ตรวจสอบข้อมูลก่อนบันทึก ======
  const validateUnits = () => {
    if (!lessonTitle.trim()) {
      alert('กรุณากรอกชื่อบทเรียน');
      return false;
    }
    if (units.length === 0) {
      alert('กรุณาเพิ่มหน่วยอย่างน้อย 1 หน่วย');
      return false;
    }
    for (const unit of units) {
      if (unit.questions.length === 0) {
        alert(`หน่วย ${unit.title} ต้องมีคำถามอย่างน้อย 1 ข้อ`);
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
          alert(`คำถามใน ${unit.title} ต้องมีตัวเลือกถูกต้องอย่างน้อย 1 ตัว`);
          return false;
        }
      }
    }
    return true;
  };

  // ====== ฟังก์ชัน Update / Send ======
  const updateLesson = async () => {
    if (!validateUnits()) return;

    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("status", "draft");
    formData.append("creator", session?.user?.email || "");
    formData.append("updatedAt", new Date().toISOString());

    const formattedUnits = units.map(unit => ({
      title: unit.title,
      questions: unit.questions.map(q => ({
        questionText: q.questionText,
        choices: q.choices,
        questionImage: q.previewUrl || "",
      })),
    }));

    const lessonsWithoutFile = [
      {
        title: lessonTitle,
        bookName: bookName,
        units: formattedUnits,
      },
    ];
    formData.append("lessons", JSON.stringify(lessonsWithoutFile));

    if (coverImageFile) {
      formData.append(`lessons[0][coverImage]`, coverImageFile);
    }

    units.forEach((unit, uIdx) => {
      unit.questions.forEach((q, qIdx) => {
        if (q.questionImageFile) {
          formData.append(
            `lessons[0][units][${uIdx}][questions][${qIdx}][questionImage]`,
            q.questionImageFile
          );
        }
      });
    });

    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        alert("แก้ไขบทเรียนสำเร็จ");
        router.push("/admin/admin_dashboard?tab=drafts");
      } else {
        const errorData = await res.json();
        alert("เกิดข้อผิดพลาด: " + (errorData.error || "ไม่ทราบสาเหตุ"));
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    }
  };

  const saveToBackend = async () => {
    if (!validateUnits()) return;

    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("status", "published");
    formData.append("creator", session?.user?.email || "");
    formData.append("updatedAt", new Date().toISOString());

    const formattedUnits = units.map(unit => ({
      title: unit.title,
      questions: unit.questions.map(q => ({
        questionText: q.questionText,
        choices: q.choices,
        questionImage: q.previewUrl || "",
      })),
    }));

    const lessonsWithoutFile = [
      {
        title: lessonTitle,
        bookName: bookName,
        units: formattedUnits,
      },
    ];
    formData.append("lessons", JSON.stringify(lessonsWithoutFile));

    if (coverImageFile) {
      formData.append(`lessons[0][coverImage]`, coverImageFile);
    }

    units.forEach((unit, uIdx) => {
      unit.questions.forEach((q, qIdx) => {
        if (q.questionImageFile) {
          formData.append(
            `lessons[0][units][${uIdx}][questions][${qIdx}][questionImage]`,
            q.questionImageFile
          );
        }
      });
    });

    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        alert("ส่งบทเรียนสำเร็จ");
        router.push("/admin/admin_dashboard");
      } else {
        const errorData = await res.json();
        alert("เกิดข้อผิดพลาด: " + (errorData.error || "ไม่ทราบสาเหตุ"));
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    }
  };

  if (loading) {
    return <div className="text-center p-10">กำลังโหลดข้อมูลบทเรียน...</div>;
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Navbar */}
      <nav className="bg-white w-full px-6 border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center py-4">
          <div className="relative inline-block w-48">
            <select
              className="w-full border border-gray-300 px-10 py-2 rounded text-sm"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="ภาษาอังกฤษ">ภาษาอังกฤษ</option>
              <option value="ภาษาไทย">ภาษาไทย</option>
              <option value="คณิตศาสตร์">คณิตศาสตร์</option>
            </select>
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
              <BsCheck2Square className="text-lg" />
            </div>
          </div>

          <div className="flex gap-3 text-sm">
            <button
              onClick={updateLesson}
              className="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
            >
              <BsFileEarmark className="text-lg" /> ฉบับร่าง
            </button>
            <button
              onClick={saveToBackend}
              className="flex items-center gap-2 bg-[#2e003e] text-white px-4 py-2 rounded hover:bg-[#48065e] transition"
            >
              <BiSend className="text-lg" /> ส่งตรวจ
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto mt-8 p-6 bg-gray-100 rounded-xl shadow space-y-8">
        {/* รูปปกบทเรียน */}
        <div className="flex items-center gap-4">
          <label className="cursor-pointer relative">
            {coverPreviewUrl ? (
              <div className="relative w-32 h-32">
                <img
                  src={coverPreviewUrl}
                  alt="หน้าปกบทเรียน"
                  className="w-32 h-32 object-cover rounded-xl border"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 hover:opacity-100 rounded-xl transition">
                  <FiEdit className="text-white text-4xl" />
                </div>
              </div>
            ) : (
              <div className="w-32 h-32 flex items-center justify-center border-2 border-dashed rounded-xl text-gray-400">
                เลือกรูปหน้าปก
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files.length > 0) {
                  const file = e.target.files[0];
                  setCoverImageFile(file);
                  setCoverPreviewUrl(URL.createObjectURL(file));
                }
              }}
            />
          </label>
        </div>

        {/* ชื่อบทเรียนและหนังสืออ้างอิง */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อบทเรียน</label>
            <input
              type="text"
              placeholder="กรอกชื่อบทเรียน"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              className="w-full bg-white p-3 border border-gray-300 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">หนังสืออ้างอิง</label>
            <input
              type="text"
              placeholder="กรอกชื่อหนังสืออ้างอิง"
              value={bookName}
              onChange={(e) => setBookName(e.target.value)}
              className="w-full bg-white p-3 border border-gray-300 rounded-xl text-sm"
            />
          </div>
        </div>

        {/* หน่วยและคำถาม */}
        {units.map((unit, unitIdx) => (
          <div key={unitIdx} className="bg-gray-200 p-4 rounded-xl space-y-6">
            <h2 className="text-base font-semibold mb-4">{unit.title}</h2>
            {unit.questions.map((q, qIdx) => (
              <div key={qIdx} className="bg-white p-4 rounded-xl shadow space-y-4">
                <div className="flex gap-4">
                  {q.previewUrl && <img src={q.previewUrl} alt={`รูปคำถามที่ ${qIdx + 1}`} className="w-40 h-40 object-cover rounded border"/>}
                  <textarea
                    placeholder={`คำถามที่ ${qIdx + 1}`}
                    value={q.questionText}
                    onChange={(e) => updateQuestionText(unitIdx, qIdx, e.target.value)}
                    className="flex-1 h-40 p-3 border border-gray-300 rounded resize-none"
                  />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files.length > 0) {
                      updateQuestionImage(unitIdx, qIdx, e.target.files[0]);
                    }
                  }}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {q.choices.map((choice, choiceIdx) => (
                    <div key={choice.id} className={`${choice.color} p-4 rounded-xl`}>
                      <textarea
                        className="w-full h-16 p-2 rounded resize-none"
                        placeholder="ตัวเลือก"
                        value={choice.text}
                        onChange={(e) => updateChoiceText(unitIdx, qIdx, choiceIdx, e.target.value)}
                      />
                      <input
                        type="checkbox"
                        checked={choice.isCorrect}
                        onChange={() => toggleChoiceCorrect(unitIdx, qIdx, choiceIdx)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={() => addQuestionToUnit(unitIdx)} className="mt-2 bg-white border border-gray-400 text-sm px-4 py-2 rounded-xl">
              เพิ่มคำถามในหน่วยนี้
            </button>
          </div>
        ))}

        {/* ปุ่มเพิ่มหน่วย */}
        <div className="flex justify-center mt-6">
          <button onClick={addNewUnit} className="w-[12rem] h-12 bg-white border border-gray-300 text-gray-500 rounded-xl transition">
            เพิ่มหน่วยถัดไป
          </button>
        </div>
      </div>
    </div>
  );
}
