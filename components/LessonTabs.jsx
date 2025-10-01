"use client";

import Link from "next/link";

export default function LessonTabs({ activeTab, setActiveTab }) {
  return (
    <div className="px-6 pt-4 mb-6">
      <div className="flex items-center gap-40 ml-2">
        
        <h2 className="text-xl font-bold text-gray-800">บทเรียนที่สร้าง</h2>
        <div className="flex gap-4 text-sm font-medium">
          <Link
            href="/lesson_myPublished"
            onClick={() => setActiveTab("published")}
            className={`pb-1 cursor-pointer ${
              activeTab === "published"
                ? "border-b-2 border-purple-600 text-purple-600 font-medium"
                : "text-gray-500 hover:text-black"
            }`}
          >
            โพสแล้ว
          </Link>

          <Link
            href="/lesson_drafts"
            onClick={() => setActiveTab("drafts")}
            className={`pb-1 cursor-pointer ${
              activeTab === "drafts"
                ? "border-b-2 border-purple-600 text-purple-600 font-medium"
                : "text-gray-500 hover:text-black"
            }`}
          >
            ฉบับล่าง
          </Link>

          <Link
              href="/lesson_pending"
              onClick={() => setActiveTab("pending")}
              className={`pb-1 cursor-pointer ${activeTab === "pending"
                ? "border-b-2 border-purple-600 text-purple-600 font-medium"
                : "text-gray-500 hover:text-black"
                }`}
            >
              รออนุมัติ
            </Link>
        </div>
      </div>
    </div>
  );
}
