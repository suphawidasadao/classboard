"use client";

import Image from 'next/image';
import React from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function MainNav() {
    const { data: session, status } = useSession();

    return (
        <nav className="bg-white w-full px-10 border-b border-gray-300 shadow-sm">
            <div className="max-w-screen flex justify-between items-center px-8 py-4 text-white">
                <div className="relative w-28 h-10">
                    <Image
                        src="ClassBoard (1).svg"
                        alt="Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
                {session?.user?.email && (
                    <Link href={`/lesson_myPublished`}
                        className="bg-[#2e003e] hover:bg-[#552c62] text-white text-sm px-4 py-2 rounded-md">
                        {session.user.email.split('@')[0]} &apos; Dashboard
                    </Link>
                )}

            </div>
        </nav>
    );
}
