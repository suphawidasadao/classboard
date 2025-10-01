'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import SideLayout from '../../../components/SideLayout';
 
export default function LessonReportPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState([]);
  const [error, setError] = useState(null);
 
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
 
  useEffect(() => {
    if (!session?.user) return;
 
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/report');
        const data = await res.json();
        if (!res.ok) {
          setError(data?.error || 'Failed to fetch report');
          setLessons([]);
        } else {
          setLessons(data.lessons || []);
          setError(null);
        }
      } catch (err) {
        console.error(err);
        setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
      } finally {
        setLoading(false);
      }
    };
 
    fetchReport();
  }, [session]);
 
  if (!session) {
    return (
<SideLayout>
<div className="min-h-screen bg-gray-50 font-sans py-6 px-6">
<p className="p-6 text-gray-600">กรุณาเข้าสู่ระบบเพื่อดูรายงาน</p>
</div>
</SideLayout>
    );
  }
 
  if (loading) {
    return (
<SideLayout>
<div className="min-h-screen bg-gray-50 font-sans py-6 px-6">
<p className="p-6 text-gray-600">กำลังโหลดรายงาน...</p>
</div>
</SideLayout>
    );
  }
 
  if (error) {
    return (
<SideLayout>
<div className="min-h-screen bg-gray-50 font-sans py-6 px-6">
<p className="p-6 text-red-600">{error}</p>
</div>
</SideLayout>
    );
  }
 
  // สร้าง options สำหรับ dropdown
  const subjects = [...new Set(lessons.map(l => l.subject))];
  const filteredLessons = selectedSubject
    ? lessons.filter(l => l.subject === selectedSubject)
    : lessons;
 
  const lessonForUnits = selectedLesson
    ? filteredLessons.find(l => l.title === selectedLesson)
    : null;
  const units = lessonForUnits ? lessonForUnits.units : [];
 
  const displayedLessons = filteredLessons
    .filter(l => !selectedLesson || l.title === selectedLesson)
    .map(l => ({
      ...l,
      units: l.units.filter(u => !selectedUnit || u.unitTitle === selectedUnit)
    }));
 
  // เช็คว่ามีสถิติจริงมั้ย
  const hasStats =
    lessons.length > 0 &&
    lessons.some(l =>
      l.units?.some(u => u.attempts && u.attempts.length > 0)
    );
    return (
<SideLayout>
<div className="min-h-screen bg-gray-50 font-sans py-6 px-6">
<h1 className="text-2xl font-bold text-gray-800 mb-6">รายงานบทเรียนของฉัน</h1>
 
        {/* Dropdown Filter */}
<div className="flex flex-wrap gap-4 mb-6">

          {/* วิชา */}
<div className="flex-1 min-w-[180px]">
<label className="block text-sm font-semibold text-gray-700 mb-1">วิชา</label>
<select

              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"

              value={selectedSubject}

              onChange={e => {

                setSelectedSubject(e.target.value);

                setSelectedLesson('');

                setSelectedUnit('');

              }}
>
<option value="">ทั้งหมดวิชา</option>

              {subjects.map((s, idx) => (
<option key={idx} value={s}>{s}</option>

              ))}
</select>
</div>
 
          {/* บทเรียน */}
<div className="flex-1 min-w-[180px]">
<label className="block text-sm font-semibold text-gray-700 mb-1">ชื่อบทเรียน</label>
<select

              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"

              value={selectedLesson}

              onChange={e => {

                setSelectedLesson(e.target.value);

                setSelectedUnit('');

              }}

              disabled={!selectedSubject}
>
<option value="">ทั้งหมดบทเรียน</option>

              {filteredLessons.map((l, idx) => (
<option key={idx} value={l.title}>{l.title}</option>

              ))}
</select>
</div>
 
          {/* หน่วย */}
<div className="flex-1 min-w-[180px]">
<label className="block text-sm font-semibold text-gray-700 mb-1">หน่วย</label>
<select

              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"

              value={selectedUnit}

              onChange={e => setSelectedUnit(e.target.value)}

              disabled={!selectedLesson}
>
<option value="">ทั้งหมดหน่วย</option>

              {units.map((u, idx) => (
<option key={idx} value={u.unitTitle}>{u.unitTitle}</option>

              ))}
</select>
</div>
</div>
 
        {/* แสดงผล */}
<div className="space-y-8">

          {!hasStats ? (
<div className="text-center text-gray-500 py-10 bg-white rounded-xl shadow-sm">

              ยังไม่มีบทเรียนหรือข้อมูลสถิติ
</div>

          ) : (

            displayedLessons.map(lesson => (
<div

                key={lesson._id}

                className="bg-white shadow-md rounded-2xl p-6 border border-gray-100"
>
<h2 className="text-lg font-bold text-gray-800 mb-4">

                  บทเรียน: {lesson.title}
</h2>
 
                <div className="overflow-x-auto rounded-lg border border-gray-200">
<table className="min-w-full divide-y divide-gray-200 text-sm">
<thead className="bg-gray-100 text-gray-700 font-semibold">
<tr>
<th className="py-3 px-4 text-left">หน่วย</th>
<th className="py-3 px-4 text-left">ผู้ทำ</th>
<th className="py-3 px-4 text-center">จำนวนครั้ง</th>
<th className="py-3 px-4 text-center">ล่าสุด</th>
<th className="py-3 px-4 text-center">ต่ำสุด</th>
<th className="py-3 px-4 text-center">สูงสุด</th>
<th className="py-3 px-4 text-center">สถานะ</th>
</tr>
</thead>
<tbody className="divide-y divide-gray-100 bg-white">

                      {lesson.units.map(unit => {

                        const attemptsByUser = {};

                        unit.attempts?.forEach(a => {

                          if (!attemptsByUser[a.userId]) attemptsByUser[a.userId] = [];

                          attemptsByUser[a.userId].push(a);

                        });
 
                        return Object.entries(attemptsByUser).map(

                          ([userId, userAttempts]) => {

                            const count = userAttempts.length;

                            const latestScore =

                              userAttempts[userAttempts.length - 1]?.score ?? 0;

                            const minScore = Math.min(...userAttempts.map(a => a.score));

                            const maxScore = Math.max(...userAttempts.map(a => a.score));

                            const isFull = userAttempts.some(

                              a => a.score === a.totalQuestions

                            );
 
                            return (
<tr

                                key={`${unit.unitId}-${userId}`}

                                className="hover:bg-gray-50 transition"
>
<td className="py-2 px-4 font-medium text-gray-800">

                                  {unit.unitTitle}
</td>
<td className="py-2 px-4 text-gray-700">{userId}</td>
<td className="py-2 px-4 text-center text-gray-600">

                                  {count}
</td>
<td className="py-2 px-4 text-center text-gray-600">

                                  {latestScore}
</td>
<td className="py-2 px-4 text-center text-gray-600">

                                  {minScore}
</td>
<td className="py-2 px-4 text-center text-gray-600">

                                  {maxScore}
</td>
<td className="py-2 px-4 text-center">

                                  {isFull ? (
<span className="px-2 py-1 text-sm font-semibold rounded-full text-green-700 bg-green-50">

                                      สำเร็จ
</span>

                                  ) : (
<span className="px-2 py-1 text-sm font-semibold rounded-full text-red-700 bg-red-50">

                                      ไม่สำเร็จ
</span>

                                  )}
</td>
</tr>

                            );

                          }

                        );

                      })}
</tbody>
</table>
</div>
</div>

            ))

          )}
</div>
</div>
</SideLayout>

  );

}
 