'use client';

import Link from "next/link";
import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { useRouter } from 'next/navigation';
import { signIn, useSession } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

function RegisterPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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

    if (!email || !password) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {

      const resCheckUser = await fetch("/api/checkUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const { user } = await resCheckUser.json();
      if (user) {
        setError("อีเมลนี้ถูกใช้งานแล้ว!");
        return;
      }

      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email, password
        })
      });

      if (res.ok) {
        // ล็อกอินอัตโนมัติ
        const loginRes = await signIn("credentials", {
          redirect: false,
          email: email,
          password: password,
        });

        if (!loginRes.error) {
          // redirect ตาม role
          console.log("Logged in successfully");
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
    <div className="overflow-hidden h-screen">
      <div className="text-sm">
        <Navbar />
        <div className="bg-gradient-to-b bg-[#2e003e] flex items-start justify-center px-4 py-56">
          <div className="bg-white relative z-10 rounded-xl shadow-lg flex flex-col md:flex-row w-full max-w-[750px] overflow-hidden">

            <div className="w-full md:w-2/3 p-10">
              <h2 className="text-xl font-semibold mb-6">ยินดีต้อนรับเข้าสู่ ClassBoard</h2>

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
                  className="w-full p-2 text-xs border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-900 rounded-md"
                />
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="Password"
                  className="w-full p-2 text-xs border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-900 rounded-md"
                />
                <button className="w-full flex justify-center items-center px-3 py-2 border border-gray-300 rounded-md text-sm bg-[#2e003ee3] hover:bg-[#552c62] text-white">
                  <span>ลงทะเบียน</span>
                </button>
              </form>

              <div className="my-3 text-center text-gray-400 text-xs">หรือด้วย</div>

              <div className="space-y-2">
                <button className="w-full flex justify-between items-center px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-100" onClick={() => { signIn("google"); }}>
                  <span className="flex items-center">ดำเนินการต่อด้วย Google</span>
                  <span className="text-2xl"><FcGoogle /></span>
                </button>
              </div>

              <p className="text-[10px] text-gray-400 mt-4">
                การลงทะเบียนแสดงว่าคุณยอมรับ <span className="underline">เงื่อนไขในการให้บริการ</span> และ <span className="underline">นโยบายความเป็นส่วนตัว</span>
              </p>

              <p className="text-sm text-center mt-3">
                มีบัญชีอยู่แล้วใช่ไหม? <Link href="/login" className="text-purple-600 font-medium hover:underline">เข้าสู่ระบบ</Link>
              </p>
            </div>

            <div className="w-full md:w-1/3">
              <img
                src="https://m.media-amazon.com/images/I/811tbpgQ+3L._UF350,350_QL80_.jpg"
                alt="Image"
                className="w-full h-full object-cover rounded-md"
              />
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
