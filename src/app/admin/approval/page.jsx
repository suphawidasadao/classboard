'use client';
import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../../components/AdminLayout';
import { useRouter } from 'next/navigation';
import { IoMdDocument } from "react-icons/io";

export default function Approval() {
  const router = useRouter();
  const [lessonsQueue, setLessonsQueue] = useState([]);
  const [activeView, setActiveView] = useState('approval');

  // สำหรับ Modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchLessonsQueue = async () => {
    const res = await fetch('/api/admin/pending_lessons');
    const data = await res.json();
    setLessonsQueue(data.lessons || []);
  };

  useEffect(() => {
    fetchLessonsQueue();
  }, []);

  const handleApprove = async (id) => {
    const res = await fetch(`/api/lessons/approve/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' }),
    });
    if (res.ok) {
      const data = await res.json();
      setLessonsQueue(prev => prev.map(l => l._id === id ? { ...l, status: data.lesson.status } : l));
    }
  };

  const openRejectModal = (id) => {
    setSelectedLessonId(id);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const submitReject = async () => {
  if (!rejectReason) return;
  const res = await fetch(`/api/lessons/approve/${selectedLessonId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'rejected', reason: rejectReason }),
  });
  if (res.ok) {
  const data = await res.json();
  console.log("📌 API response:", data); // ดูว่า lesson.reason มีค่ามั้ย
  setLessonsQueue(prev => prev.map(l =>
    l._id === selectedLessonId
      ? { ...l, status: data.lesson.status, reason: data.lesson.reason }
      : l
  ));
  setShowRejectModal(false);
}

};


  const handleViewLesson = (id) => router.push(`/admin/lessons/view/${id}`);

  return (
    <AdminLayout activeViewProp={activeView}>
      <h2 className="font-bold text-lg mb-4">คิวการอนุมัติบทเรียน</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="py-3 px-4">ผู้สร้างบทเรียน</th>
              <th className="py-3 px-4">ชื่อบทเรียน</th>
              <th className="py-3 px-4">วิชา</th>
              <th className="py-3 px-4">วันที่สร้าง</th>
              <th className="py-3 px-4">สถานะ</th>
              <th className="py-3 px-4">การดำเนินการ</th>
              <th className="py-3 px-4">รายละเอียด</th>
            </tr>
          </thead>
          <tbody>
            {lessonsQueue.length > 0 ? lessonsQueue.map((lesson) => (
              <tr key={lesson._id} className="border-t border-gray-200">
                <td className="py-3 px-4">{lesson.creator}</td>
                <td className="py-3 px-4">{lesson.lessons[0]?.title || '-'}</td>
                <td className="py-3 px-4">{lesson.subject}</td>
                <td className="py-3 px-4">{new Date(lesson.createdAt).toLocaleDateString()}</td>
                <td className="py-3 px-4 text-sm font-medium">
                  {lesson.status === 'approved' && <span className="text-green-600">อนุญาต</span>}
                  {lesson.status === 'rejected' && <span className="text-red-600">ปฏิเสธ</span>}
                  {lesson.status === 'pending' && <span className="text-gray-500">รอดำเนินการ</span>}
                </td>
                <td className="py-3 px-4 space-x-2">
                  <button onClick={() => handleApprove(lesson._id)} className="text-green-600 hover:underline">อนุญาต</button>|
                  <button onClick={() => openRejectModal(lesson._id)} className="text-red-600 hover:underline">ปฏิเสธ</button>
                </td>
                <td className="px-10">
                  <button onClick={() => handleViewLesson(lesson._id)} className="text-gray-500 text-xl hover:text-gray-700"><IoMdDocument /></button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">ไม่มีบทเรียนที่รออนุมัติ</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Overlay เบลอและมืด */}
          <div className="absolute inset-0 bg-black/30"></div>

          {/* Modal */}
          <div className="relative bg-white rounded-lg p-6 w-96 shadow-lg z-10">
            <h3 className="text-lg font-semibold mb-4">เหตุผลการปฏิเสธ</h3>
            <textarea
              className="w-full border border-gray-300 rounded p-2 mb-4"
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="กรอกเหตุผล..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-sm px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                ยกเลิก
              </button>
              <button
                onClick={submitReject}
                className="text-sm px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                ยืนยันปฏิเสธ
              </button>
            </div>
          </div>
        </div>
      )}


    </AdminLayout>
  );
}
