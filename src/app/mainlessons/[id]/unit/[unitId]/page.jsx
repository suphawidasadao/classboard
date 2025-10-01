"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaArrowLeft, FaCheck, FaTimes as FaWrong } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
 
export default function UnitQuizPage() {
  const { id: lessonId, unitId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callback = searchParams.get("callback");
  const { data: session } = useSession();
 
  const [unit, setUnit] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);
 
  const subject = searchParams.get("subject") || "ไม่ระบุ";
 
  useEffect(() => {
    const fetchUnit = async () => {
      try {
        const res = await fetch(`/api/lessons/${lessonId}/units/${unitId}`);
        const data = await res.json();
        setUnit(data);
        setQuestions(data.questions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUnit();
  }, [lessonId, unitId]);
 
  if (loading)
  return (
    <div className="flex items-center justify-center h-screen bg-[#f2f2f2]">
      <div className="w-12 h-12 border-4 border-gray-300 border-t-[#2e003e] rounded-full animate-spin"></div>
    </div>
  );
  if (!unit) return <p className="p-6">ไม่พบหน่วย</p>;
 
  const q = questions[current];
  const correctAnswer = q.choices.find(c => c.isCorrect)?.text;
  const selected = selectedAnswers[q._id] || null;
 
  const handleSelect = (choice) => {
    if (checked) return;
    setSelectedAnswers(prev => ({ ...prev, [q._id]: choice }));
  };
 
  const handleCheck = () => {
    if (!selected) return alert("กรุณาเลือกคำตอบก่อน");
    setChecked(true);
    if (selected === correctAnswer) setScore(prev => prev + 1);
  };
 
  const handleNext = async () => {
  if (current + 1 < questions.length) {
    setCurrent(prev => prev + 1);
    setChecked(false);
    return;
  }
 
  const answersToSend = questions.map(q => ({
    questionId: q._id,
    selected: selectedAnswers[q._id] || "",
    isCorrect: selectedAnswers[q._id] === q.choices.find(c => c.isCorrect)?.text,
  }));
 
  if (session) {
    console.log("Sending subject to API:", subject);
 
    await fetch(`/api/lessons/${lessonId}/units/${unitId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        score,
        totalQuestions: questions.length,
        answers: answersToSend,
        subject,
      }),
    });
  }
 
  setShowResult(true);
};
 
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <div className="w-full flex items-center space-x-2 px-4 mt-3">
        <button onClick={() => router.back()} className="text-gray-800 text-xl">
          <RxCross2 />
        </button>
        <div className="flex-1 h-4 bg-gray-200 rounded-full">
          <div className="h-4 bg-green-500 rounded-full" style={{ width: `${((current + 1)/questions.length)*100}%` }} />
        </div>
      </div>
 
      <div className="flex flex-col mt-6 w-full flex-grow px-4 items-center">
        <h1 className="text-xl font-bold mb-12 mt-12">คำถามที่ {current + 1}</h1>
        {q.questionImage && <img src={q.questionImage} alt="question" className="w-56 h-56 object-contain" />}
        <div className="border rounded-lg px-8 py-4 shadow text-lg font-semibold bg-white max-w-md text-center">
          {q.questionText}
        </div>
 
        <div className="w-[90%] h-[1px] bg-gray-300 mb-4 mx-auto mt-16" />
        <div className="flex flex-wrap justify-center gap-10 mt-10">
          {q.choices.map((choice, idx) => {
            const isSelected = selected === choice.text;
            const isCorrect = checked && choice.isCorrect;
            const isWrong = checked && isSelected && !choice.isCorrect;
            return (
              <button key={idx} onClick={() => handleSelect(choice.text)}
                className={`px-6 py-2 border rounded-full shadow-xl text-base font-medium transition-colors duration-200
                  ${isCorrect ? "bg-green-500 border-green-500 text-white" :
                    isWrong ? "bg-red-200 border-red-500 text-black" :
                    isSelected ? "bg-gray-300 border-gray-500 text-black" :
                    "bg-white border-gray-300 text-black"} hover:bg-gray-100`}>
                {choice.text}
              </button>
            );
          })}
        </div>
      </div>
 
      <div className={`w-full px-16 py-4 shadow-inner flex items-center justify-between
        ${checked ? (selected===correctAnswer?"bg-[#D7FFBB]":"bg-red-200"):"bg-white"}`}>
        {checked && (
          <div className={`w-10 h-10 rounded-full flex items-center justify-center
            ${selected===correctAnswer?"bg-green-500":"bg-red-500"}`}>
            {selected===correctAnswer?<FaCheck className="text-white text-lg"/>:<FaWrong className="text-white text-lg"/>}
          </div>
        )}
 
        <div className="ml-auto">
          {checked ? (
            <button className={`px-4 py-2 rounded text-white ${selected===correctAnswer?"bg-green-500 hover:bg-green-600":"bg-red-500 hover:bg-red-600"}`}
              onClick={handleNext}>
              {current+1<questions.length?"ถัดไป":"จบบทเรียน"}
            </button>
          ) : (
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded" onClick={handleCheck}>
              ตรวจคำตอบ
            </button>
          )}
        </div>
 
        {showResult && (
          <div className="fixed inset-0 bg-white bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl flex flex-col items-center space-y-4">
              <img src="/cute.png" alt="Success" className="w-48 h-48 object-contain"/>
              <h2 className="text-xl font-bold">ทำบทเรียนเสร็จแล้ว!</h2>
              <p className="text-lg">คะแนน {score}/{questions.length}</p>
              <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded"
                onClick={()=>router.push(`/mainlessons/${lessonId}`)}>
                กลับไปหน้าบทเรียน
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
 