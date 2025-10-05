'use client';

import Link from "next/link";
import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { useRouter } from 'next/navigation';
import { signIn, useSession } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

function RegisterPage() {
  const [role, setRole] = useState("student"); // student or teacher
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [school, setSchool] = useState("");
  const [teacherDetails, setTeacherDetails] = useState("");
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role === "admin") {
        router.push('/admin/admin_dashboard');
      } else {
        router.push('/mainpage');
      }
    }
  }, [status, router, session]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || (role === "teacher" && (!teacherName || !school))) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      const resCheckUser = await fetch("/api/checkUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const { user } = await resCheckUser.json();
      if (user) {
        setError("อีเมลนี้ถูกใช้งานแล้ว!");
        return;
      }

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          email,
          password,
          teacherName: role === "teacher" ? teacherName : "",
          school: role === "teacher" ? school : "",
          teacherDetails: role === "teacher" ? teacherDetails : ""
        })
      });

      if (res.ok) {
        const loginRes = await signIn("credentials", {
          redirect: false,
          email: email,
          password: password
        });

        if (!loginRes.error) {
          console.log("Logged in successfully");

          // redirect ตาม role หลัง login
          if (role === "admin") {
            router.push("/admin/admin_dashboard");
          } else {
            router.push("/mainpage");
          }

        } else {
          console.log("Login failed after registration:", loginRes.error);
        }
      } else {
        console.log("User registration failed.");
      }
    } catch (error) {
      console.log("Error during registration: ", error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex justify-center items-center bg-gradient-to-b bg-[#2e003e] px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-[500px] p-8 md:p-10">

          <h2 className="text-xl font-semibold mb-6 text-center">ยินดีต้อนรับเข้าสู่ ClassBoard</h2>

          <form className="space-y-3" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500 w-fit text-xs text-white py-1 px-3 rounded-md mt-2 mb-2">
                {error}
              </div>
            )}

            {/* เลือกบทบาท */}
            <div className="flex space-x-4 mb-3 justify-center">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="student"
                  checked={role === "student"}
                  onChange={() => setRole("student")}
                  className="mr-2"
                />
                นักเรียน
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="teacher"
                  checked={role === "teacher"}
                  onChange={() => setRole("teacher")}
                  className="mr-2"
                />
                อาจารย์
              </label>
            </div>

            {/* ฟิลด์ทั่วไป */}
            <input
              name="email"
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email"
              className="w-full p-2 text-xs border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-900 rounded-md"
            />
            <input
              name="password"
              autoComplete="new-password"
              onChange={(e) => {
                setPassword(e.target.value);
                // ตรวจสอบความยาวรหัสผ่านทันที
                if (e.target.value.length < 8) {
                  setPasswordError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
                } else {
                  setPasswordError("");
                }
              }}
              type="password"
              placeholder="Password"
              className="w-full p-2 text-xs border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-900 rounded-md"
            />

            {/* แสดง error ถ้ามี */}
            {passwordError && (
              <div className="text-red-500 text-xs mt-1">{passwordError}</div>
            )}
            {/* ฟิลด์เพิ่มเติมสำหรับ Teacher */}
            {role === "teacher" && (
              <>
                <input
                  onChange={(e) => setTeacherName(e.target.value)}
                  type="text"
                  placeholder="ชื่อ-สกุล"
                  className="w-full p-2 text-xs border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-900 rounded-md"
                />
                <input
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  type="text"
                  placeholder="โรงเรียน"
                  className="w-full p-2 text-xs border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-900 rounded-md"
                />
                <textarea
                  value={teacherDetails}
                  onChange={(e) => setTeacherDetails(e.target.value)}
                  placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับตนเอง (เช่น วิชา / ประสบการณ์)"
                  className="w-full p-2 text-xs border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-900 rounded-md"
                />
              </>
            )}

            <button className="w-full flex justify-center items-center px-3 py-2 border border-gray-300 rounded-md text-sm bg-[#2e003ee3] hover:bg-[#552c62] text-white">
              <span>ลงทะเบียน</span>
            </button>
          </form>

          <div className="my-3 text-center text-gray-400 text-xs">หรือด้วย</div>

          <div className="space-y-2">
            <button
              className="w-full flex justify-between items-center px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-100"
              onClick={() => { signIn("google"); }}
            >
              <span className="flex items-center">ดำเนินการต่อด้วย Google</span>
              <span className="text-2xl"><FcGoogle /></span>
            </button>
          </div>

          <p className="text-[10px] text-gray-400 mt-4 text-center">
            การลงทะเบียนแสดงว่าคุณยอมรับ <span className="underline">เงื่อนไขในการให้บริการ</span> และ <span className="underline">นโยบายความเป็นส่วนตัว</span>
          </p>

          <p className="text-sm text-center mt-3">
            มีบัญชีอยู่แล้วใช่ไหม? <Link href="/login" className="text-purple-600 font-medium hover:underline">เข้าสู่ระบบ</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
