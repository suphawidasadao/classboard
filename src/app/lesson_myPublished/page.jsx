'use client';
 
import React, { useEffect, useState } from "react";
import SideLayout from "../../../components/SideLayout";
import LessonTabs from "../../../components/LessonTabs";
import { FaUser } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
 
 
export default function Lesson_Published() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("published");
  const [publishedLessons, setPublishedLessons] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
 
  const fetchPublished = async () => {
    try {
      const res = await fetch("/api/lessons/myPublished");
      const data = await res.json();
      setPublishedLessons(data.lessons || []);
    } catch (err) {
      console.error("Error fetching published lessons", err);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    fetchPublished();
    const interval = setInterval(fetchPublished, 10000);
    return () => clearInterval(interval);
  }, []);
 
  const handleDelete = async (id) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบบทเรียนนี้?")) return;
 
    try {
      const res = await fetch(`/api/lessons/${id}`, {
        method: "DELETE",
      });
 
      if (!res.ok) throw new Error("Failed to delete");
 
      setPublishedLessons((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      console.error("Error deleting lesson:", err);
      alert("ลบบทเรียนไม่สำเร็จ");
    }
  };
 
  const filteredLessons =
    selectedSubject === "myLessons"
      ? publishedLessons.filter((lesson) => lesson.creator === session?.user?.email)
      : selectedSubject
        ? publishedLessons.filter((lesson) => lesson.subject === selectedSubject)
        : publishedLessons;
 
  const subjects = [...new Set(publishedLessons.map((l) => l.subject))];
 
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
 
      <div className="flex gap-6 px-6 mt-4">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow rounded-lg p-4 space-y-1 max-h-[220px] overflow-y-auto">
          <div
            className={`font-semibold px-3 py-2 text-gray-700 flex items-center justify-between mb-2 cursor-pointer rounded ${selectedSubject === "myLessons" ? "bg-purple-200" : ""}`}
            onClick={() => setSelectedSubject("myLessons")}
          >
            <span className="flex items-center gap-2">
              <FaUser /> สร้างโดยฉัน
            </span>
            <span className="text-gray-500 text-xs w-6 text-right">
              {publishedLessons.filter((lesson) => lesson.creator === session?.user?.email).length}
            </span>
          </div>
 
          {subjects.map((subj, idx) => {
            const count = publishedLessons.filter((lesson) => lesson.subject === subj).length;
            const isSelected = selectedSubject === subj;
            return (
              <div
                key={idx}
                className={`flex justify-between items-center text-sm px-3 py-2 rounded cursor-pointer ${isSelected ? "bg-purple-200" : "bg-gray-100 hover:bg-gray-200"}`}
                onClick={() => setSelectedSubject(subj)}
              >
                <span>{subj}</span>
                <span className="text-gray-500 text-xs w-6 text-right">{count}</span>
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
                className="bg-white rounded-lg shadow flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => router.push(`/lessons/view/${lesson._id}`)}
              >
                <div className="flex items-center gap-4">
                  {/* แสดง cover image ถ้ามี */}
                  {lesson.lessons?.[0]?.coverImage ? (
                    <img
                      src={lesson.lessons[0].coverImage}
                      alt="Cover"
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-teal-500 rounded" />
                  )}
 
                  <div className="flex flex-col justify-between">
                    <div className="text-md font-medium">{lesson.lessons[0]?.title || '-'}</div>
                    <div className="text-sm text-gray-600 mt-2">{lesson.subject}</div>
                    <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                      • {lesson.creator?.split("@")[0]} • {formatDate(lesson.createdAt)}
                    </div>
                  </div>
                </div>
 
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(lesson._id);
                  }}
                  className="hover:text-red-500 text-gray-500 text-lg"
                >
                  <RiDeleteBin5Line />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">
              ยังไม่มีบทเรียนที่เผยแพร่
            </div>
          )}
        </div>
      </div>
    </SideLayout>
  );
}
 
 