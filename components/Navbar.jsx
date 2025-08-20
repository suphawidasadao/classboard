"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
  return (
    <nav className="bg-[#24042d] w-full px-10 ">
      <div className="max-w-screen flex justify-between items-center px-8 py-4 text-white">
        <div className="relative w-28 h-10">
          <Image
            src="/ClassBoard.svg"
            alt="Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <ul className="flex gap-6 text-base">
          <li>
            <Link href="/">ลงทะเบียน</Link>
          </li>
          <li>
            <Link href="/login">เข้าสู่ระบบ</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
