"use client";

import Image from 'next/image';
import React, { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { IoChevronDown, IoHomeOutline, IoTimeOutline } from 'react-icons/io5';
import { IoMdAddCircleOutline } from "react-icons/io";
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function MainNav() {
    const { data: session } = useSession();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const router = useRouter();
    const pathname = usePathname(); // ✅ เอา path ปัจจุบันมาใช้
    const profileImage = session?.user?.profileImage || "/default-profile.png";

    // ปิด dropdown เมื่อคลิกนอก
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <nav className="bg-white w-full border-b border-gray-300 shadow-sm relative h-16">
            <div className="max-w-screen flex justify-between items-center px-20 h-full">
                {/* Logo */}
                <div className="relative w-28 h-10">
                    <Image src="ClassBoard (1).svg" alt="Logo" fill className="object-contain" priority />
                </div>

                {/* ส่วน Profile / สร้างบทเรียน */}
                {session?.user && session.user.role === "teacher" ? (
                    <Link
                        href={`/lesson_myPublished`}
                        className="bg-gray-200 text-black px-4 py-2 rounded-md cursor-pointer hover:bg-gray-300 flex items-center space-x-2"
                    >
                        <IoMdAddCircleOutline className="text-lg" />
                        <span>สร้างบทเรียน</span>
                    </Link>
                ) : (
                    <div className="flex items-center cursor-pointer relative" ref={dropdownRef}>
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

            {session?.user?.role !== "teacher" && (
                <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-10">
                    {/* หน้าหลัก */}
                    <div
                        className={`flex flex-col items-center cursor-pointer ${
                            pathname === "/mainpage" 
                                ? "border-b-2 border-purple-500 text-purple-500" 
                                : "border-b-2 border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={() => router.push("/mainpage")}
                    >
                        <IoHomeOutline className="text-lg mb-1" />
                        <span className="text-sm font-medium">หน้าหลัก</span>
                    </div>

                    {/* กิจกรรม */}
                    <div
                        className={`flex flex-col items-center cursor-pointer ${
                            pathname.startsWith("/lesson_activities") 
                                ? "border-b-2 border-purple-500 text-purple-500" 
                                : "border-b-2 border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={() => router.push("/lesson_activities")}
                    >
                        <IoTimeOutline className="text-lg mb-1" />
                        <span className="text-sm font-medium">กิจกรรม</span>
                    </div>
                </div>
            )}
        </nav>
    );
}
