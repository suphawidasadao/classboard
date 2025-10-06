"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FaBook } from "react-icons/fa";
import { useSession, signOut } from "next-auth/react";
import { IoChevronDown } from "react-icons/io5";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaChartPie } from "react-icons/fa";
import { IoMdAddCircleOutline } from "react-icons/io";

export default function SideLayout({ children }) {
  const { data: session } = useSession();
  const pathname = usePathname(); // path ปัจจุบัน

  const profileImage = session?.user?.image || "/default-profile.png";

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ปิด dropdown เมื่อคลิกนอก
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // กำหนดเมนู
  const menuItems = [
    { title: "บทเรียนที่สร้าง", icon: <FaBook />, href: "/lesson_myPublished" },
    { title: "รายงาน", icon: <FaChartPie />, href: "/lesson_report" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6 space-y-6 fixed h-screen">
        <div className="flex justify-center items-center pb-5">
          <Link href="/mainpage" className="cursor-pointer">
            <Image src="/ClassBoard (1).svg" alt="Logo" width={112} height={40} className="object-contain" priority />
          </Link>
        </div>

        {session?.user?.role === 'teacher' && (
          <Link
            href={`/create_lessons`}
            className="w-full bg-[#2e003ee3] hover:bg-[#552c62] text-white py-2 rounded flex items-center justify-center"
          >
            <span className="flex items-center space-x-2">
              <IoMdAddCircleOutline className="text-lg" />
              <span>สร้างบทเรียน</span>
            </span>
          </Link>
        )}

        {/* Navigation */}
        <nav className="mt-8 space-y-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.title}
                href={item.href}
                className={`flex items-center space-x-2 px-2 py-1 rounded ${isActive ? "text-[#2e003ee3] font-bold" : "text-gray-700"}`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-lg">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white shadow px-6 py-3 flex justify-end items-center sticky top-0 z-40">
          <div
            ref={dropdownRef}
            className="flex items-center cursor-pointer relative border border-gray-300 rounded-full p-1"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-300">
              <Image src={profileImage} alt={session?.user?.name || "Profile"} width={36} height={36} className="rounded-full object-cover border border-gray-300" priority />
            </div>
            <IoChevronDown className="text-xl text-gray-700" />

            {dropdownOpen && (
              <div className="absolute right-0 text-xs mt-24 w-28 bg-white shadow-lg rounded-md border z-50">
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                >
                  ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 p-6">{children}</div>
      </div>
    </div>

  );
}
