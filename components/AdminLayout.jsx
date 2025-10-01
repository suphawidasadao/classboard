'use client';
import React, { useState, useRef } from 'react';
import { FaUser, FaBookOpen, FaChartBar, FaPlus } from 'react-icons/fa';
import { IoMdArrowDropdown } from 'react-icons/io';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signOut } from "next-auth/react";

export default function AdminLayout({ children, activeViewProp }) {
  const router = useRouter();
  const [activeView, setActiveView] = useState(activeViewProp || 'dashboard');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const profileImage = '/default-profile.png';
  const [statsDropdownOpen, setStatsDropdownOpen] = useState(false);

  return (
    <div className="flex font-sans h-screen">
      {/* Sidebar */}
      <div className="bg-[#f8f8ff] w-64 shadow-md p-6 space-y-6">
        <div className="flex justify-center items-center pb-5">
          <Image
            src="/ClassBoard (1).svg"
            alt="Logo"
            width={112}
            height={40}
            className="object-contain"
            priority
          />
        </div>

        <button
          onClick={() => router.push('/admin/create_lesson')}
          className="w-full bg-[#2e003ee3] hover:bg-[#552c62] text-white py-2 rounded flex items-center justify-center"
        >
          
          <span>+ สร้างบทเรียน</span>
        </button>

        <div
          className={`flex items-center gap-2 cursor-pointer px-2 py-2 rounded-lg hover:bg-gray-100 ${activeViewProp === 'dashboard' ? 'font-semibold bg-white text-[#2e003ee3]' : 'text-gray-700'
            }`}
          onClick={() => {
            setActiveView('dashboard');
            router.push('/admin/admin_dashboard');
          }}
        >
          <FaBookOpen className="text-lg" />
          <span className="text-sm">แดชบอร์ดผู้ดูแลระบบ</span>
        </div>

        <div
          className={`flex items-center gap-2 cursor-pointer px-2 py-2 rounded-lg hover:bg-gray-100 ${activeViewProp === 'approval' ? 'font-semibold bg-white text-[#2e003ee3]' : 'text-gray-700'
            }`}
          onClick={() => {
            setActiveView('approval');
            router.push('/admin/approval');
          }}
        >
          <FaUser className="text-lg" />
          <span className="text-sm">คิวการอนุมัติบทเรียน</span>
        </div>

        <div
          className={`flex items-center gap-2 cursor-pointer px-2 py-2 rounded-lg hover:bg-gray-100 ${activeViewProp === 'stats' ? 'font-semibold bg-white text-[#2e003ee3]' : 'text-gray-700'
            }`}
          onClick={() => {
            setActiveView('stats');
            router.push('/admin/stats');
          }}
        >
          <FaChartBar className="text-lg" />
          <span className="text-sm">สถิติบทเรียน</span>
        </div>

      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-h-screen bg-white">
        {/* Navbar */}
        <div className="w-full bg-white shadow px-6 py-3 flex justify-end items-center relative">
          <div className="flex justify-end items-center relative w-full max-w-screen-xl mx-auto">
            <div
              ref={dropdownRef}
              className="flex items-center cursor-pointer relative border border-gray-300 rounded-full p-1"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300">
                <Image
                  src={profileImage}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full object-cover border border-gray-300"
                  priority
                />
              </div>
              <IoMdArrowDropdown className="text-xl text-gray-700" />

              {dropdownOpen && (
                <div className="absolute right-0 mt-24 w-32 bg-white shadow-lg rounded-md border z-50 text-xs">
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Children Content */}
        <div className="flex-1 w-full overflow-auto p-6 max-w-screen-xl mx-auto">
          {children}
        </div>
      </div>

    </div>
  );
}
