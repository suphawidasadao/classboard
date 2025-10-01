'use client';

import React, { useEffect, useState } from "react";
import MainNav from "../../../components/MainNav";
import Link from "next/link";

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

  const subjects = [...new Set(lessons.map((l) => l.subject))];

  return (
    <div className="min-h-screen bg-[#f2f2f2] font-sans text-gray-800">
      <div className="min-h-screen bg-[#f2f2f2] font-sans text-gray-800 pb-20">
        <MainNav />
        <div className="mx-20 mt-10 space-y-10">
          {lessons.length > 0 &&
            subjects.map((subject, idx) => {
              const lessonsBySubject = lessons.filter((l) => l.subject === subject);

              return (
                <div key={idx} className="space-y-4">
                  <h2 className="text-base font-semibold text-gray-800">{subject}</h2>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {lessonsBySubject.map((lesson, lIdx) => (
                      <Link
                        key={lIdx}
                        href={`/mainlessons/${lesson._id}`}
                        className="bg-white p-4 rounded-lg shadow-sm flex flex-col justify-between hover:shadow-md transition"
                      >
                        <img
                          src={
                            lesson.lessons?.[0]?.coverImage ||
                            "https://png.pngtree.com/thumb_back/fh260/background/20221129/pngtree-english-college-skills-english-photo-image_2609615.jpg"
                          }
                          alt="Lesson Cover"
                          className="w-full h-40 rounded-xl object-cover"
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
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
