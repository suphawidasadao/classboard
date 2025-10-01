'use client';
 
import React, { useEffect, useState } from "react";
import SideLayout from "../../../components/SideLayout";
import { useSession } from "next-auth/react";
import { FaUser } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { RiDeleteBin5Line } from "react-icons/ri";
import { TfiPencil } from "react-icons/tfi";
import LessonTabs from "../../../components/LessonTabs";
 
export default function Lesson_Drafts() {
    const router = useRouter();
    const { data: session } = useSession();
 
    const [activeTab, setActiveTab] = useState("drafts");
    const [draftLessons, setDraftLessons] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [loading, setLoading] = useState(true);
 
    // เก็บ preview URL ของรูปปก
    const [coverPreviews, setCoverPreviews] = useState({});
 
    useEffect(() => {
        const fetchDrafts = async () => {
            try {
                const res = await fetch("/api/lessons/drafts");
                const data = await res.json();
                setDraftLessons(data);
 
                // สร้าง cover preview สำหรับแต่ละ draft
                const previews = {};
                data.forEach((lesson) => {
                    const cover = lesson.lessons?.[0]?.coverImage || null;
                    previews[lesson._id] = cover;
                });
                setCoverPreviews(previews);
 
            } catch (err) {
                console.error("Error fetching lessons", err);
            } finally {
                setLoading(false);
            }
        };
 
        fetchDrafts();
    }, []);
 
    // กรองบทเรียนตามหัวข้อ
    const filteredLessons = selectedSubject
        ? draftLessons.filter((lesson) => lesson.subject === selectedSubject)
        : draftLessons;
 
    const subjects = [...new Set(draftLessons.map((l) => l.subject))];
 
    const formatDate = (iso) => {
        const date = new Date(iso);
        return date.toLocaleDateString("th-TH", {
            day: "numeric",
            month: "short",
            year: "2-digit",
        });
    };
 
    // ลบบทเรียน
    const handleDelete = async (id) => {
        if (!confirm("คุณต้องการลบบทเรียนนี้ใช่หรือไม่?")) return;
 
        const res = await fetch(`/api/lessons/${id}`, { method: "DELETE" });
        if (res.ok) {
            alert("ลบสำเร็จ");
            setDraftLessons(draftLessons.filter((lesson) => lesson._id !== id));
            setCoverPreviews((prev) => {
                const updated = { ...prev };
                delete updated[id];
                return updated;
            });
        } else {
            alert("ลบไม่สำเร็จ");
        }
    };
 
    // อัปเดตรูปปก preview สำหรับ draft ที่ยังไม่บันทึก
    const handleCoverChange = (lessonId, file) => {
        const url = URL.createObjectURL(file);
        setCoverPreviews((prev) => ({ ...prev, [lessonId]: url }));
    };
 
    return (
        <SideLayout>
            <LessonTabs activeTab={activeTab} setActiveTab={setActiveTab} />
 
            <div className="flex gap-6 px-6">
                {/* Filter Sidebar */}
                <div className="w-64 bg-white shadow rounded-lg p-4 space-y-1 max-h-[220px] overflow-y-auto">
                    <div
                        className={`font-semibold px-3 py-2 text-gray-700 flex items-center justify-between mb-2 cursor-pointer rounded ${selectedSubject === null ? "bg-purple-200" : ""}`}
                        onClick={() => setSelectedSubject(null)}
                    >
                        <span className="flex items-center gap-2"><FaUser /> สร้างโดยฉัน</span>
                        <span className="text-gray-500 text-xs w-6 text-right">{filteredLessons.length}</span>
                    </div>
                    {subjects.map((subj, idx) => {
                        const count = draftLessons.filter((lesson) => lesson.subject === subj).length;
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
                            <div key={idx} className="bg-white rounded-lg shadow flex items-center justify-between p-4">
                                <div className="flex items-center gap-4">
                                    {/* แสดงรูปปก */}
                                    {coverPreviews[lesson._id] ? (
                                        <img
                                            src={coverPreviews[lesson._id]}
                                            alt="Cover"
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 bg-purple-400 rounded" />
                                    )}
                                    <div className="flex flex-col justify-between">
                                        <div className="text-md font-medium">{lesson.lessons[0]?.title || '-'}</div>
                                        <div className="text-sm text-gray-600 mt-2">{lesson.subject}</div>
                                        <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                                            • {session?.user?.email?.split("@")[0]} • {formatDate(lesson.createdAt)}
                                        </div>
                                    </div>
                                </div>
 
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                    <button
                                        onClick={() => router.push(`/lessons/edit/${lesson._id}`)}
                                        className="hover:text-blue-600 transition text-xl"
                                    >
                                        <TfiPencil />
                                    </button>
 
                                    <button
                                        onClick={() => handleDelete(lesson._id)}
                                        className="hover:text-red-500 text-lg"
                                    >
                                        <RiDeleteBin5Line />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-gray-500">ไม่มีบทเรียนในหัวข้อนี้</div>
                    )}
                </div>
            </div>
        </SideLayout>
    );
}