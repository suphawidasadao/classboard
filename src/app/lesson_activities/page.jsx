"use client";
 
import { useEffect, useState, Fragment } from "react";
import { useSession } from "next-auth/react";
import SideLayout from "../../../components/SideLayout";
 
export default function ActivityPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ attempts: [] });
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [subjects, setSubjects] = useState([]);
 
  useEffect(() => {
    if (!session?.user) return;
 
    const fetchActivity = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/activity");
        const data = await res.json();
        setStats(data);
 
        const uniqueSubjects = Array.from(
          new Set(data.attempts.map((a) => a.subject || "ไม่ระบุ"))
        );
        setSubjects(uniqueSubjects);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
 
    fetchActivity();
  }, [session]);
 
  if (!session) return <p className="p-6 text-gray-600">กรุณาเข้าสู่ระบบเพื่อดูสถิติ</p>;
  if (loading) return <p className="p-6 text-gray-600">กำลังโหลดสถิติ...</p>;
 
  const filteredAttempts =
    selectedSubject === "all"
      ? stats.attempts
      : stats.attempts.filter((a) => a.subject === selectedSubject);
 
  // แบ่งตาม lesson
  const lessonsMap = {};
  filteredAttempts.forEach((a) => {
    const lessonKey = a.lessonId || "ไม่ระบุบทเรียน";
    if (!lessonsMap[lessonKey])
      lessonsMap[lessonKey] = { title: a.lessonTitle || "ไม่ระบุชื่อบท", attempts: [] };
    lessonsMap[lessonKey].attempts.push(a);
  });
 
  return (
    <SideLayout>
      <div className="min-h-screen bg-gray-50 font-sans py-6">
        <div className="flex items-center gap-4 px-6">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            สถิติการทำแบบทดสอบ
          </h1>
        </div>
 
        {/* เลือกวิชา */}
        <div className="mt-6 px-6">
          <label className="font-semibold text-gray-700 mr-3">เลือกวิชา:</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">ทั้งหมด</option>
            {subjects.map((subj, idx) => (
              <option key={idx} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </div>
 
        {/* แยกตามบทเรียน */}
        <div className="mt-8 px-6 space-y-8">
          {Object.entries(lessonsMap).map(([lessonId, lessonData]) => {
            const lessonAttempts = lessonData.attempts;
 
            // แบ่งตาม chapter
            const chaptersMap = {};
            lessonAttempts.forEach((a) => {
              const chapter = a.chapter || "ไม่ระบุบท";
              if (!chaptersMap[chapter]) chaptersMap[chapter] = [];
              chaptersMap[chapter].push(a);
            });
 
            const totalUnits = new Set(lessonAttempts.map((a) => a.unitId)).size;
            const completedUnits = lessonAttempts.filter(
              (a) => a.score === a.totalQuestions
            ).length;
 
            return (
              <div
                key={lessonId}
                className="bg-white shadow-md rounded-2xl p-6 border border-gray-100"
              >
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-gray-800">
                    บทเรียน: {lessonData.title}
                  </h2>
                </div>
 
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-100 text-gray-700 text-sm font-semibold">
                      <tr>
                        <th className="py-3 px-4 text-left">บท / หน่วย</th>
                        <th className="py-3 px-4 text-center">จำนวนครั้ง</th>
                        <th className="py-3 px-4 text-center">ล่าสุด</th>
                        <th className="py-3 px-4 text-center">ต่ำสุด</th>
                        <th className="py-3 px-4 text-center">สูงสุด</th>
                        <th className="py-3 px-4 text-center">วันเวลาที่ทำ</th>
                        <th className="py-3 px-4 text-center">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {Object.entries(chaptersMap).map(([chapter, attempts]) => {
                        // group by unit
                        const unitsMap = {};
                        attempts.forEach((a) => {
                          if (!unitsMap[a.unitId]) unitsMap[a.unitId] = [];
                          unitsMap[a.unitId].push(a);
                        });
 
                        return (
                          <Fragment key={chapter}>
                            {Object.entries(unitsMap).map(([unitId, unitAttempts], idx) => {
                              const sortedAttempts = unitAttempts.sort(
                                (a, b) => a.attemptNumber - b.attemptNumber
                              );
 
                              const isFull = sortedAttempts.some(
                                (a) => a.score === a.totalQuestions
                              );
 
                              const attemptsCount = sortedAttempts.length;
                              const latestScore =
                                sortedAttempts[sortedAttempts.length - 1]?.score || 0;
                              const minScore = Math.min(...sortedAttempts.map((a) => a.score));
                              const maxScore = Math.max(...sortedAttempts.map((a) => a.score));
                              const lastAttemptDate = sortedAttempts[sortedAttempts.length - 1]?.createdAt
                                ? new Date(sortedAttempts[sortedAttempts.length - 1].createdAt).toLocaleString("th-TH", {
                                  day: "numeric",
                                  month: "short",
                                  year: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                                : "-";
 
                              return (
                                <tr key={unitId} className="hover:bg-gray-50 transition">
                                  <td className="py-2 px-4 font-medium text-gray-800">
                                    {unitAttempts[0]?.unitTitle
                                      ? unitAttempts[0].unitTitle
                                      : `หน่วย ${idx + 1}`}
                                  </td>
                                  <td className="py-2 px-4 text-center text-gray-600">
                                    {attemptsCount}
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
                                  <td className="py-2 px-4 text-center text-gray-600">
                                    {lastAttemptDate}
                                  </td>
                                  <td className="py-2 px-4 text-center">
                                    {isFull ? (
                                      <span className="px-2 py-1 text-sm font-semibold rounded-full text-green-700">
                                        สำเร็จ
                                      </span>
                                    ) : (
                                      <span className="px-2 py-1 text-sm font-semibold rounded-full text-red-700">
                                        ไม่สำเร็จ
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SideLayout>
  );
}