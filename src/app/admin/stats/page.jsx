'use client';
import AdminLayout from '../../../../components/AdminLayout';
import React, { useState, useEffect } from 'react';

export default function Stats() {
  const [activeView, setActiveView] = useState('stats');
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [units, setUnits] = useState([]);

  const [selectedCreator, setSelectedCreator] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');

  const adminEmail = 'admin@gmail.com'; // เปลี่ยนตรงนี้ถาต้องการใช้ email อื่น

  // Fetch data
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/activity');
        const data = await res.json();
        setAttempts(data.attempts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // อัปเดต subjects เมื่อ selectedCreator เปลี่ยน
  useEffect(() => {
    if (!selectedCreator) {
      setSubjects([]);
      setSelectedSubject('');
      return;
    }

    const filteredByCreator = attempts.filter(a => {
      if (selectedCreator === adminEmail) return (a.creator || '').toLowerCase() === adminEmail.toLowerCase();
      if (selectedCreator === 'user') return (a.creator || '').toLowerCase() !== adminEmail.toLowerCase();
      return true;
    });

    const uniqueSubjects = Array.from(
      new Set(filteredByCreator.map(a => a.subject || 'ไม่ระบุวิชา'))
    );
    setSubjects(uniqueSubjects);
    setSelectedSubject(uniqueSubjects[0] || '');
  }, [selectedCreator, attempts]);

  // อัปเดต lessons เมื่อ selectedSubject เปลี่ยน
  useEffect(() => {
    if (!selectedSubject) {
      setLessons([]);
      setSelectedLesson('');
      return;
    }

    const lessonList = Array.from(
      new Set(
        attempts
          .filter(a => {
            // กรองตาม creator ก่อน แล้วตาม subject
            if (selectedCreator === adminEmail) {
              return (a.creator || '').toLowerCase() === adminEmail.toLowerCase() && a.subject === selectedSubject;
            }
            if (selectedCreator === 'user') {
              return (a.creator || '').toLowerCase() !== adminEmail.toLowerCase() && a.subject === selectedSubject;
            }
            return a.subject === selectedSubject;
          })
          .map(a => a.lessonTitle || 'ไม่ระบุบท')
      )
    );
    setLessons(lessonList);
    setSelectedLesson(lessonList[0] || '');
  }, [selectedSubject, selectedCreator, attempts]);

  // อัปเดต units เมื่อ selectedLesson เปลี่ยน
  useEffect(() => {
    if (!selectedLesson) {
      setUnits([]);
      setSelectedUnit('');
      return;
    }

    const unitList = Array.from(
      new Set(
        attempts
          .filter(a => {
            if (selectedCreator === adminEmail) {
              return (a.creator || '').toLowerCase() === adminEmail.toLowerCase()
                && a.subject === selectedSubject
                && a.lessonTitle === selectedLesson;
            }
            if (selectedCreator === 'user') {
              return (a.creator || '').toLowerCase() !== adminEmail.toLowerCase()
                && a.subject === selectedSubject
                && a.lessonTitle === selectedLesson;
            }
            return a.subject === selectedSubject && a.lessonTitle === selectedLesson;
          })
          .map(a => a.unitTitle || 'ไม่ระบุหน่วย')
      )
    );

    unitList.sort((a, b) => {
      const getNum = t => {
        const match = t.match(/\d+/);
        return match ? parseInt(match[0], 10) : 9999;
      };
      return getNum(a) - getNum(b);
    });

    setUnits(unitList);
    setSelectedUnit(unitList[0] || '');
  }, [selectedLesson, selectedSubject, selectedCreator, attempts]);

  if (loading)
  return (
    <div className="flex items-center justify-center h-screen bg-[#f2f2f2]">
      <div className="w-12 h-12 border-4 border-gray-300 border-t-[#2e003e] rounded-full animate-spin"></div>
    </div>
  );

  // กรอง attempts ตาม dropdown (รวมทุกเงื่อนไข)
  const filteredAttempts = attempts.filter(a => {
    // creator
    if (selectedCreator) {
      if (selectedCreator === adminEmail && (a.creator || '').toLowerCase() !== adminEmail.toLowerCase()) return false;
      if (selectedCreator === 'user' && (a.creator || '').toLowerCase() === adminEmail.toLowerCase()) return false;
    }
    // subject, lesson, unit
    if (selectedSubject && a.subject !== selectedSubject) return false;
    if (selectedLesson && a.lessonTitle !== selectedLesson) return false;
    if (selectedUnit && a.unitTitle !== selectedUnit) return false;
    return true;
  });

  // จัด group ตาม lesson และ unit
  const lessonsMap = {};
  filteredAttempts.forEach(a => {
    const lessonKey = a.lessonTitle || 'ไม่ระบุบท';
    if (!lessonsMap[lessonKey]) lessonsMap[lessonKey] = {};
    const unitKey = a.unitTitle || 'ไม่ระบุหน่วย';
    if (!lessonsMap[lessonKey][unitKey]) lessonsMap[lessonKey][unitKey] = [];
    lessonsMap[lessonKey][unitKey].push(a);
  });

  return (
    <AdminLayout activeViewProp={activeView}>
      <div className="flex-1 overflow-auto p-6">
        <div className="min-h-screen ">
          <h2 className="font-bold text-lg mb-4">สถิตินักเรียน</h2>

          {/* Dropdown filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Creator */}
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-semibold text-gray-700 mb-1">ผู้สร้างบทเรียน</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={selectedCreator}
                onChange={e => setSelectedCreator(e.target.value)}
              >
                <option value="">ทั้งหมด</option>
                <option value={adminEmail}>บทเรียนแอดมิน</option>
                <option value="user">บทเรียนผู้ใช้</option>
              </select>
            </div>

            {/* Subject */}
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-semibold text-gray-700 mb-1">วิชา</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                disabled={!selectedCreator}
              >
                <option value="">ทั้งหมดวิชา</option>
                {subjects.map((s, idx) => (
                  <option key={idx} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Lesson */}
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-semibold text-gray-700 mb-1">ชื่อบทเรียน</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={selectedLesson}
                onChange={e => setSelectedLesson(e.target.value)}
                disabled={!selectedSubject}
              >
                <option value="">ทั้งหมดบทเรียน</option>
                {lessons.map((l, idx) => (
                  <option key={idx} value={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* Unit */}
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
                  <option key={idx} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ตารางสถิติ */}
          {Object.entries(lessonsMap).map(([lessonTitle, unitsObj]) => {
            const firstUnitKey = Object.keys(unitsObj)[0];
            const firstAttempt = unitsObj[firstUnitKey]?.[0]; 
            const creator = firstAttempt?.creator || '-';

            return (
              <div key={lessonTitle} className="mb-8 bg-white shadow-lg rounded-2xl p-4 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{lessonTitle}</h3>
                <p className="text-sm text-gray-500 mb-4">ผู้สร้าง: {creator}</p>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border border-gray-200 rounded-lg">
                    <thead className="bg-blue-50 text-gray-700 font-semibold">
                      <tr>
                        <th className="py-3 px-4 text-left">หน่วย</th>
                        <th className="py-3 px-4 text-center">นักเรียน</th>
                        <th className="py-3 px-4 text-center">จำนวนครั้ง</th>
                        <th className="py-3 px-4 text-center">คะแนนล่าสุด</th>
                        <th className="py-3 px-4 text-center">ต่ำสุด</th>
                        <th className="py-3 px-4 text-center">สูงสุด</th>
                        <th className="py-3 px-4 text-center">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(unitsObj)
                        .sort(([a], [b]) => {
                          const getNum = t => {
                            const match = t.match(/\d+/);
                            return match ? parseInt(match[0], 10) : 9999;
                          };
                          return getNum(a) - getNum(b);
                        })
                        .map(([unitTitle, attemptsList]) => {
                          const userMap = {};
                          attemptsList.forEach(a => {
                            const key = a.userId;
                            if (!userMap[key]) userMap[key] = [];
                            userMap[key].push(a);
                          });

                          return Object.entries(userMap).map(([userId, userAttempts]) => {
                            const sorted = userAttempts.sort((a,b) => a.attemptNumber - b.attemptNumber);
                            const latest = sorted[sorted.length-1]?.score || 0;
                            const min = Math.min(...sorted.map(a => a.score));
                            const max = Math.max(...sorted.map(a => a.score));
                            const isFull = sorted.some(a => a.score === a.totalQuestions);

                            return (
                              <tr key={`${unitTitle}-${userId}`} className="border-t border-gray-200 hover:bg-blue-50 transition">
                                <td className="py-2 px-4">{unitTitle}</td>
                                <td className="py-2 px-4 text-center font-medium">
                                  {(sorted[0]?.userEmail || sorted[0]?.userName || userId)?.split('@')[0]}
                                </td>
                                <td className="py-2 px-4 text-center">{userAttempts.length}</td>
                                <td className="py-2 px-4 text-center">{latest}</td>
                                <td className="py-2 px-4 text-center">{min}</td>
                                <td className="py-2 px-4 text-center">{max}</td>
                                <td className="py-2 px-4 text-center">
                                  {isFull
                                    ? <span className="text-green-600 font-semibold">สำเร็จ</span>
                                    : <span className="text-red-600 font-semibold">ไม่สำเร็จ</span>}
                                </td>
                              </tr>
                            );
                          });
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
