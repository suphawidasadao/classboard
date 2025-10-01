"use client";
 
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { BsCheck } from "react-icons/bs"
import { FaCalendarDay } from "react-icons/fa";
import SideLayout from "../../../../../components/SideLayout";
 
export default function LessonDetailPageWithNav() {
  const { data: session } = useSession();
  const params = useParams();
  const lessonId = params?.id;
  const router = useRouter();
  const [lesson, setLesson] = useState(null);
 
  useEffect(() => {
    if (!lessonId) return;
 
    const fetchLesson = async () => {
      try {
        const res = await fetch(`/api/lessons/${lessonId}`);
        if (!res.ok) throw new Error("Lesson not found");
        const data = await res.json();
 
        const lessonData = data.lesson;
        const firstLesson = lessonData.lessons?.[0] || {};
 
        const lessonObj = {
          title: firstLesson.title || "",
          bookName: firstLesson.bookName || "-",
          units: firstLesson.units || [],
          subject: lessonData.subject || "",
          status: lessonData.status || "",
          creator: lessonData.creator || "-",
          createdAt: lessonData.createdAt || null,
          reason: lessonData.reason || "",
        };
 
        console.log("Fetched Lesson:", lessonObj);
 
        setLesson(lessonObj);
      } catch (err) {
        console.error(err);
      }
    };
 
    fetchLesson();
  }, [lessonId]);
 
  if (!lesson) return <div className="p-10 text-gray-500">กำลังโหลด...</div>;
 
  return (
    <SideLayout>
      <div className="min-h-screen">
        <div className="p-8 max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-xl font-bold text-gray-800">{lesson.title}</h1>
          </div>
 
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div className="space-y-1 text-gray-700">
                <div className="flex items-center space-x-2 text-base">
                  <span>วิชา: {lesson.subject}</span>
                </div>
                <p className="text-gray-700 text-base">หนังสือ: {lesson.bookName || "-"}</p>
                <p className="text-gray-700 text-base">สถานะ: {lesson.status}</p>
                {lesson.status === "rejected" && (
                  <p className="text-red-600 text-base mt-2">
                    เหตุผลที่ถูกปฏิเสธ: {lesson.reason || "-"}
                  </p>
                )}
              </div>
 
              <div className="text-gray-500 text-sm flex items-center gap-1">
                <FaCalendarDay />
                <span>
                  สร้างเมื่อ: {lesson.createdAt ? new Date(lesson.createdAt).toLocaleDateString("th-TH") : "-"}
                </span>
              </div>
            </div>
          </div>
 
          <div className="space-y-6">
            {lesson.units?.map((unit, uIdx) => (
              <div key={uIdx} className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-3 mb-4">
                  {unit.title}
                </h2>
 
                <div className="space-y-6">
                  {unit.questions?.map((q, qIdx) => (
                    <div key={qIdx} className="space-y-4 border-b border-gray-200 pb-4">
                      <p className="text-lg font-semibold text-gray-800">
                        {qIdx + 1}. {q.questionText}
                      </p>
 
                      {q.questionImage && (
                        <img
                          src={q.questionImage}
                          alt={`รูปคำถาม ${qIdx + 1}`}
                          className="w-40 h-40 object-cover rounded border border-gray-300"
                        />
                      )}
 
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        {q.choices?.map((c, cIdx) => (
                          <div
                            key={cIdx}
                            className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition
                              ${c.isCorrect ? "bg-green-50" : "hover:bg-gray-50"}`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center
                                ${c.isCorrect ? "bg-green-600" : "bg-white border border-gray-300"}`}
                            >
                              {c.isCorrect && <BsCheck className="text-white w-4 h-4" />}
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
      </div>
    </SideLayout>
  );
}