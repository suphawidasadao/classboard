'use client';
import React, { useEffect, useState, Suspense } from 'react';
import AdminLayout from '../../../../components/AdminLayout';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import AdminTabs from '../../../../components/AdminTabs';

export default function Dashboard() {
  const router = useRouter();
  const [activeView, setActiveView] = useState('dashboard');
  const [myLessons, setMyLessons] = useState([]);
  const [lessonsQueue, setLessonsQueue] = useState([]);
  const [studentCount, setStudentCount] = useState(0);
  const [activeTab, setActiveTab] = useState('published');

  // Fetch Data
  useEffect(() => {
    const fetchMyLessons = async () => {
      const res = await fetch('/api/admin/lessons');
      const data = await res.json();
      setMyLessons(data.lessons || []);
    };
    const fetchStudentCount = async () => {
      const res = await fetch('/api/admin/students_count');
      const data = await res.json();
      setStudentCount(data.count || 0);
    };
    const fetchLessonsQueue = async () => {
      const res = await fetch('/api/admin/pending_lessons');
      const data = await res.json();
      setLessonsQueue(data.lessons || []);
    };

    fetchMyLessons();
    fetchStudentCount();
    fetchLessonsQueue();
  }, []);

  const filteredLessons = myLessons.filter((lesson) =>
    activeTab === 'published' ? lesson.status === 'published' : lesson.status === 'draft'
  );

  return (
    <AdminLayout activeViewProp={activeView}>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-blue-100 text-center py-6 rounded-xl">
          <div className="text-sm text-gray-700">บทเรียนทั้งหมด</div>
          <div className="text-2xl font-bold text-blue-900">{lessonsQueue.length}</div>
        </div>
        <div className="bg-purple-100 text-center py-6 rounded-xl">
          <div className="text-sm text-gray-700">จำนวนนักเรียน</div>
          <div className="text-2xl font-bold text-purple-900">{studentCount}</div>
        </div>
      </div>

      <Suspense fallback={<div>Loading tabs...</div>}>
        <AdminTabs onTabChange={(tab) => setActiveTab(tab)} />
      </Suspense>

      {/* Lesson Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {filteredLessons.length > 0 ? (
          filteredLessons.map((lesson) => (
            <div
              key={lesson._id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden"
              onClick={() => {
                if (activeTab === 'published') {
                  router.push(`/admin/lessons/view/${lesson._id}`);
                }
              }}
            >
              <div className="relative w-full h-40 bg-gray-200 flex items-center justify-center text-white text-lg font-semibold">
                {lesson.lessons?.[0]?.coverImage ? (
                  <img
                    src={lesson.lessons[0].coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  'ไม่มีรูป'
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-md font-semibold mb-1 truncate">{lesson.lessons[0]?.title || '-'}</h3>
                <p className="text-sm text-gray-500 mb-1 truncate">{lesson.subject}</p>
                <p className="text-xs text-gray-400 mb-3 truncate">
                  {new Date(lesson.createdAt).toLocaleDateString('th-TH')}
                </p>
                <div className="mt-auto flex gap-3 justify-end">
                  {lesson.status === 'draft' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/lessons/edit/${lesson._id}`);
                      }}
                      className="hover:text-blue-600 text-gray-600 transition text-base"
                    >
                      <FiEdit />
                    </button>
                  )}
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบทเรียนนี้?')) return;
                      try {
                        const res = await fetch(`/api/admin/lessons/${lesson._id}`, { method: 'DELETE' });
                        if (!res.ok) throw new Error('Failed to delete');
                        setMyLessons((prev) => prev.filter((l) => l._id !== lesson._id));
                      } catch (err) {
                        console.error('Error deleting lesson:', err);
                        alert('ลบบทเรียนไม่สำเร็จ');
                      }
                    }}
                    className="hover:text-red-600 text-gray-600 text-base"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-500 col-span-full">ไม่มีบทเรียนในแท็บนี้</div>
        )}
      </div>
    </AdminLayout>
  );
}
