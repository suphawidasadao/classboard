"use client";
import { FaArrowLeft, FaLock } from "react-icons/fa";
import { useParams, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import Image from "next/image";
import { IoChevronDown } from "react-icons/io5";
 
export default function LessonPage() {
  const { id: lessonId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
 
  const [lesson, setLesson] = useState(null);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
 
  // ✅ state สำหรับ popup alert
  const [showAlert, setShowAlert] = useState(false);
 
  // ✅ state สำหรับ dropdown profile
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
 
  const activeStyle = "bg-[#2e003e] text-white";
  const lockedStyle = "bg-gray-300 text-gray-500";
 
  const profileImage =
    session?.user?.image || "/default-profile.png"; // ใช้ default ถ้าไม่มีรูป
 
  // ปิด dropdown เมื่อคลิกนอกกล่อง
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
 
  const fetchProgress = async (lessonData) => {
    if (!lessonData || !session?.user) return;
 
    const tempProgress = {};
    for (const lessonItem of lessonData.lessons) {
      for (const unit of lessonItem.units) {
        try {
          const res = await fetch(
            `/api/lessons/${lessonId}/units/${unit._id}/attempts`
          );
          const data = await res.json();
 
          if (data.attempts && data.attempts.length > 0) {
            const bestScore = data.attempts.reduce(
              (max, a) => (a.score > max ? a.score : max),
              0
            );
            const attemptsCount = data.attempts.length;
            const lastScore = data.attempts[data.attempts.length - 1].score;
 
            tempProgress[unit._id] = {
              attempts: attemptsCount,
              bestScore,
              lastScore,
              completed: attemptsCount > 0,
            };
          } else {
            tempProgress[unit._id] = {
              attempts: 0,
              bestScore: 0,
              lastScore: 0,
              completed: false,
            };
          }
        } catch (err) {
          console.error("Error fetching attempts:", err);
        }
      }
    }
    setProgress(tempProgress);
  };
 
  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/lessons/${lessonId}`);
        const data = await res.json();
        if (data.lesson) {
          setLesson(data.lesson);
          await fetchProgress(data.lesson);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId, session?.user]);
 
  useEffect(() => {
    const handler = () => fetchProgress(lesson);
    window.addEventListener("updateProgress", handler);
    return () => window.removeEventListener("updateProgress", handler);
  }, [lesson]);
 
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-[#f2f2f2]">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-[#2e003e] rounded-full animate-spin"></div>
      </div>
    );
 
  if (!lesson) return <div className="p-10 text-gray-500">ไม่พบบทเรียน</div>;
 
  const handleUnitClick = (unit, idx, lessonItem) => {
    const prevUnit = idx > 0 ? lessonItem.units[idx - 1] : null;
    const prevCompleted =
      !prevUnit || (progress[prevUnit._id]?.completed || false);
 
    if (!prevCompleted) {
      setShowAlert(true);
      return;
    }
 
    router.push(
      `/mainlessons/${lessonId}/unit/${unit._id}?callback=updateProgress&subject=${encodeURIComponent(
        lesson.subject || "ไม่ระบุ"
      )}`
    );
  };
 
  return (
    <div className="min-h-screen bg-[#f2f2f2] font-sans text-gray-800">
      {/* Navbar */}
      <div className="flex items-center justify-between px-16 py-[10px] bg-white border-b border-gray-300 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/mainpage")}
            className="flex items-center gap-2 text-gray-700 hover:text-[#2e003e] transition"
          >
            <RxCross2 className="text-xl" />
          </button>
 
          <button
            type="button"
            disabled
            className="border border-gray-300 px-10 py-2 rounded text-sm bg-gray-100 text-gray-700 shadow-sm"
          >
            วิชา: {lesson.subject || "ไม่ระบุ"}
          </button>
        </div>
 
        {/* ✅ แทนส่วน Dashboard ด้วย dropdown profile */}
        {session?.user && (
          <div
            className="flex items-center cursor-pointer relative"
            ref={dropdownRef}
          >
            <div
              className="flex items-center border border-gray-300 rounded-full p-1"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-300">
                <Image
                  src={profileImage}
                  alt={session?.user?.name || "Profile"}
                  width={36}
                  height={36}
                  className="rounded-full object-cover border border-gray-300"
                  priority
                />
              </div>
              <IoChevronDown className="text-xl text-gray-700 ml-1" />
            </div>
 
            {dropdownOpen && (
              <div className="absolute right-0 mt-20 w-32 bg-white shadow-lg rounded-md border z-50 text-xs">
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                >
                  ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        )}
      </div>
 
      {/* Units */}
      <div className="flex flex-col gap-10 items-center">
        {lesson.lessons.map((lessonItem, lessonIdx) => (
          <div key={lessonIdx} className="w-full max-w-4xl mt-20">
            <h2 className="text-2xl font-semibold text-center text-[#2e003e] mb-2">
              {lessonItem.title || "ไม่มีชื่อบท"}
            </h2>
 
            <div className="flex justify-center gap-6 flex-wrap mt-12">
              {lessonItem.units.map((unit, idx) => {
                const currentUnit = progress[unit._id] || {
                  attempts: 0,
                  bestScore: 0,
                  lastScore: 0,
                  completed: false,
                };
                const prevUnit = idx > 0 ? lessonItem.units[idx - 1] : null;
                const prevCompleted =
                  !prevUnit || (progress[prevUnit._id]?.completed || false);
                const isUnlocked = prevCompleted;
                const unitStyle = isUnlocked ? activeStyle : lockedStyle;
 
                return (
                  <div
                    key={unit._id}
                    className={`flex flex-col items-center cursor-pointer p-4 rounded-lg shadow ${isUnlocked ? "hover:shadow-md" : ""
                      }`}
                    onClick={() => handleUnitClick(unit, idx, lessonItem)}
                  >
                    <div
                      className={`w-24 h-24 flex items-center justify-center rounded-lg text-3xl ${unitStyle}`}
                    >
                      {isUnlocked ? idx + 1 : <FaLock />}
                    </div>
                    <p className="mt-2 text-center">{unit.title}</p>
                    {isUnlocked && (
                      <p className="text-sm text-gray-600">
                        เล่นไปแล้ว: {currentUnit.attempts} ครั้ง | คะแนนล่าสุด:{" "}
                        {currentUnit.lastScore}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
 
      {/* ✅ Popup Alert */}
      {showAlert && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-transparent backdrop-blur-[2px]"></div>
 
          <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center z-10">
            <button
              onClick={() => setShowAlert(false)}
              className="absolute top-1 right-2 text-gray-500 hover:text-gray-800 text-3xl font-bold"
            >
              &times;
            </button>
 
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              ไม่สามารถเข้าได้
            </h3>
            <p className="text-gray-600 mb-4">ต้องทำหน่วยก่อนหน้าก่อน</p>
          </div>
        </div>
      )}
    </div>
  );
}