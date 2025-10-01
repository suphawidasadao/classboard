'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../../../../components/AdminLayout';
import { useParams } from 'next/navigation';
import { BsCheck } from 'react-icons/bs';
import { FaCalendarDay } from "react-icons/fa";
import { useSession } from "next-auth/react";

export default function LessonDetailPage() {
  const params = useParams();
  const { id } = params;
  const { data: session } = useSession();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchLesson = async () => {
      try {
        const res = await fetch(`/api/admin/lessons/${id}`);
        if (!res.ok) throw new Error("Failed to fetch lesson");
        const data = await res.json();
        setLesson(data.lesson);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [id]);

  const mainLesson = lesson?.lessons?.[0] || {};

  return (
    <AdminLayout activeViewProp="lessons">
      <div className="min-h-screen p-8">
        {loading ? (
          <div className="text-center text-gray-400 py-10 animate-pulse">
            กำลังโหลด...
          </div>
        ) : !lesson ? (
          <div className="text-center text-gray-400 py-10">ไม่พบบทเรียน</div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Lesson Detail */}
            <h1 className="text-xl font-bold text-gray-800">
              {mainLesson.title || '-'}
            </h1>

            {/* Info Card */}
            <div className="bg-white p-6 rounded-lg shadow flex flex-col md:flex-row justify-between items-start">
              <div className="space-y-2">
                {lesson.creator !== 'admin@gmail.com' && (
                  <p className="text-gray-700 text-sm flex items-center gap-1">
                    ผู้สร้าง: {lesson.creator || '-'}
                  </p>
                )}
                <div className="flex items-center text-sm space-x-2 text-gray-700">
                  <span>วิชา: {lesson.subject || '-'}</span>
                </div>
                <p className="text-gray-700 text-sm flex items-center gap-1">
                  ชื่อหนังสือ: {mainLesson.bookName || "-"}
                </p>
                {lesson.status === "rejected" && (
                  <p className="text-red-600 text-sm font-medium">
                    เหตุผลการปฏิเสธ: {lesson.reason || "-"}
                  </p>
                )}
              </div>

              <p className="text-gray-500 text-sm flex items-center gap-1">
                <FaCalendarDay className="w-4 h-4" />
                สร้างเมื่อ: {new Date(lesson.createdAt).toLocaleDateString("th-TH")}
              </p>
            </div>

            {/* Units */}
            <div className="space-y-6">
              {mainLesson.units?.map((unit, uIdx) => (
                <div
                  key={uIdx}
                  className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm"
                >
                  <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-3 mb-4">
                    {unit.title}
                  </h2>

                  <div className="space-y-6">
                    {unit.questions?.map((q, qIdx) => (
                      <div key={qIdx} className="space-y-4 border-b border-gray-200 pb-4">
                        <p className="font-semibold text-gray-800">
                          {qIdx + 1}. {q.questionText}
                        </p>

                        {q.questionImage && (
                          <img
                            src={q.questionImage}
                            alt={`รูปคำถาม ${qIdx + 1}`}
                            className="w-40 h-40 object-cover rounded border border-gray-300"
                          />
                        )}

                        {/* Choices */}
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          {q.choices?.map((c, cIdx) => (
                            <div
                              key={cIdx}
                              className={`flex items-center gap-2 p-2 rounded-md transition
                                ${c.isCorrect ? "bg-green-50" : "hover:bg-gray-50"}`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full flex items-center justify-center
                                  ${c.isCorrect ? "bg-green-600" : "bg-white border border-gray-300"}`}
                              >
                                {c.isCorrect && <BsCheck className="text-white w-3 h-3" />}
                              </div>
                              <span className={`text-sm ${c.isCorrect ? "text-green-700 font-semibold" : "text-gray-700"}`}>
                                {c.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
