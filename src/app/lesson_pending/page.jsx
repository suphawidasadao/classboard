'use client';
 
import React, { useEffect, useState } from "react";
import SideLayout from "../../../components/SideLayout";
import { useSession } from "next-auth/react";
import { FaUser } from "react-icons/fa";
import { useRouter } from "next/navigation";
import LessonTabs from "../../../components/LessonTabs";
 
export default function Lesson_Pending() {
  const router = useRouter();
  const { data: session } = useSession();
 
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingLessons, setPendingLessons] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(true);
 
  // ดึงบทเรียนทุกสถานะ (pending, rejected, approved)
  const fetchLessons = async () => {
    try {
      const res = await fetch("/api/lessons/pending");
      const data = await res.json();
      setPendingLessons(data.lessons || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    fetchLessons();
    const interval = setInterval(fetchLessons, 10000); // refresh ทุก 10 วินาที
    return () => clearInterval(interval);
  }, []);
 
  // กรองบทเรียนตาม subject ที่เลือก
  const filteredLessons = selectedSubject
    ? pendingLessons.filter((lesson) => lesson.subject === selectedSubject)
    : pendingLessons;
 
  const subjects = [...new Set(pendingLessons.map((l) => l.subject))];
 
  const formatDate = (iso) => {
    const date = new Date(iso);
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "2-digit",
    });
  };
 
  return (
    <SideLayout>
      <LessonTabs activeTab={activeTab} setActiveTab={setActiveTab} />
 
      <div className="flex gap-6 px-6">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow rounded-lg p-4 space-y-1 max-h-[220px] overflow-y-auto">
          <div
            className={`font-semibold px-3 py-2 text-gray-700 flex items-center justify-between mb-2 cursor-pointer rounded ${selectedSubject === null ? "bg-purple-200" : ""
              }`}
            onClick={() => setSelectedSubject(null)}
          >
            <span className="flex items-center gap-2">
              <FaUser /> สร้างโดยฉัน
            </span>
            <span className="text-gray-500 text-xs w-6 text-right">
              {filteredLessons.length}
            </span>
          </div>
 
          {subjects.map((subj, idx) => {
            const count = pendingLessons.filter(
              (lesson) => lesson.subject === subj
            ).length;
            const isSelected = selectedSubject === subj;
            return (
              <div
                key={idx}
                className={`flex justify-between items-center text-sm px-3 py-2 rounded cursor-pointer ${isSelected ? "bg-purple-200" : "bg-gray-100 hover:bg-gray-200"
                  }`}
                onClick={() => setSelectedSubject(subj)}
              >
                <span>{subj}</span>
                <span className="text-gray-500 text-xs w-6 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
 
        {/* Lessons List */}
        <div className="flex flex-col gap-4 flex-1">
          {loading ? (
            <div className="text-center py-10 text-gray-500">กำลังโหลด...</div>
          ) : filteredLessons.length > 0 ? (
            filteredLessons.map((lesson, idx) => (
              <div
                key={idx}
                className="relative bg-white rounded-lg shadow flex items-center p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => router.push(`/lessons/view/${lesson._id}`)}
              >
                {/* สถานะด้านขวาบน */}
                {lesson.status && (
                  <span
                    className={`absolute top-2 right-4 px-2 py-1 rounded text-xs font-semibold ${
                      lesson.status === "pending"
                        ? "bg-gray-200 text-gray-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {lesson.status === "pending" ? "รอดำเนินการ" : "ถูกปฏิเสธ"}
                  </span>
                )}
 
                <div className="flex items-center gap-4">
                  {/* Cover Image */}
                  {lesson.lessons[0]?.coverImage ? (
                    <img
                      src={lesson.lessons[0].coverImage}
                      alt="Cover"
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-purple-400 rounded" />
                  )}
 
                  {/* Lesson Info */}
                  <div className="flex flex-col justify-between ml-2">
                    <div className="text-md font-medium">{lesson.lessons[0]?.title || "-"}</div>
                    <div className="text-sm text-gray-600 mt-1">{lesson.subject}</div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                      • {session?.user?.email?.split("@")[0]} • {formatDate(lesson.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">ไม่มีบทเรียนที่รออนุมัติ</div>
          )}
        </div>
      </div>
    </SideLayout>
  );
}