'use client';

import React, { useEffect, useState } from "react";
import MainNav from "../../../components/MainNav";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function ClassBoardPage() {
  const { data: session } = useSession();
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

  // ดึง subject ทั้งหมด
  let subjects = [...new Set(lessons.map((l) => l.subject))];

  // จัดเรียงให้ภาษาอังกฤษอยู่บนสุด
  subjects.sort((a, b) => {
    if (a.toLowerCase() === "ภาษาอังกฤษ") return -1;
    if (b.toLowerCase() === "ภาษาอังกฤษ") return 1;
    return a.localeCompare(b, "th");
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f2f2f2]">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-[#2e003e] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="p-10 text-gray-500">
        ไม่พบบทเรียนที่เผยแพร่
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2f2] font-sans text-gray-800">
      <MainNav />
      <div className="mx-20 mt-10 space-y-10">
        {subjects.map((subject, idx) => {
          const lessonsBySubject = lessons.filter((l) => l.subject === subject);

          return (
            <div key={idx} className="space-y-4">
              <h2 className="text-base font-semibold text-gray-800">{subject}</h2>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {lessonsBySubject.map((lesson, lIdx) => {
                  // หา coverImage (รองรับทั้งสองกรณี)
                  const coverImage =
                    lesson.coverImage ||
                    lesson.lessons?.[0]?.coverImage ||
                    "https://png.pngtree.com/thumb_back/fh260/background/20221129/pngtree-english-college-skills-english-photo-image_2609615.jpg";

                  // ตรวจ role ว่าเป็น teacher หรือ student
                  const isTeacher = session?.user?.role === "teacher";

                  // ถ้าเป็นอาจารย์ ให้ลิงก์ไปหน้า view ของ unit แรก
                  const firstUnitId = lesson.lessons?.[0]?.units?.[0]?._id;

                  const lessonHref = isTeacher && firstUnitId
                    ? `/mainlessons/${lesson._id}/view`
                    : `/mainlessons/${lesson._id}`;

                  return (
                    <Link
                      key={lIdx}
                      href={lessonHref}
                      className="bg-white p-4 rounded-lg shadow-sm flex flex-col justify-between hover:shadow-md transition"
                    >
                      <img
                        src={coverImage}
                        alt="Lesson Cover"
                        className="w-full h-52 rounded-xl object-cover"
                      />

                      <div className="text-left text-base font-medium mt-2 truncate">
                        {lesson.lessons?.[0]?.title || lesson.title}
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
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
