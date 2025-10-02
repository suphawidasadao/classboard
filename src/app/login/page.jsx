'use client';

import Link from "next/link";
import React, { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

function Loginpage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // ✅ อ่านค่าจาก localStorage ถ้ามี
    const savedEmail = localStorage.getItem('resetEmail');
    const savedPassword = localStorage.getItem('resetPassword');

    if (savedEmail) setEmail(savedEmail);
    if (savedPassword) setPassword(savedPassword);

    // เคลียร์ออก
    localStorage.removeItem('resetEmail');
    localStorage.removeItem('resetPassword');
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.role === "admin") {
        router.push('/admin/admin_dashboard');
      } else {
        router.push('/mainpage');
      }
    }
  }, [status, router, session]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false
      });

      if (res.error) {
        setError("Invalid credentials");
        return;
      }

    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="overflow-hidden h-screen">
      <div className="text-sm">
        <Navbar />
        <div className="bg-[#2e003e] flex items-start justify-center px-4 py-48 overflow-hidden">
          <div className="bg-white relative z-10 rounded-xl shadow-lg flex flex-col md:flex-row w-full max-w-[750px] overflow-hidden">
            <div className="w-full md:w-2/3 p-10">
              <h2 className="text-xl font-semibold mb-6">เข้าสู่ระบบ ClassBoard</h2>
              <form className="space-y-3" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-500 w-fit text-xs text-white py-1 px-3 rounded-md mt-2 mb-2">
                    {error}
                  </div>
                )}
                <input 
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Email"
                  value={email}
                  className="w-full p-2 text-xs border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-900 rounded-md"
                />
                <input 
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="Password"
                  value={password}
                  className="w-full p-2 text-xs border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-900 rounded-md"
                />
                <p className="text-xs">ลืมรหัสผ่าน
                  <Link href="/forget-password" className="ml-2 text-blue-800 hover:underline">รหัสผ่านใหม่</Link>
                </p>
                <button type="submit" className="w-full flex justify-center items-center px-3 py-2 border border-gray-300 rounded-md text-sm bg-[#2e003ee3] hover:bg-[#552c62] text-white">
                  <span>เข้าสู่ระบบ</span>
                </button>
              </form>
              <div className="my-3 text-center text-gray-400 text-xs">หรือด้วย</div>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-100" onClick={() => { signIn("google"); }}>
                  <span className="flex items-center">ดำเนินการต่อด้วย Google</span>
                  <span className="text-2xl"><FcGoogle /></span>
                </button>
              </div>
              <p className="text-sm text-center mt-8">
                ยังไม่มีบัญชีใช่ไหม? <Link href="/" className="text-purple-600 font-medium hover:underline">สมัครสมาชิก</Link>
              </p>
            </div>
            <div className="w-full md:w-1/3">
              <img src="https://m.media-amazon.com/images/I/811tbpgQ+3L._UF350,350_QL80_.jpg" alt="Image" className="w-full h-full object-cover rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Loginpage;
