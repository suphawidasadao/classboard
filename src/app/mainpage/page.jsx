"use client";

import React, { useEffect, useState } from "react";
import MainNav from "../../../components/MainNav";
import Link from "next/link"; // 👉 ต้อง import ก่อนใช้

export default function ClassBoardPage() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await fetch("/api/lessons/published");
        const data = await res.json();
        setLessons(data.lessons || []);
      } catch (error) {
        console.error("Error fetching lessons:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  const formatDate = (iso) => {
    const date = new Date(iso);
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2] font-sans text-gray-800">
      <MainNav />

      <div className="mx-20 mt-10">
        {loading ? (
          <div className="text-center py-10 text-gray-500">กำลังโหลด...</div>
        ) : lessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {lessons.map((lesson, idx) => (
              <Link
                key={idx}
                href={`/lesson/${lesson._id}`}
                className="bg-white p-4 rounded-lg shadow-sm flex flex-col justify-between hover:shadow-md transition"
              >
                <img
                  src="https://png.pngtree.com/thumb_back/fh260/background/20221129/pngtree-english-college-skills-english-photo-image_2609615.jpg"
                  alt="Lesson Icon"
                  className="w-full h-40 rounded-xl object-cover"
                />

                <div className="text-left text-base font-medium mt-2 truncate">
                  {lesson.title}
                </div>

                <div className="flex justify-between text-sm text-gray-700 mt-2">
                  <span className="truncate">{lesson.subject}</span>
                  <span className="text-purple-700 truncate">
                    {formatDate(lesson.createdAt)}
                  </span>
                </div>

                <div className="text-xs text-gray-500 mt-1">
                  โดย {lesson.creator?.split("@")[0]}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            ยังไม่มีบทเรียนที่เผยแพร่
          </div>
        )}
      </div>
    </div>
  );
}
